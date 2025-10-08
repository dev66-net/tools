import { useRecoilState, useRecoilValue } from 'recoil';
import { blockDirectionState, blockZIndexState, maxZIndexState } from './atoms';
import { parseBlockType, tileSpacing, baseSize } from './utils';
import { TYPE_LABEL } from './types';
import type { BlockType } from './types';

interface BlockProps {
  type: BlockType;
  zIndex?: number;
  float?: boolean;
  top?: number;
  left?: number;
  selected?: boolean;
  onClick?: () => void;
  onContextMenu?: () => void;
}

export function Block({
  type,
  float = false,
  top = 0,
  left = 0,
  selected = false,
  onClick,
  onContextMenu,
}: BlockProps) {
  const blockDir = useRecoilValue(blockDirectionState);
  const [maxZIndex, setMaxZIndex] = useRecoilState(maxZIndexState);
  const [zIndexMap, setZIndexMap] = useRecoilState(blockZIndexState);
  const info = parseBlockType(type);

  const dir = blockDir.get(type) ?? 'row';
  const [width, height] = dir === 'row' ? [info.width, info.height] : [info.height, info.width];
  const computedWidth = width * baseSize - tileSpacing * 2;
  const computedHeight = height * baseSize - tileSpacing * 2;

  return (
    <div
      className={selected ? 'block-selected' : ''}
      onClick={() => {
        onClick?.();
        setZIndexMap(zIndexMap.set(type, maxZIndex + 1));
        setMaxZIndex(maxZIndex + 1);
      }}
      onContextMenu={(event) => {
        event.preventDefault();
        onContextMenu?.();
      }}
      style={{
        position: 'absolute',
        opacity: float ? 0.5 : undefined,
        left: left + tileSpacing,
        top: top + tileSpacing,
        zIndex: zIndexMap.get(type),
        width: computedWidth,
        height: computedHeight,
        backgroundColor: info.color,
        padding: 2,
        border: '1px solid #000',
        borderRadius: 10,
      }}
    >
      <div
        style={{
          position: 'absolute',
          margin: 1,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 600,
        }}
      >
        <span>{TYPE_LABEL[type] ?? type}</span>
      </div>
    </div>
  );
}
