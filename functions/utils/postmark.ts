import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import type { User } from "@/shared/models/user";

import type { AppContext } from "../types/appcontext";
import { createUrlFromRequest } from "./urls";

export type PostmarkHeader = {
  Name: string;
  Value: string | number;
};

export type PostmarkEmailOptions = {
  From: string;
  To: string;
  Cc?: string;
  Bcc?: string;
  Tag?: string;
  ReplyTo?: string;
  Headers?: PostmarkHeader[];
  TrackOpens?: boolean;
  TrackLinks?: "None" | "HtmlAndText" | "HtmlOnly" | "TextOnly";
  Metadata?: Record<string, string | number>;
  MessageStream?: string;
};

export const PostmarkEmailResponse = z.object({
  To: z.string().optional(),
  SubmittedAt: z.string().optional(),
  MessageID: z.string().optional(),
  ErrorCode: z.number().optional(),
  Message: z.string().optional(),
});

export type PostmarkEmailResponse = z.infer<typeof PostmarkEmailResponse>;

export type SendEmailResult = {
  success: boolean;
  raw: PostmarkEmailResponse;
};

const applicationJson = "application/json";
const postmarkTestToken = "POSTMARK_API_TEST";

const sendRequest = async (
  endpoint: string,
  token: string,
  options: PostmarkEmailOptions,
): Promise<PostmarkEmailResponse> => {
  if (postmarkTestToken === token) {
    return { MessageID: "value" };
  }

  const body = JSON.stringify(options);
  const url = new URL(endpoint, "https://api.postmarkapp.com/");
  const headers = new Headers();
  headers.set("Content-Type", applicationJson);
  headers.set("Accept", applicationJson);
  headers.set("X-Postmark-Server-Token", token);
  const response = await fetch(url.toString(), { method: "post", body, headers });
  return PostmarkEmailResponse.parse(await response.json());
};

export type PostmarkSendWithTemplateOptions = PostmarkEmailOptions & {
  TemplateModel: Record<string, string | number>;
  InlineCss?: boolean;
} & (
    | {
        TemplateId: number;
        TemplateAlias?: never;
      }
    | {
        TemplateId?: never;
        TemplateAlias: string;
      }
  );

export const sendWithTemplate = async (
  token: string,
  options: PostmarkSendWithTemplateOptions,
): Promise<SendEmailResult> => {
  const response = await sendRequest("/email/withTemplate", token, options);

  if (!response.MessageID) {
    return { raw: response, success: false };
  }

  return { raw: response, success: true };
};

export type SendEmailFunction<T extends SendEmailResult = SendEmailResult> = (
  ctx: AppContext,
  user: User,
) => Promise<T>;

export type BasicTemplateModel = {
  product_url: string;
};

export type ActionTemplateModel = BasicTemplateModel & {
  name: string;
  action_url: string;
};

const createActionTemplateOptions = (ctx: AppContext, pathname: string, template: string, code: string, user: User) => {
  const actionQuery = new URLSearchParams();
  actionQuery.set("email", user.email);
  actionQuery.set("code", code);

  const model: ActionTemplateModel = {
    product_url: createUrlFromRequest(ctx.request),
    action_url: createUrlFromRequest(ctx.request, pathname, actionQuery),
    name: user.fullName,
  };

  return {
    From: ctx.env.POSTMARK_SENDER,
    To: `"${user.fullName}" <${user.email}>`,
    TemplateAlias: template,
    TemplateModel: model,
  };
};

const createActionSenderFunction = (pathname: string, template: string): SendEmailFunction => {
  return async (ctx, user) => {
    const code = uuidv4();

    const options = createActionTemplateOptions(ctx, pathname, template, code, user);
    const response = await sendWithTemplate(ctx.env.POSTMARK_SERVER_TOKEN, options);

    if (response.success) {
      user.verificationCode = code;
    }
    return response;
  };
};

export const sendConfirmationEmail = createActionSenderFunction("/auth/verify-email", "email-verification");

export const sendResetPasswordEmail = createActionSenderFunction("/auth/reset-password", "reset-password");
