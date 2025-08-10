import type { Config } from "drizzle-kit";

const config: Config = {
  out: "./src/drizzle-out",
  dialect: "sqlite",
  schema: ["./src/drizzle-out/schema.ts", "./src/drizzle-out/auth-schema.ts"],
  driver: "d1-http",
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
    token: process.env.CLOUDFLARE_D1_TOKEN!,
  },
  tablesFilter: ["!_cf_KV"],
};

export default config satisfies Config;
