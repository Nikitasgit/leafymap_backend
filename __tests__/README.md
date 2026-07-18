# Tests Backend

## Structure

```
__tests__/
  helpers/        Mocks partagés (createMockRepository, builders, mongoTestSetup)
  actions/        Tests unitaires legacy (repos mockés) — rapides
  favorites/      Tests Clean Architecture (domain, usecases, infrastructure)
  follows/        Tests Clean Architecture Follows (domain, usecases)
  comments/       Tests Clean Architecture Comments (domain, usecases)
  validations/    Tests des schémas Zod — rapides
  utils/          Tests des utilitaires (errorHandler, controllerFactory…) — rapides
  controllers/    Smoke tests controllers (peu nombreux, ne pas étendre)
  repositories/   Tests d'intégration Mongo — EXCLUS du run par défaut
```

- `npm test` : run unitaire rapide (exclut `repositories/` et `favorites/infrastructure/`).
- `npm run test:integration` : tests Mongo (`mongodb-memory-server`, lent).

## Fichiers de référence à imiter

- **Use case (Clean Architecture)** : `favorites/usecases/CreateFavorite.usecase.test.ts`
- **Action métier (legacy)** : `actions/eventBookings/CreateEventBookingAction.test.ts`
- **Validation Zod** : `validations/eventBooking.validations.test.ts`

## Conventions

1. **2 à 4 tests par action** : le happy path + les 1-3 erreurs métier importantes.
   Ne pas tester tous les cas limites.
2. **Asserter sur `code` et `statusCode`, jamais sur `message`** (les messages
   seront traduits via i18n) :

   ```ts
   await expect(action.execute(params)).rejects.toMatchObject({
     code: ERROR_CODES.EVENT_BOOKING_ALREADY_EXISTS,
     statusCode: 409,
   });
   ```

   Les codes sont définis dans `utils/errors.ts` (`ERROR_CODES`).
3. **Mocks via les helpers** de `helpers/mockRepositories.ts` :

   ```ts
   const repo = createMockRepository<IEventRepository>("aggregate", "updateMany");
   repo.findById.mockResolvedValue(buildEvent({ deleted: true }) as never);
   ```

   Passer en argument les méthodes spécifiques au repository (celles hors du
   socle create/findById/findOne/findAll/updateOne/deleteOne/deleteMany).
4. **Services externes mockés avec `jest.mock`** (EmailService,
   NotificationService, awsService…). Ne jamais envoyer de vrai email ni
   toucher au réseau.
5. **Vérifier les effets de bord importants** : `create`/`updateOne` appelés
   avec les bons champs, ou `not.toHaveBeenCalled()` en cas d'erreur.
6. **Un fichier de test par action**, nommé `<NomAction>.test.ts`, dans le
   sous-dossier miroir de `actions/`.

## Cibles restantes à couvrir (par priorité)

Actions (suivre l'exemple `CreateEventBookingAction.test.ts`) :

- [x] `actions/auth/SignIn.action.ts` — succès + `AUTH_INVALID_CREDENTIALS`,
      `AUTH_EMAIL_NOT_VERIFIED`, `AUTH_USER_BANNED`
- [x] `actions/auth/Register.action.ts` — création + `AUTH_EMAIL_ALREADY_USED`
      + re-envoi de vérification si email non vérifié (mock EmailService)
- [x] `actions/auth/VerifyEmail.action.ts` — succès +
      `AUTH_INVALID_EMAIL_VERIFICATION_TOKEN` (token invalide / expiré)
- [x] `actions/auth/ResetPassword.action.ts` — succès +
      `AUTH_INVALID_RESET_PASSWORD_TOKEN` (token invalide / expiré)
- [x] `actions/eventBookings/CancelEventBooking.action.ts` — annulation OK +
      `EVENT_BOOKING_CANCEL_CLOSED`
- [x] `actions/eventBookings/UpdateEventBooking.action.ts` — succès +
      `EVENT_BOOKING_NOT_FOUND`, `EVENT_BOOKING_TOO_MANY_SEATS`
- [x] `actions/partnerships/CreatePartnerships.action.ts` — succès +
      `PARTNERSHIP_ALREADY_EXISTS`, `PARTNERSHIP_INVITATION_ALREADY_SENT`
      (mock NotificationService)
- [x] `actions/partnerships/UpdatePartnerships.action.ts` —
      `PARTNERSHIP_ACCEPT_FORBIDDEN`, `PARTNERSHIP_UPDATE_FORBIDDEN`,
      `PARTNERSHIP_NOT_FOUND`
- [x] `actions/places/CreatePlace.action.ts` — succès + `USER_NOT_FOUND` +
      `USER_ALREADY_HAS_PLACE`
- [x] `actions/events/UpdateEvent.action.ts` — succès + `EVENT_NOT_FOUND`,
      `PLACE_NOT_FOUND`, `EVENT_PLACE_FORBIDDEN`
- [x] `actions/events/DeleteEvent.action.ts` — succès + `EVENT_NOT_FOUND`
      (mock CascadeDeleteService)

Validations (suivre l'exemple `eventBooking.validations.test.ts`) :

- [x] `validations/auth.validations.ts` — `registerSchema`, `loginSchema`
- [x] `validations/event.validations.ts` — `newEventSchema`
- [x] `validations/partnership.validations.ts` — `getPartnershipsByUserIdQuerySchema`

Utils :

- [x] `utils/controllerFactory.ts` — `requireAuth` (401),
      `requireObjectIdParam` (`INVALID_ROUTE_PARAM`), `validateOrThrow`
      (`VALIDATION_ERROR` avec `data`), forward d'erreur vers `next`
- [x] `utils/validation.ts` — `validateData` (null si OK, erreurs par champ)

## Prochaines cibles suggérées

Actions :

- [x] EventInvitations (domain + Create/Update use cases + validations)
- [ ] `actions/auth/RequestPasswordReset.action.ts`

Validations :

- [ ] `validations/place.validations.ts`, `validations/user.validations.ts`

Intégration Mongo (`npm run test:integration`) :

- [x] `repositories/users/MongooseUserRepository.test.ts`
- [x] `repositories/events/MongooseEventRepository.test.ts` — CRUD + filtres
      `deleted` et `lifecycleStatus`
