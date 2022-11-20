import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ResetPasswordRequest,
  SendResetPasswordRequest,
  SuccessResponse,
  VerifyEmailRequest,
} from "@/shared/api/types";
import { HttpClient, JsonRecord } from "@/utils/http-client";
import { JwtStore } from "@/utils/jwt-store";

const prefix = (path: string) => `/api/auth${path}`;

const createSuccessHandler = <T extends JsonRecord>(path: string) => {
  return (data: T): Promise<SuccessResponse> => {
    return HttpClient.post(path, data, SuccessResponse);
  };
};

export const loginHandler = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await HttpClient.post(prefix("/login"), data, LoginResponse);
  const isSaved = await JwtStore.save(response.jwt);
  if (!isSaved) {
    // TODO: Improve error handling
    throw new Error("Unable to store JWT token to local storage.");
  }
  return response;
};

export const registerHandler = createSuccessHandler<RegisterRequest>(prefix("/register"));

export const resetPasswordHandler = createSuccessHandler<ResetPasswordRequest>(prefix("/reset-password"));

export const sendResetPasswordHandler = createSuccessHandler<SendResetPasswordRequest>(prefix("/send-reset-password"));

export const verifyEmailHandler = createSuccessHandler<VerifyEmailRequest>(prefix("/verify-email"));
