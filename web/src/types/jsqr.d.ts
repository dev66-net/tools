declare module 'jsqr' {
  interface Point {
    x: number;
    y: number;
  }

  interface QRCodeLocation {
    topLeftCorner: Point;
    topRightCorner: Point;
    bottomLeftCorner: Point;
    bottomRightCorner: Point;
  }

  interface QRCodeResult {
    data: string;
    version?: number;
    location: QRCodeLocation;
  }

  interface DecodeOptions {
    inversionAttempts?: 'dontInvert' | 'onlyInvert' | 'attemptBoth' | 'attemptBothMirrored';
  }

  export default function jsQR(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    options?: DecodeOptions
  ): QRCodeResult | null;
}
