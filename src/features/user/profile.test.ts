import { describe, expect, it } from "vitest";

import type { Json } from "@/lib/supabase/types";

import {
  isMissingPreferencesColumnError,
  mapProfileRowToAppProfile,
  type UserProfileRowLike,
} from "./profile";

const baseProfileRow: UserProfileRowLike = {
  id: "9c80ef53-998e-4f9a-a61b-a15aa56513bd",
  email: "gmrgabo@gmail.com",
  display_name: "alex",
  avatar_url: null,
  plan: "free",
  onboarding_completed_at: null,
  created_at: "2026-04-06T12:00:00.000Z",
  updated_at: "2026-04-06T12:00:00.000Z",
  deleted_at: null,
};

describe("mapProfileRowToAppProfile", () => {
  it("falls back to empty preferences for legacy rows", () => {
    expect(mapProfileRowToAppProfile(baseProfileRow).preferences).toEqual({});
  });

  it("keeps valid persisted preferences", () => {
    const rowWithPreferences: UserProfileRowLike = {
      ...baseProfileRow,
      preferences: {
        editorAutosaveEnabled: true,
        editorTipsEnabled: false,
        theme: "dark",
      } as Json,
    };

    expect(mapProfileRowToAppProfile(rowWithPreferences).preferences).toEqual({
      editorAutosaveEnabled: true,
      editorTipsEnabled: false,
      theme: "dark",
    });
  });
});

describe("isMissingPreferencesColumnError", () => {
  it("detects profile schema drift on preferences", () => {
    expect(
      isMissingPreferencesColumnError({
        code: "42703",
        message: 'column "preferences" does not exist',
      }),
    ).toBe(true);
  });

  it("ignores unrelated database errors", () => {
    expect(
      isMissingPreferencesColumnError({
        code: "23505",
        message: "duplicate key value violates unique constraint",
      }),
    ).toBe(false);
  });
});
