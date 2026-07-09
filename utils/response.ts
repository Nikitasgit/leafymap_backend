import { Response } from "express";

export const APIResponse = (
  response: Response,
  data: any,
  message: string,
  status: number = 200,
  code?: string
) => {
  const responseData = {
    message,
    data,
    ...(code && { code }),
  };
  response.status(status).json(responseData);
};
