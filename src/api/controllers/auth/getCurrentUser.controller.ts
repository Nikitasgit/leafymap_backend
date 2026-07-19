import type GetUserByIdUseCase from "@src/application/usecases/users/GetUserById.usecase";
import {
  Controller,
  createController,
  requireAuth,
} from "@src/api/http/controllerFactory";

const CURRENT_USER_PROJECT = [
  "_id",
  "email",
  "username",
  "firstname",
  "lastname",
  "userType",
  "role",
  "acceptedCGU",
  "website",
  "phone",
  "description",
  "country",
  "address",
  "followers",
  "place",
  "image.urls",
  "googlePictureUrl",
  "place.location",
  "place.placeCategory",
  "place.rating",
  "userCategory",
  "userCategory.name",
  "bannedAt",
  "banReason",
  "banDuration",
  "banExpiresAt",
  "lastLogin",
  "preferences",
];

const GetCurrentUserController = (
  getUserByIdUseCase: GetUserByIdUseCase
): Controller =>
  createController({
    execute: async (req) => {
      const user = await getUserByIdUseCase.execute({
        userId: requireAuth(req).id,
        project: CURRENT_USER_PROJECT,
      });
      return { user };
    },
    successMessage: "User retrieved successfully",
  });

export default GetCurrentUserController;
