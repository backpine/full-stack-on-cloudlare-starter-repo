import { createBetterAuth } from "@/auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import Database from "better-sqlite3";

export const auth = createBetterAuth(
  drizzleAdapter(
    {},
    {
      provider: "sqlite",
    },
  ),
);
