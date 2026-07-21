export interface JwtTokenPayload {
  id: string;
  userType: string;
  role?: string;
}

export interface IJwtTokenIssuer {
  issue(payload: JwtTokenPayload): string;
  verify(token: string): JwtTokenPayload;
}
