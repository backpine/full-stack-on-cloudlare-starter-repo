import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      // /esm/icons/index.mjs only exports the icons statically, so no separate chunks are created
      "@tabler/icons-react": "@tabler/icons-react/dist/esm/icons/index.mjs",
    },
  },
  plugins: [
    tsConfigPaths(),
    tanstackRouter({ autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
    cloudflare(
      // When developing code that calls data-service through a Wrangler service
      // binding, replace the cloudflare() call above with this so Vite starts the
      // bound worker alongside user-application:
      //{
      //   auxiliaryWorkers: [
      //     {
      //       configPath: "../data-service/wrangler.jsonc",
      //     },
      //   ],
      // }
    ),
  ],
  server: {
    watch: {
      ignored: ["**/.wrangler/state/**"],
    },
  },
});
