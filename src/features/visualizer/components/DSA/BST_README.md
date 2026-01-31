# Binary Search Tree (BST) Visualizer

## Overview
The `BSTVisualizer` is a React component that provides an interactive, step-by-step visualization of standard Binary Search Tree operations. It is designed with a "Manim-inspired" aesthetic, focusing on clarity, smooth animations, and a professional look suitable for educational platforms.

## Features
- **Interactive Operations**: Supports Insertion, Search, and Deletion of nodes.
- **Step-by-Step History**: Records every logical step (comparison, traversal, linking) allowing users to scrub through the execution timeline.
- **Responsive Layout**: Uses a recursive algorithm to dynamically position nodes based on the container width.
- **Visual Feedback**:
  - **Blue**: Comparing/Visiting nodes.
  - **Green**: Found/Inserted nodes.
  - **Red**: Deleted/Discarded nodes.
  - **Gold**: Highlighted paths.
- **Log System**: Displays a detailed log of operations for each step (e.g., "50 > 30 -> Going Right").

## Component Structure

### Imports
- **React & Hooks**: `useState`, `useEffect`, `useRef` for state and lifecycle management.
- **Framer Motion**: `motion`, `AnimatePresence` for fluid animations of nodes and edges.
- **Lucide React**: Icons for UI elements.

### Key Types
- **`BSTNode`**: The logical data structure class.
- **`VisualNode`**: A decoupled representation for rendering, containing coordinates (`x`, `y`) and status colors.
- **`HistoryStep`**: A snapshot of the tree state, logs, and messages at a specific point in time.

## Algorithms

### Layout (`calculateLayout`)
The visualizer uses a deterministic recursive layout strategy:
1.  **Root Positioning**: The root starts at `width / 2` and a fixed top margin.
2.  **Recursive Spacing**: Child nodes are placed at `(x ± offset, y + vertical_gap)`.
3.  **Dynamic Offset**: The horizontal `offset` decreases by a factor (e.g., 0.55) at each depth to prevent overlap, with a minimum clamp.

### Deletion Logic
Deletion is visualized in two phases for clarity:
1.  **Search & Mark**: The node is located and highlighted.
2.  **Structural Update**: The actual BST deletion logic (handling 0, 1, or 2 children) is executed, and the tree is re-rendered in the new state. For the 2-children case, the Inorder Successor strategy is used.

## Usage

```tsx
import BSTVisualizer from './BSTVisualizer';

// Usage in a page
export default function Page() {
  return (
    <div className="container mx-auto p-4">
      <BSTVisualizer speed={800} />
    </div>
  );
}
```

## Customization
- **Colors**: Modified via the `MANIM_COLORS` constant.
- **Speed**: Default animation speed can be passed via the `speed` prop.
- **Styling**: Uses Tailwind CSS classes for structure and theming.
