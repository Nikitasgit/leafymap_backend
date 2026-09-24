export interface RecoveryCodes {
  codes: string[];
  hashes: string[];
}

export interface ITwoFactorService {
  generateSecret(): string;
  generateOtpauthUri(account: string, secret: string): string;
  generateQrDataUrl(otpauthUri: string): Promise<string>;
  verifyTotp(code: string, secret: string): boolean;
  generateRecoveryCodes(count?: number): RecoveryCodes;
  hashRecoveryCode(code: string): string;
}
