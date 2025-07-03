import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface JWTPayload {
  id: string;
  userType: string;
}

/**
 * Generates a JWT token for a user
 * @param payload - The payload to include in the token
 * @returns The generated JWT token
 */
export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "1d",
  });
};

/**
 * Sets the JWT token as an HTTP-only cookie
 * @param res - Express response object
 * @param token - The JWT token to set
 */
export const setTokenCookie = (res: any, token: string): void => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 86400000, // 1 day
  });
};
