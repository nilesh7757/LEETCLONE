# Segment Tree Visualizer

## Overview
The `SegmentTreeVisualizer` is an interactive, "Manim-inspired" component designed to visualize the operations of a Segment Tree, a versatile data structure for range queries. It provides a polished, futuristic interface to demonstrate building, querying (Range Sum Query), and updating values.

## Features
- **Interactive Operations**:
  - **Build**: Constructs the Segment Tree from a user-provided array, showing the recursive allocation and merging of segments.
  - **Query (RSQ)**: Visualizes the range sum query process, highlighting the traversal path and the segments that contribute to the total sum.
  - **Update**: Demonstrates point updates, showing the navigation to the leaf node and the subsequent re-balancing (utility propagation) up the tree.
- **Dynamic Layout**: Uses a recursive layout algorithm to position nodes, ensuring a clear hierarchical structure.
- **Fit-to-Screen**: Automatically scales and centers the entire tree within the viewport, regardless of its size or depth.
- **Step-by-Step History**: Records every logical step (merge, scan, intersect, commit), allowing users to scrub through the execution timeline.
- **Visual Feedback**:
  - **Blue**: Active node being probed.
  - **Green**: Segment fully contained in the query range (contributing to sum).
  - **Red**: Node being updated or re-balanced.
  - **Opacity**: Nodes outside the visible tree structure are hidden.

## Component Structure

### Imports
- **React & Hooks**: `useState`, `useEffect`, `useRef`, `useCallback`, `useMemo` for state and lifecycle management.
- **Framer Motion**: `motion`, `AnimatePresence` for fluid animations.
- **Lucide React**: Icons for the UI.

### Key Types
- **`VisualNode`**: Represents a node in the visualization state, including its range `[start, end]` and status.
- **`HistoryStep`**: A snapshot of the visualization state, including logs and query results.

## Algorithms

### Layout (`getLayout`)
The visualizer uses a standard recursive tree layout:
1.  **Root Positioning**: Starts at `width / 2`.
2.  **Recursive Splitting**: Each node `i` splits into children `2*i` and `2*i+1`.
3.  **Horizontal Spacing**: The offset decreases at each level to accommodate the tree's width.

### Auto-Scaling
The component continuously calculates the bounding box of all *visible* nodes. It then applies a CSS `transform` (scale and translate) to the container to ensure the tree fits perfectly within the viewport with a consistent padding.

## Usage

```tsx
import SegmentTreeVisualizer from './SegmentTreeVisualizer';

export default function Page() {
  return (
    <div className="container mx-auto p-4">
      <SegmentTreeVisualizer speed={800} />
    </div>
  );
}
```

## Customization
- **Colors**: Defined in `MANIM_COLORS`.
- **Speed**: Adjustable via the `speed` prop.
- **Styles**: Built with Tailwind CSS.
