# Documentation Backend - Leafy Map

testsss
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
   - [Déploiement initial sur AWS EC2](#déploiement-initial-sur-aws-ec2)
   - [Mise à jour du backend](#mise-à-jour-du-backend-après-un-push)
   - [Commandes PM2 utiles](#commandes-pm2-utiles)
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

# Démarrage en production
npm start
```

## Architecture du projet

```
leafymap-backend/
├── app.ts                 # Configuration Express et middlewares
├── server.ts              # Point d'entrée de l'application
├── config/                # Configuration (DB, AWS, etc.)
├── controllers/           # Logique métier des routes
├── middlewares/           # Middlewares personnalisés
├── models/                # Modèles Mongoose
├── routes/                # Définition des routes API
├── services/              # Services réutilisables
├── types/                 # Types et interfaces TypeScript
├── utils/                 # Fonctions utilitaires
├── validations/           # Schémas de validation Zod
└── logs/                  # Logs d'application (Winston)
```

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

- **Fichier** : `middlewares/auth.ts`
- **Vérification** : Token depuis cookies ou header `Authorization`
- **Décodage JWT** : Extraction des informations utilisateur
- **Validation** : Vérification que l'utilisateur existe toujours
- **Injection** : `req.decoded` contient les données utilisateur

### 2. Système de permissions et rôles

#### Types d'utilisateurs

- **Guest** : Utilisateur de base, peut consulter les événements et la carte
- **Creator** : Organisateur ou hôte d'événements avec profil public et lieu associé
- **Organizer** : Responsable de lieu qui accueille et publie des événements (documentation legacy)

#### Limitations par rôle

##### Guest

- ✅ Peut créer un profil **Creator** ou **Organizer**
- ❌ Ne peut PAS créer de lieu
- ❌ Ne peut PAS créer d'événement
- ❌ Ne peut PAS créer de partnership

##### Creator

- ✅ Peut créer **1 seul lieu** maximum (limite globale : 1 lieu par utilisateur)
- ✅ Peut créer des événements
- ✅ Peut **modifier le statut** d'un partnership (accepter/refuser)
- ❌ Ne peut PAS créer de partnership
- ✅ Possède un profil avec `creatorName` et `creatorCategories` (SubCategories)

##### Organizer

- ✅ Peut créer **1 seul lieu** maximum (limite globale : 1 lieu par utilisateur)
- ✅ Peut créer des événements
- ✅ Peut **créer des partnerships** (demandes de collaboration)
- ❌ Ne peut PAS modifier le statut d'un partnership

#### Règles de propriété

##### Places (Lieux)

- Seul le **créateur du lieu** peut le modifier
- Seul le **créateur du lieu** peut le supprimer
- Middleware : `placeOwnership.ts` vérifie la propriété

##### Events (Événements)

- Peuvent être créés par **Creator** OU **Organizer**
- Seul le **propriétaire du lieu** associé peut modifier l'événement
- Seul le **propriétaire du lieu** associé peut supprimer l'événement
- Middleware : `eventOwnership.ts` vérifie la propriété

##### Partnerships (Partenariats)

- Créés par des **Organizers** uniquement
- Statut modifié par des **Creators** uniquement
- Workflow : `pending` → `accepted` ou `refused`

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
- **Création** : Disponible pour Creators et Organizers uniquement
- **Modification/Suppression** : Réservée au propriétaire du lieu associé

#### Users (Utilisateurs)

- **Types d'utilisateurs** : creator, organizer, guest
- **Profils** : Informations personnelles, catégories de créateur
- **Suivis** : Système de followers pour les lieux
- **Creator profile** :
  - `creatorName` : Nom d'artiste (max 30 caractères)
  - `creatorCategories` : Références aux SubCategories
  - Associé à une ou plusieurs catégories d'artisan

#### Partnerships (Partenariats)

- Demandes de collaboration entre utilisateurs et lieux
- Workflow : pending → accepted/refused
- **Création** : Organizers uniquement
- **Validation** : Creators uniquement (acceptation/refus)

#### Categories & SubCategories

- **Category** : Catégorie principale (ex: "Art", "Artisanat", "Alimentaire")
- **SubCategory** : Sous-catégorie liée à une Category
  - Exemple : Category "Artisanat" → SubCategory "Céramiste", "Tisserand", "Forgeron"
  - Les **SubCategories** sont utilisées pour les `creatorCategories` des utilisateurs
  - Un creator peut avoir plusieurs SubCategories
  - Chaque SubCategory référence une Category parente

#### Images

- **Upload vers AWS S3** : Stockage sécurisé des images
- **Processing** : Optimisation avec Sharp
- **Middlewares** : Autorisation d'upload/delete, traitement mémoire
- **URLs signés** : Génération automatique à chaque récupération

### 4. URLs signés pour les images (AWS S3)

#### Fonctionnement

Les images stockées sur S3 ne sont pas accessibles publiquement. À chaque récupération d'une image depuis la base de données, un **URL signé** temporaire est généré automatiquement.

#### Implémentation dans `models/Image.ts`

**Middleware Mongoose post-hook** :

```typescript
imageSchema.post(
  ["find", "findOne", "findOneAndUpdate"],
  async function (docs) {
    // Génère automatiquement des URLs signés après chaque requête
    doc.urls.original = await generateSignedUrlFromFullUrl(doc.urls.original);
    doc.urls.thumbnail = await generateSignedUrlFromFullUrl(doc.urls.thumbnail);
    doc.urls.medium = await generateSignedUrlFromFullUrl(doc.urls.medium);
  }
);
```

#### Processus de génération (`utils/s3.ts`)

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
- **Interfaces pour les modèles** : Types partagés dans `/types/models/`
- **Path aliases** : `types/*` pour les imports
- **ObjectId Mongoose** : Utilise `Types.ObjectId` pour les références
- **Populate** : Les données sont populées dans les controllers selon les besoins, mais pas de types `Populated` spécifiques (côté frontend uniquement)

### Architecture

- **Séparation des responsabilités** :
  - Routes → Controllers → Services → Models
  - Middlewares réutilisables
  - Utilitaires isolés

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
    data?: any,
    error?: string
  }
  ```

## 🔧 Configuration

### Variables d'environnement requises

```env
PORT=3000
NODE_ENV=development|production
MONGODB_URI=mongodb://...
JWT_SECRET=your_secret_key
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=...
AWS_BUCKET_NAME=...
```

### MongoDB

- **ODM** : Mongoose
- **Connexion** : Configurée dans `config/db.ts`
- **Indexes** : 2dsphere pour géolocalisation

### AWS S3

- **SDK** : @aws-sdk/client-s3 v3
- **Upload** : Multer + S3
- **Signed URLs** : Génération pour accès sécurisé

## Dépendances principales

- **Express** : Framework web
- **Mongoose** : ODM MongoDB
- **Zod** : Validation de schémas
- **JWT** : Authentification
- **Bcrypt** : Hashage des mots de passe
- **Winston** : Logging
- **Sharp** : Traitement d'images
- **Helmet** : Sécurité HTTP
- **CORS** : Cross-Origin Resource Sharing

## Notes importantes

- **Logs** : Vérifier `logs/error.log` en cas de problème
- **Types** : Toujours typer les nouvelles entités dans `/types`
- **Validation** : Créer un schéma Zod pour chaque nouveau endpoint
- **Tests** : Utiliser Postman/Thunder Client pour tester les routes

## Déploiement

### Déploiement initial sur AWS EC2

Le backend est déployé sur une instance AWS EC2 Ubuntu. Voici les étapes qui ont été suivies :

#### 1. Configuration de l'instance EC2

- Création d'une instance EC2 sur AWS
- Génération d'une paire de clés SSH (`.pem`)
- Configuration des groupes de sécurité (ports 80, 443, 22)

#### 2. Connexion et configuration du serveur

```bash
# Connexion SSH à l'instance
ssh -i "votre-cle.pem" ubuntu@your-instance.compute.amazonaws.com

# Mise à jour du système Ubuntu
sudo apt update && sudo apt upgrade -y
```

#### 3. Installation des dépendances

```bash
# Installation de Node.js via NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Installation de Git
sudo apt install git -y

# Installation de PM2 (Process Manager)
npm install -g pm2
```

#### 4. Clonage et configuration du projet

```bash
# Cloner le repository
git clone https://github.com/your-username/your-backend.git
cd your-backend

# Installation des dépendances
npm install

# Création du fichier .env avec les variables d'environnement
nano .env

# Build du projet TypeScript
npm run build

# Démarrage avec PM2
pm2 start dist/server.js --name backend-app
pm2 save
pm2 startup
```

#### 5. Configuration de Nginx (Reverse Proxy)

```bash
# Installation de Nginx
sudo apt install nginx -y

# Configuration du reverse proxy
sudo nano /etc/nginx/sites-available/backend

# Redirection des requêtes vers le port 3000
# Redirection HTTP → HTTPS automatique
```

Configuration Nginx :

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 6. Configuration DNS (Route 53)

- Ajout d'un enregistrement A : `api.yourdomain.com` → IP de l'instance EC2
- TTL : 600 secondes

#### 7. Certificat SSL avec Certbot

```bash
# Installation de Certbot
sudo apt install certbot python3-certbot-nginx -y

# Génération du certificat SSL
sudo certbot --nginx -d api.yourdomain.com

# Renouvellement automatique configuré
```

Le backend est maintenant accessible sur **https://api.yourdomain.com**

---

### Mise à jour du backend (après un push)

Lorsque vous poussez des modifications sur le repository GitHub, suivez ces étapes pour mettre à jour le serveur :

#### Étape 1 : Connexion SSH au serveur

```bash
# Remplacer par votre clé et votre instance
ssh -i "votre-cle-ssh.pem" ubuntu@votre-instance.compute.amazonaws.com
```

> ⚠️ **Important** : Assurez-vous que votre fichier de clé SSH a les bonnes permissions :
>
> ```bash
> chmod 400 votre-cle-ssh.pem
> ```

#### Étape 2 : Navigation vers le projet

```bash
cd your-backend
```

#### Étape 3 : Récupération des dernières modifications

```bash
git pull origin main
```

#### Étape 4 : Installation des nouvelles dépendances (si nécessaire)

```bash
npm install
```

#### Étape 5 : Build du projet TypeScript

```bash
npm run build
```

#### Étape 6 : Redémarrage de l'application avec PM2

```bash
pm2 restart backend-app
```

#### Étape 7 : Vérification du statut

```bash
# Vérifier que l'application tourne correctement
pm2 status

# Voir les logs en temps réel (optionnel)
pm2 logs backend-app

# Voir les logs d'erreur uniquement
pm2 logs backend-app --err
```

### Commandes PM2 utiles

````bash
# Voir le statut de toutes les applications
pm2 status

# Voir les logs
pm2 logs backend-app

# Arrêter l'application
pm2 stop backend-app

# Démarrer l'application
pm2 start backend-app

# Redémarrer l'application
pm2 restart backend-app

# Supprimer l'application de PM2
pm2 delete backend-app

# Vider les logs
pm2 flush


### Résumé rapide : Mise à jour en 5 commandes

```bash
ssh -i "votre-cle.pem" ubuntu@your-instance.compute.amazonaws.com
cd your-backend
git pull
npm run build
pm2 restart backend-app
````

### Checklist avant déploiement

- [ ] Variables d'environnement à jour sur le serveur
- [ ] Build local réussi
- [ ] Commit et push sur GitHub
- [ ] Connexion SSH au serveur OK
- [ ] Git pull réussi
- [ ] Build sur le serveur réussi
- [ ] PM2 restart effectué
- [ ] Vérification des logs PM2
- [ ] Test de l'API en production
