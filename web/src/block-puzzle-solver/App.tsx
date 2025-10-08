import './App.css';
import './Chessboard.css';
import { List, Map } from 'immutable';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import {
  availableBlocksState,
  availableBlockPositionState,
  blockDirectionState,
  boardSnapshotState,
  placedBlockState,
  selectedBlockState,
  solverResultState,
} from './atoms';
import { Block } from './Block';
import { Chessboard } from './Chessboard';
import { Inventory } from './Inventory';
import {
  baseSize,
  indexToRowCol,
  parseBlockType,
} from './utils';
import {
  DEFAULT_BLOCKS,
  EMPTY_BLOCK,
  type BlockBoardState,
  type BlockType,
  type CanvasPosition,
  type GridIndex,
  type GridPosition,
} from './types';
import { runSolver } from './solver';

interface BlockPuzzleSolverLabels {
  startSolver: string;
  applySolution: string;
  resetBoard: string;
  searchLabel: string;
}

const fallbackLabels: BlockPuzzleSolverLabels = {
  startSolver: 'Start solver',
  applySolution: 'Apply latest solution',
  resetBoard: 'Reset board',
  searchLabel: 'Search explored',
};

export interface BlockPuzzleSolverAppProps {
  labels?: BlockPuzzleSolverLabels;
}

function createEmptyBoard(): List<BlockType> {
  return List(Array.from({ length: 64 }, () => EMPTY_BLOCK as BlockType));
}

function mergePlacedBlocks(
  placements: Map<BlockType, { index: number; dir: 'row' | 'col' }>,
  directions: Map<BlockType, 'row' | 'col'>,
): List<BlockType> {
  let board = createEmptyBoard();
  placements.forEach((placement, blockType) => {
    const { row, col } = indexToRowCol(placement.index);
    const info = parseBlockType(blockType);
    const dir = directions.get(blockType) ?? placement.dir ?? 'row';
    const [width, height] = dir === 'row' ? [info.width, info.height] : [info.height, info.width];
    for (let r = row; r < row + height; r += 1) {
      for (let c = col; c < col + width; c += 1) {
        const index = r * 8 + c;
        board = board.set(index, blockType);
      }
    }
  });
  return board;
}

