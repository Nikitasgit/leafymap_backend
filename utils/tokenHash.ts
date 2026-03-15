import { createHash, randomBytes } from "crypto";

export function generateSecureToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

export function isTokenExpired(expiresAt: Date | undefined): boolean {
  return !expiresAt || new Date() > expiresAt;
}

export interface TokenWithExpiry {
  token: string;
  tokenHash: string;
  expiresAt: Date;
}

const DEFAULT_EXPIRY_MINUTES = 15;

export function generateTokenWithExpiry(
  expiryMinutes: number = DEFAULT_EXPIRY_MINUTES,
): TokenWithExpiry {
  const token = generateSecureToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);
  return { token, tokenHash, expiresAt };
}
