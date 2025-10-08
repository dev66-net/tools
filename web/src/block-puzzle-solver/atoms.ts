import { atom } from 'recoil';
import { List, Map } from 'immutable';
import { DEFAULT_BLOCKS, EMPTY_BLOCK, type BlockBoardState, type BlockDir, type BlockPlacement, type BlockType, type CanvasPosition, type GridIndex } from './types';

export const selectedBlockState = atom<BlockType>({
  key: 'blockPuzzle/selectedBlock',
  default: EMPTY_BLOCK,
});

export const availableBlocksState = atom<List<BlockType>>({
  key: 'blockPuzzle/availableBlocks',
  default: List(DEFAULT_BLOCKS),
});

export const availableBlockPositionState = atom<Map<BlockType, CanvasPosition>>({
  key: 'blockPuzzle/availableBlockPosition',
  default: Map<BlockType, CanvasPosition>(),
});

export const placedBlockState = atom<Map<BlockType, { index: GridIndex; dir: BlockDir }>>({
  key: 'blockPuzzle/placedBlocks',
  default: Map(),
});

export const blockDirectionState = atom<Map<BlockType, BlockDir>>({
  key: 'blockPuzzle/blockDirection',
  default: Map(),
});

export const blockZIndexState = atom<Map<BlockType, number>>({
  key: 'blockPuzzle/blockZIndex',
  default: Map(),
});

export const maxZIndexState = atom<number>({
  key: 'blockPuzzle/maxZIndex',
  default: 1,
});

export const boardSnapshotState = atom<List<BlockType>>({
  key: 'blockPuzzle/boardSnapshot',
  default: List(Array.from({ length: 64 }, () => EMPTY_BLOCK as BlockType)),
});

export const solverResultState = atom<BlockBoardState>({
  key: 'blockPuzzle/solverResult',
  default: { items: [] },
});
