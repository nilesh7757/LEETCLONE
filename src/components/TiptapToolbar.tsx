"use client";

import { type Editor } from '@tiptap/react';
import { Bold, Italic, Strikethrough, Code, List, ListOrdered, Heading1, Heading2, Quote, Minus, Underline, Link as LucideLink, Image } from 'lucide-react';

interface ToolbarProps {
  editor: Editor | null;
}

const Toolbar = ({ editor }: ToolbarProps) => {
  if (!editor) {
    return null;
  }

  const getButtonClass = (isActive: boolean) =>
    `p-2 rounded hover:bg-[var(--foreground)]/10 ${
      isActive ? 'bg-[var(--foreground)]/10 text-[var(--foreground)]' : 'text-[var(--foreground)]/60'
    }`;

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 rounded-t-lg border-t border-x border-[var(--card-border)] bg-[var(--card-bg)]">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={getButtonClass(editor.isActive('bold'))}
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={getButtonClass(editor.isActive('italic'))}
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={getButtonClass(editor.isActive('strike'))}
      >
        <Strikethrough className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        className={getButtonClass(editor.isActive('underline'))}
      >
        <Underline className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={getButtonClass(editor.isActive('code'))}
      >
        <Code className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => {
          if (editor.isActive('link')) {
            editor.chain().focus().unsetLink().run();
            return;
          }
          const previousUrl = editor.getAttributes('link').href;
          const url = window.prompt('URL', previousUrl);
          if (url === null) {
            return;
          }
          if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
          }
          editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        }}
        className={getButtonClass(editor.isActive('link'))}
      >
        <LucideLink className="w-4 h-4" />
      </button>

      {/* Image Upload Button */}
      <input
        type="file"
        accept="image/*"
        id="image-upload-input"
        style={{ display: 'none' }}
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (file) {
            const formData = new FormData();
            formData.append('image', file);

            try {
              const response = await fetch('/api/upload-image', {
                method: 'POST',
                body: formData,
              });

              if (response.ok) {
                const data = await response.json();
                editor.chain().focus().setImage({ src: data.url }).run();
              } else {
                console.error('Image upload failed:', response.statusText);
                alert('Image upload failed!');
              }
            } catch (error) {
              console.error('Error uploading image:', error);
              alert('Error uploading image!');
            }
          }
        }}
      />
      <button
        type="button"
        onClick={() => {
          document.getElementById('image-upload-input')?.click();
        }}
        className={getButtonClass(editor.isActive('image'))}
      >
        <Image className="w-4 h-4" />
      </button>
      
      <button
        type="button"
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={getButtonClass(editor.isActive('paragraph'))}
      >
        {/* Removed Paragraph icon, paragraph is often default or toggled via other block types */}
        <span className="w-4 h-4 flex items-center justify-center text-xs font-bold">P</span> 
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={getButtonClass(editor.isActive('heading', { level: 1 }))}
      >
        <Heading1 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={getButtonClass(editor.isActive('heading', { level: 2 }))}
      >
        <Heading2 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={getButtonClass(editor.isActive('bulletList'))}
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={getButtonClass(editor.isActive('orderedList'))}
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={getButtonClass(editor.isActive('blockquote'))}
      >
        <Quote className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className={getButtonClass(editor.isActive('horizontalRule'))}
      >
        <Minus className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toolbar;
