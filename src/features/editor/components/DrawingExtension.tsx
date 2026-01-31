import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import Whiteboard from './Whiteboard';
import { Trash2 } from 'lucide-react';

export const DrawingExtension = Node.create({
  name: 'drawing',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      shapes: {
        default: [],
      },
      image: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'drawing-block',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['drawing-block', mergeAttributes(HTMLAttributes, { 'data-image': HTMLAttributes.image })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(({ node, updateAttributes, deleteNode, editor }) => {
      return (
        <NodeViewWrapper className="drawing-block my-4 group relative">
          <Whiteboard
            initialShapes={node.attrs.shapes}
            readOnly={!editor.isEditable}
            onUpdate={(shapes, imageData) => {
              if (!editor.isEditable) return;
              // Wrap in setTimeout to avoid "flushSync was called from inside a lifecycle method"
              setTimeout(() => {
                updateAttributes({
                  shapes: shapes,
                  image: imageData,
                });
              }, 0);
            }}
          />
          {editor.isEditable && (
             <button
                onClick={() => deleteNode()}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-20"
                title="Remove Drawing"
             >
                <Trash2 className="w-4 h-4" />
             </button>
          )}
        </NodeViewWrapper>
      );
    });
  },
});
