# Éléments du diagramme de classes (copie-colle)

Vue simplifiée, sans Partnership / Follow / Review / Favorite / Comment / Conversation / Message / Product.

Héritage volontaire pour le jury : `User` est abstraite, spécialisée en `Guest`, `Creator`, `Admin`.

Visibilité UML : `-` privé, `+` public. Comme dans l’exemple du cours, les attributs sont privés, les méthodes publiques.

Ne copie pas les `id_*` FK dans les classes : les liens se font par les associations.

Les services dépendent des **interfaces** (`INotification`, `IStorage`), pas d’AWS / e-mail en dur. Les flèches vers les services sont des **dépendances** (pointillés).

---

## «abstract» User

```
«abstract» User
---------------
- id : Long
- email : String
- username : String
- firstname : String
- lastname : String
- passwordHash : String
- emailVerified : Boolean
- acceptedAt : Date
- bannedAt : Date
- createdAt : Date
---------------
+ updateProfile()
+ getPublicInfo()
```

## Guest

```
Guest
---------------
+ createBooking(event : Event, seats : Integer) : EventBooking
```

## Creator

```
Creator
---------------
+ createEvent() : Event
+ createPlace() : Place
+ sendInvitation(event : Event, collaborator : Creator) : EventInvitation
```

## Admin

```
Admin
---------------
+ banUser(user : User)
+ deleteContent()
```

## UserCategory

```
UserCategory
---------------
- id : Long
- name : String
```

## Place

```
Place
---------------
- id : Long
- label : String
- longitude : Double
- latitude : Double
- rating : Double
---------------
+ updateDetails()
```

## PlaceCategory

```
PlaceCategory
---------------
- id : Long
- name : String
```

## Event

```
Event
---------------
- id : Long
- name : String
- description : String
- online : Boolean
- isBookable : Boolean
- capacity : Integer
- maxSeatsPerBooking : Integer
- rating : Double
- status : EventStatus
- lifecycleStatus : LifecycleStatus
---------------
+ update()
+ areBookingsOpen() : Boolean
```

## EventPeriod

```
EventPeriod
---------------
- startDate : Date
- endDate : Date
```

## EventTimeSlot

```
EventTimeSlot
---------------
- title : String
- startTime : Time
- endTime : Time
```

## EventCategory

```
EventCategory
---------------
- id : Long
- name : String
```

## EventBooking

```
EventBooking
---------------
- id : Long
- seats : Integer
- status : BookingStatus
- cancelledAt : Date
---------------
+ updateSeats(seats : Integer)
+ cancel()
```

## EventInvitation

```
EventInvitation
---------------
- id : Long
- status : InvitationStatus
---------------
+ accept()
+ refuse()
+ cancel()
```

## Image

```
Image
---------------
- id : Long
- originalUrl : String
- thumbnailUrl : String
- type : ImageType
```

## Notification

```
Notification
---------------
- id : Long
- action : NotificationAction
- message : String
- readAt : Date
---------------
+ markAsRead()
```

---

## Interfaces

```
«interface» INotification
---------------
+ notifyUser(receiver : User, action : NotificationAction)
```

```
«interface» IStorage
---------------
+ store() : Image
+ signUrl(image : Image) : String
+ delete(image : Image)
```

## EventService

```
EventService
---------------
+ createEvent(creator : Creator) : Event
+ updateEvent(event : Event)
+ deleteEvent(event : Event)
+ getEvent(id : Long) : Event
```

## PlaceService

```
PlaceService
---------------
+ createPlace(creator : Creator) : Place
+ updatePlace(place : Place)
+ deletePlace(place : Place)
```

## EventBookingService

```
EventBookingService
---------------
+ createBooking(user : User, event : Event, seats : Integer) : EventBooking
+ updateBooking(booking : EventBooking, seats : Integer)
+ cancelBooking(booking : EventBooking)
```

## EventInvitationService

```
EventInvitationService
---------------
+ sendInvitation(event : Event, collaborator : Creator) : EventInvitation
+ acceptInvitation(invitation : EventInvitation)
+ refuseInvitation(invitation : EventInvitation)
+ cancelInvitation(invitation : EventInvitation)
```

## NotificationService

```
NotificationService
---------------
+ notifyUser(receiver : User, action : NotificationAction)
+ createNotification(sender : User, receiver : User, action : NotificationAction) : Notification
```

