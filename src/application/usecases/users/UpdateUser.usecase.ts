import { UpdateUserInput } from "@src/application/dtos/users/updateUser.dto";
import { IJwtTokenIssuer } from "@src/domain/interfaces/IJwtTokenIssuer";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import {
  ImageId,
  UserCategoryId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { UserAddress } from "@src/domain/value-objects/UserAddress.vo";
import { UserPreferences } from "@src/domain/value-objects/UserPreferences.vo";
import {
  ERROR_CODES,
  NotFoundError,
  ValidationError,
} from "@src/shared/errors";

const normalizeOptionalName = (
  value: string | null | undefined,
): string | null | undefined => {
  if (value == null) {
    return value;
  }
  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
};

const toUserPreferences = (value: unknown): UserPreferences | undefined => {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== "object" || value === null) {
    throw new ValidationError({ preferences: "Invalid user preferences" });
  }

  const emailNotifications =
    "emailNotifications" in value ? value.emailNotifications : undefined;
  if (
    emailNotifications !== undefined &&
    typeof emailNotifications !== "boolean"
  ) {
    throw new ValidationError({
      "preferences.emailNotifications":
        "Invalid email notification preference",
    });
  }

  return UserPreferences.from({ emailNotifications });
};

class UpdateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtTokenIssuer: IJwtTokenIssuer
  ) {}

  async execute(params: UpdateUserInput): Promise<{ token?: string }> {
    const userId = UserId.from(params.userId);
    const existing = await this.userRepository.findById(userId);

    if (!existing || existing.deleted) {
      throw new NotFoundError(ERROR_CODES.USER_NOT_FOUND, "User not found");
    }

    const { updateData } = params;

    const firstname = normalizeOptionalName(updateData.firstname);
    const lastname = normalizeOptionalName(updateData.lastname);

    const updated = existing.updateProfile({
      firstname,
      lastname,
      username: updateData.username,
      userCategoryId: updateData.userCategory
        ? UserCategoryId.from(updateData.userCategory)
        : undefined,
      website: updateData.website,
      phone: updateData.phone,
      userType: updateData.userType,
      description: updateData.description,
      country: updateData.country,
      address: updateData.address
        ? UserAddress.from(updateData.address)
        : undefined,
      imageId: updateData.image ? ImageId.from(updateData.image) : undefined,
      interestIds: updateData.interests
        ? updateData.interests.map((id) => UserCategoryId.from(id))
        : undefined,
      googlePictureUrl: updateData.googlePictureUrl,
      preferences: toUserPreferences(updateData.preferences),
    });

    await this.userRepository.update(updated);

    if (updateData.userType && updateData.userType !== existing.userType) {
      const reloaded = await this.userRepository.findById(userId);
      if (reloaded) {
        return {
          token: this.jwtTokenIssuer.issue({
            id: userId,
            userType: reloaded.userType,
            role: reloaded.role,
          }),
        };
      }
    }

    return {};
  }
}

export default UpdateUserUseCase;
