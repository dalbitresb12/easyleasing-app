import { z, ZodError } from "zod";

export enum HttpErrorCode {
  NoError,
  UnknownError,
  HttpError,
  ServerError,
  ValidationError,
}

export const HttpErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  code: z.number(),
  status: z.number(),
});
export type HttpErrorSchema = z.infer<typeof HttpErrorSchema>;

export class HttpError extends Error {
  code: HttpErrorCode;
  status: number;

  constructor(status: number, message: string) {
    super(message);
    (this.name = "Bad request"), (this.status = status);
    this.code = HttpErrorCode.HttpError;
  }

  toJSON(): HttpErrorSchema {
    return {
      error: this.name,
      message: this.message,
      code: this.code,
      status: this.status,
    };
  }

  static fromJSON(data: unknown): HttpError {
    const parsed = HttpErrorSchema.parse(data);
    const error = new HttpError(parsed.status, parsed.message);
    error.name = parsed.error;
    error.code = parsed.code;
    return error;
  }
}

export class ServerError extends HttpError {
  data?: unknown;

  constructor(message: string, data?: unknown) {
    super(500, message);
    this.name = "Server error";
    this.data = data;
    this.code = HttpErrorCode.ServerError;
  }
}

// TODO: Include issues in response
export class ValidationError extends HttpError {
  issues: ZodError;

  constructor(message: string, issues: ZodError) {
    super(400, message);
    this.issues = issues;
    this.code = HttpErrorCode.ValidationError;
  }
}
