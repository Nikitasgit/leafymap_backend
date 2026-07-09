import { registerSchema } from "../../validations/auth.validations";
import { IRegisterAction } from "@/actions/auth";
import { Controller, createController, validateOrThrow } from "@/utils/controllerFactory";

const RegisterController = (registerAction: IRegisterAction): Controller =>
  createController({
    execute: async (req) => {
      await registerAction.execute({
        registerData: validateOrThrow(registerSchema, req.body),
      });
    },
    successMessage: "User registered",
    successStatus: 201,
  });

export default RegisterController;
