import { Response } from "express";

export const setTokenCookie = (res: Response, token: string): void => {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 86400000, // 1 day
    path: "/",
  });
};

export const clearTokenCookie = (res: Response): void => {
  res.clearCookie("token");
};
