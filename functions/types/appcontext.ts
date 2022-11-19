import type { User } from "../models/user";

export interface AppEnv {
  users: KVNamespace;
  preferences: KVNamespace;
  loan_data: KVNamespace;
  JWT_SECRET: string;
}

export interface AppData extends Record<string, unknown> {
  user: User;
}

export type AppFunction = PagesFunction<AppEnv, string, AppData>;
