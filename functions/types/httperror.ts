import { ZodError } from "zod";

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
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
