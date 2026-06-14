# Support Merise - LeafyMap

Ce document sert de support pour construire le MCD dans Looping. Il represente le modele MongoDB actuel de LeafyMap en version **simplifiee** : une entite Merise correspond a une collection, les sous-documents restent des attributs ou sont volontairement ignores pour la lisibilite du dossier.

Evolutions integrees : notifications email, reservations, categories d'evenements, role admin, bannissement et suppression logique.

La messagerie est volontairement ignoree.

## Hypotheses De Modelisation

- Les seuls roles applicatifs retenus sont `guest`, `creator` et `admin`.
- Le role `creator` couvre aussi les usages d'organisation d'evenements et de gestion de lieu.
- Le MCD est volontairement simplifie : environ une vingtaine d'entites, proche des collections MongoDB.
- Les sous-documents MongoDB (`schedule`, horaires de lieu, etc.) ne sont pas eclates en entites Merise.
- Les references polymorphes MongoDB sont remplacees par des associations explicites ou par des cles etrangeres optionnelles.
- Les contenus supprimes par un administrateur ne sont pas effaces physiquement : ils passent en `deleted = true`.
- Les notifications sont stockees en base, mais les emails envoyes a partir des notifications ne sont pas historises dans une table dediee.
- `email_notifications_enabled` est un attribut direct de `User`.

## Hors Perimetre Du MCD

- `Conversation`, `Message`, `Comment` : messagerie exclue.
- `Product`, `ProductCategory` : hors perimetre tant qu'ils ne sont pas centraux dans le dossier.
- Horaires de lieu (`defaultSchedule`, `customDates`, `timeSlots`) : presents en MongoDB mais non modelises dans le MCD.
- `UserInterest` : non modelise.

## Liste Des Entites Retenues

1. `User`
2. `Category`
3. `UserCategory`
4. `PlaceCategory`
5. `PlaceType`
6. `Place`
7. `EventCategory`
8. `Event`
9. `EventPeriod`
10. `EventTimeSlot`
11. `EventTimeSlotCollaborator`
12. `EventBooking`
13. `EventInvitation`
14. `Partnership`
15. `Review`
16. `Favorite`
17. `Follow`
18. `Image`
19. `Notification`

## Entites Principales A Saisir

### User

Utilisateur de la plateforme.

Attributs recommandes :

- `id_user` : identifiant.
- `email` : unique, obligatoire.
- `password_hash` : obligatoire sauf fournisseur externe.
- `username` : unique si renseigne.
- `firstname`.
- `lastname`.
- `website`.
- `phone`.
- `description`.
- `country`.
- `role` : `guest`, `creator`, `admin`.
- `email_notifications_enabled` : booleen.
- `accepted_cgu` : booleen.
- `accepted_at` : date.
- `email_verified` : booleen.
- `banned` : booleen.
- `banned_at`.
- `ban_reason`.
- `deleted` : booleen.
- `deleted_at`.
- `deleted_by_user_id` : administrateur ayant supprime le compte, nullable.
- `created_at`.
- `updated_at`.

L'utilisateur peut accepter ou refuser les notifications email :

- lors de l'inscription, avec une case a cocher separee des CGU ;
- dans les parametres de compte, modifiable a tout moment.

Remarque : dans Looping, `role` peut rester un attribut simple. Il n'est pas necessaire de creer une entite `Role`.

### Category

Categorie generale pouvant regrouper des sous-categories.

Attributs recommandes :

- `id_category` : identifiant.
- `name` : unique, obligatoire.
- `deleted` : booleen.
- `created_at`.
- `updated_at`.

### UserCategory

Categorie ou specialite associee aux profils creators.

Attributs recommandes :

- `id_user_category` : identifiant.
- `name` : obligatoire.
- `type` : `creation` ou `organization` si cette distinction reste utile. Ce champ ne cree pas un role `organizer`.
- `deleted` : booleen.
- `created_at`.
- `updated_at`.

### PlaceCategory

Categorie de lieu.

Attributs recommandes :

- `id_place_category` : identifiant.
- `name` : obligatoire.
- `description`.
- `deleted` : booleen.
- `created_at`.
- `updated_at`.

### PlaceType

Type de lieu. Exemple : `food`, `art`, `craft`.

Attributs recommandes :

- `id_place_type` : identifiant.
- `code` : unique, obligatoire.
- `label` : obligatoire.

