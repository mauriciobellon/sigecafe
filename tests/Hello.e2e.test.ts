import { setup, createPage, url } from '@nuxt/test-utils/e2e'
import { describe, test, expect } from 'vitest'

describe('E2E Test Components', async () => {
    await setup({
        browser: true,
        browserOptions: {
            type: 'chromium'
        }
    })

    test('Hello', async () => {
        const page = await createPage()
        await page.goto(url('/'), { waitUntil: 'hydration' })
        const helloText = await page.getByTestId('hello')
        const text = await helloText.textContent()

        expect(text).toBe('Hello World')
    })
})