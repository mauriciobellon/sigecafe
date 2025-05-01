import { setup } from "@nuxt/test-utils/e2e";

const baseURL = process.env.BASE_URL
const basePort = parseInt(baseURL?.split(':')[2] ?? '80')

export default async () => {
  await setup({
    host: `${baseURL}:${basePort}`,
    browser: true,
    browserOptions: {
      type: "chromium",
    },
  });
};
