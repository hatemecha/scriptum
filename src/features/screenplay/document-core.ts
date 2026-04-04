import { type ScreenplayBlockType } from "@/features/screenplay/blocks";

export const screenplayDocumentKind = "scriptum/screenplay-document";
export const screenplayDocumentSchemaVersion = 1;
export const screenplayDocumentMinimumReaderVersion = 1;
export const screenplayBlockSchemaVersion = 1;
export const screenplaySceneIndexVersion = 1;
export const screenplaySyncSchemaVersion = 1;

export const screenplayProjectStatuses = ["draft", "archived"] as const;
export const screenplayDocumentSyncStatuses = [
  "local-only",
  "pending-sync",
  "synced",
  "conflict",
] as const;

export type ScreenplayProjectStatus = (typeof screenplayProjectStatuses)[number];
export type ScreenplayDocumentSyncStatus = (typeof screenplayDocumentSyncStatuses)[number];
export type ScreenplayDocumentValidationMode = "editor" | "persisted";

export type ScreenplayEntityId<Prefix extends string> = `${Prefix}_${string}`;
export type ScreenplayDocumentId = ScreenplayEntityId<"doc">;
export type ScreenplayProjectId = ScreenplayEntityId<"project">;
export type ScreenplayBlockId = ScreenplayEntityId<"blk">;
export type ScreenplaySceneId = ScreenplayEntityId<"scene">;
export type ScreenplayOperationId = ScreenplayEntityId<"op">;

export interface ScreenplayDocumentSchema {
  kind: typeof screenplayDocumentKind;
  version: typeof screenplayDocumentSchemaVersion;
  minimumReaderVersion: typeof screenplayDocumentMinimumReaderVersion;
  blockVersion: typeof screenplayBlockSchemaVersion;
  sceneIndexVersion: typeof screenplaySceneIndexVersion;
  syncVersion: typeof screenplaySyncSchemaVersion;
}

export interface ScreenplayDocumentMetadata {
  id: ScreenplayDocumentId;
  revision: number;
  createdAt: string;
  updatedAt: string;
  lastNormalizedAt: string | null;
}

