-- Cleanup after pre-Day 17 rollout: remove legacy duplicate snapshot policies.
-- Keep only the authenticated-scoped policy names used by current migrations.

drop policy if exists "snapshots_select_own" on public.document_snapshots;
drop policy if exists "snapshots_insert_own" on public.document_snapshots;
