import { ListLeasingsResponse } from "@/shared/api/types";
import { EditableLeasing, SanitizedLeasing, PartialEditableLeasing } from "@/shared/models/leasing";

import { HttpClient, HttpMethods } from "@/utils/http-client";

const prefix = (path?: string) => (path ? `/api/leasings${path}` : `/api/leasings`);

export const leasingsHandler = (): Promise<ListLeasingsResponse> => {
  return HttpClient.get(prefix(), ListLeasingsResponse);
};

export const leasingsPostHandler = (data: EditableLeasing): Promise<SanitizedLeasing> => {
  return HttpClient.post(prefix(), data, SanitizedLeasing);
};

export const leasingGetHandler = (id: string): Promise<SanitizedLeasing> => {
  return HttpClient.get(prefix(`/${id}`), SanitizedLeasing);
};

export const leasingPostHandler = (id: string, data: EditableLeasing): Promise<SanitizedLeasing> => {
  return HttpClient.post(prefix(`/${id}`), data, SanitizedLeasing);
};

export const leasingPutHandler = leasingPostHandler;

export const leasingPatchHandler = (id: string, data: PartialEditableLeasing): Promise<SanitizedLeasing> => {
  return HttpClient.patch(prefix(`/${id}`), data, SanitizedLeasing);
};

export const leasingDeleteHandler = async (id: string): Promise<boolean> => {
  await HttpClient.rawRequest(prefix(`/${id}`), HttpMethods.DELETE);
  return true;
};
