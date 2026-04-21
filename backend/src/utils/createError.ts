import { AppError } from "../classes/AppError.js";

export function createError(
  message: string,
  statusCode: number,
  errors?: Record<string, string>
): AppError {

 return new AppError(message, statusCode, errors);
}
