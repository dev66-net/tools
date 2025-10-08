import { TYPE_LABEL, type BlockDir, type BlockShape, type BlockType, type CanvasPosition, type GridIndex, type GridPosition } from './types';

let cache: Record<BlockType, BlockShape> = {} as Record<BlockType, BlockShape>;

export const baseSize = 60;
export const tileSpacing = 3;

export function parseBlockType(type: BlockType): BlockShape {
  if (cache[type]) {
    return cache[type];
  }

  if (!type) {
    cache[type] = { width: 0, height: 0, color: 'transparent', dir: 'row' };
    return cache[type];
  }

  const [size, color, dir = 'row'] = type.split(':');
  const [height, width] = size.split('x').map((value) => Number.parseInt(value, 10));
  cache[type] = { width, height, color, dir: dir as BlockDir };
  return cache[type];
}

export function infoToType(info: BlockShape): BlockType {
  return `${info.width}x${info.height}:${info.color}:${info.dir}` as BlockType;
}

export function positionToIndex(position: CanvasPosition): GridIndex {
  const col = Math.ceil(position.left / baseSize);
  const row = Math.ceil(position.top / baseSize);
  return row * 8 + col;
}

export function indexToRowCol(index: GridIndex): GridPosition {
  return {
    row: index >> 3,
    col: index & 0b111,
  };
}

export function rowColToCanvas(position: GridPosition): CanvasPosition {
  return {
    top: position.row * baseSize,
    left: position.col * baseSize,
  };
}

export function isOutsideGrid(position: GridPosition): boolean {
  return position.row > 7 || position.col > 7;
}

export function renderBoard(board: BlockType[]): string {
  const snapshot: string[] = [];
  for (let i = 0; i < board.length; i += 1) {
    if (i > 0 && i % 8 === 0) {
      snapshot.push('\n');
    }
    snapshot.push(TYPE_LABEL[board[i]] ?? '.');
  }
  return snapshot.join('');
}

export function resetBlockCache(): void {
  cache = {} as Record<BlockType, BlockShape>;
}
