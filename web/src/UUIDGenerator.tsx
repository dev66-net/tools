import { ChangeEvent, useMemo, useState } from 'react';
import { useI18n } from './i18n/index';
import { UUID_NAMESPACES, generateUuidV1, generateUuidV4, generateUuidV5 } from './utils/uuid.ts';

const namespaceOptions = ['DNS', 'URL', 'OID', 'X500', 'custom'] as const;

type NamespaceOption = (typeof namespaceOptions)[number];

type CopyTarget = 'v1' | 'v4' | 'v5';

type V5State = 'idle' | 'pending' | 'error' | 'success';

type UUIDGeneratorCopy = {
  title: string;
  description: string;
  sections: {
    v4: {
      title: string;
      hint: string;
      placeholder: string;
      generate: string;
      copy: string;
      copied: string;
    };
    v1: {
      title: string;
      hint: string;
      placeholder: string;
      generate: string;
      copy: string;
      copied: string;
    };
    v5: {
      title: string;
      hint: string;
      namespaceLabel: string;
      namespaceOptions: Record<Exclude<NamespaceOption, 'custom'>, { label: string; description: string }> & {
        custom: { label: string; description: string };
      };
      customNamespaceLabel: string;
      customNamespacePlaceholder: string;
      nameLabel: string;
      namePlaceholder: string;
      buttons: {
        generate: string;
        pending: string;
        copy: string;
        copied: string;
      };
      errors: {
        nameRequired: string;
        generic: string;
      };
      resultPlaceholder: string;
    };
  };
  guidance: {
    title: string;
    description: string;
    bullets: string[];
    hint: string;
  };
};

async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.warn('Clipboard write failed, fallback to execCommand', error);
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch (fallbackError) {
    console.error('Fallback clipboard write failed', fallbackError);
    return false;
  }
}