Un lieu possede **un seul** type.

### Place

Lieu cree par un creator.

Attributs recommandes :

- `id_place` : identifiant.
- `mapbox_id`.
- `label`.
- `longitude`.
- `latitude`.
- `rating`.
- `deleted` : booleen.
- `deleted_at`.
- `deleted_by_user_id` : administrateur ayant supprime le lieu, nullable.
- `moderation_reason`.
- `created_at`.
- `updated_at`.

Les horaires du lieu existent en MongoDB mais ne sont pas modelises dans ce MCD.

### EventCategory

Categorie d'evenement.

Attributs recommandes :

- `id_event_category` : identifiant.
- `name` : unique, obligatoire.
- `description`.
- `deleted` : booleen.
- `created_at`.
- `updated_at`.

Cette entite est separee de `Category` pour rendre le MCD plus lisible.

### Event

Evenement publie par un creator.

Attributs recommandes :

- `id_event` : identifiant.
- `name` : obligatoire.
- `description` : obligatoire.
- `online` : booleen.
- `address_label` : utile si l'evenement n'est pas lie a un lieu.
- `longitude` : nullable.
- `latitude` : nullable.
- `status` : `available`, `full`, `cancelled`.
- `lifecycle_status` : `unvalid`, `upcoming`, `ongoing`, `completed`.
- `first_date`.
- `latest_date`.
- `rating`.
- `is_bookable` : booleen.
- `capacity` : nombre total de places disponibles, nullable si non limite.
- `max_seats_per_booking` : nombre maximum de places par reservation.
- `deleted` : booleen.
- `deleted_at`.
- `deleted_by_user_id` : administrateur ayant supprime l'evenement, nullable.
- `moderation_reason`.
- `created_at`.
- `updated_at`.

### EventPeriod

Periode de l'evenement.

Attributs recommandes :

- `id_event_period` : identifiant.
- `start_date`.
- `end_date`.

### EventTimeSlot

Creneau horaire d'une periode d'evenement.

Attributs recommandes :

- `id_event_time_slot` : identifiant.
- `title`.
- `start_time`.
- `end_time`.

### EventTimeSlotCollaborator

Entite d'association entre `EventTimeSlot` et `User`.

Attributs recommandes :

- `id_event_time_slot_collaborator` : identifiant.
- `created_at`.

### EventBooking

Reservation d'un utilisateur pour un evenement.

Attributs recommandes :

- `id_event_booking` : identifiant.
- `seats` : nombre de places reservees.
- `status` : `pending`, `confirmed`, `cancelled`.
- `booked_at`.
- `cancelled_at`.
- `deleted` : booleen.
- `deleted_at`.
- `deleted_by_user_id` : administrateur ayant supprime la reservation, nullable.
- `created_at`.
- `updated_at`.

### EventInvitation

Invitation d'un utilisateur a collaborer sur un evenement.

Attributs recommandes :

- `id_event_invitation` : identifiant.
- `status` : `pending`, `accepted`, `refused`, `cancelled`, `completed`.
- `deleted` : booleen.
- `deleted_at`.
- `deleted_by_user_id` : administrateur ayant supprime l'invitation, nullable.
- `created_at`.
- `updated_at`.

### Partnership

Demande de partenariat entre deux creators.

Attributs recommandes :

- `id_partnership` : identifiant.
- `status` : `pending`, `accepted`, `refused`, `cancelled`, `completed`.
- `deleted` : booleen.
- `deleted_at`.
- `deleted_by_user_id` : administrateur ayant supprime le partenariat, nullable.
- `created_at`.
- `updated_at`.

### Review

Avis laisse par un utilisateur sur un lieu ou un evenement.

Attributs recommandes :

- `id_review` : identifiant.
- `rating` : note de 1 a 5.
- `comment`.
- `certified` : booleen.
- `deleted` : booleen.
- `deleted_at`.
- `deleted_by_user_id` : administrateur ayant supprime l'avis, nullable.
- `moderation_reason`.
- `created_at`.
- `updated_at`.

Pour eviter une reference polymorphe, utiliser deux associations optionnelles vers `Place` et `Event`, avec la regle qu'une seule des deux doit etre renseignee.

### Favorite

Favori d'un utilisateur sur un lieu.

Attributs recommandes :

- `id_favorite` : identifiant.
- `created_at`.

### Follow

Abonnement d'un utilisateur a un autre utilisateur.

