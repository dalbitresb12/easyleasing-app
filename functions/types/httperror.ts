import { ZodError } from "zod";

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export class ServerError extends HttpError {
  data?: unknown;

  constructor(message: string, data?: unknown) {
    super(500, message);
    this.data = data;
  }
}

export class ValidationError extends HttpError {
  issues: ZodError;
  flatten: boolean;

  constructor(issues: ZodError, flatten = true) {
    super(400, "Validation error");
    this.issues = issues;
    this.flatten = flatten;
  }
}
