export interface OpaqueTokenWithExpiry {
  token: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface IOpaqueTokenFactory {
  generate(expiryMinutes?: number): OpaqueTokenWithExpiry;
  hash(rawToken: string): string;
  isExpired(expiresAt: Date | undefined): boolean;
}
