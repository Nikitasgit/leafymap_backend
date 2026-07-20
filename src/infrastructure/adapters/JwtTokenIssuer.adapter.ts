import {
  IJwtTokenIssuer,
  JwtTokenPayload,
} from "@src/domain/interfaces/IJwtTokenIssuer";
import { generateToken, verifyToken } from "@src/infrastructure/auth/jwt";

class JwtTokenIssuerAdapter implements IJwtTokenIssuer {
  issue(payload: JwtTokenPayload): string {
    return generateToken(payload);
  }

  verify(token: string): JwtTokenPayload {
    return verifyToken(token);
  }
}

export default JwtTokenIssuerAdapter;
