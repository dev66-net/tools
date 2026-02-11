import type { ToolCopy } from '../../../i18n/types';

const minesweeper: ToolCopy = {
  meta: {
    label: 'Minesweeper',
    fallbackLabel: 'Minesweeper',
    pageTitle: 'Minesweeper | Classic Mine Sweeping Game - tools.dev66.net',
    description:
      'Play the classic Minesweeper game online. Choose from Easy, Medium, Hard difficulty or create a custom board. Features timer and flag counter.',
    keywords: [
      'minesweeper',
      'mine sweeper',
      'minesweeper game',
      'classic game',
      'puzzle game',
      'online minesweeper',
      'browser game',
    ],
    executionNote: 'All game logic runs locally in your browser. No data is sent to any server.',
  },
  page: {
    title: 'Minesweeper',
    description:
      'The classic mine sweeping puzzle game. Uncover all safe cells without detonating any mines. Use flags to mark suspected mine locations.',
    difficulties: {
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
      custom: 'Custom',
    },
    custom: {
      rows: 'Rows (5-30)',
      cols: 'Columns (5-50)',
      mines: 'Mines',
    },
    game: {
      title: 'Game Board',
      description: 'Click to reveal a cell. Right-click to place a flag.',
      newGame: 'New Game',
      won: '🎉 Congratulations! You cleared all mines!',
      lost: '💥 Game Over! You hit a mine.',
    },
    instructions: {
      title: 'How to Play',
      description: 'Clear the board by revealing all safe cells.',
      steps: [
        'Left-click on a cell to reveal it.',
        'Right-click to place or remove a flag marking a suspected mine.',
        'Numbers indicate how many mines are adjacent to that cell.',
        'If you reveal a mine, the game is over.',
        'Reveal all safe cells to win the game.',
      ],
      tips: 'The first click is always safe - it will never be a mine. Use the numbers to deduce where mines must be located.',
    },
  },
};

export default minesweeper;
