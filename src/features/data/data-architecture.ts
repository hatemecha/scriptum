import {
  createScreenplayDocument,
  screenplayDocumentSchemaVersion,
  type CreateScreenplayBlockInput,
  type ScreenplayDocument,
  type ScreenplayDocumentId,
  type ScreenplayProjectId,
  type ScreenplayProjectStatus,
} from "@/features/screenplay/document-model";
import { hasIdPrefix, isNonNegativeInteger } from "@/features/screenplay/document-core";

export const dataArchitectureProfilePlans = ["free", "premium"] as const;
export const dataArchitectureSnapshotKinds = [
  "autosave",
  "manual-save",
  "system-migration",
  "restore",
] as const;

export type DataArchitectureProfilePlan = (typeof dataArchitectureProfilePlans)[number];
export type DataArchitectureSnapshotKind = (typeof dataArchitectureSnapshotKinds)[number];
export type DataArchitectureProfileId = string;
export type DataArchitectureSnapshotId = `snapshot_${string}`;

export interface DataArchitectureTimestamps {
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  deletedAt: string | null;
}

export interface DataArchitectureProfileRecord {
  id: DataArchitectureProfileId;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  plan: DataArchitectureProfilePlan;
  /** Product preferences stored as JSON (theme, locale, editor tips, etc.). */
  preferences: Readonly<Record<string, unknown>>;
  onboardingCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface DataArchitectureProjectRecord extends DataArchitectureTimestamps {
  id: ScreenplayProjectId;
  ownerProfileId: DataArchitectureProfileId;
  title: string;
  author: string | null;
  description: string | null;
  language: string;
  status: ScreenplayProjectStatus;
  currentSnapshotId: DataArchitectureSnapshotId | null;
  latestRevision: number;
  lastEditedAt: string;
}

export interface DataArchitectureSnapshotRecord {
  id: DataArchitectureSnapshotId;
  projectId: ScreenplayProjectId;
  ownerProfileId: DataArchitectureProfileId;
  documentId: ScreenplayDocumentId;
  revision: number;
  snapshotKind: DataArchitectureSnapshotKind;
  documentSchemaVersion: number;
  documentData: ScreenplayDocument;
  createdAt: string;
}

export interface DataArchitectureGraph {
  profiles: readonly DataArchitectureProfileRecord[];
  projects: readonly DataArchitectureProjectRecord[];
  documentSnapshots: readonly DataArchitectureSnapshotRecord[];
}

export interface CreateDataArchitectureReferenceGraphInput {
  ownerProfileId?: DataArchitectureProfileId;
  ownerEmail?: string | null;
  projectId?: ScreenplayProjectId;
  documentId?: ScreenplayDocumentId;
  blocks?: readonly CreateScreenplayBlockInput[];
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

