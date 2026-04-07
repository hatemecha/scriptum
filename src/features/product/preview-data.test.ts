import { describe, expect, it } from "vitest";

import { isPreviewDemoProjectId } from "./preview-data";

describe("isPreviewDemoProjectId", () => {
  it("returns true for seeded playground / landing demo ids", () => {
    expect(isPreviewDemoProjectId("the-silent-editor")).toBe(true);
    expect(isPreviewDemoProjectId("manana-sin-mapa")).toBe(true);
    expect(isPreviewDemoProjectId("last-call")).toBe(true);
    expect(isPreviewDemoProjectId("sin-titulo")).toBe(true);
  });

  it("returns false for normal uuid-shaped project ids", () => {
    expect(isPreviewDemoProjectId("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11")).toBe(false);
    expect(isPreviewDemoProjectId("")).toBe(false);
  });
});
