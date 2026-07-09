import { IUpdatePartnershipsAction } from "@/actions/partnerships";
import { Controller, createController, requireAuth } from "@/utils/controllerFactory";

const UpdatePartnershipsController = (
  updatePartnershipsAction: IUpdatePartnershipsAction
): Controller =>
  createController({
    execute: async (req) => {
      await updatePartnershipsAction.execute({
        partnerships: req.body.partnerships,
        userId: requireAuth(req).id,
      });
    },
    successMessage: "Partnerships updated successfully",
  });

export default UpdatePartnershipsController;
