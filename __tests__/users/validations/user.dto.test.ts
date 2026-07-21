import { updateUserSchema } from "@src/api/dto/users/user.dto";

const objectId = "507f1f77bcf86cd799439011";

describe("updateUserSchema", () => {
  it("accepts every supported field in an ordinary partial update", () => {
    const result = updateUserSchema.safeParse({
      firstname: "Alice",
      lastname: "Martin",
      username: "Alice Martin",
      userCategory: objectId,
      website: "example.com",
      phone: "0123456789",
      userType: "guest",
      description: "Une description valide",
      country: "France",
      address: {
        number: "12",
        street: "rue des Fleurs",
        code: "75001",
        extra: "Bâtiment B",
      },
      image: objectId,
      interests: [objectId],
      googlePictureUrl: "https://example.com/photo.jpg",
      preferences: { emailNotifications: true },
    });

    expect(result.success).toBe(true);
  });

  it("keeps creator onboarding fields required", () => {
    const result = updateUserSchema.safeParse({
      userType: "creator",
      username: "Alice Martin",
    });

    expect(result.success).toBe(false);
  });

  it("accepts an ordinary update without firstname or lastname", () => {
    const result = updateUserSchema.safeParse({
      preferences: { emailNotifications: false },
    });

    expect(result.success).toBe(true);
  });

  it("rejects protected and unknown fields", () => {
    const result = updateUserSchema.safeParse({
      description: "Une description valide",
      role: "admin",
      email: "attacker@example.com",
    });

    expect(result.success).toBe(false);
  });
});
