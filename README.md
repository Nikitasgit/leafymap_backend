1. Créer le backend avec Node.js et Express, retourne "Welcome to innovastay" au port 3000.
2. Créer un repository pour le backend sur Github et y ajouter notre application.
3. Achat du nom de domaine "innovastay.fr".
4. Déployer l'application sur AWS EC2 instance sur une machine Ubuntu avec l'aide de ce tutoriel > https://github.com/saasscaleup/nodejs-ssl-server/blob/master/README.md.

- Création de notre instance EC2
- Connection via SSH Key
- Mettre à jour le sytème Ubuntu
- installer Node.js et NVM
- installer git
- Cloner notre repository github
- Installer pm2 qui relance notre application en cas de problème.
- Installer web server pour reverse proxy: Nginx (redirige toutes les requêtes vers le port 3000 défini et les requêtes HTTP vers HTTPS).
- Ajout de notre nom de domaine dans la configuration Nginx.
- Ajout de l'addresse IP de notre instance dans notre fournisseur de domaine (Route 53 AWS) > sous-domaine : api.server.innovastay.fr TTL 600 A.
- Installation de Cerbot qui nous permet d'obtenir un certificat SSL (https).

Le backend est maintenant disponible sur https://api.server.innovastay.fr

5. Création de l'application Next.js et du repository pour le frontend.
6. Déployement de l'application frontend sur Vercel, ajout du nom de domaine.
7. Changement des servernames de Route 53 pour les remplacer par ceux de Vercel, afin d'obtenir un wildcard (\*.innovastay.fr). On ajoute également dans nos DNS records de Vercel: api.server.innovastay.fr A avec l'addresse ip de notre instance EC2.

   Pourquoi commencer par le déployement? Pour commencer, le référencement Google peut prendre du temps ainsi que la mise en ligne globale du site. Ensuite, pour tester un système de création de domaines et sous-domaines via la plateforme.

8. Choix de la palette couleurs pour la plateforme.
9. Création de la maquette mobile Figma pour la plateforme, ainsi que les composants réutilisables tel que boutons, formulaires, titres, textes, cards, inputs, containers.
