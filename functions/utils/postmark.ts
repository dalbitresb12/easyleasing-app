import type { AppContext } from "../types/appcontext";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import type { User } from "../models/user";

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

const createUrlFromRequest = (request: Request, pathname?: string, query?: URLSearchParams): string => {
  const url = new URL(request.url);
  url.username = "";
  url.password = "";
  url.hash = "";
  url.pathname = pathname ?? "";
  url.search = query?.toString() ?? "";
  return url.toString();
};

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

const createActionTemplateOptions = (
  ctx: AppContext,
  pathname: string,
  templateAlias: string,
  code: string,
  user: User,
) => {
  const actionQuery = new URLSearchParams();
  actionQuery.set("email", user.email);
  actionQuery.set("code", code);

  const model: ActionTemplateModel = {
    product_url: createUrlFromRequest(ctx.request),
    action_url: createUrlFromRequest(ctx.request, pathname, actionQuery),
    name: user.fullname,
  };

  return {
    From: ctx.env.POSTMARK_SENDER,
    To: `"${user.fullname}" <${user.email}>`,
    TemplateAlias: templateAlias,
    TemplateModel: model,
  };
};

export const sendConfirmationEmail: SendEmailFunction = async (ctx, user) => {
  const code = uuidv4();

  const options = createActionTemplateOptions(ctx, "/auth/verify-email", "email-verification", code, user);
  const response = await sendWithTemplate(ctx.env.POSTMARK_SERVER_TOKEN, options);

  if (response.success) {
    user.verificationCode = code;
  }
  return response;
};
