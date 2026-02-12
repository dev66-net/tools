import type { ToolCopy } from '../../../i18n/types';

const twentyFourSolver: ToolCopy = {
  meta: {
    label: '24点求解器',
    pageTitle: '24点求解器 | 找出所有解法 - tools.dev66.net',
    description: '输入4个数字（1-13），使用加减乘除找出所有等于24的表达式。支持文本输入和拨号盘输入两种模式。',
    keywords: [
      '24点游戏',
      '24点求解',
      '扑克牌24点',
      '数学谜题',
      '算术求解器',
      '24点计算器',
      '24点解法',
    ],
    fallbackLabel: '24点求解器',
    executionNote: '所有解法均通过预计算查表在本地完成，不会上传数据。',
  },
  page: {
    title: '24点求解器',
    description: '输入4个数字（1-13），使用加减乘除和括号找出所有等于24的表达式。',
    input: {
      modeLabel: '输入模式',
      textMode: '文本输入',
      dialMode: '拨号输入',
      numberLabel: '数字',
      numberPlaceholder: '输入1-13',
    },
    dial: {
      title: '拨号输入',
      description: '点击数字输入，输入4个数字后自动求解。',
      buttons: {
        clear: '清空',
        backspace: '删除',
      },
    },
    results: {
      title: '解法',
      noSolution: '这组数字无解',
      solutionCount: '找到 {count} 个解法',
      unsolvableHint: '这组数字无法通过基本运算得到24。',
    },
    instructions: {
      title: '游戏说明',
      description: '24点是一款经典算术谜题。使用全部4个数字各一次，配合加减乘除得到24。',
      bullets: [
        '输入4个1-13之间的数字（如扑克牌点数）。',
        '每个数字必须恰好使用一次。',
        '可以使用加减乘除和括号，顺序不限。',
        '求解器会找出所有等于24的有效表达式。',
      ],
    },
  },
};

export default twentyFourSolver;
