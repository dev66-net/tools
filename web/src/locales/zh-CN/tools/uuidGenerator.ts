import type { ToolCopy } from '../../../i18n/types';

const uuidGenerator: ToolCopy = {
  meta: {
    label: 'UUID 生成器',
    pageTitle: 'UUID 生成器｜在线创建 v1/v4/v5 UUID - tools.dev66.net',
    description:
      'UUID 生成器可生成时间序列 v1、随机 v4 及基于命名空间的 v5 UUID，支持批量输出与格式选项，适合标识资源与请求。',
    keywords: [
      'UUID 生成',
      'UUID v4',
      'UUID v1',
      'UUID v5',
      '随机 UUID',
      '命名空间 UUID',
      'UUID 工具',
      '唯一标识符',
    ],
    fallbackLabel: 'UUID 工具',
    executionNote: 'UUID 算法在浏览器端实现，可离线批量生成标识符。',
  },
  page: {
    title: 'UUID 生成器：在线创建 v1/v4/v5',
    description:
      '即时生成时间序列 v1、随机 v4 与基于命名空间的 v5 UUID，支持自定义命名空间与批量复制，适合标识资源或请求链路。',
    sections: {
      v4: {
        title: 'UUID v4 · 随机',
        hint: '使用加密随机数构造，适用于大多数场景。',
        placeholder: '点击生成后显示结果',
        generate: '生成 v4',
        copy: '复制',
        copied: '已复制',
      },
      v1: {
        title: 'UUID v1 · 时间序列',
        hint: '基于时间戳与节点信息生成，保持有序。',
        placeholder: '点击生成后显示结果',
        generate: '生成 v1',
        copy: '复制',
        copied: '已复制',
      },
      v5: {
        title: 'UUID v5 · 名称散列',
        hint: '结合命名空间与名称生成稳定的 UUID，适合可复现的标识。',
        namespaceLabel: '命名空间',
        namespaceOptions: {
          DNS: {
            label: 'DNS（域名）',
            description: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
          },
          URL: {
            label: 'URL',
            description: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
          },
          OID: {
            label: 'OID',
            description: '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
          },
          X500: {
            label: 'X.500 名称',
            description: '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
          },
          custom: {
            label: '自定义命名空间',
            description: '输入其他有效 UUID',
          },
        },
        customNamespaceLabel: '自定义命名空间 UUID',
        customNamespacePlaceholder: '例如：123e4567-e89b-12d3-a456-426614174000',
        nameLabel: '名称',
        namePlaceholder: '输入名称（如域名 example.com）',
        buttons: {
          generate: '生成 v5',
          pending: '生成中…',
          copy: '复制',
          copied: '已复制',
        },
        errors: {
          nameRequired: '请填写名称，UUID v5 需要名称作为输入。',
          generic: 'v5 生成失败，请检查命名空间与名称。',
        },
        resultPlaceholder: '生成结果将显示在此处',
      },
    },
    guidance: {
      title: '选择合适的 UUID 版本',
      description: '结合业务需求选择合适的算法，确保 ID 稳定且不冲突。',
      bullets: [
        'v4 随机 UUID 适合生成不可预测的标识符，例如订单号、会话 ID。',
        'v1 基于时间戳，便于按时间排序，但包含节点信息，更适合内部系统使用。',
        'v5 将命名空间与名称哈希成固定值，适用于根据域名、路径生成稳定 ID。',
      ],
      hint: '生成过程完全在本地完成，可放心复制到代码、数据库或配置文件中。',
    },
  },
};

export default uuidGenerator;
