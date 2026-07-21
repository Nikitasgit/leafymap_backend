import { UserType } from "@src/domain/entities/User.entity";

export interface UpdateUserInput {
  userId: string;
  updateData: {
    firstname?: string;
    lastname?: string;
    username?: string;
    userCategory?: string;
    website?: string;
    phone?: string;
    userType?: UserType;
    description?: string;
    country?: string;
    address?: {
      number?: string;
      street: string;
      code: string;
      extra?: string;
    };
    image?: string;
    interests?: string[];
    googlePictureUrl?: string;
    preferences?: {
      emailNotifications?: boolean;
    };
  };
}
