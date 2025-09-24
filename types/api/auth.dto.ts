export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  acceptedCGU: boolean;
}

export interface LoginFormData {
  identifier: string;
  password: string;
}
