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

const applicationJson = "application/json";

const sendRequest = async (
  endpoint: string,
  token: string,
  options: PostmarkEmailOptions,
): Promise<PostmarkEmailResponse> => {
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

export const sendWithTemplate = (
  token: string,
  options: PostmarkSendWithTemplateOptions,
): Promise<PostmarkEmailResponse> => {
  return sendRequest("/email/withTemplate", token, options);
};

export type BasicTemplateModel = {
  product_url: string;
};

export type ConfirmationEmailTemplateModel = BasicTemplateModel & {
  name: string;
  action_url: string;
};

export type ConfirmationEmailResponse = {
  success: boolean;
  raw: PostmarkEmailResponse;
};

export const sendConfirmationEmail = async (
  token: string,
  request: Request,
  user: User,
): Promise<ConfirmationEmailResponse> => {
  const code = uuidv4();

  const url = new URL(request.url);
  const model: ConfirmationEmailTemplateModel = {
    product_url: `${url.protocol}//${url.hostname}`,
    action_url: `${url.protocol}//${url.hostname}/auth/verify-email?code=${code}`,
    name: user.fullname,
  };

  const response = await sendWithTemplate(token, {
    From: "EasyLeasing <easyleasing@dalbitresb.com>",
    To: `"${user.fullname}" <${user.email}>`,
    TemplateAlias: "email-verification",
    TemplateModel: model,
  });

  if (!response.MessageID) {
    return { raw: response, success: false };
  }

  user.verificationCode = code;
  return { raw: response, success: true };
};
