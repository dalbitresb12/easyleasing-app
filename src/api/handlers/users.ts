import { SanitizedUser } from "@/shared/models/user";
import { HttpClient } from "@/utils/http-client";

const prefix = (path: string) => `/api/users${path}`;

export const usersHandler = (): Promise<SanitizedUser> => {
  return HttpClient.get(prefix("/me"), SanitizedUser);
};

export const pictureHandler = (): Promise<string> => {
  return HttpClient.getFile(prefix("/picture"));
};
