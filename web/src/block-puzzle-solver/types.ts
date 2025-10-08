export type BlockDir = 'row' | 'col';

export type BlockType =
  | '1x1:gray'
  | '1x2:gray'
  | '1x3:gray'
  | '2x3:red'
  | '2x4:red'
  | '1x4:blue'
  | '1x5:blue'
  | '3x3:white'
  | '2x2:white'
  | '3x4:yellow'
  | '2x5:yellow'
  | '';

export const EMPTY_BLOCK: BlockType = '';

export interface BlockShape {
  width: number;
  height: number;
  color: string;
  dir: BlockDir;
}

export const TYPE_LABEL: Record<BlockType, string> = {
  '': '.',
  '1x1:gray': '2',
  '1x2:gray': '3',
  '1x3:gray': '1',
  '2x3:red': '7',
  '2x4:red': '8',
  '1x4:blue': '6',
  '1x5:blue': '4',
  '3x3:white': '9',
  '2x2:white': 'A',
  '3x4:yellow': '5',
  '2x5:yellow': 'B',
};

export const DEFAULT_BLOCKS: BlockType[] = [
  '1x3:gray',
  '1x1:gray',
  '1x2:gray',
  '1x5:blue',
  '1x4:blue',
  '2x3:red',
  '2x4:red',
  '3x3:white',
  '2x2:white',
  '3x4:yellow',
  '2x5:yellow',
];

export interface GridPosition {
  row: number;
  col: number;
}

export interface CanvasPosition {
  top: number;
  left: number;
}

export type GridIndex = number;

export interface BlockPlacement {
  item: {
    type: BlockType;
    dir: BlockDir;
  };
  index: GridIndex;
}

export interface BlockBoardState {
  items: BlockPlacement[];
}
