export interface SignInInput {
  identifier: string;
  password: string;
}

export interface SignInUserOutput {
  id: string;
  email: string;
  username?: string;
  userType: string;
  role: string;
  acceptedAt?: Date;
  twoFactorEnabled?: boolean;
}

export interface SignInOutput {
  user?: SignInUserOutput;
  token?: string;
  twoFactorRequired?: boolean;
  challengeToken?: string;
}
