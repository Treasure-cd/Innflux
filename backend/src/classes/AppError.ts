export class AppError extends Error {
  statusCode: number;
  errors?: Record<string, string> | undefined;

  constructor(
    message: string,
    statusCode = 500,
    errors?: Record<string, string>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}