Attributs recommandes :

- `id_follow` : identifiant.
- `created_at`.

### Image

Image rattachee a un contenu.

Attributs recommandes :

- `id_image` : identifiant.
- `original_url`.
- `thumbnail_url`.
- `medium_url`.
- `original_name`.
- `size`.
- `mimetype`.
- `type` : `profile`, `cover`, `gallery`, `other`.
- `deleted` : booleen.
- `deleted_at`.
- `deleted_by_user_id` : administrateur ayant supprime l'image, nullable.
- `moderation_reason`.
- `created_at`.
- `updated_at`.

Associations optionnelles vers `User`, `Place`, `Event`, `Review`. Une seule reference cible doit etre renseignee.

### Notification

Notification applicative recue par un utilisateur.

Attributs recommandes :

- `id_notification` : identifiant.
- `action` : `partnership_invitation`, `partnership_accepted`, `event_invitation`, `event_accepted`, `event_refused`, `review`, `new_follower`, `other`.
- `message`.
- `read` : booleen.
- `read_at`.
- `created_at`.
- `updated_at`.

L'email n'a pas d'entite dediee. Une notification peut provoquer un email si le type est eligible et si `User.email_notifications_enabled = true` pour le destinataire.

## Associations Et Cardinalites Merise

### Utilisateurs

- `User` appartient eventuellement a `UserCategory`

  - `User` : 0,1
  - `UserCategory` : 0,N
  - Regle : utile pour qualifier le profil principal d'un creator.

- `User` suit un autre `User` via `Follow`
  - follower : `User` 0,N
  - following : `User` 0,N
  - Regle : un utilisateur ne peut pas suivre deux fois le meme utilisateur.

### Lieux

- `User` cree `Place`

  - `User` : 0,1
  - `Place` : 1,1
  - Regle : un creator peut avoir au maximum un lieu ; un guest ne peut pas creer de lieu.

- `Place` appartient a `PlaceCategory`

  - `Place` : 1,1
  - `PlaceCategory` : 0,N

- `Place` possede un `PlaceType`
  - `Place` : 1,1
  - `PlaceType` : 0,N
  - Regle : un lieu possede un seul type.

### Evenements

- `User` cree `Event`

  - `User` : 0,N
  - `Event` : 1,1
  - Regle : seuls les creators peuvent creer des evenements.

- `Event` appartient a `EventCategory`

  - `Event` : 1,1
  - `EventCategory` : 0,N

- `Event` peut etre rattache a `Place`

  - `Event` : 0,1
  - `Place` : 0,N
  - Regle : un evenement non en ligne doit avoir soit un lieu, soit une localisation libre.

- `Event` possede des periodes

  - `Event` : 1,N
  - `EventPeriod` : 1,1

- `EventPeriod` possede des creneaux

  - `EventPeriod` : 0,N
  - `EventTimeSlot` : 1,1

- `EventTimeSlot` a des collaborateurs via `EventTimeSlotCollaborator`
  - `EventTimeSlot` : 0,N
  - `User` : 0,N
  - Association porteuse : `EventTimeSlotCollaborator`.

### Reservations

- `User` reserve `Event` via `EventBooking`
  - `User` : 0,N
  - `Event` : 0,N
  - Association porteuse : `EventBooking`.
  - Regle : reservation possible uniquement si `Event.is_bookable = true`.
  - Regle : `EventBooking.seats` doit etre superieur a 0 et inferieur ou egal a `Event.max_seats_per_booking`.
  - Regle : la somme des reservations confirmees ne doit pas depasser `Event.capacity` si la capacite est renseignee.

### Invitations Et Partenariats

- `EventInvitation` concerne un `Event`

  - `Event` : 0,N
  - `EventInvitation` : 1,1

- `EventInvitation` est initiee par un `User`

  - initiator : `User` 0,N
  - `EventInvitation` : 1,1

- `EventInvitation` cible un `User`

  - collaborator : `User` 0,N
  - `EventInvitation` : 1,1

- `Partnership` est initie par un `User`

  - initiator : `User` 0,N
  - `Partnership` : 1,1

- `Partnership` cible un `User`
  - collaborator : `User` 0,N
  - `Partnership` : 1,1

### Avis, Favoris Et Images

- `User` ecrit `Review`

  - `User` : 0,N
  - `Review` : 1,1

