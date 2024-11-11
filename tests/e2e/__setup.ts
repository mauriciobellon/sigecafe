import { setup } from '@nuxt/test-utils/e2e';

export default async () => {
    await setup({
        host: "http://localhost:3000",
        browser: true,
        browserOptions: {
            type: 'chromium'
        }
    })
}