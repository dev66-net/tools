import { RecoilRoot } from 'recoil';
import { useI18n } from './i18n/index';
import { lazy, Suspense, useEffect, useState } from 'react';

const BlockPuzzleSolverApp = lazy(() => import('./block-puzzle-solver/App'));

type BlockPuzzleSolverCopy = {
  title: string;
  description: string;
  solver: {
    startSolver: string;
    applySolution: string;
    resetBoard: string;
    searchLabel: string;
  };
  instructions: {
    title: string;
    description: string;
    steps: string[];
    tips: string[];
  };
};

export default function BlockPuzzleSolver() {
  const { translations } = useI18n();
  const copy = translations.tools.blockPuzzleSolver.page as BlockPuzzleSolverCopy;
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <main className="card card--full-width">
      <h1>{copy.title}</h1>
      <p className="card-description">{copy.description}</p>
      <section className="section">
        <RecoilRoot>
          {isClient && (
            <Suspense fallback={<div>Loading...</div>}>
              <BlockPuzzleSolverApp labels={copy.solver} />
            </Suspense>
          )}
        </RecoilRoot>
      </section>
      <section className="section">
        <header className="section-header">
          <h2>{copy.instructions.title}</h2>
          <p>{copy.instructions.description}</p>
        </header>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <figure style={{ margin: 0 }}>
            <figcaption style={{ textAlign: 'center', marginBottom: '0.5rem', fontWeight: '600' }}>题目 (Problem)</figcaption>
            <img src="/block-puzzle-solver-problem.png" alt="Example of a puzzle to be solved" style={{ maxWidth: '320px', display: 'block', borderRadius: '8px' }} />
          </figure>
          <figure style={{ margin: 0 }}>
            <figcaption style={{ textAlign: 'center', marginBottom: '0.5rem', fontWeight: '600' }}>答案 (Solution)</figcaption>
            <img src="/block-puzzle-solver-solution.png" alt="Example of a solved puzzle" style={{ maxWidth: '320px', display: 'block', borderRadius: '8px' }} />
          </figure>
        </div>
        <ol>
          {copy.instructions.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        {copy.instructions.tips.map((tip) => (
          <p key={tip} className="hint">
            {tip}
          </p>
        ))}
      </section>
    </main>
  );
}
