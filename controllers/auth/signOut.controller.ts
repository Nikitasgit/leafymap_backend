import { Controller, createController } from "@/utils/controllerFactory";

const SignOutController = (): Controller =>
  createController({
    execute: async (_req, res) => {
      res
        .clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        })
        .clearCookie("userType", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });
    },
    successMessage: "Logged out",
  });

export default SignOutController;
