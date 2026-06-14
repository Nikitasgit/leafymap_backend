# Diagramme De Classes SQL - Elements

## Enumerations Metier

- `role` = `ENUM('guest','creator','admin')`
- `event_status` = `ENUM('available','full','cancelled')`
- `event_lifecycle_status` = `ENUM('unvalid','upcoming','ongoing','completed')`
- `booking_status` = `ENUM('pending','confirmed','cancelled')`
- `invitation_status` = `ENUM('pending','accepted','refused','cancelled','completed')`
- `partnership_status` = `ENUM('pending','accepted','refused','cancelled','completed')`
- `notification_action` = `ENUM('partnership_invitation','partnership_accepted','event_invitation','event_accepted','event_refused','review','new_follower','other')`
- `image_type` = `ENUM('profile','cover','gallery','other')`

## CoreUsers

### user

id_user : BIGINT <<PK>>
id_user_category : BIGINT <<FK, NULL>>
email : VARCHAR(255) <<UNIQUE, NOT NULL>>
password_hash : VARCHAR(255) <<NOT NULL>>
username : VARCHAR(50) <<UNIQUE, NULL>>
firstname : VARCHAR(50)
lastname : VARCHAR(50)
website : VARCHAR(255)
phone : VARCHAR(50)
description : VARCHAR(300)
country : CHAR(2)
role : role <<NOT NULL>>
email_notifications_enabled : BOOLEAN <<NOT NULL>>
accepted_cgu : BOOLEAN <<NOT NULL>>
accepted_at : TIMESTAMP <<NOT NULL>>
email_verified : BOOLEAN <<NOT NULL>>
banned : BOOLEAN <<NOT NULL>>
banned_at : TIMESTAMP
ban_reason : VARCHAR(100)
deleted : BOOLEAN <<NOT NULL>>
deleted_at : TIMESTAMP
deleted_by_user_id : BIGINT <<FK, NULL>>
created_at : TIMESTAMP <<NOT NULL>>
updated_at : TIMESTAMP <<NOT NULL>>

### category

id_category : BIGINT <<PK>>
name : VARCHAR(50) <<UNIQUE, NOT NULL>>
deleted : BOOLEAN <<NOT NULL>>
created_at : TIMESTAMP <<NOT NULL>>
updated_at : TIMESTAMP <<NOT NULL>>

### user_category

id_user_category : BIGINT <<PK>>
id_category : BIGINT <<FK, NOT NULL>>
name : VARCHAR(50) <<NOT NULL>>
type : ENUM('creation','organization') <<NOT NULL>>
deleted : BOOLEAN <<NOT NULL>>
created_at : TIMESTAMP <<NOT NULL>>
updated_at : TIMESTAMP <<NOT NULL>>

### follow

id_follow : BIGINT <<PK>>
id_follower : BIGINT <<FK, NOT NULL>>
id_following : BIGINT <<FK, NOT NULL>>
created_at : TIMESTAMP <<NOT NULL>>

Contrainte : `UNIQUE(id_follower, id_following)`

## Places

### place_category

id_place_category : BIGINT <<PK>>
id_category : BIGINT <<FK, NOT NULL>>
name : VARCHAR(50) <<NOT NULL>>
description : VARCHAR(300)
deleted : BOOLEAN <<NOT NULL>>
created_at : TIMESTAMP <<NOT NULL>>
updated_at : TIMESTAMP <<NOT NULL>>

### place

id_place : BIGINT <<PK>>
id_user : BIGINT <<FK, UNIQUE, NOT NULL>>
id_place_category : BIGINT <<FK, NOT NULL>>
mapbox_id : VARCHAR(80)
label : VARCHAR(100) <<NOT NULL>>
longitude : DECIMAL(9,6) <<NOT NULL>>
latitude : DECIMAL(9,6) <<NOT NULL>>
rating : DECIMAL(3,2) <<NOT NULL>>
deleted : BOOLEAN <<NOT NULL>>
deleted_at : TIMESTAMP
deleted_by_user_id : BIGINT <<FK, NULL>>
moderation_reason : VARCHAR(100)
created_at : TIMESTAMP <<NOT NULL>>
updated_at : TIMESTAMP <<NOT NULL>>

