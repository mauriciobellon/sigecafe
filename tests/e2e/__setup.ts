import { setup } from "@nuxt/test-utils/e2e";

export default async () => {
  await setup({
    host: "https://sigecafe.bellon.dev",
    browser: true,
    browserOptions: {
      type: "chromium",
    },
  });
};
