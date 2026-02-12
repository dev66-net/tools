import type { ToolCopy } from '../../../i18n/types';

const twentyFourSolver: ToolCopy = {
  meta: {
    label: '24 Game Solver',
    pageTitle: '24 Game Solver | Find All Solutions - tools.dev66.net',
    description: 'Enter 4 numbers (1-13) and find all ways to make 24 using +, -, *, /. Supports text and dial pad input modes.',
    keywords: [
      '24 game',
      '24 point game',
      '24 solver',
      'card game solver',
      'math puzzle',
      'arithmetic solver',
    ],
    fallbackLabel: '24 Game Solver',
    executionNote: 'All solutions are computed locally using a pre-computed lookup table.',
  },
  page: {
    title: '24 Game Solver',
    description: 'Enter four numbers (1-13) and discover all expressions that equal 24 using +, -, *, / and parentheses.',
    input: {
      modeLabel: 'Input Mode',
      textMode: 'Text Input',
      dialMode: 'Dial Pad',
      numberLabel: 'Number',
      numberPlaceholder: 'Enter 1-13',
    },
    dial: {
      title: 'Dial Pad Input',
      description: 'Click numbers to input. Automatically solves when 4 numbers are entered.',
      buttons: {
        clear: 'Clear',
        backspace: 'Backspace',
      },
    },
    results: {
      title: 'Solutions',
      noSolution: 'No solution exists for these numbers.',
      solutionCount: '{count} solution(s) found',
      unsolvableHint: 'This combination cannot make 24 with basic operations.',
    },
    instructions: {
      title: 'How to Play',
      description: 'The 24 game is a classic arithmetic puzzle. Use all four numbers exactly once with +, -, *, / to reach 24.',
      bullets: [
        'Enter four numbers between 1 and 13 (like playing cards).',
        'Each number must be used exactly once.',
        'You can use +, -, *, / and parentheses in any order.',
        'The solver finds all valid expressions that equal 24.',
      ],
    },
  },
};

export default twentyFourSolver;
