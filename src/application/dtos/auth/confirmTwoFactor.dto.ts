export interface ConfirmTwoFactorInput {
  userId: string;
  code: string;
}

export interface ConfirmTwoFactorOutput {
  recoveryCodes: string[];
}
