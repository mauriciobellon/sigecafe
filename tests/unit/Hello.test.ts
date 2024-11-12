import Hello from "@/components/Hello.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";

describe("Unit Test Components", () => {
  it("Hello", async () => {
    const helloComponent = await mountSuspended(Hello);
    expect(helloComponent.text()).toContain("Hello World");
  });
});
