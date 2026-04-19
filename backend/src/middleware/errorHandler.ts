import type { ErrorRequestHandler } from "express";
import { AppError } from "../classes/AppError.js";


function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}


const errorHandler: ErrorRequestHandler = (err, req, res, next ) => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let stack: string | undefined;
  let errors: Record<string, string> | undefined;

if (isAppError(err)) {
  statusCode = err.statusCode ?? 500;
  message = err.message;
  errors = err.errors;
  stack = err.stack;
} else if (err instanceof Error) {
  message = err.message;
 
  stack = err.stack;
}else {
    console.error("Unknown error:", err);
  }

  if (res.headersSent) {
    return next(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    stack: process.env.NODE_ENV === "production" ? undefined : stack,
  });
};

export default errorHandler;
