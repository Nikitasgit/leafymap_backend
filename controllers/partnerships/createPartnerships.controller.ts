import { ICreatePartnershipsAction } from "@/actions/partnerships";
import { Controller, createController, requireAuth } from "@/utils/controllerFactory";

const CreatePartnershipsController = (
  createPartnershipsAction: ICreatePartnershipsAction
): Controller =>
  createController({
    execute: (req) =>
      createPartnershipsAction.execute({
        partnership: req.body.partnership,
        initiatorId: requireAuth(req).id,
      }),
    successMessage: "Partnership created successfully",
    successStatus: 201,
  });

export default CreatePartnershipsController;
