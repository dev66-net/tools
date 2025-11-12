import { getToolSourceUrl } from '../config';

/**
 * Generate open source note with source code link
 * @param toolId - The tool identifier
 * @param locale - The locale code ('en' or 'zh-CN')
 * @returns Formatted open source note string
 */
export function generateOpenSourceNote(toolId: string, locale: 'en' | 'zh-CN'): string {
  const sourceUrl = getToolSourceUrl(toolId);

  if (!sourceUrl) {
    return '';
  }

  if (locale === 'zh-CN') {
    return `🔓 本工具完全开源且免费使用。查看<a href="${sourceUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--link-color, #3b82f6); text-decoration: underline;">源代码</a>以审计安全性。`;
  }

  return `🔓 This tool is fully open source and free to use. <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--link-color, #3b82f6); text-decoration: underline;">View source code</a> for security audit.`;
}