## Events

### event_category

id_event_category : BIGINT <<PK>>
name : VARCHAR(50) <<UNIQUE, NOT NULL>>
description : VARCHAR(300)
deleted : BOOLEAN <<NOT NULL>>
created_at : TIMESTAMP <<NOT NULL>>
updated_at : TIMESTAMP <<NOT NULL>>

### event

id_event : BIGINT <<PK>>
id_user : BIGINT <<FK, NOT NULL>>
id_place : BIGINT <<FK, NULL>>
id_event_category : BIGINT <<FK, NOT NULL>>
name : VARCHAR(50) <<NOT NULL>>
description : VARCHAR(300) <<NOT NULL>>
online : BOOLEAN <<NOT NULL>>
address_label : VARCHAR(300)
longitude : DECIMAL(9,6)
latitude : DECIMAL(9,6)
status : event_status <<NOT NULL>>
lifecycle_status : event_lifecycle_status <<NOT NULL>>
first_date : DATE
latest_date : DATE
rating : DECIMAL(3,2) <<NOT NULL>>
is_bookable : BOOLEAN <<NOT NULL>>
capacity : INT
max_seats_per_booking : INT
deleted : BOOLEAN <<NOT NULL>>
deleted_at : TIMESTAMP
deleted_by_user_id : BIGINT <<FK, NULL>>
moderation_reason : VARCHAR(100)
created_at : TIMESTAMP <<NOT NULL>>
updated_at : TIMESTAMP <<NOT NULL>>

### event_period

id_event_period : BIGINT <<PK>>
id_event : BIGINT <<FK, NOT NULL>>
start_date : DATE <<NOT NULL>>
end_date : DATE <<NOT NULL>>

### event_time_slot

id_event_time_slot : BIGINT <<PK>>
id_event_period : BIGINT <<FK, NOT NULL>>
title : VARCHAR(80) <<NOT NULL>>
start_time : TIME <<NOT NULL>>
end_time : TIME <<NOT NULL>>

### event_booking

id_event_booking : BIGINT <<PK>>
id_event : BIGINT <<FK, NOT NULL>>
id_user : BIGINT <<FK, NOT NULL>>
seats : INT <<NOT NULL>>
status : booking_status <<NOT NULL>>
booked_at : TIMESTAMP <<NOT NULL>>
cancelled_at : TIMESTAMP
deleted : BOOLEAN <<NOT NULL>>
deleted_at : TIMESTAMP
deleted_by_user_id : BIGINT <<FK, NULL>>
created_at : TIMESTAMP <<NOT NULL>>
updated_at : TIMESTAMP <<NOT NULL>>

Contrainte : `UNIQUE(id_event, id_user)` sur reservations actives

## Interactions

### event_invitation

id_event_invitation : BIGINT <<PK>>
id_event : BIGINT <<FK, NOT NULL>>
id_initiator : BIGINT <<FK, NOT NULL>>
id_collaborator : BIGINT <<FK, NOT NULL>>
status : invitation_status <<NOT NULL>>
deleted : BOOLEAN <<NOT NULL>>
deleted_at : TIMESTAMP
deleted_by_user_id : BIGINT <<FK, NULL>>
created_at : TIMESTAMP <<NOT NULL>>
updated_at : TIMESTAMP <<NOT NULL>>

Contrainte : `UNIQUE(id_event, id_initiator, id_collaborator)`

### partnership