- `Review` concerne soit `Place`, soit `Event`

  - `Place` : 0,N
  - `Review` : 0,1
  - `Event` : 0,N
  - `Review` : 0,1
  - Regle : une review doit concerner exactement un seul contenu.

- `User` ajoute `Place` en favori via `Favorite`

  - `User` : 0,N
  - `Place` : 0,N
  - Association porteuse : `Favorite`.
  - Regle : un meme utilisateur ne peut pas ajouter deux fois le meme lieu en favori.

- `Image` est ajoutee par un `User`

  - `User` : 0,N
  - `Image` : 0,1

- `Image` illustre soit `User`, soit `Place`, soit `Event`, soit `Review`
  - Regle : une image doit etre rattachee a un seul type de contenu.

### Notifications

- `User` envoie `Notification`

  - sender : `User` 0,N
  - `Notification` : 1,1

- `User` recoit `Notification`

  - receiver : `User` 0,N
  - `Notification` : 1,1

- `Notification` peut concerner un contenu metier
  - `Event` : 0,N
  - `Partnership` : 0,N
  - `EventInvitation` : 0,N
  - `Review` : 0,N
  - `Follow` : 0,N
  - `Notification` : 0,1 pour chaque association optionnelle.
  - Regle : une notification reference au maximum un contenu metier.

## MLD Relationnel Propose

Notation :

- `PK` : cle primaire.
- `FK` : cle etrangere.
- `UQ` : contrainte d'unicite.
- `NN` : non nullable.

### Utilisateurs

`user` : ok

- `id_user` PK.
- `id_user_category` FK nullable vers `user_category`.
- `email` UQ NN.
- `password_hash` NN.
- `username` UQ nullable.
- `firstname`.
- `lastname`.
- `website`.
- `phone`.
- `description`.
- `country`.
- `role` NN.
- `email_notifications_enabled` NN.
- `accepted_cgu` NN.
- `accepted_at` NN.
- `email_verified` NN.
- `banned` NN.
- `banned_at`.
- `ban_reason`.
- `deleted` NN.
- `deleted_at`.
- `deleted_by_user_id` FK nullable vers `user`.
- `created_at` NN.
- `updated_at` NN.

`category` : ok

- `id_category` PK.
- `name` UQ NN.
- `deleted` NN.
- `created_at` NN.
- `updated_at` NN.

`user_category` : ok

- `id_user_category` PK.
- `id_category` FK NN vers `category`.
- `name` NN.
- `type` NN.
- `deleted` NN.
- `created_at` NN.
- `updated_at` NN.

`follow` :

- `id_follow` PK.
- `id_follower` FK NN vers `user`.
- `id_following` FK NN vers `user`.
- `created_at` NN.
- UQ (`id_follower`, `id_following`).

### Lieux

`place_category` : ok

- `id_place_category` PK.
- `name` NN.
- `description`.
- `deleted` NN.
- `created_at` NN.
- `updated_at` NN.

`place_type` : ok

- `id_place_type` PK.
- `code` UQ NN.
- `label` NN.

`place` : ok

- `id_place` PK.
- `id_user` FK UQ NN vers `user`.
- `id_place_category` FK NN vers `place_category`.
- `id_place_type` FK NN vers `place_type`.
- `mapbox_id`.
- `label` NN.
- `longitude` NN.
- `latitude` NN.
- `rating` NN.
- `deleted` NN.
- `deleted_at`.
- `deleted_by_user_id` FK nullable vers `user`.
- `moderation_reason`.
- `created_at` NN.
- `updated_at` NN.

### Evenements

`event_category` : OK

- `id_event_category` PK.
- `name` UQ NN.
- `description`.
- `deleted` NN.
- `created_at` NN.
- `updated_at` NN.

`event` : OK

- `id_event` PK.
- `id_user` FK NN vers `user`.
- `id_place` FK nullable vers `place`.
- `id_event_category` FK NN vers `event_category`.
- `name` NN.
- `description` NN.
- `online` NN.
- `address_label`.
- `longitude`.
- `latitude`.
- `status` NN.
- `lifecycle_status` NN.
- `first_date`.
- `latest_date`.
- `rating` NN.
- `is_bookable` NN.
- `capacity`.
- `max_seats_per_booking`.
- `deleted` NN.
- `deleted_at`.
- `deleted_by_user_id` FK nullable vers `user`.
- `moderation_reason`.
- `created_at` NN.
- `updated_at` NN.

