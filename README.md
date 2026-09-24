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
   - [Service web Render](#service-web-render)
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
- Cible `local` : utilise `E2E_MONGODB_URI` si défini, sinon `MONGODB_URI` (localhost / `mongo`)
- Cible `staging` : `MONGODB_URI` Atlas dont l’hôte contient `staging`, plus `--confirm staging`
- Cible `production` : le script charge `.env.prod` et écrase `MONGODB_URI` déjà présent dans l’environnement. L’hôte doit contenir `production` ou `prod.`, et `--confirm production` est obligatoire. Refusée si l’hôte est local ou staging.
- `--reset` : supprime uniquement les comptes `@leafymap.seed` et les objets S3 `images/seed/`
- Mot de passe commun : `SEED_USER_PASSWORD` ou défaut `SeedUser!2026`
- Comptes démo : `boulangerie.martin@leafymap.seed`, `le.bar.perche@leafymap.seed`, `atelier.luma@leafymap.seed`
- `--skip-images` : pas d’upload AWS (avatars par défaut dans l’UI)
- Pool d’images : ~60 photos thématiques réutilisées, préfixe S3 `images/seed/` (le bucket est partagé avec la prod)
- Ne pas lancer depuis docker-compose / Dockerfile (trop lourd + effets S3)

La CI exécute, dans l'ordre : `lint:ci`, `knip`, `build`, tests unitaires, puis
tests d'intégration et couverture. Elle s'exécute pour `develop` et `main`.
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

```env
PORT=3000
NODE_ENV=development|production
MONGODB_URI=mongodb://...
DATABASE_URL=postgresql://leafymap:leafymap@localhost:5432/leafymap?schema=public
REDIS_URL=redis://localhost:6379
MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
JWT_SECRET=your_secret_key
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=...
AWS_BUCKET_NAME=...
```

### MongoDB

- **ODM** : Mongoose
- **Connexion** : Configurée dans `src/infrastructure/persistence/db.ts`
- **Indexes** : 2dsphere pour géolocalisation

### PostgreSQL (Prisma — annonces CMS)

- **ORM** : Prisma (`prisma/schema.prisma`)
- **Connexion** : `DATABASE_URL` via `src/infrastructure/persistence/prisma.ts`
- **Docker local** :

```bash
# Depuis leafymap_backend/ (Docker Desktop doit être démarré)
docker compose up -d
npx prisma migrate deploy
# ou en dev :
npx prisma migrate dev
```

Le compose démarre Postgres 16 sur le port `5432` (`leafymap` / `leafymap` / db `leafymap`).
Voir aussi `env.example`.

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

Si le token est absent ou Mapbox injoignable, l'API renvoie une liste vide / `null` (fail-open). À définir aussi sur Render, côté web service.

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

L'API est hébergée sur **Render** (web service Node.js). Le frontend reste sur **Vercel**. Les images restent sur **AWS S3** ; MongoDB Atlas et PostgreSQL sont des services managés distincts. Il n'y a plus d'instance EC2, ni Nginx, ni PM2.

### Service web Render

1. Créer un **Web Service** sur Render, connecté au dépôt GitHub `leafymap_backend`.
2. Runtime **Node**.
3. Commandes :

```bash
# Build
npm run render:build

# Start
npm start
```

`render:build` installe les dépendances (y compris `devDependencies` nécessaires à TypeScript / Prisma), compile, puis exécute `prisma migrate deploy`.

4. Renseigner les variables d'environnement dans le dashboard Render (mêmes clés que le `.env` local : `MONGODB_URI`, `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `FRONTEND_URL`, clés S3, SMTP, `MAPBOX_ACCESS_TOKEN`, etc.). Ne jamais committer les secrets.
5. HTTPS et le reverse proxy sont fournis par Render. Un domaine personnalisé peut être branché dans le dashboard (DNS chez le registrar).
6. Activer le **auto-deploy** sur `main` : un push qui passe (idéalement après CI GitHub Actions) déclenche un nouveau build Render.

Logs, redémarrages et historique des deploys : dashboard Render du service.

### Mise à jour

Avec l'auto-deploy : `git push` sur `main` suffit. Sinon : **Manual Deploy** dans Render.

Vérifier ensuite les logs du deploy (build, migrate, start) puis un appel à l'API en production.

### Checklist avant déploiement

- [ ] Variables d'environnement à jour dans Render (rien de secret dans Git)
- [ ] Build local réussi (`npm run build`)
- [ ] CI GitHub Actions verte sur la PR
- [ ] Push sur `main` (ou deploy manuel Render)
- [ ] Logs Render : migrate + start OK
- [ ] Test de l'API en production (`FRONTEND_URL` / CORS cohérents avec `https://leafymap.com`)
