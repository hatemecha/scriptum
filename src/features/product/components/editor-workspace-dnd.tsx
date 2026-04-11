"use client";

import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useId, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import styles from "./workspace-screen.module.css";

export const SCENES_PANEL_DRAG_ID = "scriptum-editor-scenes-panel";
export const SCRIPT_META_PANEL_DRAG_ID = "scriptum-editor-script-meta-panel";
export const EDITOR_DROP_LEFT = "scriptum-editor-drop-left";
export const EDITOR_DROP_RIGHT = "scriptum-editor-drop-right";

export type ScenePanelSide = "left" | "right";

type EditorWorkspaceDndProps = {
  children: ReactNode;
  onScenePanelSideChange: (side: ScenePanelSide) => void;
  scenePanelSide: ScenePanelSide;
};

export function EditorWorkspaceDnd({
  children,
  onScenePanelSideChange,
  scenePanelSide,
}: EditorWorkspaceDndProps) {
  /** Stable across SSR + hydration — avoids @dnd-kit's module-level id counter mismatch (DndDescribedBy-0 vs -1). */
  const dndContextId = useId();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 },
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) {
      return;
    }
    const dropLeft = over.id === EDITOR_DROP_LEFT;
    const scenesOnLeft = scenePanelSide === "left";

    if (active.id === SCENES_PANEL_DRAG_ID) {
      const scenesInLeftColumn = scenesOnLeft;
      if (dropLeft !== scenesInLeftColumn) {
        onScenePanelSideChange(scenesOnLeft ? "right" : "left");
      }
      return;
    }
    if (active.id === SCRIPT_META_PANEL_DRAG_ID) {
      const dataInLeftColumn = !scenesOnLeft;
      if (dropLeft !== dataInLeftColumn) {
        onScenePanelSideChange(scenesOnLeft ? "right" : "left");
      }
    }
  }

  return (
    <DndContext id={dndContextId} sensors={sensors} onDragEnd={handleDragEnd}>
      {children}
    </DndContext>
  );
}

type EditorSideSlotLayout = "collapse-end" | "collapse-start" | "fill";

type DroppableEditorSideProps = {
  children: ReactNode;
  className?: string;
  droppableId: typeof EDITOR_DROP_LEFT | typeof EDITOR_DROP_RIGHT;
  slotLayout: EditorSideSlotLayout;
};

function sideSlotLayoutClass(slotLayout: EditorSideSlotLayout): string {
  switch (slotLayout) {
    case "fill":
      return styles.editorWorkspaceSideSlotStretch;
    case "collapse-start":
      return styles.editorWorkspaceSideSlotAlignStart;
    case "collapse-end":
      return styles.editorWorkspaceSideSlotAlignEnd;
    default: {
      const _exhaustive: never = slotLayout;
      return _exhaustive;
    }
  }
}

export function DroppableEditorSide({
  children,
  className,
  droppableId,
  slotLayout,
}: DroppableEditorSideProps) {
  const { isOver, setNodeRef } = useDroppable({ id: droppableId });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        styles.editorWorkspaceSideSlot,
        isOver && styles.editorWorkspaceSideSlotOver,
        sideSlotLayoutClass(slotLayout),
        className,
      )}
    >
      {children}
    </div>
  );
}

type DraggableScenesPanelProps = {
  body: ReactNode;
  dragHandle: ReactNode;
  dragHandleLabel: string;
  headerTrailing: ReactNode;
};

export function DraggableScenesPanel({
  body,
  dragHandle,
  dragHandleLabel,
  headerTrailing,
}: DraggableScenesPanelProps) {
  const { attributes, isDragging, listeners, setNodeRef, transform } = useDraggable({
    id: SCENES_PANEL_DRAG_ID,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <aside
      ref={setNodeRef}
      style={style}
      className={cn(styles.editorSidebar, isDragging && styles.editorSidebarDragging)}
      aria-label="Sidebar de escenas"
    >
      <div className={styles.editorSidebarHeader}>
        <button
          type="button"
          className={styles.editorScenesDragHandle}
          aria-label={dragHandleLabel}
          {...listeners}
          {...attributes}
        >
          {dragHandle}
        </button>
        {headerTrailing}
      </div>
      {body}
    </aside>
  );
}

type DraggableScriptMetaPanelProps = {
  body: ReactNode;
  dragHandle: ReactNode;
  dragHandleLabel: string;
  headerTrailing: ReactNode;
};

export function DraggableScriptMetaPanel({
  body,
  dragHandle,
  dragHandleLabel,
  headerTrailing,
}: DraggableScriptMetaPanelProps) {
  const { attributes, isDragging, listeners, setNodeRef, transform } = useDraggable({
    id: SCRIPT_META_PANEL_DRAG_ID,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <aside
      ref={setNodeRef}
      style={style}
      className={cn(styles.editorMetaSidebar, isDragging && styles.editorSidebarDragging)}
      aria-label="Datos del guion"
    >
      <div className={styles.editorSidebarHeader}>
        <button
          type="button"
          className={styles.editorScenesDragHandle}
          aria-label={dragHandleLabel}
          {...listeners}
          {...attributes}
        >
          {dragHandle}
        </button>
        {headerTrailing}
      </div>
      {body}
    </aside>
  );
}
