import type DeleteAccountUseCase from "@src/application/usecases/users/DeleteAccount.usecase";
import {
  Controller,
  createController,
  requireAuth,
} from "@src/api/http/controllerFactory";

const DeleteAccountController = (
  deleteAccountUseCase: DeleteAccountUseCase
): Controller =>
  createController({
    execute: async (req, res) => {
      await deleteAccountUseCase.execute({
        userId: requireAuth(req).id,
      });
      res.clearCookie("token");
    },
    successMessage: "Account and all associated data deleted successfully",
  });

export default DeleteAccountController;
