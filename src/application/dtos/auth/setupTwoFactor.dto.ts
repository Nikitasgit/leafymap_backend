export interface SetupTwoFactorInput {
  userId: string;
}

export interface SetupTwoFactorOutput {
  secret: string;
  otpauthUri: string;
  qrDataUrl: string;
}
