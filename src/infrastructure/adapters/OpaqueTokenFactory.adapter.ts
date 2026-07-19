import {
  IOpaqueTokenFactory,
  OpaqueTokenWithExpiry,
} from "@src/domain/interfaces/IOpaqueTokenFactory";
import {
  generateTokenWithExpiry,
  hashToken,
  isTokenExpired,
} from "@src/infrastructure/auth/tokenHash";

class OpaqueTokenFactoryAdapter implements IOpaqueTokenFactory {
  generate(expiryMinutes?: number): OpaqueTokenWithExpiry {
    return generateTokenWithExpiry(expiryMinutes);
  }

  hash(rawToken: string): string {
    return hashToken(rawToken);
  }

  isExpired(expiresAt: Date | undefined): boolean {
    return isTokenExpired(expiresAt);
  }
}

export default OpaqueTokenFactoryAdapter;
