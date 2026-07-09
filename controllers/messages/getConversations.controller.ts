import { IGetConversationsAction } from "@/actions/messages";
import { Controller, createController, requireAuth } from "@/utils/controllerFactory";

const GetConversationsController = (
  getConversationsAction: IGetConversationsAction
): Controller =>
  createController({
    execute: (req) =>
      getConversationsAction.execute({
        userId: requireAuth(req).id,
      }),
    successMessage: "Conversations récupérées avec succès",
  });

export default GetConversationsController;
