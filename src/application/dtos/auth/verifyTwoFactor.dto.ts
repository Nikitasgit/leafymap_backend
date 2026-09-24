export interface VerifyTwoFactorInput {
  challengeToken: string;
  code: string;
}

export interface VerifyTwoFactorUserOutput {
  id: string;
  email: string;
  username?: string;
  userType: string;
  role: string;
  acceptedAt?: Date;
  twoFactorEnabled?: boolean;
}

export interface VerifyTwoFactorOutput {
  user: VerifyTwoFactorUserOutput;
  token: string;
}
