# 0/1 Knapsack Visualizer

## Overview
The `KnapsackVisualizer` is an interactive, "Manim-inspired" component designed to visualize the **Dynamic Programming (DP)** solution for the classic **0/1 Knapsack Problem**. It provides a futuristic and highly detailed interface to demonstrate how the DP table is constructed, showing the step-by-step decision-making process between including or excluding items to maximize value.

## Features
- **Interactive DP Table**:
  - Displays the `DP[item][weight]` grid step-by-step.
  - Animates cell updates with highlights (`Green` for optimal, `Red` for overflow/exclusion, `Blue` for current focus).
  - Clearly shows cell dependencies (where the values come from).
- **Decision Tracking**:
  - **Include Mode**: Shows the calculation when an item is added (`Value + DP[i-1][w-weight]`).
  - **Exclude Mode**: Shows the inheritance of the previous optimal value (`DP[i-1][w]`).
- **Detailed Item Profiling**:
  - Displays the currently processed item's name, weight, and value with custom icons (Gem, Crown, Phone, Laptop).
- **Logic Flow Visualization**:
  - Highlights the active line of pseudocode corresponding to the current step (Check Weight -> Overflow -> Decision).
- **Step-by-Step History**: Records every logical state change, allowing users to scrub through the entire algorithm execution via a timeline slider.
- **Visual Feedback**:
  - **Glassmorphism**: Uses a modern, translucent UI style.
  - **Smooth Animations**: Powered by `framer-motion` for fluid transitions.

## Component Structure

### Imports
- **React & Hooks**: `useState`, `useEffect`, `useRef` for state and lifecycle management.
- **Framer Motion**: `motion`, `AnimatePresence` for animations.
- **Lucide React**: Icons for UI elements and item representations.

### Key Types
- **`DPStep`**: Represents a snapshot of the visualization state, including the entire DP table, current indices, active decision, and logic flow line.
- **`Item`**: Defines the properties of items (Weight, Value, Name, Icon).

## Algorithm

### Logic
The visualizer pre-computes the entire DP process using the standard bottom-up approach:
1.  **Initialization**: Creates a `(N+1) x (W+1)` table.
2.  **Iteration**: Loops through each item and each capacity from 0 to `W`.
3.  **Decision**:
    *   If `item.weight > capacity`: **Exclude** (Copy value from row above).
    *   Else: **Max(Include, Exclude)**.
4.  **Recording**: At every comparison and assignment, a snapshot (`DPStep`) is pushed to the history stack.

### Visual Mapping
- **Row**: Represents items (0 to N).
- **Column**: Represents capacity (0 to W).
- **Cell Value**: The maximum value achievable with the given item subset and capacity.

## Usage

```tsx
import KnapsackVisualizer from './KnapsackVisualizer';

export default function Page() {
  return (
    <div className="container mx-auto p-4">
      <KnapsackVisualizer speed={800} />
    </div>
  );
}
```

## Customization
- **Items**: Defined in the `ITEMS` constant. Can be modified to change the scenario.
- **Capacity**: Defined in `CAPACITY`.
- **Colors**: Centralized in `MANIM_COLORS`.
- **Speed**: Adjustable via the `speed` prop.
