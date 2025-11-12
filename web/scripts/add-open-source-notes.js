import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.resolve(__dirname, '..', 'src', 'locales');

// Map tool file names to their IDs
const toolMap = {
  'base64Converter.ts': 'base64-converter',
  'blockPuzzleSolver.ts': 'block-puzzle-solver',
  'escapeDecoder.ts': 'escape-decoder',
  'hashGenerator.ts': 'hash-calculator',
  'hexConverter.ts': 'hex-converter',
  'jsonFormatter.ts': 'json-formatter',
  'jwtDecoder.ts': 'jwt-decoder',
  'markdownRenderer.ts': 'markdown-renderer',
  'qrGenerator.ts': 'qr-generator',
  'qrScanner.ts': 'qr-scanner',
  'randomNumberGenerator.ts': 'random-number-generator',
  'randomStringGenerator.ts': 'random-string-generator',
  'urlParser.ts': 'url-parser',
  'uuidGenerator.ts': 'uuid-generator',
  'zipTool.ts': 'zip-online', // Already done
};

const locales = ['en', 'zh-CN'];

async function updateToolFile(locale, fileName, toolId) {
  const filePath = path.join(localesDir, locale, 'tools', fileName);

  try {
    let content = await readFile(filePath, 'utf-8');

    // Skip if already has openSourceNote or already has the import
    if (content.includes('openSourceNote:') || content.includes('generateOpenSourceNote')) {
      console.log(`✓ ${locale}/${fileName} already has openSourceNote`);
      return;
    }

    // Add import if not present
    if (!content.includes("from '../../../i18n/openSourceNote'")) {
      // Find the last import statement
      const importRegex = /^import\s+.*from\s+['"].*['"];?\s*$/gm;
      const imports = content.match(importRegex);
      if (imports && imports.length > 0) {
        const lastImport = imports[imports.length - 1];
        const lastImportIndex = content.indexOf(lastImport);
        const afterLastImport = lastImportIndex + lastImport.length;

        content =
          content.slice(0, afterLastImport) +
          "\nimport { generateOpenSourceNote } from '../../../i18n/openSourceNote';" +
          content.slice(afterLastImport);
      }
    }

    // Add openSourceNote field after executionNote
    const executionNoteRegex = /(executionNote:\s*['"`].*?['"`],?)/s;
    if (executionNoteRegex.test(content)) {
      content = content.replace(
        executionNoteRegex,
        `$1\n    openSourceNote: generateOpenSourceNote('${toolId}', '${locale}'),`
      );

      await writeFile(filePath, content, 'utf-8');
      console.log(`✓ Updated ${locale}/${fileName}`);
    } else {
      console.log(`✗ Could not find executionNote in ${locale}/${fileName}`);
    }
  } catch (error) {
    console.error(`✗ Error processing ${locale}/${fileName}:`, error.message);
  }
}

async function main() {
  for (const locale of locales) {
    for (const [fileName, toolId] of Object.entries(toolMap)) {
      await updateToolFile(locale, fileName, toolId);
    }
  }
  console.log('\nDone!');
}

main().catch(console.error);
