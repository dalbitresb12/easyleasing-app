import { z, ZodObject, ZodRawShape } from "zod";

import { JwtStore } from "./jwt-store";

export type JsonRecord = Record<string, unknown>;

export enum HttpMethods {
  GET = "GET",
  HEAD = "HEAD",
  OPTIONS = "OPTIONS",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

export const HttpMethodsWithBody = [HttpMethods.POST, HttpMethods.PUT, HttpMethods.PATCH, HttpMethods.DELETE];
export type HttpMethodsWithBody = HttpMethods.POST | HttpMethods.PUT | HttpMethods.PATCH | HttpMethods.DELETE;
export type HttpMethodsWithoutBody = Exclude<HttpMethods, HttpMethodsWithBody>;

export class HttpClient {
  private static async handleResponse<TShape extends ZodRawShape, TModel extends ZodObject<TShape>>(
    response: Response,
    model: TModel,
  ): Promise<z.infer<TModel>> {
    if (!response.ok) {
      // TODO: Improve error handling, share common types and validation for errors
      throw new Error(response.statusText);
    }
    const body = await response.json();
    return await model.parseAsync(body);
  }

  static async request<TShape extends ZodRawShape, TModel extends ZodObject<TShape>>(
    path: string,
    method: HttpMethodsWithoutBody,
    model: TModel,
    body?: never,
  ): Promise<z.infer<TModel>>;
  static async request<
    TShape extends ZodRawShape,
    TModel extends ZodObject<TShape>,
    TBody extends JsonRecord = JsonRecord,
  >(path: string, method: HttpMethodsWithBody, model: TModel, body?: TBody): Promise<z.infer<TModel>>;
  static async request<
    TShape extends ZodRawShape,
    TModel extends ZodObject<TShape>,
    TBody extends JsonRecord = JsonRecord,
  >(path: string, method: HttpMethods, model: TModel, body?: TBody): Promise<z.infer<TModel>> {
    const options: RequestInit = { method };
    const token = await JwtStore.get();
    if (token) {
      const headers = new Headers();
      headers.set("authorization", `Bearer ${token}`);
      options.headers = headers;
    }
    if (body) options.body = JSON.stringify(body);
    const response = await fetch(path, options);
    return this.handleResponse<TShape, TModel>(response, model);
  }

  static get<TShape extends ZodRawShape, TModel extends ZodObject<TShape>>(
    path: string,
    model: TModel,
  ): Promise<z.infer<TModel>> {
    return this.request(path, HttpMethods.GET, model);
  }
  static head<TShape extends ZodRawShape, TModel extends ZodObject<TShape>>(
    path: string,
    model: TModel,
  ): Promise<z.infer<TModel>> {
    return this.request(path, HttpMethods.HEAD, model);
  }
  static options<TShape extends ZodRawShape, TModel extends ZodObject<TShape>>(
    path: string,
    model: TModel,
  ): Promise<z.infer<TModel>> {
    return this.request(path, HttpMethods.OPTIONS, model);
  }

  static post<TShape extends ZodRawShape, TModel extends ZodObject<TShape>, TBody extends JsonRecord = JsonRecord>(
    path: string,
    body: TBody,
    model: TModel,
  ): Promise<z.infer<TModel>> {
    return this.request(path, HttpMethods.POST, model, body);
  }
  static put<TShape extends ZodRawShape, TModel extends ZodObject<TShape>, TBody extends JsonRecord = JsonRecord>(
    path: string,
    body: TBody,
    model: TModel,
  ): Promise<z.infer<TModel>> {
    return this.request(path, HttpMethods.PUT, model, body);
  }
  static patch<TShape extends ZodRawShape, TModel extends ZodObject<TShape>, TBody extends JsonRecord = JsonRecord>(
    path: string,
    body: TBody,
    model: TModel,
  ): Promise<z.infer<TModel>> {
    return this.request(path, HttpMethods.PATCH, model, body);
  }
  static delete<TShape extends ZodRawShape, TModel extends ZodObject<TShape>, TBody extends JsonRecord = JsonRecord>(
    path: string,
    body: TBody,
    model: TModel,
  ): Promise<z.infer<TModel>> {
    return this.request(path, HttpMethods.DELETE, model, body);
  }
}
