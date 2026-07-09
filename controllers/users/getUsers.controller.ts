import { getUsersQuerySchema } from "../../validations/user.validations";
import { IGetUsersAction } from "@/actions/users";
import { Controller, createController, validateOrThrow } from "@/utils/controllerFactory";

const GetUsersController = (getUsersAction: IGetUsersAction): Controller =>
  createController({
    execute: (req) =>
      getUsersAction.execute({
        filters: validateOrThrow(getUsersQuerySchema, req.query),
      }),
    successMessage: "Users fetched successfully",
  });

export default GetUsersController;