export default function BlockPuzzleSolverApp({ labels = fallbackLabels }: BlockPuzzleSolverAppProps) {
  const [cursorPosition, setCursorPosition] = useState<CanvasPosition>({ top: 0, left: 0 });
  const [snapPosition, setSnapPosition] = useState<CanvasPosition>({ top: 0, left: 0 });
  const [snapIndex, setSnapIndex] = useState<GridIndex | null>(null);
  const [canPlace, setCanPlace] = useState(false);
  const [searchCount, setSearchCount] = useState(0);
  const [solverStatus, setSolverStatus] = useState<'idle' | 'running' | 'success' | 'failed'>('idle');
  const boardRef = useRef<HTMLDivElement | null>(null);

  const [selectedBlock, setSelectedBlock] = useRecoilState(selectedBlockState);
  const [availableBlocks, setAvailableBlocks] = useRecoilState(availableBlocksState);
  const [placedBlocks, setPlacedBlocks] = useRecoilState(placedBlockState);
  const [blockDirections, setBlockDirections] = useRecoilState(blockDirectionState);
  const [boardSnapshot, setBoardSnapshot] = useRecoilState(boardSnapshotState);
  const [solverResult, setSolverResult] = useRecoilState(solverResultState);
  const setAvailableBlockPositions = useSetRecoilState(availableBlockPositionState);

  useEffect(() => {
    setBoardSnapshot(mergePlacedBlocks(placedBlocks, blockDirections));
  }, [placedBlocks, blockDirections, setBoardSnapshot]);

  const boardArray = useMemo(() => boardSnapshot.toArray(), [boardSnapshot]);

  const validatePlacement = useCallback(
    (gridPosition: GridPosition, boardOffset: CanvasPosition, direction?: 'row' | 'col') => {
      if (!selectedBlock) {
        setCanPlace(false);
        setSnapIndex(null);
        return;
      }
      const info = parseBlockType(selectedBlock);
      const dir = direction ?? blockDirections.get(selectedBlock) ?? 'row';
      const { row: rawRow, col: rawCol } = gridPosition;
      if (rawRow < 0 || rawCol < 0 || rawRow > 7 || rawCol > 7) {
        setCanPlace(false);
        setSnapIndex(null);
        return;
      }
      const snapped = {
        left: boardOffset.left + rawCol * baseSize,
        top: boardOffset.top + rawRow * baseSize,
      };
      setSnapPosition(snapped);

      const [width, height] = dir === 'row' ? [info.width, info.height] : [info.height, info.width];
      if (rawRow + height > 8 || rawCol + width > 8) {
        setCanPlace(false);
        setSnapIndex(null);
        return;
      }

      for (let row = rawRow; row < rawRow + height; row += 1) {
        for (let col = rawCol; col < rawCol + width; col += 1) {
          const index = row * 8 + col;
          if (boardArray[index] && boardArray[index] !== selectedBlock) {
            setCanPlace(false);
            setSnapIndex(null);
            return;
          }
        }
      }

      setSnapIndex((rawRow << 3) + rawCol);
      setCanPlace(true);
    },
    [selectedBlock, blockDirections, boardArray],
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!selectedBlock) {
        return;
      }
      const boardElement = boardRef.current;
      if (!boardElement) {
        return;
      }

      const info = parseBlockType(selectedBlock);
      const dir = blockDirections.get(selectedBlock) ?? 'row';
      const [width, height] = dir === 'row' ? [info.width, info.height] : [info.height, info.width];

      const rect = boardElement.getBoundingClientRect();
      const boardSize = baseSize * 8;
      const offsetLeft = event.clientX - rect.left;
      const offsetTop = event.clientY - rect.top;
      const insideBoard =
        offsetLeft >= 0 &&
        offsetLeft <= boardSize &&
        offsetTop >= 0 &&
        offsetTop <= boardSize;
      const boardOffset = {
        left: boardElement.offsetLeft,
        top: boardElement.offsetTop,
      };
      if (!insideBoard) {
        setCanPlace(false);
        setSnapIndex(null);
        return;
      }
      const rawCol = Math.floor(offsetLeft / baseSize);
      const rawRow = Math.floor(offsetTop / baseSize);
      const gridPosition: GridPosition = {
        row: Math.min(8 - height, Math.max(0, rawRow)),
        col: Math.min(8 - width, Math.max(0, rawCol)),
      };
      const displayPosition = {
        left: boardOffset.left + gridPosition.col * baseSize,
        top: boardOffset.top + gridPosition.row * baseSize,
      };
      setCursorPosition(displayPosition);
      validatePlacement(gridPosition, boardOffset);
    },
    [selectedBlock, validatePlacement, blockDirections],
  );

  const handlePlaceBlock = useCallback(() => {
    if (!selectedBlock) {
      return;
    }

    if (!canPlace) {
      setSelectedBlock(EMPTY_BLOCK);
      return;
    }

    if (snapIndex === null) {
      setSelectedBlock(EMPTY_BLOCK);
      return;
    }

    const dir = blockDirections.get(selectedBlock) ?? 'row';
    const index = snapIndex;
    setPlacedBlocks(placedBlocks.set(selectedBlock, { index, dir }));
    setAvailableBlocks((prev) => prev.filter((item) => item !== selectedBlock).toList());
    setSelectedBlock(EMPTY_BLOCK);
    setCanPlace(false);
    setSnapIndex(null);
  }, [selectedBlock, canPlace, blockDirections, snapIndex, setPlacedBlocks, placedBlocks, setAvailableBlocks, setSelectedBlock]);

  const handleRotateSelected = useCallback(() => {
    if (!selectedBlock) {
      return;
    }
    const boardElement = boardRef.current;
    if (!boardElement) {
      return;
    }
    const boardOffset = {
      left: boardElement.offsetLeft,
      top: boardElement.offsetTop,
    };

    const current = blockDirections.get(selectedBlock) ?? 'row';
    const next = current === 'row' ? 'col' : 'row';
    setBlockDirections(blockDirections.set(selectedBlock, next));

    const col = Math.floor((cursorPosition.left - boardOffset.left) / baseSize);
    const row = Math.floor((cursorPosition.top - boardOffset.top) / baseSize);
    const gridPosition = { row, col };

    validatePlacement(gridPosition, boardOffset, next);
  }, [selectedBlock, blockDirections, setBlockDirections, validatePlacement, cursorPosition]);

  const handleRunSolver = useCallback(() => {
    setSearchCount(0);
    setSolverStatus('running');
    setSolverResult({ items: [] });
    const payload: BlockBoardState = { items: [] };
    placedBlocks.forEach((placement, blockType) => {
      payload.items.push({
        item: {
          type: blockType,
          dir: placement.dir ?? blockDirections.get(blockType) ?? 'row',
        },
        index: placement.index,
      });
    });

    const result = runSolver(payload, (count) => {
      setSearchCount(count);
    });

    if (result) {
      setSolverResult(result);
      setSolverStatus('success');
    } else {
      setSolverResult({ items: [] });
      setSolverStatus('failed');
    }
  }, [blockDirections, placedBlocks, setSolverResult, setSolverStatus, setSearchCount]);

  const handleApplySolution = useCallback(() => {
    if (!solverResult || solverResult.items.length === 0) {
      return;
    }
    let nextPlaced = placedBlocks;
    let nextDirections = blockDirections;
    const solvedTypes = new Set<BlockType>();
    solverResult.items.forEach((item) => {
      solvedTypes.add(item.item.type);
      nextDirections = nextDirections.set(item.item.type, item.item.dir);
      nextPlaced = nextPlaced.set(item.item.type, {
        index: item.index,
        dir: item.item.dir,
      });
    });
    setPlacedBlocks(nextPlaced);
    setBlockDirections(nextDirections);
    setAvailableBlocks((prev) => prev.filter((block) => !solvedTypes.has(block)).toList());
    setSelectedBlock(EMPTY_BLOCK);
  }, [blockDirections, placedBlocks, setBlockDirections, setPlacedBlocks, setSelectedBlock, solverResult, setAvailableBlocks]);

  return (
    <div
      className="block-puzzle-stage"
      onMouseMove={handleMouseMove}
      onClick={handlePlaceBlock}
      onContextMenu={(event) => {
        event.preventDefault();
        handleRotateSelected();
      }}
    >
      <div className="block-puzzle-layout">
        <Chessboard
          ref={boardRef}
          squares={Array.from({ length: 8 }, () => Array(8).fill(0))}
        />
        <Inventory />
        {selectedBlock && (
          <Block
            float
            type={selectedBlock}
            top={cursorPosition.top}
            left={cursorPosition.left}
            selected
          />
        )}
        {selectedBlock && (
          <Block
            float
            type={selectedBlock}
            top={snapPosition.top}
            left={snapPosition.left}
          />
        )}
      </div>
      <div className="block-puzzle-toolbar">
        <div className="block-puzzle-toolbar-actions">
          <button type="button" onClick={handleRunSolver}>
            {labels.startSolver}
          </button>
          <button type="button" onClick={handleApplySolution}>
            {labels.applySolution}
          </button>
          <button
            type="button"
            onClick={() => {
              setPlacedBlocks(Map());
              setBlockDirections(Map());
              setAvailableBlocks(List(DEFAULT_BLOCKS));
              setAvailableBlockPositions(Map());
              setSelectedBlock(EMPTY_BLOCK);
              setSolverResult({ items: [] });
              setCanPlace(false);
              setSearchCount(0);
              setSolverStatus('idle');
            }}
          >
            {labels.resetBoard}
          </button>
        </div>
        <div className="block-puzzle-toolbar-feedback">
          {labels.searchLabel}: {searchCount}
          {solverStatus === 'running' && ' (求解中...)'}
          {solverStatus === 'success' && (
            <span style={{ color: 'green' }}> (搜索成功有解答)</span>
          )}
          {solverStatus === 'failed' && <span style={{ color: 'red' }}> (无解)</span>}
        </div>
      </div>
    </div>
  );
}
