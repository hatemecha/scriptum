"use client";

import { useEffect } from "react";

import { COMMAND_PRIORITY_CRITICAL, KEY_ENTER_COMMAND } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

type PersistOnEnterPluginProps = {
  enabled: boolean;
  onEnterCommit: () => void;
};

/**
 * Runs after other CRITICAL Enter handlers return false. Schedules cloud persist once the
 * screenplay plugin has finished handling the line break.
 */
export function PersistOnEnterPlugin({ enabled, onEnterCommit }: PersistOnEnterPluginProps): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    return editor.registerCommand(
      KEY_ENTER_COMMAND,
      () => {
        queueMicrotask(() => {
          onEnterCommit();
        });
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor, enabled, onEnterCommit]);

  return null;
}