  return trimmedValue && trimmedValue.length > 0 ? trimmedValue : fallback;
}

function createSnapshotId(suffix: string): DataArchitectureSnapshotId {
  return `snapshot_${suffix}` as DataArchitectureSnapshotId;
}

export function isValidDataArchitectureProfileId(profileId: string): boolean {
  return uuidPattern.test(profileId);
}

export function createDataArchitectureReferenceGraph(
  input: CreateDataArchitectureReferenceGraphInput = {},
): DataArchitectureGraph {
  const now = new Date("2026-04-04T00:00:00.000Z").toISOString();
  const ownerProfileId = input.ownerProfileId ?? "3f6b1be5-2de0-4b63-8c62-f4f4f4c7bc1d";

  if (!isValidDataArchitectureProfileId(ownerProfileId)) {
    throw new Error(`Profile id "${ownerProfileId}" must be a UUID.`);
  }

  const baseDocument = createScreenplayDocument({
    id: input.documentId,
    revision: 1,
    createdAt: now,
    updatedAt: "2026-04-04T00:20:00.000Z",
    project: {
      id: input.projectId,
      title: "Marta's Kettle",
      author: "Scriptum User",
      description: "Reference screenplay project.",
      language: "en",
      status: "draft",
      createdAt: now,
      updatedAt: "2026-04-04T00:20:00.000Z",
    },
    blocks: input.blocks ?? [
      {
        type: "scene-heading",
        text: "INT. KITCHEN - NIGHT",
      },
      {
        type: "action",
        text: "The kettle screams on the stove.",
      },
    ],
    sync: {
      status: "synced",
      baseRevision: 1,
      lastSyncedRevision: 1,
      lastSyncedAt: "2026-04-04T00:20:00.000Z",
    },
  });

  const activeDocument = createScreenplayDocument({
    id: baseDocument.document.id,
    revision: 2,
    createdAt: baseDocument.document.createdAt,
    updatedAt: "2026-04-04T00:45:00.000Z",
    project: {
      id: baseDocument.project.id,
      title: "Marta's Kettle",
      author: "Scriptum User",
      description: "Reference screenplay project.",
      language: "en",
      status: "draft",
      createdAt: baseDocument.project.createdAt,
      updatedAt: "2026-04-04T00:45:00.000Z",
    },
    blocks: [
      ...((input.blocks ?? [
        {
          type: "scene-heading",
          text: "INT. KITCHEN - NIGHT",
        },
        {
          type: "action",
          text: "The kettle screams on the stove.",
        },
      ]) as readonly CreateScreenplayBlockInput[]),
      {
        type: "character",
        text: "MARTA",
      },
      {
        type: "dialogue",
        text: "We missed the call.",
      },
    ],
    sync: {
      status: "synced",
      baseRevision: 2,
      lastSyncedRevision: 2,
      lastSyncedAt: "2026-04-04T00:45:00.000Z",
    },
  });

  const profiles: readonly DataArchitectureProfileRecord[] = [
    {
      id: ownerProfileId,
      email: normalizeNullableText(input.ownerEmail) ?? "writer@example.com",
      displayName: "Scriptum User",
      avatarUrl: null,
      plan: "free",
      preferences: { theme: "system", editorTipsEnabled: true },
      onboardingCompletedAt: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
  ];

  const documentSnapshots: readonly DataArchitectureSnapshotRecord[] = [
    {
      id: createSnapshotId("01hrz8j9g4m6c2s1a7n5p3q40"),
      projectId: baseDocument.project.id,
      ownerProfileId,
      documentId: baseDocument.document.id,
      revision: 1,
      snapshotKind: "manual-save",
      documentSchemaVersion: screenplayDocumentSchemaVersion,
      documentData: baseDocument,
      createdAt: "2026-04-04T00:20:00.000Z",
    },
    {
      id: createSnapshotId("01hrz8j9g4m6c2s1a7n5p3q41"),
      projectId: activeDocument.project.id,
      ownerProfileId,
      documentId: activeDocument.document.id,
      revision: 2,
      snapshotKind: "autosave",
      documentSchemaVersion: screenplayDocumentSchemaVersion,
      documentData: activeDocument,
      createdAt: "2026-04-04T00:45:00.000Z",
    },
  ];

  const projects: readonly DataArchitectureProjectRecord[] = [
    {
      id: activeDocument.project.id,
      ownerProfileId,
      title: normalizeRequiredText(activeDocument.project.title, "Untitled Screenplay"),
      author: normalizeNullableText(activeDocument.project.author),
      description: normalizeNullableText(activeDocument.project.description),
      language: normalizeRequiredText(activeDocument.project.language, "en"),
      status: activeDocument.project.status,
      currentSnapshotId: documentSnapshots[1].id,
      latestRevision: activeDocument.document.revision,
      lastEditedAt: activeDocument.document.updatedAt,
      createdAt: activeDocument.project.createdAt,
      updatedAt: activeDocument.project.updatedAt,
      archivedAt: null,
      deletedAt: null,
    },
  ];

  return {
    profiles,
    projects,
    documentSnapshots,
  };
}

export function getDataArchitectureValidationErrors(graph: DataArchitectureGraph): string[] {
  const errors: string[] = [];
  const profileIds = new Set<string>();
  const projectIds = new Set<string>();
  const snapshotIds = new Set<string>();
  const projectById = new Map(graph.projects.map((project) => [project.id, project]));

  for (const profile of graph.profiles) {
    if (profileIds.has(profile.id)) {
      errors.push(`Duplicate profile id "${profile.id}".`);
    }

    profileIds.add(profile.id);

    if (!isValidDataArchitectureProfileId(profile.id)) {
      errors.push(`Profile id "${profile.id}" must be a UUID.`);
    }

    if (!dataArchitectureProfilePlans.includes(profile.plan)) {
      errors.push(`Unsupported profile plan "${profile.plan}".`);
    }

    if (
      typeof profile.preferences !== "object" ||
      profile.preferences === null ||
      Array.isArray(profile.preferences)
    ) {
      errors.push(`Profile "${profile.id}" preferences must be a plain object.`);
    }

    if (normalizeRequiredText(profile.createdAt, "").length === 0) {
      errors.push(`Profile "${profile.id}" createdAt cannot be empty.`);
    }

    normalizeTimestamp(profile.createdAt, profile.createdAt);
    normalizeTimestamp(profile.updatedAt, profile.updatedAt);
    normalizeOptionalTimestamp(profile.deletedAt);
    normalizeOptionalTimestamp(profile.onboardingCompletedAt);
  }

  for (const project of graph.projects) {
    if (projectIds.has(project.id)) {
      errors.push(`Duplicate project id "${project.id}".`);
    }

    projectIds.add(project.id);

    if (!hasIdPrefix(project.id, "project")) {
      errors.push(`Project id "${project.id}" must use the "project_" prefix.`);
    }

    if (!profileIds.has(project.ownerProfileId)) {
      errors.push(
        `Project "${project.id}" references unknown owner profile "${project.ownerProfileId}".`,
      );
    }

    if (project.title.trim().length === 0) {
      errors.push(`Project "${project.id}" title cannot be empty.`);
    }

    if (!isNonNegativeInteger(project.latestRevision)) {
      errors.push(`Project "${project.id}" latestRevision must be a non-negative integer.`);
    }

    normalizeTimestamp(project.createdAt, project.createdAt);
    normalizeTimestamp(project.updatedAt, project.updatedAt);
    normalizeTimestamp(project.lastEditedAt, project.lastEditedAt);
    normalizeOptionalTimestamp(project.archivedAt);
    normalizeOptionalTimestamp(project.deletedAt);
  }

  for (const snapshot of graph.documentSnapshots) {
    if (snapshotIds.has(snapshot.id)) {
      errors.push(`Duplicate snapshot id "${snapshot.id}".`);
    }

    snapshotIds.add(snapshot.id);

    if (!hasIdPrefix(snapshot.id, "snapshot")) {
      errors.push(`Snapshot id "${snapshot.id}" must use the "snapshot_" prefix.`);
    }

    if (!projectIds.has(snapshot.projectId)) {
      errors.push(`Snapshot "${snapshot.id}" references unknown project "${snapshot.projectId}".`);
      continue;
    }

    if (!profileIds.has(snapshot.ownerProfileId)) {
      errors.push(
        `Snapshot "${snapshot.id}" references unknown owner profile "${snapshot.ownerProfileId}".`,
      );
    }

    if (!isNonNegativeInteger(snapshot.revision)) {
      errors.push(`Snapshot "${snapshot.id}" revision must be a non-negative integer.`);
    }

    if (!dataArchitectureSnapshotKinds.includes(snapshot.snapshotKind)) {
      errors.push(`Unsupported snapshot kind "${snapshot.snapshotKind}".`);
    }

    if (snapshot.documentSchemaVersion !== screenplayDocumentSchemaVersion) {
      errors.push(
        `Snapshot "${snapshot.id}" documentSchemaVersion must be ${screenplayDocumentSchemaVersion}.`,
      );
    }

    if (snapshot.documentId !== snapshot.documentData.document.id) {
      errors.push(`Snapshot "${snapshot.id}" documentId must match document_data.document.id.`);
    }

    if (snapshot.projectId !== snapshot.documentData.project.id) {
      errors.push(`Snapshot "${snapshot.id}" projectId must match document_data.project.id.`);
    }

    if (snapshot.revision !== snapshot.documentData.document.revision) {
      errors.push(`Snapshot "${snapshot.id}" revision must match document_data.document.revision.`);
    }

    if (snapshot.ownerProfileId !== projectById.get(snapshot.projectId)?.ownerProfileId) {
      errors.push(
        `Snapshot "${snapshot.id}" ownerProfileId must match its project's owner profile.`,
      );
    }

    normalizeTimestamp(snapshot.createdAt, snapshot.createdAt);
  }

  for (const project of graph.projects) {
    const projectSnapshots = graph.documentSnapshots
      .filter((snapshot) => snapshot.projectId === project.id)
      .sort((left, right) => left.revision - right.revision);

    if (projectSnapshots.length === 0) {
      errors.push(`Project "${project.id}" must have at least one document snapshot.`);
      continue;
    }

    const activeSnapshot = project.currentSnapshotId
      ? projectSnapshots.find((snapshot) => snapshot.id === project.currentSnapshotId)
      : null;

    if (project.currentSnapshotId == null) {
      errors.push(`Project "${project.id}" must define currentSnapshotId in persisted MVP data.`);
      continue;
    }

    if (!activeSnapshot) {
      errors.push(
        `Project "${project.id}" currentSnapshotId "${project.currentSnapshotId}" was not found.`,
      );
      continue;
    }

    const highestRevision = projectSnapshots[projectSnapshots.length - 1]?.revision ?? 0;

    if (project.latestRevision !== activeSnapshot.revision) {
      errors.push(
        `Project "${project.id}" latestRevision must match the active snapshot revision.`,
      );
    }

    if (activeSnapshot.revision !== highestRevision) {
      errors.push(
        `Project "${project.id}" active snapshot must be the highest persisted revision.`,
      );
    }

    if (project.title !== activeSnapshot.documentData.project.title) {
      errors.push(`Project "${project.id}" title must match the active snapshot project title.`);
    }
  }

  return errors;
}

export function getDataArchitectureModelValidationErrors(): string[] {
  return getDataArchitectureValidationErrors(createDataArchitectureReferenceGraph());
}
