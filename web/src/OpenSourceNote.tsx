import { useMemo } from 'react';
import { useI18n } from './i18n/index';
import type { Translations } from './i18n/types';

type OpenSourceNoteProps = {
  toolId: string;
  translations?: Translations;
};

export default function OpenSourceNote({ toolId, translations: propsTranslations }: OpenSourceNoteProps) {
  const { translations: hookTranslations } = useI18n();
  const translations = propsTranslations || hookTranslations;

  const openSourceNote = useMemo(() => {
    const toolData = translations.tools[toolId];
    if (!toolData?.meta?.openSourceNote) {
      return null;
    }
    return toolData.meta.openSourceNote;
  }, [translations, toolId]);

  if (!openSourceNote) {
    return null;
  }

  return (
    <section className="tool-meta tool-meta--open-source" role="note" aria-label="Open source security notice">
      <div
        className="open-source-note-content"
        dangerouslySetInnerHTML={{ __html: openSourceNote }}
      />
    </section>
  );
}