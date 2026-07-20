import { asClass, AwilixContainer } from "awilix";
import PlacesController from "@src/api/controllers/PlacesController";
import CreatePlaceUseCase from "@src/application/usecases/places/CreatePlace.usecase";
import DeletePlaceUseCase from "@src/application/usecases/places/DeletePlace.usecase";
import GetPlaceByIdUseCase from "@src/application/usecases/places/GetPlaceById.usecase";
import GetPlacesUseCase from "@src/application/usecases/places/GetPlaces.usecase";
import GetPlacesInViewUseCase from "@src/application/usecases/places/GetPlacesInView.usecase";
import UpdatePlaceUseCase from "@src/application/usecases/places/UpdatePlace.usecase";
import type { Cradle } from "@src/di/cradle";

export const registerPlacesModule = (
  container: AwilixContainer<Cradle>
): void => {
  container.register({
    createPlaceUseCase: asClass(CreatePlaceUseCase).singleton(),
    updatePlaceUseCase: asClass(UpdatePlaceUseCase).singleton(),
    deletePlaceUseCase: asClass(DeletePlaceUseCase).singleton(),
    getPlaceByIdUseCase: asClass(GetPlaceByIdUseCase).singleton(),
    getPlacesUseCase: asClass(GetPlacesUseCase).singleton(),
    getPlacesInViewUseCase: asClass(GetPlacesInViewUseCase).singleton(),

    placesController: asClass(PlacesController).singleton(),
  });
};
