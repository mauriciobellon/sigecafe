import { describe, it, expect } from "vitest";
import Hello from "../app/components/Hello.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";

describe("Unit Test Components", () => {
  it("Hello", async () => {
    const helloComponent = await mountSuspended(Hello);
    expect(helloComponent.text()).toContain("Hello World");
  });
});  