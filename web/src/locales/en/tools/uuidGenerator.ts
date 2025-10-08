import type { ToolCopy } from '../../../i18n/types';

const uuidGenerator: ToolCopy = {
  meta: {
    label: 'UUID Generator',
    pageTitle: 'UUID Generator | Create UUID v1, v4, and v5 Online - tools.dev66.net',
    description:
      'Produce time-based v1, random v4 or namespace v5 UUIDs with batch output and format options for identifiers and request IDs.',
    keywords: [
      'uuid generator',
      'uuid v4',
      'uuid v1',
      'uuid v5',
      'random uuid',
      'namespace uuid',
      'uuid tool',
      'developer tools',
    ],
    fallbackLabel: 'UUID generator',
    executionNote: 'UUIDs are generated entirely in the browser so you can work offline.',
  },
  page: {
    title: 'UUID Generator: Create v1 / v4 / v5 Identifiers',
    description:
      'Generate time-based v1, random v4 and namespace-based v5 UUIDs locally. Copy results in bulk for resource IDs, request tracing or configuration.',
    sections: {
      v4: {
        title: 'UUID v4 · Random',
        hint: 'Uses cryptographically secure randomness and fits most scenarios.',
        placeholder: 'Click generate to show the result',
        generate: 'Generate v4',
        copy: 'Copy',
        copied: 'Copied',
      },
      v1: {
        title: 'UUID v1 · Time-based',
        hint: 'Built from timestamps and node identifiers to keep ordering.',
        placeholder: 'Click generate to show the result',
        generate: 'Generate v1',
        copy: 'Copy',
        copied: 'Copied',
      },
      v5: {
        title: 'UUID v5 · Namespace hash',
        hint: 'Combine a namespace and name to get a stable deterministic UUID.',
        namespaceLabel: 'Namespace',
        namespaceOptions: {
          DNS: {
            label: 'DNS (domain)',
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
            label: 'X.500 name',
            description: '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
          },
          custom: {
            label: 'Custom namespace',
            description: 'Provide any valid UUID',
          },
        },
        customNamespaceLabel: 'Custom namespace UUID',
        customNamespacePlaceholder: 'e.g. 123e4567-e89b-12d3-a456-426614174000',
        nameLabel: 'Name',
        namePlaceholder: 'Enter the name (for example example.com)',
        buttons: {
          generate: 'Generate v5',
          pending: 'Generating…',
          copy: 'Copy',
          copied: 'Copied',
        },
        errors: {
          nameRequired: 'Name is required for UUID v5.',
          generic: 'Failed to generate UUID v5. Check the namespace and name.',
        },
        resultPlaceholder: 'Result will appear here',
      },
    },
    guidance: {
      title: 'Choose the Right UUID Version',
      description: 'Match the UUID variant to your ID strategy so values stay unique and useful.',
      bullets: [
        'v4 random UUIDs suit unpredictable identifiers such as orders or session tokens.',
        'v1 encodes timestamps and sorts chronologically but exposes node info—keep it internal.',
        'v5 hashes a namespace and name into a stable value, ideal for mapping domains or paths.',
      ],
      hint: 'All UUIDs are generated locally; nothing is sent over the network.',
    },
  },
};

export default uuidGenerator;
