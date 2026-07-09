import { IGetConversationWithUserAction } from "@/actions/messages/GetConversationWithUser.action";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
} from "@/utils/controllerFactory";

const GetConversationWithUserController = (
  getConversationWithUserAction: IGetConversationWithUserAction
): Controller =>
  createController({
    execute: (req) =>
      getConversationWithUserAction.execute({
        userId: requireAuth(req).id,
        otherUserId: requireObjectIdParam(req, "otherUserId"),
      }),
    successMessage: "Conversation check completed successfully",
  });

export default GetConversationWithUserController;
