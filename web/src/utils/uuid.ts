import { bytesToHex } from './bytes.ts';
import { randomIntInclusive, secureRandomBytes, supportsCryptoRandom } from './random.ts';

const UUID_EPOCH_OFFSET = 0x01b21dd213814000n;

let lastTimestamp = 0n;
let lastNanos = 0;
let clockSeq: number | null = null;
let nodeId: Uint8Array | null = null;

function ensureClockSeq(): number {
  if (clockSeq === null) {
    if (supportsCryptoRandom()) {
      const buffer = secureRandomBytes(2);
      clockSeq = ((buffer[0]! << 8) | buffer[1]!) & 0x3fff;
    } else {
      clockSeq = Math.floor(Math.random() * 0x4000);
    }
  }
  return clockSeq!;
}

function ensureNodeId(): Uint8Array {
  if (nodeId) {
    return nodeId;
  }
  const bytes = supportsCryptoRandom() ? secureRandomBytes(6) : Uint8Array.from({ length: 6 }, () => randomIntInclusive(0, 255, false).value);
  bytes[0] = (bytes[0] ?? 0) | 0x01;
  nodeId = bytes;
  return nodeId;
}

function numberToBytes(value: number, byteLength: number): Uint8Array {
  const result = new Uint8Array(byteLength);
  for (let i = byteLength - 1; i >= 0; i -= 1) {
    result[i] = value & 0xff;
    value >>>= 8;
  }
  return result;
}

export function uuidBytesToString(bytes: Uint8Array): string {
  if (bytes.length !== 16) {
    throw new Error('UUID 需要 16 个字节。');
  }
  const hex = bytesToHex(bytes);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function uuidStringToBytes(uuid: string): Uint8Array {
  const normalized = uuid.trim().toLowerCase().replace(/[^0-9a-f]/g, '');
  if (normalized.length !== 32) {
    throw new Error('UUID 字符串格式不正确。');
  }
  const output = new Uint8Array(16);
  for (let i = 0; i < 16; i += 1) {
    const byte = normalized.slice(i * 2, i * 2 + 2);
    output[i] = Number.parseInt(byte, 16);
  }
  return output;
}

function formatV1Timestamp(): { bytes: Uint8Array; clockSeqHi: number; clockSeqLow: number; node: Uint8Array } {
  const now = BigInt(Date.now());
  let timestamp = now * 10000n + UUID_EPOCH_OFFSET;
  const currentClockSeq = ensureClockSeq();
  const node = ensureNodeId();

  if (timestamp < lastTimestamp) {
    clockSeq = (currentClockSeq + 1) & 0x3fff;
  }
  if (timestamp === lastTimestamp) {
    lastNanos = (lastNanos + 1) % 10000;
    if (lastNanos === 0) {
      clockSeq = ((ensureClockSeq() + 1) & 0x3fff) >>> 0;
    }
  } else {
    lastNanos = 0;
  }

  timestamp += BigInt(lastNanos);
  lastTimestamp = timestamp;

  const timeLow = Number(timestamp & 0xffffffffn) >>> 0;
  const timeMid = Number((timestamp >> 32n) & 0xffffn);
  const timeHigh = Number((timestamp >> 48n) & 0x0fffn) | 0x1000;

  const currentSeq = ensureClockSeq();
  const clockSeqHi = ((currentSeq >> 8) & 0x3f) | 0x80;
  const clockSeqLow = currentSeq & 0xff;

  const bytes = new Uint8Array(16);
  const timeLowBytes = numberToBytes(timeLow, 4);
  const timeMidBytes = numberToBytes(timeMid, 2);
  const timeHighBytes = numberToBytes(timeHigh, 2);

  bytes.set(timeLowBytes, 0);
  bytes.set(timeMidBytes, 4);
  bytes.set(timeHighBytes, 6);
  bytes[8] = clockSeqHi;
  bytes[9] = clockSeqLow;
  bytes.set(node, 10);
  return { bytes, clockSeqHi, clockSeqLow, node };
}

export function generateUuidV1(): string {
  const { bytes } = formatV1Timestamp();
  return uuidBytesToString(bytes);
}

export function generateUuidV4(): string {
  const bytes = supportsCryptoRandom() ? secureRandomBytes(16) : Uint8Array.from({ length: 16 }, () => randomIntInclusive(0, 255, false).value);
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
  return uuidBytesToString(bytes);
}

export async function generateUuidV5(namespaceUuid: string, name: string): Promise<string> {
  if (typeof name !== 'string') {
    throw new Error('名称必须为字符串。');
  }
  const namespaceBytes = uuidStringToBytes(namespaceUuid);
  const nameBytes = new TextEncoder().encode(name);
  const buffer = new Uint8Array(namespaceBytes.length + nameBytes.length);
  buffer.set(namespaceBytes, 0);
  buffer.set(nameBytes, namespaceBytes.length);

  if (!globalThis.crypto || !globalThis.crypto.subtle) {
    throw new Error('当前环境不支持 SHA-1 摘要计算。');
  }

  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-1', buffer);
  const hash = new Uint8Array(hashBuffer).slice(0, 16);
  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  return uuidBytesToString(hash);
}

export const UUID_NAMESPACES = {
  DNS: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  URL: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
  OID: '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
  X500: '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
} as const;
