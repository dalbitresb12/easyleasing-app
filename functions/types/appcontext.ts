import type { User } from "../models/user";

export interface AppEnv {
  users: KVNamespace;
  loan_data: KVNamespace;
  uploads: R2Bucket;
  JWT_SECRET: string;
  POSTMARK_SERVER_TOKEN: string;
  POSTMARK_SENDER: string;
}

export interface AppData extends Record<string, unknown> {
  user: User;
}

export type AppFunction = PagesFunction<AppEnv, string, AppData>;
export type AppContext = EventContext<AppEnv, string, AppData>;
