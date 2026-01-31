"use client";

import { type Editor } from '@tiptap/react';
import { Bold, Italic, Strikethrough, Code, List, ListOrdered, Heading1, Heading2, Quote, Minus, Underline, Link as LucideLink, Image, PencilLine, Terminal, X, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ToolbarProps {
  editor: Editor | null;
}

const Toolbar = ({ editor }: ToolbarProps) => {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  if (!editor) {
    return null;
  }

  const openLinkModal = () => {
    const previousUrl = editor.getAttributes('link').href || '';
    setLinkUrl(previousUrl);
    setIsLinkModalOpen(true);
  };

  const saveLink = () => {
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    }
    setIsLinkModalOpen(false);
    setLinkUrl('');
  };

  const getButtonClass = (isActive: boolean) =>
    `p-2 rounded hover:bg-[var(--foreground)]/10 ${
      isActive ? 'bg-[var(--foreground)]/10 text-[var(--foreground)]' : 'text-[var(--foreground)]/60'
    }`;

  return (
    <div className="flex flex-wrap items-center gap-1 p-3 rounded-t-[2rem] bg-[var(--card)]/30 backdrop-blur-xl mb-px">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={getButtonClass(editor.isActive('bold'))}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={getButtonClass(editor.isActive('italic'))}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        className={getButtonClass(editor.isActive('underline'))}
        title="Underline"
      >
        <Underline className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={getButtonClass(editor.isActive('strike'))}
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </button>
      
      <div className="w-[1px] h-4 bg-white/10 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={getButtonClass(editor.isActive('code'))}
        title="Inline Code"
      >
        <Code className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        disabled={!editor.can().chain().focus().toggleCodeBlock().run()}
        className={getButtonClass(editor.isActive('codeBlock'))}
        title="Code Block"
      >
        <Terminal className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={openLinkModal}
        className={getButtonClass(editor.isActive('link'))}
        title="Insert Link"
      >
        <LucideLink className="w-4 h-4" />
      </button>

      {/* Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
           <div 
             className="bg-[var(--card)]/80 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-white/5"
             onKeyDown={(e) => {
               if (e.key === 'Enter') { e.preventDefault(); saveLink(); }
               if (e.key === 'Escape') setIsLinkModalOpen(false);
             }}
           >
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                 <h3 className="text-sm font-black uppercase tracking-widest text-[var(--foreground)]">Edit Link</h3>
                 <button onClick={() => setIsLinkModalOpen(false)} className="text-[var(--foreground)]/40 hover:text-[var(--foreground)] transition-colors">
                    <X className="w-4 h-4" />
                 </button>
              </div>
              <div className="p-6 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted-foreground)]">URL Endpoint</label>
                    <input 
                       autoFocus
                       type="text"
                       value={linkUrl}
                       onChange={(e) => setLinkUrl(e.target.value)}
                       placeholder="https://neural-link.io"
                       className="w-full px-4 py-3 bg-[var(--background)]/50 rounded-xl text-sm text-[var(--foreground)] outline-none focus:ring-1 focus:ring-[var(--viz-cyan)]/30 transition-all"
                    />
                 </div>
                 <div className="flex items-center gap-3 pt-2">
                    <button 
                       onClick={() => { setLinkUrl(''); saveLink(); }}
                       className="flex-1 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all"
                    >
                       Remove
                    </button>
                    <button 
                       onClick={saveLink}
                       className="flex-1 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-black bg-[var(--viz-cyan)] hover:opacity-90 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[var(--viz-cyan)]/20"
                    >
                       <Check className="w-3.5 h-3.5" strokeWidth={3} /> Save Link
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

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
                toast.error('Image upload failed!');
              }
            } catch (error) {
              console.error('Error uploading image:', error);
              toast.error('Error uploading image!');
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
        onClick={() => editor.chain().focus().insertContent({ type: 'drawing' }).run()}
        className={getButtonClass(editor.isActive('drawing'))}
        title="Insert Drawing Pad"
      >
        <PencilLine className="w-4 h-4" />
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
