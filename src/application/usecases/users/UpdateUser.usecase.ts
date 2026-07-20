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
import { ERROR_CODES, NotFoundError } from "@src/shared/errors";

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

    const {
      password: _password,
      email: _email,
      acceptedCGU: _acceptedCGU,
      acceptedAt: _acceptedAt,
      deleted: _deleted,
      role: _role,
      bannedAt: _bannedAt,
      banReason: _banReason,
      banDuration: _banDuration,
      banExpiresAt: _banExpiresAt,
      lastLogin: _lastLogin,
      id: _id,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      place: _place,
      followers: _followers,
      ...raw
    } = params.updateData;

    let firstname = raw.firstname;
    let lastname = raw.lastname;
    if (firstname) {
      firstname = firstname.toLowerCase().trim();
    }
    if (lastname) {
      lastname = lastname.toLowerCase().trim();
    }

    if (
      raw.preferences !== undefined &&
      (raw.preferences === null || typeof raw.preferences !== "object")
    ) {
      throw new Error("Invalid user preferences");
    }
    if (
      raw.preferences?.emailNotifications !== undefined &&
      typeof raw.preferences.emailNotifications !== "boolean"
    ) {
      throw new Error("Invalid email notification preference");
    }

    const updated = existing.updateProfile({
      firstname,
      lastname,
      username: raw.username,
      userCategoryId: raw.userCategory
        ? UserCategoryId.from(raw.userCategory)
        : undefined,
      website: raw.website,
      phone: raw.phone,
      userType: raw.userType,
      description: raw.description,
      country: raw.country,
      address: raw.address ? UserAddress.from(raw.address) : undefined,
      imageId: raw.image ? ImageId.from(raw.image) : undefined,
      interestIds: raw.interests
        ? raw.interests.map((id) => UserCategoryId.from(id))
        : undefined,
      googlePictureUrl: raw.googlePictureUrl,
      preferences: raw.preferences
        ? UserPreferences.from(raw.preferences)
        : undefined,
    });

    await this.userRepository.update(updated);

    if (raw.userType) {
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
