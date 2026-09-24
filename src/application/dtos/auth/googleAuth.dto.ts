export interface GoogleAuthInput {
  idToken: string;
}

export interface GoogleAuthUserOutput {
  id: string;
  email: string;
  username?: string;
  firstname?: string;
  lastname?: string;
  userType: string;
  role: string;
  acceptedAt?: Date;
  googlePictureUrl?: string;
  deleted: boolean;
  bannedAt?: Date;
  banReason?: string;
  banExpiresAt?: Date;
  twoFactorEnabled?: boolean;
}

export interface GoogleAuthOutput {
  user?: GoogleAuthUserOutput;
  token?: string;
  twoFactorRequired?: boolean;
  challengeToken?: string;
  mergedUnverifiedAccount?: boolean;
}
