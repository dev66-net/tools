
import {
  DEFAULT_BLOCKS,
  type BlockBoardState,
  type BlockDir,
  type BlockPlacement,
  type BlockShape,
  type BlockType,
  type GridIndex,
  type GridPosition,
} from './types';

interface Context {
  count: number;
  onProgress: (count: number) => void;
}

type Board = BlockType[];

function createBoardState(placements: BlockPlacement[]): Board {
  const board: Board = new Array(64).fill('');
  placements.forEach((placement) => {
    const { row, col } = indexToRowCol(placement.index);
    const shape = parseBlockType(placement.item.type);
    const dir = placement.item.dir || 'row';
    const [width, height] = dir === 'row' ? [shape.width, shape.height] : [shape.height, shape.width];
    for (let r = row; r < row + height; r += 1) {
      for (let c = col; c < col + width; c += 1) {
        const index = r * 8 + c;
        board[index] = placement.item.type;
      }
    }
  });
  return board;
}

function search(
  board: Board,
  placed: BlockPlacement[],
  left: BlockType[],
  blockInfoMap: Map<BlockType, BlockShape>,
  context: Context,
): BlockBoardState | undefined {
  if (left.length === 0) {
    return { items: placed };
  }

  let firstEmptyIndex = -1;
  for (let i = 0; i < 64; i += 1) {
    if (board[i] === '') {
      firstEmptyIndex = i;
      break;
    }
  }

  if (firstEmptyIndex === -1) {
    return undefined;
  }

  const position = indexToRowCol(firstEmptyIndex);

  for (let i = 0; i < left.length; i += 1) {
    const blockType = left[i];
    const shape = blockInfoMap.get(blockType)!;
    const directions: BlockDir[] = ['row', 'col'];
    for (const dir of directions) {
      const [width, height] = dir === 'row' ? [shape.width, shape.height] : [shape.height, shape.width];
      if (position.row + height > 8 || position.col + width > 8) {
        continue;
      }

      let canPlace = true;
      for (let r = position.row; r < position.row + height; r += 1) {
        for (let c = position.col; c < position.col + width; c += 1) {
          const index = r * 8 + c;
          if (board[index] !== '') {
            canPlace = false;
            break;
          }
        }
        if (!canPlace) {
          break;
        }
      }

      if (canPlace) {
        context.count += 1;
        context.onProgress(context.count);

        const nextPlaced = [...placed];
        const nextBoard = [...board];
        nextPlaced.push({ item: { type: blockType, dir }, index: firstEmptyIndex });
        for (let r = position.row; r < position.row + height; r += 1) {
          for (let c = position.col; c < position.col + width; c += 1) {
            const index = r * 8 + c;
            nextBoard[index] = blockType;
          }
        }

        const nextLeft = [...left];
        nextLeft.splice(i, 1);
        const result = search(nextBoard, nextPlaced, nextLeft, blockInfoMap, context);
        if (result) {
          return result;
        }
      }
    }
  }

  return undefined;
}

function indexToRowCol(index: GridIndex): GridPosition {
  return { row: Math.floor(index / 8), col: index % 8 };
}

const shapeCache: Record<string, BlockShape> = {};

function parseBlockType(type: BlockType): BlockShape {
  if (shapeCache[type]) {
    return shapeCache[type];
  }
  const [size, color, dir] = type.split(':');
  const [height, width] = size.split('x').map((value) => Number.parseInt(value, 10));
  shapeCache[type] = { width, height, color, dir: (dir as BlockDir) ?? 'row' };
  return shapeCache[type];
}

export function runSolver(
  request: BlockBoardState,
  onProgress: (count: number) => void,
): BlockBoardState | undefined {
  const context: Context = { count: 0, onProgress };

  request.items.forEach((placement) => {
    placement.item.dir = placement.item.dir || 'row';
  });

  const boardState = createBoardState(request.items);

  const usedBlocks = new Set(request.items.map((item) => item.item.type));
  const remainingBlocks = DEFAULT_BLOCKS.filter((block) => !usedBlocks.has(block));
  const blockInfoMap = new Map<BlockType, BlockShape>();
  DEFAULT_BLOCKS.forEach((block) => blockInfoMap.set(block, parseBlockType(block)));
  const sortedRemainingBlocks = remainingBlocks.slice().sort((a, b) => {
    const aShape = blockInfoMap.get(a)!;
    const bShape = blockInfoMap.get(b)!;
    return bShape.height * bShape.width - aShape.height * aShape.width;
  });

  return search(boardState, request.items, sortedRemainingBlocks, blockInfoMap, context);
}
