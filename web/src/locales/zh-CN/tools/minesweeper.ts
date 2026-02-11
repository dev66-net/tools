import type { ToolCopy } from '../../../i18n/types';

const minesweeper: ToolCopy = {
  meta: {
    label: '扫雷',
    fallbackLabel: '扫雷游戏',
    pageTitle: '扫雷 | 经典扫雷游戏 - tools.dev66.net',
    description:
      '在线玩经典扫雷游戏。选择简单、中等、困难难度或创建自定义地图。包含计时器和地雷计数功能。',
    keywords: [
      '扫雷',
      '扫雷游戏',
      '经典游戏',
      '益智游戏',
      '在线扫雷',
      '网页游戏',
      'minesweeper',
    ],
    executionNote: '所有游戏逻辑都在您的浏览器本地运行，不会向任何服务器发送数据。',
  },
  page: {
    title: '扫雷',
    description:
      '经典的扫雷益智游戏。揭开所有安全格子而不引爆任何地雷。使用旗帜标记怀疑有地雷的位置。',
    difficulties: {
      easy: '初级',
      medium: '中级',
      hard: '高级',
      custom: '自定义',
    },
    custom: {
      rows: '行数 (5-30)',
      cols: '列数 (5-50)',
      mines: '地雷数',
    },
    game: {
      title: '游戏棋盘',
      description: '左键点击揭开格子，右键点击放置旗帜。',
      newGame: '新游戏',
      won: '🎉 恭喜你！成功扫清所有地雷！',
      lost: '💥 游戏结束！你踩到地雷了。',
    },
    instructions: {
      title: '游戏说明',
      description: '通过揭开所有安全格子来清空棋盘。',
      steps: [
        '左键点击格子来揭开它。',
        '右键点击放置或移除标记疑似地雷的旗帜。',
        '数字表示该格子周围有多少颗地雷。',
        '如果你揭到地雷，游戏结束。',
        '揭开所有安全格子即可获胜。',
      ],
      tips: '首次点击总是安全的 - 永远不会是地雷。利用数字推理出地雷的位置。',
    },
  },
};

export default minesweeper;