Réalise `INotification` (flèche pointillée, triangle vide vers l’interface).  
Les opérations de l’interface sont **reprises** sur le service.

## ImageService

```
ImageService
---------------
+ store() : Image
+ signUrl(image : Image) : String
+ delete(image : Image)
```

Réalise `IStorage`.

---

## Énumérations

```
«enumeration» EventStatus
---------------
available
full
cancelled
```

```
«enumeration» LifecycleStatus
---------------
unvalid
upcoming
ongoing
completed
```

```
«enumeration» BookingStatus
---------------
pending
confirmed
cancelled
```

```
«enumeration» InvitationStatus
---------------
pending
accepted
refused
cancelled
```

```
«enumeration» ImageType
---------------
profile
cover
gallery
```

```
«enumeration» NotificationAction
---------------
new_event
event_invitation
event_accepted
event_refused
event_booking_cancelled
```

---

## Relations

Héritage (triangle vide vers le parent) :

- Guest, Creator, Admin **héritent de** User

Réalisation d’interface (pointillés, triangle vide vers l’interface) :

- NotificationService **réalise** INotification
- ImageService **réalise** IStorage

Composition (losange plein du côté du tout) :

- Event **1** composé de **1..\*** EventPeriod
- EventPeriod **1** composé de **0..\*** EventTimeSlot

Associations métier :

| De | Card. | Vers | Card. | Rôle |
| --- | --- | --- | --- | --- |
| User | 0..\* | UserCategory | 0..1 | category |
| User | 0..1 | Image | 0..1 | avatar |
| User | 1 | Image | 0..\* | uploadedBy |
| Creator | 1 | Place | 0..1 | owns |
| Creator | 1 | Event | 0..\* | creates |
| PlaceCategory | 1 | Place | 0..\* | |
| Place | 0..1 | Event | 0..\* | hostedAt |
| Place | 0..1 | Image | 0..\* | ofPlace |
| EventCategory | 1 | Event | 0..\* | |
| Event | 0..1 | Image | 0..\* | ofEvent |
| Event | 1 | EventBooking | 0..\* | |
| User | 1 | EventBooking | 0..\* | bookedBy |
| Event | 1 | EventInvitation | 0..\* | |
| Creator | 1 | EventInvitation | 0..\* | initiator |
| Creator | 1 | EventInvitation | 0..\* | collaborator |
| User | 1 | Notification | 0..\* | sender |
| User | 1 | Notification | 0..\* | receiver |
| Event | 0..1 | Notification | 0..\* | |
| EventInvitation | 0..1 | Notification | 0..\* | |

Dépendances (flèches pointillées, **sans** cardinalité) :

| De | Vers | Pourquoi |
| --- | --- | --- |
| Guest | EventBookingService | le guest réserve via le service |
| Creator | EventService | le creator publie via le service |
| Creator | PlaceService | |
| Creator | EventInvitationService | |
| EventService | Event | orchestre l’entité |
| PlaceService | Place | |
| EventBookingService | EventBooking | |
| EventInvitationService | EventInvitation | |
| NotificationService | Notification | |
| ImageService | Image | |
| EventService | INotification | notifie après création |
| EventService | IStorage | image de couverture |
| PlaceService | IStorage | |
| EventBookingService | INotification | annulation de réservation |
| EventInvitationService | INotification | invitation / acceptation / refus |

Notes utiles à l’oral :

- Un Creator peut aussi réserver → `EventBooking` pointe vers `User`, pas seulement `Guest`.
- Un Event en ligne n’a pas de Place (`hostedAt` à 0..1).
- Image : `uploadedBy` est **toujours** le user. Place / Event sont optionnels (`ofPlace` / `ofEvent`). L’avatar est le sous-ensemble `type = profile`.
- Place / Event / Invitation : UML pointe `Creator` (règle métier). Merise stocke `id_user` (une table) ; le filtre `user_type = creator` est applicatif.
- Sur les sous-classes : 1–2 opérations pour **justifier l’héritage**. Le CRUD complet est sur les services.
- Sur les entités : règles métier (`cancel()`, `accept()`, `areBookingsOpen()`).
- `IStorage` cache AWS. `INotification` cache l’e-mail / le push. Les services métier dépendent des interfaces, pas de `AwsService`.
