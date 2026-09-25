# Documentation Backend - Leafy Map

Plateforme de **découverte d'événements locaux** : carte interactive, lieux, organisateurs et gestion d'événements.

## Table des matières

1. [Commandes de base](#-commandes-de-base)
2. [Architecture du projet](#-architecture-du-projet)
3. [Fonctionnalités principales](#-fonctionnalités-principales)
   - [Authentification & Autorisation](#1-authentification--autorisation)
   - [Système de permissions et rôles](#2-système-de-permissions-et-rôles)
   - [Gestion des ressources](#3-gestion-des-ressources)
   - [URLs signés pour les images](#4-urls-signés-pour-les-images-aws-s3)
   - [Validation des données](#5-validation-des-données)
   - [Sécurité](#6-sécurité)
   - [Logging](#7-logging)
4. [Conventions de code](#️-conventions-de-code)
   - [TypeScript](#typescript)
   - [Architecture](#architecture)
   - [Nommage](#nommage)
   - [Gestion d'erreurs](#gestion-derreurs)
   - [Réponses API](#réponses-api)
5. [Configuration](#-configuration)
6. [ Dépendances principales](#-dépendances-principales)
7. [ Notes importantes](#-notes-importantes)
8. [Déploiement](#-déploiement)
   - [CI et livraison](#ci-et-livraison)
   - [Service web Render (runtime Node)](#service-web-render-runtime-node)
   - [Image Docker (alternative)](#image-docker-alternative)
   - [Mise à jour](#mise-à-jour)
   - [Checklist avant déploiement](#checklist-avant-déploiement)

---

## Commandes de base

```bash
# Installation des dépendances
npm install

# Développement (avec hot-reload via nodemon)
npm run dev

# Build du projet TypeScript
npm run build

# Build en mode watch
npm run watch

# Vérification ESLint
npm run lint

# Correction automatique des problèmes ESLint compatibles
npm run lint:fix

# Détection code / deps inutilisés
npm run knip

# Tests unitaires (les tests Mongoose sont exclus)
npm test

# Tests d'intégration MongoMemory
npm run test:integration

# Couverture unitaire et seuil de non-régression
npm run test:coverage

# Toutes les vérifications de tests
npm run test:all

# Démarrage en production
npm start

# Seed écosystème fictif (local Docker / Mongo localhost)
npm run seed:ecosystem -- --target local --reset

# Seed Atlas staging (confirmation obligatoire)
npm run seed:ecosystem -- --target staging --confirm staging --reset

# Seed Atlas production (charge .env.prod, confirmation obligatoire)
npm run seed:ecosystem -- --target production --confirm production --reset

# Itération rapide sans upload S3
npm run seed:ecosystem -- --target local --skip-images --users 50 --events 200
```

### Seed écosystème (local / staging / production)

Script `scripts/seed-ecosystem/` : ~1500 utilisateurs, lieux, ~15000 événements, invitations, réservations, follows, favoris et partenariats, répartis entre grandes villes et petites agglomérations (Beaune, Uzès, Arles, Colmar, Annecy, …).

- Prérequis : `npm run seed:categories`
- Cible `local` et `staging` : uniquement `MONGO_URI` dans `.env`. Local : hôte `localhost`, `127.0.0.1` ou `mongo`. Staging : hôte contenant `staging`, plus `--confirm staging`.
- Cible `production` : uniquement `MONGO_URI` dans `.env.prod`. L’hôte doit contenir `production` ou `prod.`, et `--confirm production` est obligatoire. Refusée si l’hôte est local ou staging.
- `--reset` : supprime uniquement les comptes `@leafymap.seed` et les objets S3 `images/seed/`
- Mot de passe commun : `SEED_USER_PASSWORD` ou défaut `SeedUser!2026`
- Comptes démo : `boulangerie.martin@leafymap.seed`, `le.bar.perche@leafymap.seed`, `atelier.luma@leafymap.seed`
- `--skip-images` : pas d’upload AWS (avatars par défaut dans l’UI)
- Pool d’images : ~60 photos thématiques réutilisées, préfixe S3 `images/seed/` (le bucket est partagé avec la prod)
- Ne pas lancer depuis docker-compose / Dockerfile (trop lourd + effets S3)

La CI (`.github/workflows/ci.yml`) ne se lance que sur les **pull requests vers `main`**.
Elle n’est pas déclenchée par un push sur `develop`, ni par un push direct sur `main`.
Ordre : `lint:ci`, `knip`, `build`, tests unitaires, tests d’intégration, couverture.
`lint:ci` impose zéro warning. Les seuils globaux de couverture sont volontairement
conservateurs (32 % statements, 27 % branches, 33 % lignes) : ils protègent la
baseline actuelle sans constituer un objectif de couverture production.

`knip` détecte fichiers, exports et dépendances inutilisés. Lancez
`npm run knip` localement avant de pousser si vous touchez à la structure des
modules ou aux dépendances.

## Architecture du projet

Le backend suit une **Clean Architecture pragmatique** : tout le code runtime vit sous `src/`. Hors `src/` : tooling, scripts ops, tests et docs.

```
leafymap_backend/
├── src/
│   ├── main/                     # Entry : server.ts + app.ts (Express)
│   ├── api/                      # Delivery HTTP
│   │   ├── controllers/
│   │   ├── dto/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── http/                 # controllerFactory, response, errorHandler…
│   │   └── types/
│   ├── application/              # Use cases + DTOs application
│   ├── domain/                   # Entités, VOs, ports — zéro dépendance externe
│   ├── infrastructure/           # Repos, adapters, auth helpers, services, realtime, cron
│   ├── shared/                   # errors, logger, constants, delay
│   └── di/                       # Awilix container (container.ts, cradle.ts, modules/)
├── scripts/                      # CLI ops (seed, admin, migrate)
├── __tests__/
└── (configs : package.json, tsconfig, jest, eslint…)
```

### Domaines : Favorites, Follows, Comments, Reviews, Events, EventBookings, EventInvitations, Partnerships, Products, Categories, Images, Places, Users, Auth, Admin, Notifications, Messages, Announcements (Postgres/Prisma)

Flux d'écriture :

```
Route → Controller → UseCase → Domain Entity / Port → Mongoose Repository / Adapter
```

Les **annonces plateforme** suivent le même flux, mais avec un repository **Prisma**
sur PostgreSQL (CMS relationnel, indépendant de MongoDB).

Les lectures suivent un **CQRS-lite** : les mutations reconstituent des entités
riches, tandis que les queries retournent des read models dédiés. Les repositories
Mongoose appliquent les projections/populates, puis les `*ReadMapper` normalisent
les documents lean vers les contrats de lecture. Il n'y a ni bus CQRS, ni
event-sourcing.

| Couche | Emplacement | Rôle |
| --- | --- | --- |
| Main | `src/main/` | Bootstrap HTTP + Socket.IO + cron |
| API | `src/api/` | Validation Zod, mapping HTTP, routes, middlewares |
| Application | `src/application/usecases/` | Orchestration métier |
| Domain | `src/domain/` | Entités, value objects, ports (`IFavoriteRepository`, `IFollowRepository`, `ICommentRepository`, `IReviewRepository`, `IEventRepository`, `IEventBookingRepository`, `IEventInvitationRepository`, `IPartnershipRepository`, `IProductRepository`, `ICategoryRepository`, `IImageRepository`, `IPlaceRepository`, `IUserRepository`, `INotificationRepository`, `IMessageRepository`, `IConversationRepository`, …) |
| Infrastructure | `src/infrastructure/` | Mongoose, mappers, adapters, services (email/S3), auth helpers, realtime (Socket.IO), cron |
| Shared | `src/shared/` | errors, logger, constants |
| DI | `src/di/` | Container Awilix (`container.ts` + `cradle.ts` + `modules/`) — injection CLASSIC par nom de paramètre |

Alias unique : `@src/*` → `src/*`. Entry prod : `dist/main/server.js`.

Règles de dépendance (contrôlées par ESLint) : `domain` ne dépend pas de
`application`, `api`, `infrastructure`, `main` ou `di` ; `application` ne dépend
pas de `api`, `infrastructure`, `main` ou `di` ; `api` ne dépend pas de
`infrastructure`, `main` ou `di`. `infrastructure` implémente les ports domain ;
`main` et `di` constituent le composition root.

Les fichiers `src/api/routes/*.routes.ts` exportent des factories pures qui
reçoivent un `Pick<RouteDependencies, ...>`. Seul `src/main/app.ts` lit le
`cradle`, configure le signing HTTP et compose les routers. DI : registration
`asClass` / `asFunction` en `Lifetime.SINGLETON` ; les noms de constructeur
(`userRepository`, `cascadeDeleter`, …) doivent matcher les clés du cradle.

### Frontière Mongo et réponses HTTP

- `_id` et `Types.ObjectId` restent confinés à l'infrastructure. Les entités et
  ports utilisent des IDs brandés ; les read models exposent `id: string`.
- `normalizeLeanDocument` normalise récursivement `_id` en `id`, y compris dans
  les objets populés et tableaux. Les read mappers sélectionnent ensuite
  explicitement les champs du contrat.
- Les URLs S3 sont signées une seule fois à la frontière HTTP par
  `createController` → `signResponseImageUrls` → `signNestedImageUrls`.
  `signImages: false` est réservé aux réponses qui ne doivent pas être signées.

Points d’attention :

- Validation ObjectId via `src/api/http/objectId.ts` aux frontières API ; les VOs domain ne font que le branding.
- `CascadeDeleteUseCase` (port `ICascadeDeleter`) / `DeleteAccount` / admin consomment directement les ports domain (Favorite, Follow, Comment, Review, Event, EventBooking, EventInvitation, Partnership, Product, Place, User, Notification).
- Follows : ports `IFollowCounter` / `IFollowNotifier` ; `IFollowCounter` via `MongooseFollowCounterAdapter` → `IUserRepository.incrementFollowers` ; `deleteAllInvolvingUser` à la suppression de compte.
- Comments réutilise le pattern polymorphe `reference` / `referenceType` (comme Favorites) et expose `findIdsByReferences` / `softDelete` pour cascade et moderation.
- Reviews : même forme polymorphe (`Place` / `Event`), unicité `(author, reference, referenceType)`, ports `IReviewTargetChecker` / `IReviewRatingUpdater` (adapters Place/Event), soft-delete admin + cascade.
- Events : entité riche (schedule, lifecycle, capacity), ports `IPlaceOwnershipChecker` ; lifecycle dérivé du schedule (domain + filet de sécurité schéma) ; cron via `UpdateEventLifecycleStatusUseCase`.
- EventBookings : règles de capacité / unicité / fenêtres `upcoming` dans les use cases ; port `IEventNotifier` pour les notifications organisateur.
- EventInvitations : transitions de statut (accept/refuse/cancel), ownership create via `event.belongsTo`, port `IEventInvitationNotifier`, retrait collaborateur du schedule à la suppression.
- Partnerships : invitation user↔user (`pending` → `accepted`), unicité bidirectionnelle, accept réservé au collaborateur, soft-delete via `cancel`, port `IPartnershipNotifier`.
- Products : CRUD léger (catégorie + user), limite `MAX_PRODUCTS_PER_USER` (10) à la création, ownership via `belongsTo`, hard-delete, `deleteManyByUserId` à la suppression de compte.
- Categories : lecture seule (`GET /api/categories`), agrège CategoryType + User/Place/Product/EventCategory via `ICategoryRepository.findAll()` ; pas d’entité riche ni de writes HTTP (seeds uniquement).
- Images : polymorphe `reference` / `referenceType` (Place/User/Event ; Comment/Review non uploadables), ports `IImageStorage` (S3) et `IImageReferenceOwnershipChecker` ; signing explicite (pas de post-hooks schéma) ; hard-delete HTTP/cascade (DB + S3) ; soft-delete admin ; ownership delete/upload dans les use cases.
- Places : entité avec location GeoJSON + schedules ; port `IUserPlaceLinker` (back-ref `User.place`, rule 1 place/user) ; ownership update/delete dans les use cases ; `GET /in-view` via aggregation geo/`ids`/filters dans le repository ; `scheduleWithEvents` via helper application `placeScheduleWithEvents` (pas de service infra) ; delete user = cascade hard + unlink ; soft-delete admin.
- Users : entité profil/compte ; port `IUserRepository` ; reads populés via `findDetailsById` / `findList` ; l'API valide un DTO d'update strict et `UpdateUser` renouvelle le JWT si `userType` change ; `DeleteAccount` cascade (places/events/follows/images…) ; `AuthMiddleware` / `AdminMiddleware` / Socket.IO / `CreateNotificationUseCase` consomment le même port domain (`MongooseUserRepository`) ; `IUserPlaceLinker` / `IUserPlaceResolver` branchés sur le port domain.
- Auth : credentials sur l’entité `User` ; use cases Register / SignIn / GoogleAuth / VerifyEmail / ResendVerification / RequestPasswordReset / ResetPassword / AcceptCgu ; ports `IPasswordHasher`, `IAuthEmailSender`, `IJwtTokenIssuer`, `IGoogleIdentityVerifier`, `IOpaqueTokenFactory` ; `GET /me` réutilise `GetUserByIdUseCase` ; SignOut = clear cookies HTTP.
- Admin : modération via use cases Search/Get/Ban/Unban/SoftDelete/Restore (users + resources) ; méthodes domain `User.ban` / `unban` / `softDelete` / `restore` ; `findAdminByEmail` + `findDetailsById({ includeDeleted })` ; soft-delete contenu via ports Event/Place/Image/Review/Comment ; middlewares auth/admin sur `IUserRepository` domain.
- Notifications : entité + port `INotificationRepository` ; HTTP list / mark-by-action / mark-all ; `IUnreadConversationCounter` pour le compteur conversations non lues (messaging) ; writes + email via `CreateNotificationUseCase` + port `INotificationEmailSender` ; adapters `FollowNotifier` / `EventNotifier` / `EventInvitationNotifier` / `PartnershipNotifier` consomment le use case ; cascade/DeleteAccount sur le port domain.
- Messages : entités `Message` / `Conversation` + ports `IMessageRepository` / `IConversationRepository` ; HTTP create / inbox / thread / mark-read / update / delete ; ownership via `belongsTo` / `isParticipant` dans les use cases ; realtime via port `IMessageRealtimePublisher` (Socket.IO) ; `join_conversation` appelle `MarkMessagesAsReadUseCase` ; unread counter Notifications branché sur les repos domain.
- Ownership des mutations (delete/update) : règle métier via `entity.belongsTo(actorId)` / `isParticipant` dans le use case — pas via middleware HTTP.
- Existence de la référence à la création d’un comment : port `ICommentReferenceChecker` (`CommentReferenceChecker` adapter Image/Review), appelé depuis `CreateCommentUseCase`.

### Couches consolidées

Shell legacy (`middlewares/`, `utils/`, `types/`, `validations/`, `di/`, `config/`, `app.ts`, `server.ts` à la racine) absorbé sous `src/`. Plus de code runtime hors `src/`.


## Fonctionnalités principales

### 1. Authentification & Autorisation

#### Processus de création d'utilisateur

1. **Validation des données** : Schéma Zod pour email, password, username
2. **Vérification d'unicité** : Email et username doivent être uniques
3. **Hashage du mot de passe** :
   - Le mot de passe en clair n'est jamais stocké
   - Hash stocké dans la base de données
4. **Type d'utilisateur** : Par défaut `guest`
5. **CGU** : Acceptation obligatoire avec date d'acceptation

#### Processus de connexion

1. **Identification** : Par email OU username
2. **Vérification** : `bcrypt.compare()` entre password fourni et hash stocké
3. **Génération JWT** : Token contenant `id` et `userType`
4. **Cookie HTTP-only** : Token stocké côté client de manière sécurisée

#### Middleware d'authentification

- **Fichier** : `src/api/middlewares/auth.middleware.ts`
- **Vérification** : Token depuis cookies ou header `Authorization`
- **Décodage JWT** : Extraction des informations utilisateur
- **Validation** : Vérification que l'utilisateur existe toujours
- **Injection** : `req.decoded` contient les données utilisateur

### 2. Système de permissions et rôles

#### Types d'utilisateurs et rôles

- **guest** : compte standard.
- **creator** : profil pouvant gérer un lieu et publier des événements.
- Les rôles d'administration (`user` / `admin`) sont distincts du `userType`.
- `organizer` n'est plus une valeur du modèle courant.

#### Règles de propriété

##### Places (Lieux)

- Seul le **créateur du lieu** peut le modifier
- Seul le **créateur du lieu** peut le supprimer
- Ownership vérifiée dans les use cases via le port `IPlaceOwnershipChecker` (`PlaceOwnershipChecker` adapter)

##### Events (Événements)

- Peuvent être créés par **Creator** OU **Organizer**
- Seul le **propriétaire du lieu** associé peut modifier l'événement
- Seul le **propriétaire du lieu** associé peut supprimer l'événement
- Ownership vérifiée dans les use cases (`PlaceOwnershipChecker` / `event.belongsTo`)

##### Partnerships (Partenariats)

- Invitation entre deux utilisateurs, unique dans les deux sens
- Acceptation réservée au collaborateur invité
- Workflow : `pending` → `accepted`, ou annulation via soft-delete

### 3. Gestion des ressources

#### Places (Lieux)

- CRUD complet des lieux (galeries, ateliers, marchés, etc.)
- **Géolocalisation** : Index 2dsphere MongoDB pour recherche géographique
- **Types** : food, art, craft
- **Horaires** : Système de planning par défaut + dates personnalisées
- **Collaborateurs** : Système de partenariats avec statuts (pending, accepted, refused)
- **Middleware de propriété** : Vérification que l'utilisateur est propriétaire
- **Quota** : 1 lieu maximum par utilisateur (Guest : 0 lieu)

#### Events (Événements)

- CRUD des événements liés aux lieux
- **Planning** : Périodes avec créneaux horaires et collaborateurs
- **Statuts** : cancelled, full, available
- **Images** : Gestion d'images via S3
- **Création** : Réservée aux profils autorisés par les use cases
- **Modification/Suppression** : Réservée au propriétaire de l'événement ;
  un changement de lieu vérifie aussi la propriété du lieu

#### Users (Utilisateurs)

- **Types d'utilisateurs** : creator, guest
- **Profils** : Informations personnelles, catégories de créateur
- **Suivis** : Système de followers pour les lieux
- **Creator profile** : catégorie utilisateur, intérêts, description, image et
  lieu associé selon les contrats courants

#### Partnerships (Partenariats)

- Invitations de collaboration entre utilisateurs
- Workflow : pending → accepted, avec annulation
- **Validation** : l'utilisateur invité est le seul à pouvoir accepter

#### Catégories

La lecture agrège `CategoryType`, `UserCategory`, `PlaceCategory`,
`ProductCategory` et `EventCategory`. Les écritures de catégories sont réservées
aux scripts de seed, pas aux routes HTTP publiques.

#### Images

- **Upload vers AWS S3** : Stockage sécurisé des images
- **Processing** : Optimisation avec Sharp
- **Middlewares** : Autorisation d'upload/delete, traitement mémoire
- **URLs signées** : Génération à la frontière de réponse HTTP

### 4. URLs signés pour les images (AWS S3)

#### Fonctionnement

Les images stockées sur S3 ne sont pas accessibles publiquement. Un **URL signé**
temporaire est généré au moment de construire la réponse HTTP.

#### Implémentation (`IImageStorage` / `AwsImageStorageAdapter`)

Le signing est appliqué une seule fois sur les payloads de réponse HTTP
(`createController` → `signResponseImageUrls` → `signNestedImageUrls`) pour
toute URL S3 imbriquée. `AwsImageStorageAdapter.signUrls` / `signUrl` délèguent
à `AwsService.generateSignedUrlFromFullUrl`.

#### Processus de génération

1. **URL stockée** : `https://bucket.s3.region.amazonaws.com/path/to/image.jpg`
2. **Extraction de la clé** : Suppression du préfixe bucket
3. **Commande S3** : `GetObjectCommand` avec la clé
4. **Signature** : Génération d'une URL signée avec `getSignedUrl()`
5. **Expiration** : 10 minutes (`expiresIn: 600`)
6. **URL signée** : Retournée avec paramètres de signature AWS

#### Avantages

- **Sécurité** : Accès contrôlé aux images
- **Temporalité** : URLs expirables pour éviter le partage permanent
- **Automatique** : Transparent pour les controllers
- **Performance** : Pas de stockage d'URLs pré-signés

#### Formats d'images générés

- `original` : Image complète
- `thumbnail` : Miniature (optimisée avec Sharp)
- `medium` : Taille intermédiaire

### 5. Validation des données

- **Zod** : Validation robuste des schémas
- **Validations personnalisées** : Pour chaque entité (places, events, users, auth)
- **Messages d'erreur en français** : Retours utilisateur clairs

### 6. Sécurité

- **Helmet.js** : Protection des headers HTTP
- **CORS configuré** : Origines autorisées définies
- **Cookie sécurisé** : httpOnly, secure en production, sameSite
- **Validation stricte** : Toutes les entrées utilisateur validées

### 7. Logging

- **Winston** : Système de logs structuré
- **Niveaux** : info, error
- **Destinations** : Console + fichiers (error.log, combined.log)
- **Format** : Timestamp + colorisation

## 🛠️ Conventions de code

### TypeScript

- **Mode strict activé** : Typage rigoureux
- **Path alias** : `@src/*` → `src/*`
- **ObjectId Mongoose** : `Types.ObjectId` en persistence ; VOs brandés en domain
- **Populate** : côté repositories / mappers, pas de types `Populated` dédiés backend

### Architecture

- Flux : Route → Controller → UseCase → Domain → Infrastructure
- Couches sous `src/` uniquement (voir [Architecture du projet](#-architecture-du-projet))

### Nommage

- **Fichiers** : camelCase pour les fichiers TS (ex: `authController.ts`)
- **Modèles** : PascalCase (ex: `User.ts`)
- **Routes** : `/api/{ressource}` (pluriel)

### Gestion d'erreurs

- **Middleware centralisé** : `errorHandler.ts`
- **Try-catch** : Dans tous les controllers async
- **Status HTTP appropriés** : 401, 404, 500, etc.

### Réponses API

- **Format standardisé** :
  ```typescript
  {
    success: boolean,
    message: string,
    data?: unknown,
    error?: string
  }
  ```

## 🔧 Configuration

### Variables d'environnement requises

Aligné sur `env.example`. Le process lit `process.env.PORT` (repli `3000` si absent). En local l’exemple est `5001` (le port 5000 est pris par AirPlay sur macOS). Docker Compose force `5002`.

```env
NODE_ENV=development
PORT=5001
MONGO_URI=mongodb://localhost:27017/leafymap
DATABASE_URL=postgresql://leafymap:leafymap@localhost:5432/leafymap?schema=public
REDIS_URL=redis://localhost:6379
MAPBOX_ACCESS_TOKEN=pk.your_mapbox_token
JWT_SECRET=your_secret_key
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=...
AWS_BUCKET_NAME=...
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
MAIL_FROM=noreply@example.com
GOOGLE_CLIENT_ID=....apps.googleusercontent.com
```

Variables présentes dans d’anciens `.env` mais **non lues** par le code :

- `FRONTEND_URL` — les liens e-mail utilisent `https://leafymap.com` si `NODE_ENV=production`, sinon `http://localhost:3001` (`src/shared/constants/common.ts`).
- `ALLOWED_ORIGINS` — CORS et Socket.IO utilisent la même liste codée en dur : en production `https://leafymap.com` et `https://www.leafymap.com`.
- `JWT_EXPIRE` — l’expiration du JWT est fixée à `1d` dans `src/infrastructure/auth/jwt.ts`.
- `GOOGLE_CLIENT_SECRET` — la connexion Google vérifie l’`id_token` avec le Client ID seul.

### MongoDB

- **ODM** : Mongoose
- **Connexion** : Configurée dans `src/infrastructure/persistence/db.ts`
- **Indexes** : 2dsphere pour géolocalisation

### PostgreSQL (Prisma — annonces CMS)

- **ORM** : Prisma (`prisma/schema.prisma`)
- **Connexion** : `DATABASE_URL` via `src/infrastructure/persistence/prisma.ts`
- **Docker local** :

```bash
# Postgres seul, si Docker est déjà lancé et que DATABASE_URL pointe sur localhost:5432
npx prisma migrate deploy
# ou en dev, pour créer une migration :
npx prisma migrate dev
```

Le `docker-compose.yml` qui démarre Postgres 16, Mongo 7, Redis 7, l’API et le frontend **n’est pas dans ce dépôt**. Il vit dans le dossier parent qui contient les deux clones (`leafymap/docker-compose.yml`) et n’est pas versionné sur GitHub. Depuis ce dossier parent : `docker compose up -d`. L’API y est publiée sur le port **5002** (`MONGO_URI`, `DATABASE_URL` et `REDIS_URL` sont réécrits vers les noms de services). Au démarrage du conteneur API : `prisma migrate deploy`, `seed:categories`, puis `npm run dev:docker`.

Sans ce compose, lancer Postgres, Mongo et Redis soi-même et garder les URLs de `env.example`.
Identifiants Postgres du compose : `leafymap` / `leafymap` / db `leafymap`, port `5432`.

### Redis (cache)

- **Client** : `redis` (node-redis), via `src/infrastructure/persistence/redis.ts`
- **Port** : `ICache` (`src/domain/interfaces/ICache.ts`)
- **Usage actuel** :
  - `GET /api/categories` (clé `categories:all`, TTL 24h), invalidé par `npm run seed:categories`
  - `GET /api/places/in-view` et `GET /api/events/in-view` (bbox quantifiée, TTL 30s / 20s ; pas de cache sur `ids`)
  - `GET /api/geocode/suggest` et `GET /api/geocode/reverse` (TTL 1h)
- **Fail-open** : si `REDIS_URL` est absent ou Redis injoignable, l'API retombe sur Mongo
- **Docker local** : service `redis` (port `6379`) dans le compose à la racine du repo

```env
REDIS_URL=redis://localhost:6379
```

En production, pointer `REDIS_URL` vers l'URL **TCP** du provider (pas l'API REST Upstash). Upstash exige TLS : `rediss://default:PASSWORD@HOST:6379` (l'équivalent de `redis-cli --tls`). Tant que la variable n'est pas définie, le comportement reste celui d'avant (pas de cache).

### Mapbox (géocodage)

Le frontend utilise encore `NEXT_PUBLIC_MAPBOX_TOKEN` pour les **tuiles**. Le géocodage (autocomplete, reverse) passe par l'API :

- `GET /api/geocode/suggest?q=`
- `GET /api/geocode/reverse?lng=&lat=`

```env
MAPBOX_ACCESS_TOKEN=pk.your_mapbox_token
```

Si le token est absent ou Mapbox injoignable, l'API renvoie une liste vide / `null` (fail-open). À définir aussi sur Render (`MAPBOX_ACCESS_TOKEN`). Le token public des tuiles (`NEXT_PUBLIC_MAPBOX_TOKEN`) reste une variable **Vercel**, pas Render.

### AWS S3

- **SDK** : @aws-sdk/client-s3 v3
- **Upload** : Multer + S3
- **Signed URLs** : Génération pour accès sécurisé

## Dépendances principales

- **Express** : Framework web
- **Mongoose** : ODM MongoDB
- **Prisma** : ORM PostgreSQL (annonces plateforme)
- **Redis** : cache (catégories, carte in-view, géocodage ; fail-open)
- **Zod** : Validation de schémas
- **JWT** : Authentification
- **Bcrypt** : Hashage des mots de passe
- **Winston** : Logging
- **Sharp** : Traitement d'images
- **Helmet** : Sécurité HTTP
- **CORS** : Cross-Origin Resource Sharing

## Notes importantes

- **Logs** : Vérifier `logs/error.log` en cas de problème
- **Types** : Typer les nouvelles entités/domain dans `src/domain/`, les DTOs HTTP dans `src/api/dto/`, les types Express dans `src/api/types/`
- **Validation** : Créer un schéma Zod pour chaque nouveau endpoint
- **Tests** : Jest pour les tests unitaires, MongoMemory pour les repositories ;
  Postman reste utile pour une vérification manuelle des routes

## Déploiement

L'API de production est un **Web Service Render en runtime Node**. Le frontend est sur **Vercel** (voir le README frontend). MongoDB Atlas, PostgreSQL, Redis et S3 sont des services séparés. Il n'y a plus d'instance EC2, ni Nginx, ni PM2.

Le chemin de prod **n'est pas** le `Dockerfile`. Ce fichier est une image alternative, décrite plus bas. `Dockerfile.dev` sert au Compose local.

Branche déployée : **`main`**. Un push sur `develop` ne déploie rien et ne lance pas la CI.

### CI et livraison

| | CI (GitHub Actions) | Déploiement |
| --- | --- | --- |
| Déclencheur | pull request **vers** `main` | push sur `main` (auto-deploy Render), ou Manual Deploy |
| Rôle | prouver lint, Knip, build, tests | publier l'API |

La CI ne tourne pas après le merge (pas de job sur `push` `main`). Elle doit être verte **avant** la fusion. Render, lui, ne regarde pas le statut GitHub : un push sur `main` lance un build même si la CI n'a pas tourné.

### Service web Render (runtime Node)

1. Web Service connecté au dépôt `leafymap_backend`.
2. Runtime **Node 22** (`engines` : `>=22`). Environnement **Node**, pas Docker — sinon Render ignore les commandes ci-dessous et suit le `Dockerfile`.
3. Commandes :

```bash
# Build
npm run render:build

# Start
npm start
```

`render:build` = `npm install --include=dev && npm run build && prisma migrate deploy`.

- `npm install --include=dev` : TypeScript, Prisma CLI et `tsc-alias` sont en `devDependencies`. Un `npm ci --omit=dev` ne compilerait pas.
- `npm run build` : `prisma generate`, `tsc`, `tsc-alias`.
- `prisma migrate deploy` : applique les migrations **déjà commitées** dans `prisma/migrations`. Ça tourne pendant le **build**, pas au `npm start`. Une migration cassée fait échouer le deploy avant que le process écoute. Ne pas lancer `prisma migrate dev` sur Render.

`npm start` = `node -r tsconfig-paths/register dist/main/server.js`.

4. **Port.** Render injecte `PORT`. Le serveur écoute cette valeur (`src/main/server.ts`). Ne pas fixer `PORT=3000` ou `5002` dans le dashboard : le proxy Render n'atteindrait pas le process. Le `3000` du code n'est qu'un repli si `PORT` est absent. Le `5002` est le port du Compose local et l'`EXPOSE` du Dockerfile.

5. **`NODE_ENV=production`.** Render le définit. C'est ce qui active le cookie `Secure` + `SameSite=None` (le front Vercel et l'API ne sont pas le même site) et la liste CORS de production. Sans ça, le login depuis `https://www.leafymap.com` ne pose pas la session.

6. Variables dans le dashboard Render, jamais dans Git :

```env
MONGO_URI=mongodb+srv://...
DATABASE_URL=postgresql://...
JWT_SECRET=...
AWS_REGION=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=...
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
MAIL_FROM=...
GOOGLE_CLIENT_ID=....apps.googleusercontent.com
MAPBOX_ACCESS_TOKEN=pk....
REDIS_URL=rediss://default:PASSWORD@HOST:6379
```

`REDIS_URL` est optionnelle (fail-open vers Mongo). Upstash / Redis managé avec TLS : schéma **`rediss://`**, pas l'URL REST. `MAPBOX_ACCESS_TOKEN` est le token **serveur** (géocodage). Le token des tuiles reste sur Vercel.

Inutile de poser `FRONTEND_URL`, `ALLOWED_ORIGINS`, `JWT_EXPIRE` ou `GOOGLE_CLIENT_SECRET` : le runtime ne les lit pas. CORS et liens e-mail sont codés en dur :

- origines autorisées en production : `https://leafymap.com`, `https://www.leafymap.com` ;
- liens de vérification / reset : `https://leafymap.com` (apex, pas `www`).

7. HTTPS et le reverse proxy sont ceux de Render. Un domaine custom se branche dans le dashboard.
8. Auto-deploy sur `main`.

Logs, redémarrages, historique : dashboard du service. Contrôle utile dans les logs de **build** : la ligne `prisma migrate deploy`. Puis le log de start (`Server running in production mode` et `WebSocket server initialized`).

### Image Docker (alternative)

`Dockerfile` (racine du dépôt) :

- base `node:22-bookworm-slim` ;
- `npm ci` puis `npm run build` ;
- au **démarrage** du conteneur : `npx prisma migrate deploy && npm run seed:categories && npm start` ;
- `EXPOSE 5002` (indicatif ; le process écoute quand même `PORT`).

Différences avec le web service Node :

| | Render Node (`render:build`) | `Dockerfile` |
| --- | --- | --- |
| Migrations | pendant le build | au démarrage |
| `seed:categories` | non | oui, à chaque start |
| Commandes du dashboard | utilisées | ignorées si le runtime est Docker |

Le déploiement documenté ici est le runtime **Node**.

### Mise à jour

1. PR vers `main`, CI verte.
2. Merge. Avec l'auto-deploy, Render build tout seul. Sinon : **Manual Deploy**.
3. Lire le log : `prisma migrate deploy` OK, puis le process à l'écoute.
4. Smoke test depuis le site de prod (`https://www.leafymap.com`) : login (cookie cross-site) et une lecture publique, par exemple `GET /api/categories`.

### Checklist avant déploiement

- [ ] Runtime Render = **Node**, Node 22, build `npm run render:build`, start `npm start`
- [ ] `NODE_ENV=production` (automatique sur Render) — ne pas le forcer à `development`
- [ ] `PORT` laissé à Render (ne pas le surcharger)
- [ ] Secrets uniquement dans le dashboard : Mongo, `DATABASE_URL`, `JWT_SECRET`, S3, SMTP, `GOOGLE_CLIENT_ID`, `MAPBOX_ACCESS_TOKEN`, `REDIS_URL` en `rediss://` si TLS
- [ ] `GOOGLE_CLIENT_ID` identique à `NEXT_PUBLIC_GOOGLE_CLIENT_ID` sur Vercel
- [ ] Build local réussi (`npm run build`)
- [ ] CI GitHub Actions verte sur la PR vers `main`
- [ ] Logs Render : migrate pendant le build, start OK
- [ ] Login depuis `https://www.leafymap.com` et `GET /api/categories` en production
