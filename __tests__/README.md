# Tests Backend

## Structure

```
__tests__/
  helpers/          Mocks de ports (mockUserRepository…) + mongoTestSetup
  <domain>/         domain/ + usecases/ (+ infrastructure/ si intégration)
  validations/      Schémas Zod (src/api/dto)
  middlewares/      Auth / admin
  utils/            controllerFactory, errorHandler
```

- `npm test` : unitaires rapides (exclut `__tests__/**/infrastructure/`).
- `npm run test:integration` : repos Mongoose + MongoDB via `mongodb-memory-server`.

## Fichiers de référence

- Use case : `favorites/usecases/CreateFavorite.usecase.test.ts`
- Domain : `users/domain/User.entity.test.ts`
- Validation Zod : `validations/eventBooking.validations.test.ts`
- Intégration repo : `favorites/infrastructure/MongooseFavoriteRepository.test.ts`
  (aussi `follows/`, `eventBookings/`, `eventInvitations/` sous `infrastructure/`)

## Conventions

1. **2 à 4 tests par use case** : happy path + erreurs métier importantes.
2. **Asserter sur `code` et `statusCode`**, pas sur `message` :

   ```ts
   await expect(useCase.execute(params)).rejects.toMatchObject({
     code: ERROR_CODES.EVENT_BOOKING_ALREADY_EXISTS,
     statusCode: 409,
   });
   ```

   Codes dans `src/shared/errors`.
3. **Fixtures** : entités domain (`User.reconstitute`, `Event.reconstitute`…).
   Mocks de ports via `helpers/mock*Repository.ts`.
4. **Side-effects** mockés (`jest.mock`) — pas de vrai email / réseau.
5. **Un fichier par use case** : `<NomUseCase>.usecase.test.ts`.

## Intégration (`infrastructure/`)

Tester le couple **repository Mongoose ↔ Mongo ↔ mappers**, pas les use cases ni HTTP :

1. `connectMongo` / `disconnectMongo` / `clearCollection` via `helpers/mongoTestSetup`.
2. Instancier le vrai `Mongoose*Repository`.
3. Créer des entités domain (`Entity.create`), puis `save` / `find*` / contraintes (index unique, agrégations…).
4. 2 à 4 tests par repo : mapping round-trip + comportement Mongo critique.
)