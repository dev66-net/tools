// 工具定义 - 独立维护，避免导入 web 目录中的依赖
export interface ToolDefinition {
  id: string;
  slug: string;
  executionMode: 'browser' | 'remote';
}

// 所有可用的工具（排除 rubiksCubeSolver）
export const mainSiteTools: ToolDefinition[] = [
  {
    id: 'qrGenerator',
    slug: 'qr-generator',
    executionMode: 'browser',
  },
  {
    id: 'qrScanner',
    slug: 'qr-scanner',
    executionMode: 'browser',
  },
  {
    id: 'urlParser',
    slug: 'url-parser',
    executionMode: 'browser',
  },
  {
    id: 'jsonFormatter',
    slug: 'json-formatter',
    executionMode: 'browser',
  },
  {
    id: 'markdownRenderer',
    slug: 'markdown-renderer',
    executionMode: 'browser',
  },
  {
    id: 'jwtDecoder',
    slug: 'jwt-decoder',
    executionMode: 'browser',
  },
  {
    id: 'base64Converter',
    slug: 'base64-converter',
    executionMode: 'browser',
  },
  {
    id: 'hexConverter',
    slug: 'hex-converter',
    executionMode: 'browser',
  },
  {
    id: 'escapeDecoder',
    slug: 'escape-decoder',
    executionMode: 'browser',
  },
  {
    id: 'hashGenerator',
    slug: 'hash-calculator',
    executionMode: 'browser',
  },
  {
    id: 'uuidGenerator',
    slug: 'uuid-generator',
    executionMode: 'browser',
  },
  {
    id: 'randomNumberGenerator',
    slug: 'random-number-generator',
    executionMode: 'browser',
  },
  {
    id: 'randomStringGenerator',
    slug: 'random-string-generator',
    executionMode: 'browser',
  },
  {
    id: 'blockPuzzleSolver',
    slug: 'block-puzzle-solver',
    executionMode: 'browser',
  },
  {
    id: 'zipTool',
    slug: 'zip-online',
    executionMode: 'browser',
  },
];

// 工具分类定义
export interface ToolCategory {
  id: string;
  name: {
    en: string;
    'zh-cn': string;
  };
  icon: string;
  description: {
    en: string;
    'zh-cn': string;
  };
  tools: string[];
}

export const toolCategories: ToolCategory[] = [
  {
    id: 'development',
    name: {
      en: 'Development Tools',
      'zh-cn': '开发工具'
    },
    icon: '💻',
    description: {
      en: 'Essential tools for developers',
      'zh-cn': '开发者必备工具'
    },
    tools: ['jsonFormatter', 'jwtDecoder', 'base64Converter', 'hexConverter', 'urlParser']
  },
  {
    id: 'qr',
    name: {
      en: 'QR Code',
      'zh-cn': '二维码'
    },
    icon: '📱',
    description: {
      en: 'Generate and scan QR codes',
      'zh-cn': '生成和扫描二维码'
    },
    tools: ['qrGenerator', 'qrScanner']
  },
  {
    id: 'generators',
    name: {
      en: 'Generators',
      'zh-cn': '生成器'
    },
    icon: '🎲',
    description: {
      en: 'Generate various codes and values',
      'zh-cn': '生成各种代码和数值'
    },
    tools: ['hashGenerator', 'uuidGenerator', 'randomNumberGenerator', 'randomStringGenerator']
  },
  {
    id: 'utilities',
    name: {
      en: 'Utilities',
      'zh-cn': '实用工具'
    },
    icon: '🛠️',
    description: {
      en: 'Useful everyday tools',
      'zh-cn': '日常实用工具'
    },
    tools: ['markdownRenderer', 'escapeDecoder', 'blockPuzzleSolver', 'zipTool']
  }
];

// 工具信息扩展
export interface ToolInfo extends ToolDefinition {
  category: ToolCategory;
  icon: string;
  displayName: {
    en: string;
    'zh-cn': string;
  };
  description: {
    en: string;
    'zh-cn': string;
  };
}

