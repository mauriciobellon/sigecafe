import { setup, createPage } from '@nuxt/test-utils/e2e'
import { describe, test, expect } from 'vitest'

describe('E2E Test Components', async () => {
    await setup({
        browser: true,
        browserOptions: {
            type: 'chromium'
        }
    })

    test('Hello', async () => {
        const page = await createPage('/')
        const helloText = await page.textContent('div')
        expect(helloText).toContain('Hello World')
    })
})