`event_period` : ok

- `id_event_period` PK.
- `id_event` FK NN vers `event`.
- `start_date` NN.
- `end_date` NN.

`event_time_slot` : ok

- `id_event_time_slot` PK.
- `id_event_period` FK NN vers `event_period`.
- `title` NN.
- `start_time` NN.
- `end_time` NN.

`event_time_slot_collaborator` : ok

- `id_event_time_slot_collaborator` PK.
- `id_event_time_slot` FK NN vers `event_time_slot`.
- `id_user` FK NN vers `user`.
- UQ (`id_event_time_slot`, `id_user`).

`event_booking` : ok

- `id_event_booking` PK.
- `id_event` FK NN vers `event`.
- `id_user` FK NN vers `user`.
- `seats` NN.
- `status` NN.
- `booked_at` NN.
- `cancelled_at`.
- `deleted` NN.
- `deleted_at`.
- `deleted_by_user_id` FK nullable vers `user`.
- `created_at` NN.
- `updated_at` NN.
- UQ partielle (`id_event`, `id_user`) sur les reservations actives. Si le SGBD ne supporte pas les index partiels, appliquer cette regle dans le service metier.

### Interactions

`event_invitation` : ok

- `id_event_invitation` PK.
- `id_event` FK NN vers `event`.
- `id_initiator` FK NN vers `user`.
- `id_collaborator` FK NN vers `user`.
- `status` NN.
- `deleted` NN.
- `deleted_at`.
- `deleted_by_user_id` FK nullable vers `user`.
- `created_at` NN.
- `updated_at` NN.
- UQ (`id_event`, `id_initiator`, `id_collaborator`).

`partnership` : ok

- `id_partnership` PK.
- `id_initiator` FK NN vers `user`.
- `id_collaborator` FK NN vers `user`.
- `status` NN.
- `deleted` NN.
- `deleted_at`.
- `deleted_by_user_id` FK nullable vers `user`.
- `created_at` NN.
- `updated_at` NN.
- UQ (`id_initiator`, `id_collaborator`).

`review` : ok

- `id_review` PK.
- `id_author` FK NN vers `user`.
- `id_place` FK nullable vers `place`.
- `id_event` FK nullable vers `event`.
- `rating` NN.
- `comment`.
- `certified` NN.
- `deleted` NN.
- `deleted_at`.
- `deleted_by_user_id` FK nullable vers `user`.
- `moderation_reason`.
- `created_at` NN.
- `updated_at` NN.
- UQ (`id_author`, `id_place`) si avis sur lieu.
- UQ (`id_author`, `id_event`) si avis sur evenement.

`favorite` :

- `id_favorite` PK.
- `id_user` FK NN vers `user`.
- `id_place` FK NN vers `place`.
- `created_at` NN.
- UQ (`id_user`, `id_place`).

`image` : ok

- `id_image` PK.
- `id_uploader` FK nullable vers `user`.
- `id_user_reference` FK nullable vers `user`.
- `id_place_reference` FK nullable vers `place`.
- `id_event_reference` FK nullable vers `event`.
- `id_review_reference` FK nullable vers `review`.
- `original_url` NN.
- `thumbnail_url` NN.
- `medium_url` NN.
- `original_name` NN.
- `size` NN.
- `mimetype` NN.
- `type` NN.
- `deleted` NN.
- `deleted_at`.
- `deleted_by_user_id` FK nullable vers `user`.
- `moderation_reason`.
- `created_at` NN.
- `updated_at` NN.

### Notifications

`notification` : ok

- `id_notification` PK.
- `id_sender` FK NN vers `user`.
- `id_receiver` FK NN vers `user`.
- `id_event` FK nullable vers `event`.
- `id_partnership` FK nullable vers `partnership`.
- `id_event_invitation` FK nullable vers `event_invitation`.
- `id_review` FK nullable vers `review`.
- `id_follow` FK nullable vers `follow`.
- `action` NN.
- `message`.
- `read` NN.
- `read_at`.
- `created_at` NN.
- `updated_at` NN.

## Regles Metier

### Comptes Et Roles

- Un utilisateur commence avec le role `guest`.
- Un utilisateur peut devenir `creator` en completant son profil creator.
- Le role `creator` autorise la creation d'evenements et la creation d'un lieu.
- Le role `admin` sert uniquement a la moderation et au dashboard d'administration.
- Un utilisateur banni ne peut plus creer, modifier, reserver, inviter ou envoyer de demandes de partenariat.
- Un utilisateur supprime logiquement reste en base pour conserver l'integrite des contenus existants.

