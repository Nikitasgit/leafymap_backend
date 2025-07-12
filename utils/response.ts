import { Response } from "express";

export const APIResponse = (
  response: Response,
  data: any,
  message: string,
  status: number = 200
) => {
  const responseData = {
    message,
    data,
  };
  response.status(status).json(responseData);
};
