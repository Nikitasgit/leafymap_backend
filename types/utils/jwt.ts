// JWT utility types
export interface JWTPayload {
  id: string;
  email: string;
  username: string;
  userType: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface TokenVerificationResult {
  valid: boolean;
  payload?: JWTPayload;
  error?: string;
}