id_partnership : BIGINT <<PK>>
id_initiator : BIGINT <<FK, NOT NULL>>
id_collaborator : BIGINT <<FK, NOT NULL>>
status : partnership_status <<NOT NULL>>
deleted : BOOLEAN <<NOT NULL>>
deleted_at : TIMESTAMP
deleted_by_user_id : BIGINT <<FK, NULL>>
created_at : TIMESTAMP <<NOT NULL>>
updated_at : TIMESTAMP <<NOT NULL>>

Contrainte : `UNIQUE(id_initiator, id_collaborator)`

### review

id_review : BIGINT <<PK>>
id_author : BIGINT <<FK, NOT NULL>>
id_place : BIGINT <<FK, NULL>>
id_event : BIGINT <<FK, NULL>>
rating : DECIMAL(3,2) <<NOT NULL>>
comment : VARCHAR(300)
certified : BOOLEAN <<NOT NULL>>
deleted : BOOLEAN <<NOT NULL>>
deleted_at : TIMESTAMP
deleted_by_user_id : BIGINT <<FK, NULL>>
moderation_reason : VARCHAR(100)
created_at : TIMESTAMP <<NOT NULL>>
updated_at : TIMESTAMP <<NOT NULL>>

Contraintes :

- `CHECK ((id_place IS NOT NULL) <> (id_event IS NOT NULL))`
- `UNIQUE(id_author, id_place)` (si avis sur lieu)
- `UNIQUE(id_author, id_event)` (si avis sur evenement)

### favorite

id_favorite : BIGINT <<PK>>
id_user : BIGINT <<FK, NOT NULL>>
id_place : BIGINT <<FK, NOT NULL>>
created_at : TIMESTAMP <<NOT NULL>>

Contrainte : `UNIQUE(id_user, id_place)`

## MediaAndNotifications

### image

id_image : BIGINT <<PK>>
id_uploader : BIGINT <<FK, NULL>>
id_user_reference : BIGINT <<FK, NULL>>
id_place_reference : BIGINT <<FK, NULL>>
id_event_reference : BIGINT <<FK, NULL>>
id_review_reference : BIGINT <<FK, NULL>>
original_url : VARCHAR(300) <<NOT NULL>>
thumbnail_url : VARCHAR(300) <<NOT NULL>>
medium_url : VARCHAR(300) <<NOT NULL>>
original_name : VARCHAR(300) <<NOT NULL>>
size : BIGINT <<NOT NULL>>
mimetype : VARCHAR(50) <<NOT NULL>>
type : image_type <<NOT NULL>>
deleted : BOOLEAN <<NOT NULL>>
deleted_at : TIMESTAMP
deleted_by_user_id : BIGINT <<FK, NULL>>
moderation_reason : VARCHAR(100)
created_at : TIMESTAMP <<NOT NULL>>
updated_at : TIMESTAMP <<NOT NULL>>

Contrainte :

- `CHECK ((id_user_reference IS NOT NULL)::int + (id_place_reference IS NOT NULL)::int + (id_event_reference IS NOT NULL)::int + (id_review_reference IS NOT NULL)::int = 1)`

### notification

id_notification : BIGINT <<PK>>
id_sender : BIGINT <<FK, NOT NULL>>
id_receiver : BIGINT <<FK, NOT NULL>>
id_event : BIGINT <<FK, NULL>>
id_partnership : BIGINT <<FK, NULL>>
id_event_invitation : BIGINT <<FK, NULL>>
id_review : BIGINT <<FK, NULL>>
id_follow : BIGINT <<FK, NULL>>
action : notification_action <<NOT NULL>>
message : VARCHAR(300)
read : BOOLEAN <<NOT NULL>>
read_at : TIMESTAMP
created_at : TIMESTAMP <<NOT NULL>>
updated_at : TIMESTAMP <<NOT NULL>>

Contrainte :

- `CHECK ((id_event IS NOT NULL)::int + (id_partnership IS NOT NULL)::int + (id_event_invitation IS NOT NULL)::int + (id_review IS NOT NULL)::int + (id_follow IS NOT NULL)::int <= 1)`
