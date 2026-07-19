export interface RegisterInput {
  email: string;
  password: string;
  acceptedCGU: boolean;
  emailNotifications?: boolean;
}

export interface RegisterOutput {
  _id: string;
}
