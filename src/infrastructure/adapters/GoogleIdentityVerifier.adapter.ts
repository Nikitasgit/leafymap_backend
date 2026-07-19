import {
  GoogleIdentity,
  IGoogleIdentityVerifier,
} from "@src/domain/interfaces/IGoogleIdentityVerifier";
import { verifyGoogleIdToken } from "@src/infrastructure/auth/googleAuth";

class GoogleIdentityVerifierAdapter implements IGoogleIdentityVerifier {
  async verifyIdToken(idToken: string): Promise<GoogleIdentity> {
    const payload = await verifyGoogleIdToken(idToken);
    return {
      email: payload.email,
      googleId: payload.sub,
      picture: payload.picture,
      givenName: payload.given_name,
      familyName: payload.family_name,
    };
  }
}

export default GoogleIdentityVerifierAdapter;
