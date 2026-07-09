import { IGetUserByIdAction } from "@/actions/users";
import { IUser } from "@/types/models/user";
import { Controller, createController, requireAuth } from "@/utils/controllerFactory";

const CURRENT_USER_PROJECT: (keyof IUser | string)[] = [
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
  getUserByIdAction: IGetUserByIdAction
): Controller =>
  createController({
    execute: async (req) => {
      const user = await getUserByIdAction.execute({
        userId: requireAuth(req).id,
        project: CURRENT_USER_PROJECT,
      });
      return { user };
    },
    successMessage: "User retrieved successfully",
  });

export default GetCurrentUserController;
