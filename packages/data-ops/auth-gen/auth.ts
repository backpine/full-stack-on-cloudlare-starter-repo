import { createBetterAuth } from "@/auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth: ReturnType<typeof betterAuth> = createBetterAuth(
  drizzleAdapter({},
    {provider: "sqlite"}
  )
)
