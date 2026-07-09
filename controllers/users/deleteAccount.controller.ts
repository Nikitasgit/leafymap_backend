import { IDeleteAccountAction } from "@/actions/users";
import { Controller, createController, requireAuth } from "@/utils/controllerFactory";

const DeleteAccountController = (
  deleteAccountAction: IDeleteAccountAction
): Controller =>
  createController({
    execute: async (req, res) => {
      await deleteAccountAction.execute({
        userId: requireAuth(req).id,
      });
      res.clearCookie("token");
    },
    successMessage: "Account and all associated data deleted successfully",
  });

export default DeleteAccountController;
