import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import type { TailwindConfig } from "tw-to-css";
import svelteEmailTailwind from "svelte-email-tailwind/vite";

const emailTwConfig: TailwindConfig = {
  theme: {
    screens: {
      md: { max: "767px" },
      sm: { max: "475px" },
    },
    extend: {
      colors: {
        brand: "rgb(255, 62, 0)",
      },
    },
  },
};

export default defineConfig({
  plugins: [
    sveltekit(),
    svelteEmailTailwind({
      tailwindConfig: emailTwConfig,
      pathToEmailFolder: "src/lib/components/emails",
    }),
  ],
});
