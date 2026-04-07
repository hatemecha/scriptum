import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Database } from "@/lib/supabase/types";

const { mergeUserProfilePreferencesMock } = vi.hoisted(() => ({
  mergeUserProfilePreferencesMock: vi.fn(),
}));

vi.mock("./profile", async () => {
  const actual = await vi.importActual<typeof import("./profile")>("./profile");
  return {
    ...actual,
    mergeUserProfilePreferences: mergeUserProfilePreferencesMock,
  };
});

import {
  clearPreferenceOverlay,
  mergeUserProfilePreferencesResilient,
  readPreferenceOverlay,
} from "./local-profile-preferences-overlay";

const userId = "user_123";
const supabase = {} as SupabaseClient<Database>;

describe("mergeUserProfilePreferencesResilient", () => {
  beforeEach(() => {
    clearPreferenceOverlay(userId);
    mergeUserProfilePreferencesMock.mockReset();
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: true,
    });
  });

  it("keeps the overlay clean after a confirmed server write", async () => {
    mergeUserProfilePreferencesMock.mockResolvedValue({
      error: null,
      profile: null,
    });

    await expect(
      mergeUserProfilePreferencesResilient(supabase, userId, { theme: "dark" }),
    ).resolves.toEqual({
      appliedLocallyOnly: false,
      error: null,
    });
    expect(readPreferenceOverlay(userId)).toEqual({});
  });

  it("queues preferences locally when the live schema is missing the column", async () => {
    mergeUserProfilePreferencesMock.mockResolvedValue({
      error: Object.assign(new Error('column "preferences" does not exist'), {
        code: "42703",
      }),
      profile: null,
    });

    await expect(
      mergeUserProfilePreferencesResilient(supabase, userId, { editorTipsEnabled: false }),
    ).resolves.toEqual({
      appliedLocallyOnly: true,
      error: null,
    });
    expect(readPreferenceOverlay(userId)).toEqual({ editorTipsEnabled: false });
  });
});
