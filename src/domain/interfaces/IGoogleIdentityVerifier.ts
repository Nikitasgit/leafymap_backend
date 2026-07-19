export interface GoogleIdentity {
  email: string;
  googleId: string;
  picture?: string;
  givenName?: string;
  familyName?: string;
}

export interface IGoogleIdentityVerifier {
  verifyIdToken(idToken: string): Promise<GoogleIdentity>;
}
