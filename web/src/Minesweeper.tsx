import { useCallback, useEffect, useMemo, useState } from 'react';
import { useI18n } from './i18n/index';

type Cell = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
};

type GameState = 'idle' | 'playing' | 'won' | 'lost';

type Difficulty = 'easy' | 'medium' | 'hard' | 'custom';

type DifficultyConfig = {
  rows: number;
  cols: number;
  mines: number;
};

const DIFFICULTY_PRESETS: Record<Difficulty, DifficultyConfig> = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 },
  custom: { rows: 10, cols: 10, mines: 10 },
};

const MIN_ROWS = 5;
const MAX_ROWS = 30;
const MIN_COLS = 5;
const MAX_COLS = 50;

function createEmptyGrid(rows: number, cols: number): Cell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      neighborMines: 0,
    }))
  );
}

function placeMines(grid: Cell[][], mineCount: number, safeRow: number, safeCol: number): void {
  const rows = grid.length;
  const cols = grid[0].length;
  const positions: [number, number][] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r !== safeRow || c !== safeCol) {
        positions.push([r, c]);
      }
    }
  }

  // Fisher-Yates shuffle
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  for (let i = 0; i < Math.min(mineCount, positions.length); i++) {
    const [r, c] = positions[i];
    grid[r][c].isMine = true;
  }
}

function calculateNeighborMines(grid: Cell[][]): void {
  const rows = grid.length;
  const cols = grid[0].length;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c].isMine) {
        grid[r][c].neighborMines = -1;
        continue;
      }

      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc].isMine) {
            count++;
          }
        }
      }
      grid[r][c].neighborMines = count;
    }
  }
}

function revealCell(grid: Cell[][], row: number, col: number): void {
  const rows = grid.length;
  const cols = grid[0].length;
  const cell = grid[row][col];

  if (cell.isRevealed || cell.isFlagged) return;

  cell.isRevealed = true;

  if (cell.neighborMines === 0) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          revealCell(grid, nr, nc);
        }
      }
    }
  }
}

function checkWin(grid: Cell[][]): boolean {
  for (const row of grid) {
    for (const cell of row) {
      if (!cell.isMine && !cell.isRevealed) {
        return false;
      }
    }
  }
  return true;
}

function revealAllMines(grid: Cell[][]): void {
  for (const row of grid) {
    for (const cell of row) {
      if (cell.isMine) {
        cell.isRevealed = true;
      }
    }
  }
}

