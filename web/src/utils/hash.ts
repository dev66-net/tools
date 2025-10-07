import { bytesToHex, utf8ToBytes } from './bytes.ts';

const S: number[] = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
  5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
  6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
];

const K: number[] = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000));

const initA = 0x67452301;
const initB = 0xefcdab89;
const initC = 0x98badcfe;
const initD = 0x10325476;

const MAX_CHUNK_BYTES = 64;

function leftRotate(x: number, c: number): number {
  return ((x << c) | (x >>> (32 - c))) >>> 0;
}

function makePaddedBuffer(message: Uint8Array): Uint8Array {
  const originalLength = message.length;
  const bitLength = originalLength * 8;
  const paddingLength = ((originalLength + 8) >>> 6 << 6) + MAX_CHUNK_BYTES;
  const buffer = new Uint8Array(paddingLength);
  buffer.set(message);
  buffer[originalLength] = 0x80;

  const lowBits = bitLength >>> 0;
  const highBits = Math.floor(bitLength / 0x100000000);

  const view = new DataView(buffer.buffer);
  view.setUint32(paddingLength - 8, lowBits, true);
  view.setUint32(paddingLength - 4, highBits, true);
  return buffer;
}

export function md5Bytes(input: Uint8Array | string): Uint8Array {
  const message = typeof input === 'string' ? utf8ToBytes(input) : input;
  const buffer = makePaddedBuffer(message);
  const view = new DataView(buffer.buffer);
  let a = initA;
  let b = initB;
  let c = initC;
  let d = initD;

  const words = new Uint32Array(16);

  for (let offset = 0; offset < buffer.length; offset += MAX_CHUNK_BYTES) {
    for (let i = 0; i < 16; i += 1) {
      words[i] = view.getUint32(offset + i * 4, true);
    }

    let A = a;
    let B = b;
    let C = c;
    let D = d;

    for (let i = 0; i < 64; i += 1) {
      let F = 0;
      let g = 0;

      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * i) % 16;
      }

      F = (F + A + K[i]! + words[g]!) >>> 0;
      A = D;
      D = C;
      C = B;
      B = (B + leftRotate(F, S[i]!)) >>> 0;
    }

    a = (a + A) >>> 0;
    b = (b + B) >>> 0;
    c = (c + C) >>> 0;
    d = (d + D) >>> 0;
  }

  const output = new Uint8Array(16);
  const outView = new DataView(output.buffer);
  outView.setUint32(0, a, true);
  outView.setUint32(4, b, true);
  outView.setUint32(8, c, true);
  outView.setUint32(12, d, true);
  return output;
}

export function md5Hex(input: Uint8Array | string): string {
  const digest = md5Bytes(input);
  return bytesToHex(digest);
}
