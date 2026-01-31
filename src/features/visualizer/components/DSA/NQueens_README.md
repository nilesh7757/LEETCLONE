# N-Queens Visualizer

## Overview
The `NQueensVisualizer` is an interactive tool designed to illustrate the **Backtracking (Depth-First Search)** algorithm used to solve the classical N-Queens puzzle. It demonstrates how the algorithm explores potential placements, detects conflicts, and backtracks to find a valid configuration where no two queens attack each other.

## Features
- **Adjustable Grid Size**: Test the algorithm on boards ranging from 4x4 up to 12x12.
- **Dynamic Animation Speed**: Control the visualization pace from fast-paced execution to slow, step-by-step observation.
- **Visual Feedback**:
  - **Crowns (Blue)**: Confirmed safe placements.
  - **Yellow Dots**: Cells currently being probed.
  - **Red X**: Detected constraint violations.
  - **Conflict Highlighting**: Clearly shows the row or diagonal path causing a collision.
- **Detailed Execution Logs**: Real-time trace of the algorithm's decision-making process.
- **Interactive Timeline**: Scrub through the entire history of the search to analyze specific transitions.

## Algorithm Logic

### Backtracking Strategy
1.  **Placement**: Attempt to place a queen in the first available row of the current column.
2.  **Validation**: Check if the new queen is under attack by any previously placed queens (same row or diagonals).
3.  **Recursion**: If valid, move to the next column.
4.  **Backtrack**: If no valid position is found in a column, the algorithm returns to the previous column, removes the queen, and tries the next available row.
5.  **Completion**: The process continues until all queens are placed or all possibilities are exhausted.

## Visual Indicators

| Indicator | Symbol | Meaning |
|-----------|--------|---------|
| **Safe Position** | 👑 | Queen placed successfully in a non-attacking cell. |
| **Conflict** | ❌ | Placement violates a row or diagonal constraint. |
| **Probing** | • | Algorithm is currently evaluating this cell. |
| **Under Attack** | . | Cells highlighted to show where existing queens can attack. |

## UI Guide
- **Visualize/Pause**: Start or stop the automated search simulation.
- **Grid Size**: Change the board dimensions (restarts simulation).
- **Animation Speed**: Adjust how quickly steps are processed.
- **Step Index**: Manually navigate through the algorithm's history.
- **Execution Logs**: View a historical list of all placements and conflicts.

## Technical Details
- **States Explored**: The total number of board configurations evaluated.
- **Complexity**: While the brute force approach is $O(N^N)$, backtracking prunes the search tree significantly, making it much more efficient for larger $N$.
