import type { ToolCopy } from '../../i18n/types';

const blockPuzzleSolver: ToolCopy = {
  meta: {
    label: 'Block Puzzle Solver',
    fallbackLabel: 'Block Puzzle Solver',
    pageTitle: 'Block Puzzle Solver | tools.dev66.net',
    description:
      'Interactive helper for the classic 8x8 block puzzle. Arrange tiles manually or let the built-in solver search for a fit.',
    keywords: ['block puzzle', 'puzzle solver', 'tiling', 'game helper', 'solver'],
    executionNote: 'All solving happens in your browser. No puzzle data ever leaves the page.',
  },
  page: {
    title: 'Block Puzzle Solver',
    description:
      'Plan placements for the 8×8 block puzzle, try different orientations, and run a local solver to fill the remaining space.',
    solver: {
      startSolver: 'Start solver',
      applySolution: 'Apply latest solution',
      resetBoard: 'Reset board',
      searchLabel: 'Search explored',
    },
    instructions: {
      title: 'How to use',
      description: 'Pick any block, place it on the board, and right-click to rotate. Remove a block by clicking it on the board.',
      steps: [
        'Click a block in the inventory to begin dragging it.',
        'Move the cursor over the board. A ghost preview shows the snap position.',
        'Left-click to drop the block when the placement turns valid.',
        'Right-click anywhere to rotate the currently selected block.',
        'Press “Start solver” to search for a way to fill the remaining cells.',
      ],
      tips: [
        'The solver can take time when many cells are empty. Watch the search counter to estimate progress.',
        'Use “Reset board” to restore the default inventory and clear the grid.',
      ],
    },
  },
};

export default blockPuzzleSolver;
