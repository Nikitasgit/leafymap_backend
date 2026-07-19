import {
  IJwtTokenIssuer,
  JwtTokenPayload,
} from "@src/domain/interfaces/IJwtTokenIssuer";
import { generateToken } from "@src/infrastructure/auth/jwt";

class JwtTokenIssuerAdapter implements IJwtTokenIssuer {
  issue(payload: JwtTokenPayload): string {
    return generateToken(payload);
  }
}

export default JwtTokenIssuerAdapter;
