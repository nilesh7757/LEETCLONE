# Trie (Prefix Tree) Visualizer

## Overview
The `TrieVisualizer` is an interactive, "Manim-inspired" component designed to visualize the operations of a Trie (Prefix Tree) data structure. It uses smooth animations and a futuristic aesthetic to demonstrate how words are stored and retrieved character by character.

## Features
- **Interactive Operations**:
  - **Insert**: Visualizes the process of storing a word, character by character, creating new nodes as needed.
  - **Search**: Demonstrates the traversal of the tree to find a word, highlighting successful paths or indicating missing characters.
- **Dynamic Layout**: Uses a recursive layout algorithm to position nodes, ensuring clear separation of branches.
- **Fit-to-Screen**: Automatically scales and centers the entire tree within the viewport, regardless of its size.
- **Step-by-Step History**: Records every logical step (allocation, match, traversal), allowing users to scrub through the execution timeline.
- **Visual Feedback**:
  - **Blue**: Active node being visited/compared.
  - **Green**: Successfully found word or inserted terminal node.
  - **Red**: Missing character (search failure).
  - **Green Dot**: Indicates the end of a valid word.

## Component Structure

### Imports
- **React & Hooks**: `useState`, `useEffect`, `useRef`, `useCallback`, `useMemo` for state and lifecycle management.
- **Framer Motion**: `motion`, `AnimatePresence` for fluid animations.
- **Lucide React**: Icons for the UI.

### Key Types
- **`TrieNode`**: The logical data structure class.
- **`VisualNode`**: A decoupled representation for rendering (`x`, `y`, `status`).
- **`HistoryStep`**: A snapshot of the visualization state.

## Algorithms

### Layout (`getLayout`)
The visualizer uses a recursive strategy similar to the BST visualizer but adapted for N-ary trees:
1.  **Root Positioning**: Starts at `width / 2`.
2.  **Child Spacing**: Children are spaced horizontally based on the available `offset`.
3.  **Recursive Offset**: The horizontal offset decreases at each level to accommodate the potentially exponential growth of the tree width.

### Auto-Scaling
The component calculates the bounding box of the entire tree at each step and applies a CSS `transform` (scale and translate) to the container. This ensures the tree is always fully visible and centered.

## Usage

```tsx
import TrieVisualizer from './TrieVisualizer';

export default function Page() {
  return (
    <div className="container mx-auto p-4">
      <TrieVisualizer speed={800} />
    </div>
  );
}
```

## Customization
- **Colors**: Defined in `MANIM_COLORS`.
- **Speed**: Adjustable via the `speed` prop.
- **Styles**: Built with Tailwind CSS.
