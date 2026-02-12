import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useI18n } from './i18n/index';

type InputMode = 'text' | 'dial';

type SolutionTable = {
  solvable: Record<string, string[]>;
  unsolvable: string[];
};

type TwentyFourSolverCopy = {
  title: string;
  description: string;
  input: {
    modeLabel: string;
    textMode: string;
    dialMode: string;
    numberLabel: string;
    numberPlaceholder: string;
  };
  dial: {
    title: string;
    description: string;
    buttons: {
      clear: string;
      backspace: string;
    };
  };
  results: {
    title: string;
    noSolution: string;
    solutionCount: string;
    unsolvableHint: string;
  };
  instructions: {
    title: string;
    description: string;
    bullets: string[];
  };
};

async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // fallthrough
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
  } catch {
    return false;
  }
}

function makeKey(nums: number[]): string {
  return nums.slice().sort((a, b) => a - b).join(',');
}

const DIAL_BUTTONS = [
  1, 2, 3, 4, 5, 6,
  7, 8, 9, 10, 11, 12, 13
];

export default function TwentyFourSolver() {
  const { translations } = useI18n();
  const copy = translations.tools.twentyFourSolver?.page as TwentyFourSolverCopy | undefined;

  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [numbers, setNumbers] = useState<(number | null)[]>([null, null, null, null]);
  const [textInputs, setTextInputs] = useState<string[]>(['', '', '', '']);
  const [table, setTable] = useState<SolutionTable | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load solution table
  useEffect(() => {
    fetch('/24-solver-table.json')
      .then((res) => res.json())
      .then((data) => {
        setTable(data);
      })
      .catch((err) => {
        console.error('Failed to load solution table:', err);
      });
  }, []);

  const currentNumbers = useMemo(() => {
    if (inputMode === 'text') {
      return textInputs.map((n) => {
        const num = parseInt(n, 10);
        return isNaN(num) ? null : num;
      });
    }
    return numbers;
  }, [inputMode, textInputs, numbers]);

  const isComplete = useMemo(() => {
    return currentNumbers.every((n) => n !== null && n >= 1 && n <= 13);
  }, [currentNumbers]);

  const solutions = useMemo(() => {
    if (!table || !isComplete) return null;
    const validNumbers = currentNumbers as number[];
    const key = makeKey(validNumbers);
    return table.solvable[key] || null;
  }, [table, currentNumbers, isComplete]);

  const isUnsolvable = useMemo(() => {
    if (!table || !isComplete) return false;
    const validNumbers = currentNumbers as number[];
    const key = makeKey(validNumbers);
    return table.unsolvable.includes(key);
  }, [table, currentNumbers, isComplete]);

  // Auto-solve when complete
  useEffect(() => {
    if (isComplete) {
      setLoading(true);
      // Small delay for visual feedback
      setTimeout(() => setLoading(false), 100);
    }
  }, [currentNumbers, isComplete]);

  const handleTextInput = useCallback((index: number, value: string) => {
    const num = parseInt(value, 10);
    const newInputs = [...textInputs];
    if (value === '' || isNaN(num)) {
      newInputs[index] = value;
    } else if (num >= 1 && num <= 13) {
      newInputs[index] = String(num);
    }
    setTextInputs(newInputs);
  }, [textInputs]);

  const handleDialClick = useCallback((num: number) => {
    setNumbers((prev) => {
      const firstEmpty = prev.findIndex((n) => n === null);
      if (firstEmpty === -1) return prev;
      const next = [...prev];
      next[firstEmpty] = num;
      return next;
    });
  }, []);

  const handleClear = useCallback(() => {
    setNumbers([null, null, null, null]);
    setTextInputs(['', '', '', '']);
  }, []);

  const handleBackspace = useCallback(() => {
    setNumbers((prev) => {
      const lastFilled = prev.map((n, i) => ({ n, i })).filter(({ n }) => n !== null).pop();
      if (!lastFilled) return prev;
      const next = [...prev];
      next[lastFilled.i] = null;
      return next;
    });
  }, []);

  const handleCopy = useCallback(async () => {
    if (!solutions) return;
    const text = solutions.join('\n');
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }, [solutions]);

  if (!copy) {
    return (
      <main className="card">
        <h1>24 Game Solver</h1>
        <p className="card-description">Loading...</p>
      </main>
    );
  }

  return (
    <main className="card">
      <h1>{copy.title}</h1>
      <p className="card-description">{copy.description}</p>

      <section className="section">
        <header className="section-header">
          <h2>{copy.input.modeLabel}</h2>
        </header>

        <div className="mode-toggle">
          <button
            type="button"
            className={`mode-toggle-button ${inputMode === 'text' ? 'active' : ''}`}
            onClick={() => setInputMode('text')}
          >
            {copy.input.textMode}
          </button>
          <button
            type="button"
            className={`mode-toggle-button ${inputMode === 'dial' ? 'active' : ''}`}
            onClick={() => setInputMode('dial')}
          >
            {copy.input.dialMode}
          </button>
        </div>
      </section>

      {inputMode === 'text' ? (
        <section className="section">
          <header className="section-header">
            <h2>{copy.input.numberLabel}</h2>
          </header>
          <div className="form-grid">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="form-field">
                <label htmlFor={`num-${i}`}>
                  {copy.input.numberLabel} {i + 1}
                </label>
                <input
                  id={`num-${i}`}
                  type="number"
                  min={1}
                  max={13}
                  value={textInputs[i]}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleTextInput(i, e.target.value)}
                  placeholder={copy.input.numberPlaceholder}
                />
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="section">
          <header className="section-header">
            <h2>{copy.dial.title}</h2>
            <p>{copy.dial.description}</p>
          </header>

          <div className="number-cards">
            {numbers.map((num, i) => (
              <div
                key={i}
                className={`number-card ${num !== null ? 'filled' : 'empty'}`}
              >
                {num !== null ? num : i + 1}
              </div>
            ))}
          </div>

          <div className="dial-pad">
            {DIAL_BUTTONS.map((num) => (
              <button
                key={num}
                type="button"
                className="dial-button"
                onClick={() => handleDialClick(num)}
                disabled={numbers.every((n) => n !== null)}
              >
                {num}
              </button>
            ))}
          </div>

          <div className="actions">
            <button type="button" className="secondary" onClick={handleClear}>
              {copy.dial.buttons.clear}
            </button>
            <button
              type="button"
              className="secondary"
              onClick={handleBackspace}
              disabled={numbers.every((n) => n === null)}
            >
              {copy.dial.buttons.backspace}
            </button>
          </div>
        </section>
      )}

      {(isComplete || loading) && (
        <section className="section">
          <header className="section-header">
            <h2>{copy.results.title}</h2>
            {solutions && (
              <p>{copy.results.solutionCount.replace('{count}', String(solutions.length))}</p>
            )}
          </header>

          {loading ? (
            <p className="hint">Solving...</p>
          ) : solutions ? (
            <>
              <div className="solutions-list">
                {solutions.map((solution, i) => (
                  <div key={i} className="solution-item">
                    {solution} = 24
                  </div>
                ))}
              </div>
              <div className="actions">
                <button type="button" className="secondary" onClick={handleCopy}>
                  {copied ? 'Copied!' : 'Copy All'}
                </button>
              </div>
            </>
          ) : isUnsolvable ? (
            <div className="no-solution">
              <p>{copy.results.noSolution}</p>
              <p className="hint">{copy.results.unsolvableHint}</p>
            </div>
          ) : null}
        </section>
      )}

      <section className="section">
        <header className="section-header">
          <h2>{copy.instructions.title}</h2>
          <p>{copy.instructions.description}</p>
        </header>
        <ul>
          {copy.instructions.bullets.map((bullet, i) => (
            <li key={i}>{bullet}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
