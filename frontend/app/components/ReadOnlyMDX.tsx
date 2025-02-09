"use client";

import { Textarea } from "@/components/ui/textarea";
import {
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  linkDialogPlugin,
  MDXEditor,
  tablePlugin,
  type MDXEditorMethods,
  type MDXEditorProps,
} from "@mdxeditor/editor";
import type { ForwardedRef } from "react";

// Only import this to the next file
export default function ReadOnlyMDX({
  editorRef,
  ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
  return (
    <MDXEditor
      readOnly={true}
      className="markdown-editor dark dark-theme text-foreground"
      plugins={[
        // Example Plugin Usage
        headingsPlugin(),
        tablePlugin(),
        listsPlugin(),
        linkPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        linkDialogPlugin(),
      ]}
      {...props}
      ref={editorRef}
    />
  );
}