### Preferences Email

- `email_notifications_enabled` est un attribut de `User`.
- Il est propose a l'inscription avec une case separee des CGU.
- Il est modifiable dans les parametres du compte.
- Lorsqu'une notification est creee, un service applicatif verifie cette preference avant d'envoyer un email.
- Aucun historique d'envoi email n'est requis dans le MCD.

### Notifications

- Une notification a toujours un emetteur et un destinataire.
- Une notification peut referencer un contenu metier, mais elle ne doit pas referencer plusieurs contenus en meme temps.
- Les notifications liees a la messagerie sont exclues du MCD.
- Les types retenus sont principalement : invitation evenement, reponse invitation, invitation partenariat, acceptation partenariat, avis, nouvel abonne et autre.

### Evenements

- Un evenement est cree par un creator.
- Un evenement appartient a une categorie d'evenement.
- Un evenement peut etre lie a un lieu existant ou a une localisation libre.
- Si `online = true`, l'evenement ne doit pas avoir de lieu ni de coordonnees physiques obligatoires.
- Si `online = false`, l'evenement doit avoir soit un lieu, soit une localisation libre.
- `first_date` et `latest_date` sont derives des periodes de l'evenement.
- `lifecycle_status` est derive du planning : non valide, a venir, en cours ou termine.

### Reservations

- Une reservation ne peut etre creee que pour un evenement avec `is_bookable = true`.
- Si `capacity` est renseignee, le total des places confirmees ne doit jamais depasser cette capacite.
- `max_seats_per_booking` limite le nombre de places dans une reservation.
- Un utilisateur ne peut pas avoir plusieurs reservations actives pour le meme evenement, mais il peut reserver a nouveau apres une annulation si les places sont disponibles.
- Si la capacite est atteinte, le statut de l'evenement peut passer a `full`.
- Une reservation annulee conserve son historique avec `status = cancelled`.

### Moderation Admin

- Un admin peut bannir un utilisateur avec une raison de ban.
- Un admin peut supprimer logiquement un contenu en passant `deleted = true`.
- Les contenus concernes par la suppression logique sont au minimum : utilisateurs, lieux, evenements, images, reviews, invitations, partenariats et reservations.
- Les champs recommandes pour la moderation sont `deleted`, `deleted_at`, `deleted_by_user_id` et `moderation_reason`.

### Lieux

- Un creator peut creer au maximum un lieu.
- Un lieu appartient a une categorie de lieu.
- Un lieu possede un seul type (`food`, `art` ou `craft`).
- Les horaires de lieu ne sont pas modelises dans le MCD.
- Un lieu supprime logiquement ne doit plus apparaitre dans la carte publique.

### Avis

- Un utilisateur peut laisser au maximum un avis par lieu.
- Un utilisateur peut laisser au maximum un avis par evenement.
- Une note est comprise entre 1 et 5.
- Un avis modere passe en `deleted = true`.
- La note moyenne d'un lieu ou d'un evenement est recalculee a partir des avis non supprimes.

### Images

- Une image peut illustrer un profil, un lieu, un evenement ou un avis.
- Une image ne doit referencer qu'un seul contenu a la fois.
- Une image supprimee logiquement ne doit plus etre affichee.

## Conseils Pour La Saisie Dans Looping

- Commencer par les entites simples : `User`, `Category`, `UserCategory`, `PlaceCategory`, `PlaceType`, `EventCategory`.
- Ajouter ensuite les entites centrales : `Place`, `Event`, `EventBooking`, `Review`, `Notification`, `Image`.
- Ajouter enfin les entites d'association : `Favorite`, `Follow`, `EventTimeSlotCollaborator`, `EventPeriod`, `EventTimeSlot`.
- Pour les associations reflexives sur `User`, nommer clairement les roles : `follower`, `following`, `initiator`, `collaborator`, `sender`, `receiver`.
- Pour les references optionnelles de `Review`, `Image` et `Notification`, ajouter une note Merise indiquant qu'une seule reference cible doit etre renseignee.
- Ne pas modeliser : messagerie, horaires de lieu, `UserInterest`, `UserPreference`, `PlacePlaceType`.
