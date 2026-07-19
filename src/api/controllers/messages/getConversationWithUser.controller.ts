import type GetConversationWithUserUseCase from "@src/application/usecases/messages/GetConversationWithUser.usecase";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
} from "@src/api/http/controllerFactory";

const GetConversationWithUserController = (
  getConversationWithUserUseCase: GetConversationWithUserUseCase
): Controller =>
  createController({
    execute: (req) =>
      getConversationWithUserUseCase.execute({
        userId: requireAuth(req).id,
        otherUserId: requireObjectIdParam(req, "otherUserId"),
      }),
    successMessage: "Conversation check completed successfully",
  });

export default GetConversationWithUserController;
