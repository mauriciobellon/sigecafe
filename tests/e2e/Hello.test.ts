import { createPage, url } from "@nuxt/test-utils/e2e";
import { describe, expect, test } from "vitest";

import setup from "./__setup";

describe("E2E Test Components", async () => {
  setup();

  test("Hello", async () => {
    const page = await createPage();
    await page.goto(url("/"), { waitUntil: "hydration" });
    const helloText = await page.getByTestId("hello");
    const text = await helloText.textContent();
    expect(text).toBe("Hello World");
  });
});
