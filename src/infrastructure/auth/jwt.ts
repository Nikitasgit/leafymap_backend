import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("FATAL: JWT_SECRET must be defined in environment variables");
}

export interface JWTPayload {
  id: string;
  userType: string;
  role?: string;
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "1d",
  });
};

export const verifyToken = (token: string): JWTPayload => {
  const decoded = jwt.verify(token, JWT_SECRET);
  if (typeof decoded === "string" || !decoded || typeof decoded !== "object") {
    throw new Error("Invalid token");
  }
  const { id, userType, role } = decoded as JWTPayload;
  if (!id || !userType) {
    throw new Error("Invalid token payload");
  }
  return { id, userType, role };
};
