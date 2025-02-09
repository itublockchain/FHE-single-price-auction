"use client";

import { Textarea } from "@/components/ui/textarea";
import {
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  toolbarPlugin,
  linkDialogPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  CreateLink,
  CodeToggle,
  MDXEditor,
  ListsToggle,
  tablePlugin,
  InsertTable,
  InsertThematicBreak,
  type MDXEditorMethods,
  type MDXEditorProps,
} from "@mdxeditor/editor";
import type { ForwardedRef } from "react";

// Only import this to the next file
export default function InitializedMDXEditor({
  editorRef,
  ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
  return (
    <MDXEditor
      className="markdown-editor dark dark-theme text-foreground"
      plugins={[
        // Example Plugin Usage
        headingsPlugin(),
        tablePlugin(),
        toolbarPlugin({
          toolbarClassName: "mdx-toolbar",
          toolbarContents: () => {
            return (
              <>
                {" "}
                <UndoRedo />
                <BoldItalicUnderlineToggles />
                <CreateLink />
                <CodeToggle />
                <ListsToggle />
                <InsertTable />
                <InsertThematicBreak />
              </>
            );
          },
        }),
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
