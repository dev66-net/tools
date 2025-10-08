import type { ToolCopy } from '../../i18n/types';

const blockPuzzleSolver: ToolCopy = {
  meta: {
    label: '方块解谜求解器',
    fallbackLabel: '方块解谜求解器',
    pageTitle: '方块解谜求解器 | tools.dev66.net',
    description: '在交互式 8×8 棋盘上预排方块，并使用内置求解器补全剩余空间。',
    keywords: ['方块解谜', '拼图求解', '填充', '游戏助手', 'solver'],
    executionNote: '所有运算均在浏览器本地完成，拼图数据不会上传。',
  },
  page: {
    title: '方块解谜求解器',
    description: '拖放方块、旋转方向，随时调用本地回溯求解器尝试填满 8×8 棋盘。',
    solver: {
      startSolver: '开始求解',
      applySolution: '应用最新方案',
      resetBoard: '重置棋盘',
      searchLabel: '搜索节点数',
    },
    instructions: {
      title: '使用步骤',
      description: '从库存中选择方块放到棋盘上，右键旋转方向，点击棋盘上的方块可以重新拾取。',
      steps: [
        '点击库存中的方块开始拖拽。',
        '将光标移动到棋盘上，半透明预览会显示对齐位置。',
        '当预览变为可放置状态时左键释放。',
        '在任意位置右键以旋转当前选中方块。',
        '点击“开始求解”触发反推算法填充剩余空间。',
      ],
      tips: [
        '空位越多，回溯搜索越耗时，可通过计数器评估进度。',
        '使用“重置棋盘”快速恢复默认库存与空白棋盘。',
      ],
    },
  },
};

export default blockPuzzleSolver;
