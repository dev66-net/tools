import { forwardRef } from 'react';
import { useRecoilState } from 'recoil';
import {
  availableBlocksState,
  placedBlockState,
  selectedBlockState,
} from './atoms';
import { Block } from './Block';
import { baseSize, indexToRowCol } from './utils';

interface ChessboardProps {
  squares: number[][];
  onClick?: (rowIndex: number, colIndex: number) => void;
  onMouseOut?: (rowIndex: number, colIndex: number) => void;
  onMouseOver?: (rowIndex: number, colIndex: number) => void;
}

export const Chessboard = forwardRef<HTMLDivElement, ChessboardProps>(function Chessboard(
  { squares, onClick, onMouseOut, onMouseOver },
  ref,
) {
  const [placedBlocks, setPlacedBlocks] = useRecoilState(placedBlockState);
  const [selectedBlock, setSelectedBlock] = useRecoilState(selectedBlockState);
  const [availableBlocks, setAvailableBlocks] = useRecoilState(availableBlocksState);

  const boardPixelSize = baseSize * 8;

  return (
    <div ref={ref} className="chessboard-wrapper" style={{ width: boardPixelSize, height: boardPixelSize }}>
      <div
        className="chessboard-grid"
        style={{
          gridTemplateColumns: `repeat(8, ${baseSize}px)`,
          gridTemplateRows: `repeat(8, ${baseSize}px)`,
          width: boardPixelSize,
          height: boardPixelSize,
        }}
      >
        {squares.map((row, rowIndex) =>
          row.map((_, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="chessboard-square"
              onClick={() => {
                onClick?.(rowIndex, colIndex);
              }}
              onMouseOut={() => {
                onMouseOut?.(rowIndex, colIndex);
              }}
              onMouseOver={() => {
                onMouseOver?.(rowIndex, colIndex);
              }}
            >
              <div className="circle" />
            </div>
          ))
        )}
      </div>
      {placedBlocks.toArray().map(([id, state]) => {
        const position = indexToRowCol(state.index);
        return (
          <Block
            key={id}
            type={id}
            left={position.col * baseSize}
            top={position.row * baseSize}
            selected={selectedBlock === id}
            onClick={() => {
              setSelectedBlock(id);
              const placement = placedBlocks.get(id);
              if (placement) {
                setPlacedBlocks(placedBlocks.delete(id));
                setAvailableBlocks((prev) => (prev.includes(id) ? prev : prev.push(id)));
              }
            }}
          />
        );
      })}
    </div>
  );
});
