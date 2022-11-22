import { SanitizedUser, UpdatableUser } from "@/shared/models/user";

import { HttpClient, HttpMethods } from "@/utils/http-client";

const prefix = (path: string) => `/api/users${path}`;

export const usersHandler = (): Promise<SanitizedUser> => {
  return HttpClient.get(prefix("/me"), SanitizedUser);
};

export const usersPatchHandler = (data: UpdatableUser): Promise<SanitizedUser> => {
  return HttpClient.patch(prefix("/me"), data, SanitizedUser);
};

export const pictureHandler = (): Promise<string> => {
  return HttpClient.getFile(prefix("/picture"));
};

export const picturePutHandler = async (file: File): Promise<boolean> => {
  await HttpClient.rawRequest(prefix("/picture"), HttpMethods.PUT, file);
  return true;
};

export const pictureDeleteHandler = async (): Promise<boolean> => {
  await HttpClient.rawRequest(prefix("/picture"), HttpMethods.DELETE);
  return true;
};
