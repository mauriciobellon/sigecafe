import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import SharedAppTitle from "@/components/Shared/AppTitle.vue";
describe("Unit Test Components", () => {
  it("Hello", async () => {
    const helloComponent = await mountSuspended(SharedAppTitle);
    expect(helloComponent.text()).toContain("Escola ON");
  });
});
