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
  acceptedCGU: boolean;
  googlePictureUrl?: string;
  deleted: boolean;
  bannedAt?: Date;
  banReason?: string;
  banExpiresAt?: Date;
}

export interface GoogleAuthOutput {
  user: GoogleAuthUserOutput;
  token: string;
  mergedUnverifiedAccount?: boolean;
}
