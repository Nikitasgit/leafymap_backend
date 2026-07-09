import { createCommentSchema } from "../../validations/comment.validations";
import { ICreateCommentAction } from "@/actions/comments";
import {
  Controller,
  createController,
  requireAuth,
  validateOrThrow,
} from "@/utils/controllerFactory";

const CreateCommentController = (
  createCommentAction: ICreateCommentAction
): Controller =>
  createController({
    execute: (req) =>
      createCommentAction.execute({
        commentData: validateOrThrow(createCommentSchema, req.body),
        authorId: requireAuth(req).id,
      }),
    successMessage: "Commentaire créé avec succès",
    successStatus: 201,
  });

export default CreateCommentController;
