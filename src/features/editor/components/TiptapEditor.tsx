"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image'; // Import the Image extension
import { DrawingExtension } from './DrawingExtension';
import Toolbar from './TiptapToolbar'; // Will create this next
import { useState } from 'react';

interface TiptapEditorProps {
  description: string;
  onChange: (richText: string) => void;
  editable?: boolean;
}

const TiptapEditor = ({ description, onChange, editable = true }: TiptapEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: {
          HTMLAttributes: {
            class: 'rounded-md bg-[var(--foreground)]/5 border border-[var(--card-border)] p-4 font-mono text-sm text-[var(--foreground)] my-4',
          },
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Image.configure({
        inline: true,
        allowBase64: true, // Allow base64 images, useful for drag/drop or clipboard
      }),
      DrawingExtension,
    ],
    content: description,
    immediatelyRender: false, // Added to prevent SSR hydration mismatches
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none min-h-[150px] p-4 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] focus:border-[var(--accent-gradient-to)] focus:ring-1 focus:ring-[var(--accent-gradient-to)] outline-none [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-[var(--foreground)] [&_h1]:mb-6 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[var(--foreground)] [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-[var(--foreground)] [&_h3]:mt-6 [&_h3]:mb-3 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-400 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_pre]:bg-[var(--foreground)]/5 [&_pre]:p-4 [&_pre]:rounded-md [&_pre]:my-4 [&_pre]:border [&_pre]:border-[var(--card-border)] [&_code]:bg-[var(--foreground)]/10 [&_code]:px-1 [&_code]:rounded text-[var(--foreground)]',
      },
    },
    editable: editable,
  });

  return (
    <div className="flex flex-col">
      {editable && (
        <Toolbar 
          editor={editor} 
        />
      )}
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;
