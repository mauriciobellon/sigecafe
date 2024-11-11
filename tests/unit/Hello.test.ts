import { describe, it, expect } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import Hello from "@/components/Hello.vue";

describe("Unit Test Components", () => {
  it("Hello", async () => {
    const helloComponent = await mountSuspended(Hello);
    expect(helloComponent.text()).toContain("Hello World");
  });
});  