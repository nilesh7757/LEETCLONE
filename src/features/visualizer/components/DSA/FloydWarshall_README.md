# Floyd-Warshall Visualizer

## Overview
The `FloydWarshallVisualizer` is an interactive, "Manim-inspired" component designed to visualize the **Floyd-Warshall Algorithm** for finding all-pairs shortest paths in a graph. It uses a futuristic, tensor-based aesthetic to demonstrate how the algorithm iteratively improves path estimates by allowing more intermediate nodes.

## Features
- **Interactive Distance Matrix**:
  - Displays the $N 	imes N$ adjacency matrix.
  - Updates dynamically as paths are relaxed.
  - Highlights the "triangular" relationship between $D[i][j]$, $D[i][k]$, and $D[k][j]$.
- **Graph Topology View**:
  - Shows the graph structure with nodes and edges.
  - Highlights the current path being evaluated:
    - **Blue**: The path via the intermediate node $k$ ($i \to k \to j$).
    - **Red**: The current direct path ($i \to j$).
- **Logic Flow**:
  - Displays the core relaxation condition: `if (D[i][k] + D[k][j] < D[i][j])`.
  - Highlights the exact values being compared.
- **Step-by-Step History**: Allows users to scrub through the algorithm's execution, visualizing every comparison and update.
- **Visual Feedback**:
  - **Glassmorphism**: Modern UI with translucent layers.
  - **Smooth Animations**: Powered by `framer-motion` for fluid state transitions.

## Component Structure

### Imports
- **React & Hooks**: `useState`, `useEffect`, `useRef`, `useMemo` for state management.
- **Framer Motion**: `motion`, `AnimatePresence` for animations.
- **Lucide React**: Icons for UI elements.

### Key Types
- **`FWStep`**: Represents a snapshot of the algorithm state (Matrix, Indices $i, j, k$, Message, Decision).
- **`Matrix`**: A 2D array representing the graph's adjacency/distance matrix.

## Algorithm

### Logic
The visualizer pre-computes the entire Floyd-Warshall process:
1.  **Initialization**: Set up the distance matrix based on edge weights ($D[i][i] = 0$, $D[i][j] = \infty$ if no edge).
2.  **Phase Loop ($k$)**: Iterate through every node $k$ to use as an intermediate vertex.
3.  **Path Loop ($i, j$)**: Check every pair $(i, j)$ to see if going through $k$ is shorter.
4.  **Relaxation**: If $D[i][k] + D[k][j] < D[i][j]$, update $D[i][j]$.

### Visual Mapping
- **Row ($i$)**: Source node.
- **Column ($j$)**: Destination node.
- **Value**: Current shortest distance.
- **Highlights**:
  - **Gold**: Intermediate node/row/column ($k$).
  - **Blue**: Component paths ($i \to k$ and $k \to j$).
  - **Red**: Target path ($i \to j$).

## Usage

```tsx
import FloydWarshallVisualizer from './FloydWarshallVisualizer';

export default function Page() {
  return (
    <div className="container mx-auto p-4">
      <FloydWarshallVisualizer speed={800} />
    </div>
  );
}
```

## Customization
- **Graph Size**: The user can regenerate random graphs with different numbers of nodes.
- **Colors**: Defined in `MANIM_COLORS`.
- **Speed**: Adjustable via the `speed` prop.

```