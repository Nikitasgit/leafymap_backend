import type GetConversationsUseCase from "@src/application/usecases/messages/GetConversations.usecase";
import {
  Controller,
  createController,
  requireAuth,
} from "@src/api/http/controllerFactory";

const GetConversationsController = (
  getConversationsUseCase: GetConversationsUseCase
): Controller =>
  createController({
    execute: (req) =>
      getConversationsUseCase.execute({
        userId: requireAuth(req).id,
      }),
    successMessage: "Conversations récupérées avec succès",
  });

export default GetConversationsController;