export interface ScreenplayProjectMetadata {
  id: ScreenplayProjectId;
  title: string;
  author: string | null;
  description: string | null;
  language: string;
  status: ScreenplayProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ScreenplayDocumentBlock {
  id: ScreenplayBlockId;
  type: ScreenplayBlockType;
  text: string;
  revision: number;
  createdAt: string;
  updatedAt: string;
}

export interface ScreenplayDocumentContent {
  blockOrder: readonly ScreenplayBlockId[];
  blocks: Record<string, ScreenplayDocumentBlock>;
}

export interface ScreenplaySceneIndexEntry {
  id: ScreenplaySceneId;
  headingBlockId: ScreenplayBlockId;
  firstBlockId: ScreenplayBlockId;
  lastBlockId: ScreenplayBlockId;
  ordinal: number;
}

export interface ScreenplaySceneIndex {
  version: typeof screenplaySceneIndexVersion;
  sceneOrder: readonly ScreenplaySceneId[];
  scenes: Record<string, ScreenplaySceneIndexEntry>;
  unscenedBlockIds: readonly ScreenplayBlockId[];
}

export interface ScreenplayDocumentIndexes {
  scenes: ScreenplaySceneIndex;
}

export interface ScreenplayDocumentSyncState {
  version: typeof screenplaySyncSchemaVersion;
  status: ScreenplayDocumentSyncStatus;
  clientId: string | null;
  baseRevision: number | null;
  lastSyncedRevision: number | null;
  lastSyncedAt: string | null;
  pendingOperationIds: readonly ScreenplayOperationId[];
}

export interface ScreenplayDocument {
  schema: ScreenplayDocumentSchema;
  document: ScreenplayDocumentMetadata;
  project: ScreenplayProjectMetadata;
  content: ScreenplayDocumentContent;
  indexes: ScreenplayDocumentIndexes;
  sync: ScreenplayDocumentSyncState;
  extensions: Record<string, never>;
}

export interface CreateScreenplayProjectMetadataInput {
  id?: ScreenplayProjectId;
  title?: string;
  author?: string | null;
  description?: string | null;
  language?: string;
  status?: ScreenplayProjectStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateScreenplayBlockInput {
  id?: ScreenplayBlockId;
  type?: ScreenplayBlockType;
  text?: string;
  revision?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateScreenplaySyncStateInput {
  status?: ScreenplayDocumentSyncStatus;
  clientId?: string | null;
  baseRevision?: number | null;
  lastSyncedRevision?: number | null;
  lastSyncedAt?: string | null;
  pendingOperationIds?: readonly ScreenplayOperationId[];
}

export interface CreateScreenplayDocumentInput {
  id?: ScreenplayDocumentId;
  revision?: number;
  createdAt?: string;
  updatedAt?: string;
  lastNormalizedAt?: string | null;
  project?: CreateScreenplayProjectMetadataInput;
  blocks?: readonly CreateScreenplayBlockInput[];
  sync?: CreateScreenplaySyncStateInput;
}

export const screenplayDocumentSchema = {
  kind: screenplayDocumentKind,
  version: screenplayDocumentSchemaVersion,
  minimumReaderVersion: screenplayDocumentMinimumReaderVersion,
  blockVersion: screenplayBlockSchemaVersion,
  sceneIndexVersion: screenplaySceneIndexVersion,
  syncVersion: screenplaySyncSchemaVersion,
} as const satisfies ScreenplayDocumentSchema;

const defaultEmptyActionBlockInput: CreateScreenplayBlockInput = {
  type: "action",
  text: "",
};

function generateOpaqueIdSuffix(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID().replace(/-/g, "");
  }

  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

export function isNonNegativeInteger(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

export function hasIdPrefix<Prefix extends string>(
  value: string,
  prefix: Prefix,
): value is ScreenplayEntityId<Prefix> {
  return value.startsWith(`${prefix}_`) && value.length > prefix.length + 1;
}

function normalizeTimestamp(value: string | undefined, fallback: string): string {
  if (value === undefined) {
    return fallback;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid timestamp: "${value}".`);
  }

  return date.toISOString();
}

function normalizeOptionalTimestamp(value: string | null | undefined): string | null {
  if (value == null) {
    return null;
  }

  return normalizeTimestamp(value, value);
}

function normalizeNullableText(value: string | null | undefined): string | null {
  if (value == null) {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length === 0 ? null : trimmedValue;
}

function normalizeRequiredText(value: string | undefined, fallback: string): string {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return fallback;
  }

  return trimmedValue;
}

function validateRevision(value: number, label: string): void {
  if (!isNonNegativeInteger(value)) {
    throw new Error(`${label} must be a non-negative integer.`);
  }
}

function createSceneIndexEntry(
  headingBlockId: ScreenplayBlockId,
  ordinal: number,
): ScreenplaySceneIndexEntry {
  return {
    id: createScreenplaySceneId(headingBlockId),
    headingBlockId,
    firstBlockId: headingBlockId,
    lastBlockId: headingBlockId,
    ordinal,
  };
}

export function createScreenplayEntityId<T extends "doc" | "project" | "blk" | "op">(
  prefix: T,
): ScreenplayEntityId<T> {
  return `${prefix}_${generateOpaqueIdSuffix()}` as ScreenplayEntityId<T>;
}

export function createScreenplaySceneId(headingBlockId: ScreenplayBlockId): ScreenplaySceneId {
  return `scene_${headingBlockId}` as ScreenplaySceneId;
}

export function createScreenplayBlock(
  input: CreateScreenplayBlockInput = {},
): ScreenplayDocumentBlock {
  const createdAt = normalizeTimestamp(input.createdAt, new Date().toISOString());
  const updatedAt = normalizeTimestamp(input.updatedAt, createdAt);
  const revision = input.revision ?? 0;

  validateRevision(revision, "Block revision");

  return {
    id: input.id ?? createScreenplayEntityId("blk"),
    type: input.type ?? "action",
    text: input.text ?? "",
    revision,
    createdAt,
    updatedAt,
  };
}

export function createScreenplayProjectMetadata(
  input: CreateScreenplayProjectMetadataInput = {},
): ScreenplayProjectMetadata {
  const createdAt = normalizeTimestamp(input.createdAt, new Date().toISOString());
  const updatedAt = normalizeTimestamp(input.updatedAt, createdAt);
  const language = normalizeRequiredText(input.language, "en");

  return {
    id: input.id ?? createScreenplayEntityId("project"),
    title: normalizeRequiredText(input.title, "Untitled Screenplay"),
    author: normalizeNullableText(input.author),
    description: normalizeNullableText(input.description),
    language,
    status: input.status ?? "draft",
    createdAt,
    updatedAt,
  };
}

export function createScreenplaySyncState(
  input: CreateScreenplaySyncStateInput = {},
): ScreenplayDocumentSyncState {
  const pendingOperationIds = [...(input.pendingOperationIds ?? [])];

  if (new Set(pendingOperationIds).size !== pendingOperationIds.length) {
    throw new Error("pendingOperationIds must not contain duplicates.");
  }

  if (pendingOperationIds.some((operationId) => !hasIdPrefix(operationId, "op"))) {
    throw new Error('Every pending operation id must use the "op_" prefix.');
  }

  if (input.baseRevision != null) {
    validateRevision(input.baseRevision, "Sync baseRevision");
  }

  if (input.lastSyncedRevision != null) {
    validateRevision(input.lastSyncedRevision, "Sync lastSyncedRevision");
  }

  return {
    version: screenplaySyncSchemaVersion,
    status: input.status ?? "local-only",
    clientId: normalizeNullableText(input.clientId),
    baseRevision: input.baseRevision ?? null,
    lastSyncedRevision: input.lastSyncedRevision ?? null,
    lastSyncedAt: normalizeOptionalTimestamp(input.lastSyncedAt),
    pendingOperationIds,
  };
}

export function buildScreenplaySceneIndex(
  content: ScreenplayDocumentContent,
): ScreenplaySceneIndex {
  const scenes: Record<string, ScreenplaySceneIndexEntry> = {};
  const sceneOrder: ScreenplaySceneId[] = [];
  const unscenedBlockIds: ScreenplayBlockId[] = [];
  let activeSceneId: ScreenplaySceneId | null = null;

  for (const blockId of content.blockOrder) {
    const block = content.blocks[blockId];

    if (!block) {
      continue;
    }

    if (block.type === "scene-heading") {
      const sceneEntry = createSceneIndexEntry(block.id, sceneOrder.length + 1);

      scenes[sceneEntry.id] = sceneEntry;
      sceneOrder.push(sceneEntry.id);
      activeSceneId = sceneEntry.id;
      continue;
    }

    if (activeSceneId == null) {
      unscenedBlockIds.push(block.id);
      continue;
    }

    scenes[activeSceneId] = {
      ...scenes[activeSceneId],
      lastBlockId: block.id,
    };
  }

  return {
    version: screenplaySceneIndexVersion,
    sceneOrder,
    scenes,
    unscenedBlockIds,
  };
}

export function createScreenplayDocument(
  input: CreateScreenplayDocumentInput = {},
): ScreenplayDocument {
  const createdAt = normalizeTimestamp(input.createdAt, new Date().toISOString());
  const updatedAt = normalizeTimestamp(input.updatedAt, createdAt);
  const revision = input.revision ?? 0;

  validateRevision(revision, "Document revision");

  const blockInputs: readonly CreateScreenplayBlockInput[] = input.blocks?.length
    ? input.blocks
    : [defaultEmptyActionBlockInput];
  const blocks: Record<string, ScreenplayDocumentBlock> = {};
  const blockOrder: ScreenplayBlockId[] = [];

  for (const blockInput of blockInputs) {
    const block = createScreenplayBlock({
      ...blockInput,
      createdAt: blockInput.createdAt ?? createdAt,
      updatedAt: blockInput.updatedAt ?? updatedAt,
    });

    if (blocks[block.id]) {
      throw new Error(`Duplicate block id "${block.id}" while creating screenplay document.`);
    }

    blocks[block.id] = block;
    blockOrder.push(block.id);
  }

  const content: ScreenplayDocumentContent = {
    blockOrder,
    blocks,
  };

  return {
    schema: screenplayDocumentSchema,
    document: {
      id: input.id ?? createScreenplayEntityId("doc"),
      revision,
      createdAt,
      updatedAt,
      lastNormalizedAt: normalizeOptionalTimestamp(input.lastNormalizedAt) ?? updatedAt,
    },
    project: createScreenplayProjectMetadata({
      ...input.project,
      createdAt: input.project?.createdAt ?? createdAt,
      updatedAt: input.project?.updatedAt ?? updatedAt,
    }),
    content,
    indexes: {
      scenes: buildScreenplaySceneIndex(content),
    },
    sync: createScreenplaySyncState(input.sync),
    extensions: {},
  };
}

export function getOrderedScreenplayBlocks(
  document: ScreenplayDocument,
): ScreenplayDocumentBlock[] {
  return document.content.blockOrder
    .map((blockId) => document.content.blocks[blockId])
    .filter((block): block is ScreenplayDocumentBlock => block !== undefined);
}

export function rebuildScreenplayDocumentIndexes(
  document: ScreenplayDocument,
): ScreenplayDocument {
  return {
    ...document,
    indexes: {
      ...document.indexes,
      scenes: buildScreenplaySceneIndex(document.content),
    },
  };
}
