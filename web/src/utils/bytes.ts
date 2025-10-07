export function utf8ToBytes(input: string): Uint8Array {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(input);
  }
  const result: number[] = [];
  for (let i = 0; i < input.length; i += 1) {
    const codePoint = input.charCodeAt(i);
    if (codePoint < 0x80) {
      result.push(codePoint);
    } else if (codePoint < 0x800) {
      result.push((codePoint >> 6) | 0xc0, (codePoint & 0x3f) | 0x80);
    } else {
      result.push((codePoint >> 12) | 0xe0, ((codePoint >> 6) & 0x3f) | 0x80, (codePoint & 0x3f) | 0x80);
    }
  }
  return Uint8Array.from(result);
}

export function bytesToUtf8(bytes: Uint8Array): string {
  if (typeof TextDecoder !== 'undefined') {
    return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  }
  let out = '';
  for (let i = 0; i < bytes.length; i += 1) {
    out += String.fromCharCode(bytes[i]!);
  }
  return decodeURIComponent(escape(out));
}

export function bytesToHex(bytes: Uint8Array, uppercase = false): string {
  const alphabet = uppercase ? '0123456789ABCDEF' : '0123456789abcdef';
  let out = '';
  for (let i = 0; i < bytes.length; i += 1) {
    const value = bytes[i]!;
    out += alphabet[value >> 4] + alphabet[value & 0x0f];
  }
  return out;
}

export function bytesToSpacedHex(
  bytes: Uint8Array,
  options?: { uppercase?: boolean; groupSize?: number; separator?: string }
): string {
  if (bytes.length === 0) {
    return '';
  }
  const { uppercase = false, groupSize = 1, separator = ' ' } = options ?? {};
  const raw = bytesToHex(bytes, uppercase);
  if (groupSize <= 1) {
    return raw;
  }
  const chunkChars = groupSize * 2;
  const parts: string[] = [];
  for (let i = 0; i < raw.length; i += chunkChars) {
    parts.push(raw.slice(i, i + chunkChars));
  }
  return parts.join(separator);
}

export function hexToBytes(hex: string): Uint8Array {
  const sanitized = hex.trim();
  if (sanitized.length === 0) {
    return new Uint8Array(0);
  }
  if (sanitized.length % 2 !== 0) {
    throw new Error('十六进制字符串长度必须为偶数。');
  }
  const length = sanitized.length / 2;
  const output = new Uint8Array(length);
  for (let i = 0; i < length; i += 1) {
    const byte = sanitized.slice(i * 2, i * 2 + 2);
    const parsed = Number.parseInt(byte, 16);
    if (Number.isNaN(parsed)) {
      throw new Error('检测到无效的十六进制字符。');
    }
    output[i] = parsed;
  }
  return output;
}
