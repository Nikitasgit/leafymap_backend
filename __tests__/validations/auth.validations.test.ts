import { loginSchema, registerSchema } from "@src/api/dto/auth/auth.dto";

describe("auth validations", () => {
  describe("registerSchema", () => {
    it("accepts valid registration data", () => {
      const result = registerSchema.safeParse({
        email: "user@test.com",
        password: "Password12",
        acceptedCGU: true,
      });

      expect(result.success).toBe(true);
    });

    it("rejects an invalid email", () => {
      const result = registerSchema.safeParse({
        email: "not-an-email",
        password: "Password12",
        acceptedCGU: true,
      });

      expect(result.success).toBe(false);
    });

    it("rejects when CGU are not accepted", () => {
      const result = registerSchema.safeParse({
        email: "user@test.com",
        password: "Password12",
        acceptedCGU: false,
      });

      expect(result.success).toBe(false);
    });
  });

  describe("loginSchema", () => {
    it("accepts a valid email identifier", () => {
      const result = loginSchema.safeParse({
        identifier: "user@test.com",
        password: "password",
      });

      expect(result.success).toBe(true);
    });

    it("accepts a valid username identifier", () => {
      const result = loginSchema.safeParse({
        identifier: "valid_user",
        password: "password",
      });

      expect(result.success).toBe(true);
    });

    it("rejects an invalid identifier", () => {
      const result = loginSchema.safeParse({
        identifier: "!!",
        password: "password",
      });

      expect(result.success).toBe(false);
    });

    it("rejects a missing password", () => {
      const result = loginSchema.safeParse({
        identifier: "user@test.com",
      });

      expect(result.success).toBe(false);
    });
  });
});
