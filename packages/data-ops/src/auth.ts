import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "./db/database";
import { account, session, user, verification } from "./drizzle-out/auth-schema";
import { polar, checkout, portal, usage, webhooks } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";

type BetterAuthInstance = ReturnType<typeof betterAuth>;

let auth: BetterAuthInstance;

type PolarConfig = {
    accessToken: string
    successUrl?: string
}

type GoogleOauthConfig = {
    clientId: string
    clientSecret: string
}

export function createBetterAuth(
    database: NonNullable<Parameters<typeof betterAuth>[0]>["database"],
    google?: GoogleOauthConfig,
    polarConfig?: PolarConfig
  ): BetterAuthInstance {
    return betterAuth({
      database,
      emailAndPassword: {
        enabled: false,
      },
      socialProviders: {
        google: {
          clientId: google?.clientId ?? "",
          clientSecret: google?.clientSecret ?? "",
        },
      },
      plugins: [
        polar({
            client: new Polar({
                accessToken: polarConfig?.accessToken ?? ""
            }),
            createCustomerOnSignUp: true,
            use: [
                checkout({
                    products: [
                        {
                            productId: "08c9347f-0f13-4201-96cc-da74c3cf9ff6",
                            slug: "/checkout/datascraper" // Custom slug for easy reference in Checkout URL, e.g. /checkout/Datascraper
                        }
                    ],
                    successUrl: polarConfig?.successUrl ?? "http://localhost:3000/success?checkout_id={CHECKOUT_ID}",
                    authenticatedUsersOnly: true
                })
            ],
        })
      ]
    });
  }


export function getAuth(
  google: GoogleOauthConfig,
  polarConfig: PolarConfig
): BetterAuthInstance {
    if (auth) return auth;
  
    auth = createBetterAuth(
      drizzleAdapter(getDb(), {
        provider: "sqlite",
        schema: {
          user,
          session,
          account,
          verification
        }
      }),
      google,
      polarConfig
    );
    return auth;
}