export default function Minesweeper() {
  const { translations } = useI18n();
  const copy = translations.tools.minesweeper.page;

  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [customConfig, setCustomConfig] = useState<DifficultyConfig>({
    rows: 10,
    cols: 10,
    mines: 10,
  });

  const config = useMemo(() => {
    if (difficulty === 'custom') {
      return customConfig;
    }
    return DIFFICULTY_PRESETS[difficulty];
  }, [difficulty, customConfig]);

  const [grid, setGrid] = useState<Cell[][]>(() => createEmptyGrid(config.rows, config.cols));
  const [gameState, setGameState] = useState<GameState>('idle');
  const [timer, setTimer] = useState(0);
  const [flagCount, setFlagCount] = useState(0);

  // Reset grid when config changes
  useEffect(() => {
    setGrid(createEmptyGrid(config.rows, config.cols));
    setGameState('idle');
    setTimer(0);
    setFlagCount(0);
  }, [config.rows, config.cols, config.mines]);

  // Timer effect
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      setTimer((t) => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  const startNewGame = useCallback(() => {
    setGrid(createEmptyGrid(config.rows, config.cols));
    setGameState('idle');
    setTimer(0);
    setFlagCount(0);
  }, [config.rows, config.cols]);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (gameState === 'won' || gameState === 'lost') return;

      setGrid((prevGrid) => {
        const newGrid = prevGrid.map((r) => r.map((c) => ({ ...c })));
        const cell = newGrid[row][col];

        if (cell.isFlagged || cell.isRevealed) return prevGrid;

        // First click - initialize mines
        if (gameState === 'idle') {
          placeMines(newGrid, config.mines, row, col);
          calculateNeighborMines(newGrid);
          setGameState('playing');
        }

        if (cell.isMine) {
          revealAllMines(newGrid);
          setGameState('lost');
          return newGrid;
        }

        revealCell(newGrid, row, col);

        if (checkWin(newGrid)) {
          setGameState('won');
        }

        return newGrid;
      });
    },
    [gameState, config.mines]
  );

  const handleCellRightClick = useCallback(
    (event: React.MouseEvent, row: number, col: number) => {
      event.preventDefault();
      if (gameState === 'won' || gameState === 'lost') return;

      setGrid((prevGrid) => {
        const newGrid = prevGrid.map((r) => r.map((c) => ({ ...c })));
        const cell = newGrid[row][col];

        if (cell.isRevealed) return prevGrid;

        if (cell.isFlagged) {
          cell.isFlagged = false;
          setFlagCount((f) => f - 1);
        } else {
          cell.isFlagged = true;
          setFlagCount((f) => f + 1);
        }

        return newGrid;
      });
    },
    [gameState]
  );

  const handleDifficultyChange = useCallback((newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
  }, []);

  const handleCustomChange = useCallback(
    (field: keyof DifficultyConfig, value: number) => {
      setCustomConfig((prev) => {
        const newConfig = { ...prev, [field]: value };
        // Validate max mines
        const maxMines = newConfig.rows * newConfig.cols - 1;
        if (newConfig.mines > maxMines) {
          newConfig.mines = maxMines;
        }
        return newConfig;
      });
    },
    []
  );

  const remainingMines = config.mines - flagCount;

  const getCellContent = (cell: Cell): string => {
    if (cell.isFlagged) return '🚩';
    if (!cell.isRevealed) return '';
    if (cell.isMine) return '💣';
    if (cell.neighborMines === 0) return '';
    return String(cell.neighborMines);
  };

  const getCellClassName = (cell: Cell): string => {
    const baseClass = 'cell';
    if (cell.isRevealed) {
      if (cell.isMine) return `${baseClass} cell--mine`;
      return `${baseClass} cell--revealed num-${cell.neighborMines}`;
    }
    if (cell.isFlagged) return `${baseClass} cell--flagged`;
    return baseClass;
  };

  return (
    <main className="card">
      <h1>{copy.title}</h1>
      <p className="card-description">{copy.description}</p>

      <section className="section">
        <header className="section-header">
          <h2>{copy.game.title}</h2>
          <p>{copy.game.description}</p>
        </header>

        {/* Difficulty Selector */}
        <div className="form-inline difficulty-selector">
          {(Object.keys(copy.difficulties) as Difficulty[]).map((diff) => (
            <button
              key={diff}
              type="button"
              className={difficulty === diff ? 'primary' : 'secondary'}
              onClick={() => handleDifficultyChange(diff)}
            >
              {copy.difficulties[diff]}
            </button>
          ))}
        </div>

        {/* Custom Settings */}
        {difficulty === 'custom' && (
          <div className="form-grid custom-settings">
            <div className="form-field">
              <label htmlFor="custom-rows">{copy.custom.rows}</label>
              <input
                id="custom-rows"
                type="number"
                min={MIN_ROWS}
                max={MAX_ROWS}
                value={customConfig.rows}
                onChange={(e) => handleCustomChange('rows', parseInt(e.target.value, 10) || MIN_ROWS)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="custom-cols">{copy.custom.cols}</label>
              <input
                id="custom-cols"
                type="number"
                min={MIN_COLS}
                max={MAX_COLS}
                value={customConfig.cols}
                onChange={(e) => handleCustomChange('cols', parseInt(e.target.value, 10) || MIN_COLS)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="custom-mines">{copy.custom.mines}</label>
              <input
                id="custom-mines"
                type="number"
                min={1}
                max={customConfig.rows * customConfig.cols - 1}
                value={customConfig.mines}
                onChange={(e) => handleCustomChange('mines', parseInt(e.target.value, 10) || 1)}
              />
            </div>
          </div>
        )}

        {/* Game Status */}
        <div className="form-inline game-status">
          <span className="status-item">
            💣 {remainingMines}
          </span>
          <button type="button" className="primary" onClick={startNewGame}>
            {copy.game.newGame}
          </button>
          <span className="status-item">
            ⏱️ {timer}
          </span>
        </div>

        {gameState === 'won' && <p className="success">{copy.game.won}</p>}
        {gameState === 'lost' && <p className="error">{copy.game.lost}</p>}

        {/* Game Grid */}
        <div
          className="minesweeper-grid"
          style={{
            gridTemplateColumns: `repeat(${config.cols}, 28px)`,
          }}
        >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                className={getCellClassName(cell)}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                onContextMenu={(e) => handleCellRightClick(e, rowIndex, colIndex)}
                disabled={gameState === 'won' || gameState === 'lost'}
                aria-label={cell.isRevealed ? (cell.isMine ? 'Mine' : `Number ${cell.neighborMines}`) : 'Hidden cell'}
              >
                {getCellContent(cell)}
              </button>
            ))
          )}
        </div>
      </section>

      <section className="section">
        <header className="section-header">
          <h2>{copy.instructions.title}</h2>
          <p>{copy.instructions.description}</p>
        </header>
        <ul>
          {copy.instructions.steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ul>
        <p className="hint">{copy.instructions.tips}</p>
      </section>

      <style>{`
        .difficulty-selector {
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }
        .difficulty-selector button {
          min-width: 80px;
        }
        .custom-settings {
          margin-bottom: 16px;
          padding: 16px;
          background: var(--bg-secondary, #f5f5f5);
          border-radius: 8px;
        }
        .custom-settings input {
          width: 80px;
        }
        .game-status {
          justify-content: center;
          align-items: center;
          gap: 24px;
          margin-bottom: 16px;
          padding: 12px;
          background: var(--bg-secondary, #f5f5f5);
          border-radius: 8px;
        }
        .status-item {
          font-family: monospace;
          font-size: 1.2em;
          font-weight: bold;
          min-width: 80px;
          text-align: center;
        }
        .success {
          color: #16a34a;
          text-align: center;
          font-weight: bold;
          margin-bottom: 12px;
        }
        .minesweeper-grid {
          display: grid;
          gap: 1px;
          background: #999;
          border: 2px solid #999;
          margin: 0 auto;
          width: fit-content;
        }
        .cell {
          width: 28px;
          height: 28px;
          background: #c0c0c0;
          border: 2px outset #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
          cursor: pointer;
          user-select: none;
          padding: 0;
        }
        .cell:hover:not(:disabled) {
          background: #d0d0d0;
        }
        .cell:active:not(:disabled) {
          border-style: inset;
        }
        .cell--revealed {
          background: #e0e0e0;
          border: 1px solid #bbb;
          cursor: default;
        }
        .cell--flagged {
          background: #c0c0c0;
        }
        .cell--mine {
          background: #ff6b6b;
          border: 1px solid #bbb;
        }
        .cell.num-1 { color: #0000ff; }
        .cell.num-2 { color: #008000; }
        .cell.num-3 { color: #ff0000; }
        .cell.num-4 { color: #000080; }
        .cell.num-5 { color: #800000; }
        .cell.num-6 { color: #008080; }
        .cell.num-7 { color: #000000; }
        .cell.num-8 { color: #808080; }
      `}</style>
    </main>
  );
}
