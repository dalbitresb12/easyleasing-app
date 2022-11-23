import { z, ZodTypeAny } from "zod";

import { HttpError } from "@/shared/api/types";

import { JwtStore } from "./jwt-store";

export type JsonRecord = Record<string, unknown>;

export enum HttpMethods {
  GET = "GET",
  HEAD = "HEAD",
  OPTIONS = "OPTIONS",
  DELETE = "DELETE",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
}

export const HttpMethodsWithBody = [HttpMethods.POST, HttpMethods.PUT, HttpMethods.PATCH];
export type HttpMethodsWithBody = HttpMethods.POST | HttpMethods.PUT | HttpMethods.PATCH;
export type HttpMethodsWithoutBody = Exclude<HttpMethods, HttpMethodsWithBody>;

export class HttpClient {
  private static async handleResponse<TModel extends ZodTypeAny>(
    response: Response,
    model: TModel,
  ): Promise<z.infer<TModel>> {
    const body = await response.json();
    if (!response.ok) {
      throw HttpError.fromJSON(body);
    }
    return await model.parseAsync(body);
  }

  private static handleRawResponse(response: Response): Response {
    if (!response.ok) {
      throw new HttpError(response.status, response.statusText);
    }
    return response;
  }

  private static async withAuthentication(options: RequestInit): Promise<RequestInit> {
    const token = await JwtStore.get();
    if (token) {
      const headers = new Headers(options.headers);
      headers.set("authorization", `Bearer ${token}`);
      options.headers = headers;
    }
    return options;
  }

  static async rawRequest(path: string, method: HttpMethodsWithoutBody): Promise<Response>;
  static async rawRequest(path: string, method: HttpMethodsWithBody, body?: BodyInit): Promise<Response>;
  static async rawRequest(path: string, method: HttpMethods, body?: BodyInit): Promise<Response> {
    const options = await this.withAuthentication({ method });
    if (body) options.body = body;
    const response = await fetch(path, options);
    return this.handleRawResponse(response);
  }

  static async request<TModel extends ZodTypeAny>(
    path: string,
    method: HttpMethodsWithoutBody,
    model: TModel,
  ): Promise<z.infer<TModel>>;
  static async request<TModel extends ZodTypeAny, TBody extends JsonRecord = JsonRecord>(
    path: string,
    method: HttpMethodsWithBody,
    model: TModel,
    body?: TBody,
  ): Promise<z.infer<TModel>>;
  static async request<TModel extends ZodTypeAny, TBody extends JsonRecord = JsonRecord>(
    path: string,
    method: HttpMethods,
    model: TModel,
    body?: TBody,
  ): Promise<z.infer<TModel>> {
    const options = await this.withAuthentication({ method });
    if (body) options.body = JSON.stringify(body);
    const response = await fetch(path, options);
    return this.handleResponse<TModel>(response, model);
  }

  static async getFile(path: string): Promise<string> {
    const options = await this.withAuthentication({ method: HttpMethods.GET });
    const response = await fetch(path, options);
    if (!response.ok) {
      throw new HttpError(response.status, response.statusText);
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  static get<TModel extends ZodTypeAny>(path: string, model: TModel): Promise<z.infer<TModel>> {
    return this.request(path, HttpMethods.GET, model);
  }
  static head<TModel extends ZodTypeAny>(path: string, model: TModel): Promise<z.infer<TModel>> {
    return this.request(path, HttpMethods.HEAD, model);
  }
  static options<TModel extends ZodTypeAny>(path: string, model: TModel): Promise<z.infer<TModel>> {
    return this.request(path, HttpMethods.OPTIONS, model);
  }
  static delete<TModel extends ZodTypeAny>(path: string, model: TModel): Promise<z.infer<TModel>> {
    return this.request(path, HttpMethods.DELETE, model);
  }

  static post<TModel extends ZodTypeAny, TBody extends JsonRecord = JsonRecord>(
    path: string,
    body: TBody,
    model: TModel,
  ): Promise<z.infer<TModel>> {
    return this.request(path, HttpMethods.POST, model, body);
  }
  static put<TModel extends ZodTypeAny, TBody extends JsonRecord = JsonRecord>(
    path: string,
    body: TBody,
    model: TModel,
  ): Promise<z.infer<TModel>> {
    return this.request(path, HttpMethods.PUT, model, body);
  }
  static patch<TModel extends ZodTypeAny, TBody extends JsonRecord = JsonRecord>(
    path: string,
    body: TBody,
    model: TModel,
  ): Promise<z.infer<TModel>> {
    return this.request(path, HttpMethods.PATCH, model, body);
  }
}