export default function UUIDGenerator() {
  const { translations } = useI18n();
  const copy = translations.tools.uuidGenerator.page as UUIDGeneratorCopy;
  const [v1Uuid, setV1Uuid] = useState('');
  const [v4Uuid, setV4Uuid] = useState('');
  const [v5Uuid, setV5Uuid] = useState('');
  const [copied, setCopied] = useState<CopyTarget | ''>('');
  const [namespace, setNamespace] = useState<NamespaceOption>('DNS');
  const [customNamespace, setCustomNamespace] = useState('');
  const [name, setName] = useState('');
  const [v5Status, setV5Status] = useState<V5State>('idle');
  const [v5Error, setV5Error] = useState('');

  const namespaceValue = useMemo(() => {
    if (namespace === 'custom') {
      return customNamespace.trim();
    }
    return UUID_NAMESPACES[namespace];
  }, [namespace, customNamespace]);

  const selectedNamespaceLabel = useMemo(
    () => copy.sections.v5.namespaceOptions[namespace].description,
    [copy.sections.v5.namespaceOptions, namespace]
  );

  const handleCopy = async (value: string, target: CopyTarget) => {
    const success = await copyToClipboard(value);
    if (success) {
      setCopied(target);
      window.setTimeout(() => setCopied(''), 1500);
    }
  };

  const handleGenerateV1 = () => {
    setV1Uuid(generateUuidV1());
    setCopied('');
  };

  const handleGenerateV4 = () => {
    setV4Uuid(generateUuidV4());
    setCopied('');
  };

  const handleGenerateV5 = async () => {
    setV5Status('pending');
    setV5Error('');
    setCopied('');
    const trimmedName = name.trim();
    if (!trimmedName) {
      setV5Status('error');
      setV5Error(copy.sections.v5.errors.nameRequired);
      return;
    }
    try {
      const uuid = await generateUuidV5(namespaceValue, trimmedName);
      setV5Uuid(uuid);
      setV5Status('success');
    } catch (error) {
      setV5Status('error');
      setV5Error((error as Error).message || copy.sections.v5.errors.generic);
    }
  };

  const isCustomNamespace = namespace === 'custom';
  const namespaceInvalid = isCustomNamespace && !namespaceValue;

  return (
    <main className="card">
      <h1>{copy.title}</h1>
      <p className="card-description">{copy.description}</p>
      <section className="section">
        <header className="section-header">
          <h2>{copy.sections.v4.title}</h2>
          <p className="hint">{copy.sections.v4.hint}</p>
        </header>
        <div className="uuid-output">
          <code>{v4Uuid || copy.sections.v4.placeholder}</code>
          <div className="uuid-actions">
            <button type="button" className="secondary" onClick={handleGenerateV4}>
              {copy.sections.v4.generate}
            </button>
            <button type="button" className="secondary" onClick={() => handleCopy(v4Uuid, 'v4')} disabled={!v4Uuid}>
              {copied === 'v4' ? copy.sections.v4.copied : copy.sections.v4.copy}
            </button>
          </div>
        </div>
      </section>
      <section className="section">
        <header className="section-header">
          <h2>{copy.sections.v1.title}</h2>
          <p className="hint">{copy.sections.v1.hint}</p>
        </header>
        <div className="uuid-output">
          <code>{v1Uuid || copy.sections.v1.placeholder}</code>
          <div className="uuid-actions">
            <button type="button" className="secondary" onClick={handleGenerateV1}>
              {copy.sections.v1.generate}
            </button>
            <button type="button" className="secondary" onClick={() => handleCopy(v1Uuid, 'v1')} disabled={!v1Uuid}>
              {copied === 'v1' ? copy.sections.v1.copied : copy.sections.v1.copy}
            </button>
          </div>
        </div>
      </section>
      <section className="section">
        <header className="section-header">
          <h2>{copy.sections.v5.title}</h2>
          <p className="hint">{copy.sections.v5.hint}</p>
        </header>
        <label htmlFor="uuid-namespace">{copy.sections.v5.namespaceLabel}</label>
        <select
          id="uuid-namespace"
          value={namespace}
          onChange={(event: ChangeEvent<HTMLSelectElement>) => {
            setNamespace(event.target.value as NamespaceOption);
            setV5Status('idle');
            setV5Error('');
          }}
        >
          {namespaceOptions.map((value) => (
            <option key={value} value={value}>
              {copy.sections.v5.namespaceOptions[value].label}
            </option>
          ))}
        </select>
        <p className="hint">{selectedNamespaceLabel}</p>
        {isCustomNamespace ? (
          <>
            <label htmlFor="uuid-custom-namespace">{copy.sections.v5.customNamespaceLabel}</label>
            <input
              id="uuid-custom-namespace"
              type="text"
              value={customNamespace}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setCustomNamespace(event.target.value);
                setV5Status('idle');
                setV5Error('');
              }}
              placeholder={copy.sections.v5.customNamespacePlaceholder}
            />
          </>
        ) : null}
        <label htmlFor="uuid-name">{copy.sections.v5.nameLabel}</label>
        <input
          id="uuid-name"
          type="text"
          value={name}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setName(event.target.value);
            setV5Status('idle');
            setV5Error('');
          }}
          placeholder={copy.sections.v5.namePlaceholder}
        />
        <div className="uuid-actions">
          <button
            type="button"
            className="secondary"
            onClick={handleGenerateV5}
            disabled={namespaceInvalid}
          >
            {v5Status === 'pending' ? copy.sections.v5.buttons.pending : copy.sections.v5.buttons.generate}
          </button>
          <button type="button" className="secondary" onClick={() => handleCopy(v5Uuid, 'v5')} disabled={!v5Uuid}>
            {copied === 'v5' ? copy.sections.v5.buttons.copied : copy.sections.v5.buttons.copy}
          </button>
        </div>
        {v5Error ? <p className="error">{v5Error}</p> : null}
        <div className="uuid-output">
          <code>{v5Uuid || copy.sections.v5.resultPlaceholder}</code>
        </div>
      </section>
      <section className="section">
        <header className="section-header">
          <h2>{copy.guidance.title}</h2>
          <p>{copy.guidance.description}</p>
        </header>
        <ul>
          {copy.guidance.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
        <p className="hint">{copy.guidance.hint}</p>
      </section>
    </main>
  );
}
