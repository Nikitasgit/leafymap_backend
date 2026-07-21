import { Response } from "express";

const cookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
    path: "/",
  };
};

export const setTokenCookie = (res: Response, token: string): void => {
  res.cookie("token", token, {
    ...cookieOptions(),
    maxAge: 86400000, // 1 day
  });
};

export const clearTokenCookie = (res: Response): void => {
  res.clearCookie("token", cookieOptions());
};
