import { getCommentsQuerySchema } from "../../validations/comment.validations";
import { IGetCommentsAction } from "@/actions/comments";
import {
  Controller,
  createController,
  validateOrThrow,
} from "@/utils/controllerFactory";

const GetCommentsController = (
  getCommentsAction: IGetCommentsAction
): Controller =>
  createController({
    execute: async (req) => {
      const filters = validateOrThrow(getCommentsQuerySchema, req.query);
      const comments = await getCommentsAction.execute({ filters });
      return { comments };
    },
    successMessage: "Commentaires récupérés avec succès",
  });

export default GetCommentsController;