// 工具信息映射
const toolInfoMap: Record<string, Partial<ToolInfo>> = {
  qrGenerator: {
    icon: '📤',
    displayName: {
      en: 'QR Generator',
      'zh-cn': '二维码生成器'
    },
    description: {
      en: 'Generate QR codes from text, URLs, and more',
      'zh-cn': '从文本、URL等生成二维码'
    }
  },
  qrScanner: {
    icon: '📥',
    displayName: {
      en: 'QR Scanner',
      'zh-cn': '二维码扫描器'
    },
    description: {
      en: 'Scan and decode QR codes from images',
      'zh-cn': '扫描并解码图像中的二维码'
    }
  },
  urlParser: {
    icon: '🔗',
    displayName: {
      en: 'URL Parser',
      'zh-cn': 'URL解析器'
    },
    description: {
      en: 'Parse and analyze URL components',
      'zh-cn': '解析和分析URL组件'
    }
  },
  jsonFormatter: {
    icon: '📝',
    displayName: {
      en: 'JSON Formatter',
      'zh-cn': 'JSON格式化'
    },
    description: {
      en: 'Format, validate and beautify JSON',
      'zh-cn': '格式化、验证和美化JSON'
    }
  },
  markdownRenderer: {
    icon: '📄',
    displayName: {
      en: 'Markdown Renderer',
      'zh-cn': 'Markdown渲染器'
    },
    description: {
      en: 'Preview and render Markdown text',
      'zh-cn': '预览和渲染Markdown文本'
    }
  },
  jwtDecoder: {
    icon: '🔐',
    displayName: {
      en: 'JWT Decoder',
      'zh-cn': 'JWT解码器'
    },
    description: {
      en: 'Decode and verify JWT tokens',
      'zh-cn': '解码和验证JWT令牌'
    }
  },
  base64Converter: {
    icon: '🔄',
    displayName: {
      en: 'Base64 Converter',
      'zh-cn': 'Base64转换器'
    },
    description: {
      en: 'Encode and decode Base64 strings',
      'zh-cn': '编码和解码Base64字符串'
    }
  },
  hexConverter: {
    icon: '🔢',
    displayName: {
      en: 'Hex Converter',
      'zh-cn': '十六进制转换器'
    },
    description: {
      en: 'Convert between hex and text',
      'zh-cn': '十六进制和文本互转'
    }
  },
  escapeDecoder: {
    icon: '🔤',
    displayName: {
      en: 'Escape Decoder',
      'zh-cn': '转义解码器'
    },
    description: {
      en: 'Decode HTML and URL escape sequences',
      'zh-cn': '解码HTML和URL转义序列'
    }
  },
  hashGenerator: {
    icon: '#️⃣',
    displayName: {
      en: 'Hash Calculator',
      'zh-cn': '哈希计算器'
    },
    description: {
      en: 'Generate MD5, SHA1, SHA256 hashes',
      'zh-cn': '生成MD5、SHA1、SHA256哈希'
    }
  },
  uuidGenerator: {
    icon: '🆔',
    displayName: {
      en: 'UUID Generator',
      'zh-cn': 'UUID生成器'
    },
    description: {
      en: 'Generate UUID v1, v4 identifiers',
      'zh-cn': '生成UUID v1、v4标识符'
    }
  },
  randomNumberGenerator: {
    icon: '🎯',
    displayName: {
      en: 'Random Number Generator',
      'zh-cn': '随机数生成器'
    },
    description: {
      en: 'Generate random numbers in range',
      'zh-cn': '生成指定范围的随机数'
    }
  },
  randomStringGenerator: {
    icon: '🔤',
    displayName: {
      en: 'Random String Generator',
      'zh-cn': '随机字符串生成器'
    },
    description: {
      en: 'Generate random strings with custom patterns',
      'zh-cn': '生成自定义模式的随机字符串'
    }
  },
  blockPuzzleSolver: {
    icon: '🧩',
    displayName: {
      en: 'Block Puzzle Solver',
      'zh-cn': '方块拼图求解器'
    },
    description: {
      en: 'Solve block sliding puzzles',
      'zh-cn': '解决滑块拼图游戏'
    }
  },
  zipTool: {
    icon: '📦',
    displayName: {
      en: 'ZIP Tool',
      'zh-cn': 'ZIP工具'
    },
    description: {
      en: 'Compress and extract ZIP files',
      'zh-cn': '压缩和提取ZIP文件'
    }
  }
};

// 获取扩展的工具信息
export function getToolInfo(toolId: string): ToolInfo | null {
  const tool = mainSiteTools.find(t => t.id === toolId);
  const info = toolInfoMap[toolId];
  const category = toolCategories.find(cat => cat.tools.includes(toolId));

  if (!tool || !info || !category) {
    return null;
  }

  return {
    ...tool,
    ...info,
    category,
    icon: info.icon || '🔧',
    displayName: info.displayName || { en: tool.id, 'zh-cn': tool.id },
    description: info.description || {
      en: 'A useful tool',
      'zh-cn': '一个有用的工具'
    }
  } as ToolInfo;
}

// 获取所有分类的工具
export function getToolsByCategory(categoryId: string): ToolInfo[] {
  const category = toolCategories.find(cat => cat.id === categoryId);
  if (!category) {
    return [];
  }

  return category.tools
    .map(toolId => getToolInfo(toolId))
    .filter(Boolean) as ToolInfo[];
}

// 获取所有工具信息
export function getAllToolsInfo(): ToolInfo[] {
  return mainSiteTools
    .map(tool => getToolInfo(tool.id))
    .filter(Boolean) as ToolInfo[];
}