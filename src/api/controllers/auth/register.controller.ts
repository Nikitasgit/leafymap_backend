import { registerSchema } from "@src/api/dto/auth/auth.dto";
import type RegisterUseCase from "@src/application/usecases/auth/Register.usecase";
import {
  Controller,
  createController,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const RegisterController = (registerUseCase: RegisterUseCase): Controller =>
  createController({
    execute: async (req) => {
      await registerUseCase.execute(validateOrThrow(registerSchema, req.body));
    },
    successMessage: "User registered",
    successStatus: 201,
  });

export default RegisterController;
