import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import type { Database } from "@/lib/supabase/types";

import { canAccessProjectEditor } from "./project-access";

function createProjectAccessClient(result: {
  data: { id: string } | null;
  error: { message: string } | null;
}) {
  const maybeSingle = vi.fn().mockResolvedValue(result);
  const is = vi.fn().mockReturnValue({ maybeSingle });
  const eqOwner = vi.fn().mockReturnValue({ is });
  const eqProject = vi.fn().mockReturnValue({ eq: eqOwner });
  const select = vi.fn().mockReturnValue({ eq: eqProject });
  const from = vi.fn().mockReturnValue({ select });

  return {
    client: { from } as unknown as SupabaseClient<Database>,
    spies: {
      eqOwner,
      eqProject,
      from,
      is,
      maybeSingle,
      select,
    },
  };
}

describe("canAccessProjectEditor", () => {
  it("denies preview/playground demo ids without querying projects", async () => {
    const { client, spies } = createProjectAccessClient({
      data: null,
      error: null,
    });

    await expect(canAccessProjectEditor(client, "user_123", "the-silent-editor")).resolves.toBe(
      false,
    );
    expect(spies.from).not.toHaveBeenCalled();
  });

  it("allows opening a real owned project", async () => {
    const { client } = createProjectAccessClient({
      data: { id: "project_real123" },
      error: null,
    });

    await expect(canAccessProjectEditor(client, "user_123", "project_real123")).resolves.toBe(true);
  });
});
