import {
  buildScreenplaySceneIndex,
  hasIdPrefix,
  isNonNegativeInteger,
  screenplayDocumentKind,
  screenplayDocumentSyncStatuses,
  screenplayProjectStatuses,
  screenplaySceneIndexVersion,
  screenplaySyncSchemaVersion,
  type ScreenplayDocument,
  type ScreenplayDocumentContent,
  type ScreenplayDocumentValidationMode,
  type ScreenplaySceneId,
  type ScreenplaySceneIndexEntry,
} from "@/features/screenplay/document-core";
import {
  getScreenplayBlockDefinition,
  type ScreenplayBlockBoundary,
} from "@/features/screenplay/blocks";
import { screenplayDocumentReferenceSamples } from "@/features/screenplay/document-reference-samples";

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
    errors.push(`Scene index version must be ${screenplaySceneIndexVersion} in V1 documents.`);
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
      errors.push(
        "Persisted documents cannot contain empty blocks outside the single empty Action fallback.",
      );
    }
  }

  if (
    new Set(document.sync.pendingOperationIds).size !== document.sync.pendingOperationIds.length
  ) {
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
    document.indexes.scenes.unscenedBlockIds.length !==
      expectedSceneIndex.unscenedBlockIds.length ||
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
