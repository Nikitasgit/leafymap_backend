export interface SignInInput {
  identifier: string;
  password: string;
}

export interface SignInUserOutput {
  _id: string;
  email: string;
  username?: string;
  userType: string;
  role: string;
}

export interface SignInOutput {
  user: SignInUserOutput;
  token: string;
}
