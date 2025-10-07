import { ChangeEvent, useMemo, useState } from 'react';
import { UUID_NAMESPACES, generateUuidV1, generateUuidV4, generateUuidV5 } from './utils/uuid.ts';

const namespaceOptions = [
  { value: 'DNS', label: 'DNS（域名）', description: '6ba7b810-9dad-11d1-80b4-00c04fd430c8' },
  { value: 'URL', label: 'URL', description: '6ba7b811-9dad-11d1-80b4-00c04fd430c8' },
  { value: 'OID', label: 'OID', description: '6ba7b812-9dad-11d1-80b4-00c04fd430c8' },
  { value: 'X500', label: 'X.500 名称', description: '6ba7b814-9dad-11d1-80b4-00c04fd430c8' },
  { value: 'custom', label: '自定义命名空间', description: '输入其他有效 UUID' },
] as const;

type NamespaceOption = (typeof namespaceOptions)[number]['value'];

type CopyTarget = 'v1' | 'v4' | 'v5';

type V5State = 'idle' | 'pending' | 'error' | 'success';

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

  const selectedNamespaceLabel = useMemo(() => {
    const option = namespaceOptions.find((item) => item.value === namespace);
    return option?.description ?? '';
  }, [namespace]);

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
      setV5Error('请填写名称，UUID v5 需要名称作为输入。');
      return;
    }
    try {
      const uuid = await generateUuidV5(namespaceValue, trimmedName);
      setV5Uuid(uuid);
      setV5Status('success');
    } catch (error) {
      setV5Status('error');
      setV5Error((error as Error).message || 'v5 生成失败，请检查命名空间与名称。');
    }
  };

  const isCustomNamespace = namespace === 'custom';
  const namespaceInvalid = isCustomNamespace && !namespaceValue;

  return (
    <main className="card">
      <h1>UUID 生成器：在线创建 v1/v4/v5</h1>
      <p className="card-description">
        即时生成时间序列 v1、随机 v4 以及基于命名空间的 v5 UUID，支持批量复制与自定义命名空间，适合标识资源或请求链路。
      </p>
      <section className="section">
        <header className="section-header">
          <h2>UUID v4 · 随机</h2>
          <p className="hint">使用加密随机数构造，适用于大多数场景。</p>
        </header>
        <div className="uuid-output">
          <code>{v4Uuid || '点击生成后显示结果'}</code>
          <div className="uuid-actions">
            <button type="button" className="secondary" onClick={handleGenerateV4}>
              生成 v4
            </button>
            <button type="button" className="secondary" onClick={() => handleCopy(v4Uuid, 'v4')} disabled={!v4Uuid}>
              {copied === 'v4' ? '已复制' : '复制'}
            </button>
          </div>
        </div>
      </section>
      <section className="section">
        <header className="section-header">
          <h2>UUID v1 · 时间序列</h2>
          <p className="hint">基于时间戳与节点标识生成，保持有序。</p>
        </header>
        <div className="uuid-output">
          <code>{v1Uuid || '点击生成后显示结果'}</code>
          <div className="uuid-actions">
            <button type="button" className="secondary" onClick={handleGenerateV1}>
              生成 v1
            </button>
            <button type="button" className="secondary" onClick={() => handleCopy(v1Uuid, 'v1')} disabled={!v1Uuid}>
              {copied === 'v1' ? '已复制' : '复制'}
            </button>
          </div>
        </div>
      </section>
      <section className="section">
        <header className="section-header">
          <h2>UUID v5 · 名称散列</h2>
          <p className="hint">根据命名空间与名称生成稳定的 UUID。</p>
        </header>
        <label htmlFor="uuid-namespace">命名空间</label>
        <select
          id="uuid-namespace"
          value={namespace}
          onChange={(event: ChangeEvent<HTMLSelectElement>) => {
            setNamespace(event.target.value as NamespaceOption);
            setV5Status('idle');
            setV5Error('');
          }}
        >
          {namespaceOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="hint">{selectedNamespaceLabel}</p>
        {isCustomNamespace ? (
          <>
            <label htmlFor="uuid-custom-namespace">自定义命名空间 UUID</label>
            <input
              id="uuid-custom-namespace"
              type="text"
              value={customNamespace}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setCustomNamespace(event.target.value);
                setV5Status('idle');
                setV5Error('');
              }}
              placeholder="例如：123e4567-e89b-12d3-a456-426614174000"
            />
          </>
        ) : null}
        <label htmlFor="uuid-name">名称</label>
        <input
          id="uuid-name"
          type="text"
          value={name}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setName(event.target.value);
            setV5Status('idle');
            setV5Error('');
          }}
          placeholder="输入名称（如域名 example.com）"
        />
        <div className="uuid-actions">
          <button
            type="button"
            className="secondary"
            onClick={handleGenerateV5}
            disabled={namespaceInvalid}
          >
            {v5Status === 'pending' ? '生成中…' : '生成 v5'}
          </button>
          <button type="button" className="secondary" onClick={() => handleCopy(v5Uuid, 'v5')} disabled={!v5Uuid}>
            {copied === 'v5' ? '已复制' : '复制'}
          </button>
        </div>
        {v5Error ? <p className="error">{v5Error}</p> : null}
        <div className="uuid-output">
          <code>{v5Uuid || '生成结果将显示在此处'}</code>
        </div>
      </section>
      <section className="section">
        <header className="section-header">
          <h2>选择合适的 UUID 版本</h2>
          <p>根据业务需求选择合适的算法，确保 ID 稳定且不冲突。</p>
        </header>
        <ul>
          <li>v4 随机 UUID 适合生成不可预测的标识符，例如订单号、会话 ID。</li>
          <li>v1 基于时间戳，便于按时间排序，但包含节点信息，适合内部系统使用。</li>
          <li>v5 将命名空间与名称哈希成固定值，适用于根据域名、路径生成稳定 ID。</li>
        </ul>
        <p className="hint">生成结果保留在本地，复制后可直接粘贴到代码、数据库或配置文件中。</p>
      </section>
    </main>
  );
}
