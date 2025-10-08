import { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  availableBlockPositionState,
  availableBlocksState,
  blockDirectionState,
  selectedBlockState,
} from './atoms';
import { Block } from './Block';
import { baseSize, parseBlockType } from './utils';
import type { BlockType } from './types';

export const inventoryContainerId = 'block-puzzle-inventory';

const INVENTORY_WIDTH = 320;
const INVENTORY_HEIGHT = 320;

export function Inventory() {
  const [selectedBlock, setSelectedBlock] = useRecoilState(selectedBlockState);
  const availableBlocks = useRecoilValue(availableBlocksState);
  const [blockPositions, setBlockPositions] = useRecoilState(availableBlockPositionState);
  const [blockDirection, setBlockDirection] = useRecoilState(blockDirectionState);

  useEffect(() => {
    let left = 0;
    let top = 0;
    let nextRowHeight = 0;
    let previous: BlockType | undefined;
    let nextPositions = blockPositions;

    availableBlocks.forEach((blockType) => {
      if (previous) {
        const info = parseBlockType(previous);
        left += info.width * baseSize;
        if (left > INVENTORY_WIDTH - baseSize) {
          left = 0;
          top += nextRowHeight;
          nextRowHeight = 0;
        }
        nextRowHeight = Math.max(nextRowHeight, info.height * baseSize);
      }

      if (!nextPositions.get(blockType)) {
        nextPositions = nextPositions.set(blockType, { left, top });
      }
      previous = blockType;
    });

    if (!nextPositions.equals(blockPositions)) {
      setBlockPositions(nextPositions);
    }
  }, [availableBlocks, blockPositions, setBlockPositions]);

  return (
    <div
      id={inventoryContainerId}
      style={{ width: INVENTORY_WIDTH, height: INVENTORY_HEIGHT, position: 'relative' }}
    >
      {availableBlocks.toArray().map((blockType) => {
        const position = blockPositions.get(blockType);
        if (!position) {
          return null;
        }

        return (
          <div key={blockType} style={{ float: 'left' }}>
            <Block
              type={blockType}
              top={position.top}
              left={position.left}
              selected={blockType === selectedBlock}
              onContextMenu={() => {
                if (selectedBlock === blockType) {
                  const dir = blockDirection.get(blockType) ?? 'row';
                  const nextDir = dir === 'row' ? 'col' : 'row';
                  setBlockDirection(blockDirection.set(blockType, nextDir));
                }
              }}
              onClick={() => {
                setSelectedBlock(blockType);
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
