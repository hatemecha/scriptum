import {
  getScreenplayBlockDefinition,
  type ScreenplayBlockBoundary,
  type ScreenplayBlockType,
} from "@/features/screenplay/blocks";

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

function isNonNegativeInteger(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

function hasIdPrefix<Prefix extends string>(
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

function getBlockBoundaryType(
  content: ScreenplayDocumentContent,
  blockIndex: number,
  direction: "previous" | "next",
): ScreenplayBlockBoundary {
  const adjacentIndex = direction === "previous" ? blockIndex - 1 : blockIndex + 1;

  if (adjacentIndex < 0) {
    return "document-start";
  }

  if (adjacentIndex >= content.blockOrder.length) {
    return "document-end";
  }

  const adjacentBlockId = content.blockOrder[adjacentIndex];
  const adjacentBlock = content.blocks[adjacentBlockId];

  return adjacentBlock?.type ?? "document-end";
}

function compareSceneIndexEntries(
  expected: ScreenplaySceneIndexEntry,
  actual: ScreenplaySceneIndexEntry,
): string[] {
  const errors: string[] = [];

  if (expected.headingBlockId !== actual.headingBlockId) {
    errors.push(
      `Scene "${expected.id}" points to heading "${actual.headingBlockId}" instead of "${expected.headingBlockId}".`,
    );
  }

  if (expected.firstBlockId !== actual.firstBlockId) {
    errors.push(
      `Scene "${expected.id}" starts at "${actual.firstBlockId}" instead of "${expected.firstBlockId}".`,
    );
  }

  if (expected.lastBlockId !== actual.lastBlockId) {
    errors.push(
      `Scene "${expected.id}" ends at "${actual.lastBlockId}" instead of "${expected.lastBlockId}".`,
    );
  }

  if (expected.ordinal !== actual.ordinal) {
    errors.push(
      `Scene "${expected.id}" ordinal is ${actual.ordinal} instead of ${expected.ordinal}.`,
    );
  }

  return errors;
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

export function getScreenplayDocumentValidationErrors(
  document: ScreenplayDocument,
  options: { mode?: ScreenplayDocumentValidationMode } = {},
): string[] {
  const mode = options.mode ?? "editor";
  const errors: string[] = [];
  const orderedBlockIds = document.content.blockOrder;
  const persistedBlocks = Object.values(document.content.blocks);
  const emptyBlockIds = orderedBlockIds.filter((blockId) => {
    const block = document.content.blocks[blockId];

    return block != null && block.text.trim().length === 0;
  });

  if (document.schema.kind !== screenplayDocumentKind) {
    errors.push(`Document schema kind must be "${screenplayDocumentKind}".`);
  }

  if (document.schema.version < document.schema.minimumReaderVersion) {
    errors.push("Document schema version cannot be lower than minimumReaderVersion.");
  }

  if (document.schema.sceneIndexVersion !== screenplaySceneIndexVersion) {
    errors.push(
      `Scene index version must be ${screenplaySceneIndexVersion} in V1 documents.`,
    );
  }

  if (document.schema.syncVersion !== screenplaySyncSchemaVersion) {
    errors.push(`Sync version must be ${screenplaySyncSchemaVersion} in V1 documents.`);
  }

  if (!hasIdPrefix(document.document.id, "doc")) {
    errors.push(`Document id "${document.document.id}" must use the "doc_" prefix.`);
  }

  if (!hasIdPrefix(document.project.id, "project")) {
    errors.push(`Project id "${document.project.id}" must use the "project_" prefix.`);
  }

  if (!isNonNegativeInteger(document.document.revision)) {
    errors.push("Document revision must be a non-negative integer.");
  }

  if (document.project.title.trim().length === 0) {
    errors.push("Project title cannot be empty.");
  }

  if (!screenplayProjectStatuses.includes(document.project.status)) {
    errors.push(`Unsupported project status "${document.project.status}".`);
  }

  if (!screenplayDocumentSyncStatuses.includes(document.sync.status)) {
    errors.push(`Unsupported sync status "${document.sync.status}".`);
  }

  if (
    document.sync.baseRevision != null &&
    document.sync.baseRevision > document.document.revision
  ) {
    errors.push("Sync baseRevision cannot be greater than document revision.");
  }

  if (
    document.sync.lastSyncedRevision != null &&
    document.sync.lastSyncedRevision > document.document.revision
  ) {
    errors.push("Sync lastSyncedRevision cannot be greater than document revision.");
  }

  if (orderedBlockIds.length === 0) {
    errors.push("Document blockOrder cannot be empty.");
  }

  if (new Set(orderedBlockIds).size !== orderedBlockIds.length) {
    errors.push("Document blockOrder cannot contain duplicate block ids.");
  }

  if (persistedBlocks.length !== orderedBlockIds.length) {
    errors.push("Document blocks map and blockOrder must contain the same number of blocks.");
  }

  for (const block of persistedBlocks) {
    if (!hasIdPrefix(block.id, "blk")) {
      errors.push(`Block id "${block.id}" must use the "blk_" prefix.`);
    }

    if (document.content.blocks[block.id]?.id !== block.id) {
      errors.push(`Block "${block.id}" must be stored under its own id key.`);
    }

    if (!orderedBlockIds.includes(block.id)) {
      errors.push(`Block "${block.id}" is missing from blockOrder.`);
    }

    if (!isNonNegativeInteger(block.revision)) {
      errors.push(`Block "${block.id}" revision must be a non-negative integer.`);
    }
  }

  for (const [index, blockId] of orderedBlockIds.entries()) {
    const block = document.content.blocks[blockId];

    if (!block) {
      errors.push(`blockOrder references unknown block id "${blockId}".`);
      continue;
    }

    const definition = getScreenplayBlockDefinition(block.type);
    const previousBoundary = getBlockBoundaryType(document.content, index, "previous");
    const nextBoundary = getBlockBoundaryType(document.content, index, "next");

    if (!definition.allowedPrevious.includes(previousBoundary)) {
      errors.push(
        `Block "${block.id}" of type "${block.type}" cannot follow "${previousBoundary}".`,
      );
    }

    if (!definition.allowedNext.includes(nextBoundary)) {
      errors.push(`Block "${block.id}" of type "${block.type}" cannot precede "${nextBoundary}".`);
    }
  }

  if (mode === "persisted") {
    const hasSingleEmptyActionFallback =
      orderedBlockIds.length === 1 &&
      document.content.blocks[orderedBlockIds[0]]?.type === "action" &&
      document.content.blocks[orderedBlockIds[0]]?.text.trim().length === 0;

    if (emptyBlockIds.length > 0 && !hasSingleEmptyActionFallback) {
      errors.push("Persisted documents cannot contain empty blocks outside the single empty Action fallback.");
    }
  }

  if (new Set(document.sync.pendingOperationIds).size !== document.sync.pendingOperationIds.length) {
    errors.push("Sync pendingOperationIds cannot contain duplicates.");
  }

  for (const operationId of document.sync.pendingOperationIds) {
    if (!hasIdPrefix(operationId, "op")) {
      errors.push(`Pending operation id "${operationId}" must use the "op_" prefix.`);
    }
  }

  const expectedSceneIndex = buildScreenplaySceneIndex(document.content);

  if (document.indexes.scenes.version !== screenplaySceneIndexVersion) {
    errors.push(`Scene index version must be ${screenplaySceneIndexVersion}.`);
  }

  if (
    document.indexes.scenes.sceneOrder.length !== expectedSceneIndex.sceneOrder.length ||
    document.indexes.scenes.sceneOrder.some(
      (sceneId, index) => expectedSceneIndex.sceneOrder[index] !== sceneId,
    )
  ) {
    errors.push("Scene index sceneOrder does not match the canonical block order.");
  }

  if (
    document.indexes.scenes.unscenedBlockIds.length !== expectedSceneIndex.unscenedBlockIds.length ||
    document.indexes.scenes.unscenedBlockIds.some(
      (blockId, index) => expectedSceneIndex.unscenedBlockIds[index] !== blockId,
    )
  ) {
    errors.push("Scene index unscenedBlockIds do not match the canonical block order.");
  }

  for (const sceneId of expectedSceneIndex.sceneOrder) {
    const expectedScene = expectedSceneIndex.scenes[sceneId];
    const actualScene = document.indexes.scenes.scenes[sceneId];

    if (!actualScene) {
      errors.push(`Scene index is missing scene "${sceneId}".`);
      continue;
    }

    errors.push(...compareSceneIndexEntries(expectedScene, actualScene));
  }

  for (const sceneId of Object.keys(document.indexes.scenes.scenes)) {
    if (!document.indexes.scenes.sceneOrder.includes(sceneId as ScreenplaySceneId)) {
      errors.push(`Scene "${sceneId}" exists in the index but not in sceneOrder.`);
    }
  }

  return errors;
}

export const screenplayDocumentReferenceSamples = [
  createScreenplayDocument({
    id: "doc_reference-sample" as ScreenplayDocumentId,
    createdAt: "2026-04-04T00:00:00.000Z",
    updatedAt: "2026-04-04T00:00:00.000Z",
    lastNormalizedAt: "2026-04-04T00:00:00.000Z",
    project: {
      id: "project_reference-sample" as ScreenplayProjectId,
      title: "Reference Screenplay",
      author: "SCRIPTUM",
      description: "Internal validation sample for the screenplay document model.",
      language: "en",
      status: "draft",
      createdAt: "2026-04-04T00:00:00.000Z",
      updatedAt: "2026-04-04T00:00:00.000Z",
    },
    blocks: [
      {
        id: "blk_sample-scene-1" as ScreenplayBlockId,
        type: "scene-heading",
        text: "INT. KITCHEN - NIGHT",
      },
      {
        id: "blk_sample-action-1" as ScreenplayBlockId,
        type: "action",
        text: "The kettle screams on the stove.",
      },
      {
        id: "blk_sample-character-1" as ScreenplayBlockId,
        type: "character",
        text: "MARTA",
      },
      {
        id: "blk_sample-parenthetical-1" as ScreenplayBlockId,
        type: "parenthetical",
        text: "(under her breath)",
      },
      {
        id: "blk_sample-dialogue-1" as ScreenplayBlockId,
        type: "dialogue",
        text: "We missed the call.",
      },
      {
        id: "blk_sample-transition-1" as ScreenplayBlockId,
        type: "transition",
        text: "CUT TO:",
      },
      {
        id: "blk_sample-scene-2" as ScreenplayBlockId,
        type: "scene-heading",
        text: "EXT. STREET - NIGHT",
      },
      {
        id: "blk_sample-action-2" as ScreenplayBlockId,
        type: "action",
        text: "Rain pushes everyone under the awnings.",
      },
    ],
    sync: {
      status: "local-only",
    },
  }),
  createScreenplayDocument({
    id: "doc_reference-leading-action" as ScreenplayDocumentId,
    createdAt: "2026-04-04T00:00:00.000Z",
    updatedAt: "2026-04-04T00:00:00.000Z",
    lastNormalizedAt: "2026-04-04T00:00:00.000Z",
    project: {
      id: "project_reference-leading-action" as ScreenplayProjectId,
      title: "Leading Action Sample",
      language: "en",
      status: "draft",
    },
    blocks: [
      {
        id: "blk_leading-action" as ScreenplayBlockId,
        type: "action",
        text: "Black before the first image.",
      },
      {
        id: "blk_leading-transition" as ScreenplayBlockId,
        type: "transition",
        text: "FADE IN:",
      },
      {
        id: "blk_first-scene" as ScreenplayBlockId,
        type: "scene-heading",
        text: "INT. STUDIO - MORNING",
      },
      {
        id: "blk_first-scene-action" as ScreenplayBlockId,
        type: "action",
        text: "A blank page waits in the typewriter.",
      },
    ],
  }),
] as const satisfies readonly ScreenplayDocument[];

export function getScreenplayDocumentModelValidationErrors(): string[] {
  const errors: string[] = [];

  for (const sample of screenplayDocumentReferenceSamples) {
    const sampleErrors = getScreenplayDocumentValidationErrors(sample, {
      mode: "persisted",
    });

    errors.push(...sampleErrors.map((error) => `[${sample.project.title}] ${error}`));
  }

  return errors;
}
