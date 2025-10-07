const hasCrypto =
  typeof globalThis !== 'undefined' &&
  typeof globalThis.crypto !== 'undefined' &&
  typeof globalThis.crypto.getRandomValues === 'function';

export function supportsCryptoRandom(): boolean {
  return hasCrypto;
}

export function secureRandomBytes(length: number): Uint8Array {
  if (!hasCrypto) {
    throw new Error('Secure random generator is not available.');
  }
  const buffer = new Uint8Array(length);
  globalThis.crypto.getRandomValues(buffer);
  return buffer;
}

function secureRandomIntInclusive(min: number, max: number): number {
  if (!hasCrypto) {
    throw new Error('Secure random generator is not available.');
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    throw new Error('Invalid bounds.');
  }
  const floorMin = Math.ceil(min);
  const floorMax = Math.floor(max);
  if (floorMax < floorMin) {
    throw new Error('上界必须大于或等于下界。');
  }
  const range = floorMax - floorMin + 1;
  if (range <= 0) {
    throw new Error('范围过大，无法生成随机数。');
  }
  const maxUint32 = 0x100000000;
  const bucketSize = Math.floor(maxUint32 / range) * range;
  const randomBuffer = new Uint32Array(1);
  let randomValue = 0;
  do {
    globalThis.crypto.getRandomValues(randomBuffer);
    randomValue = randomBuffer[0]!;
  } while (randomValue >= bucketSize);
  const offset = randomValue % range;
  return floorMin + offset;
}

function mathRandomIntInclusive(min: number, max: number): number {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    throw new Error('Invalid bounds.');
  }
  const floorMin = Math.ceil(min);
  const floorMax = Math.floor(max);
  if (floorMax < floorMin) {
    throw new Error('上界必须大于或等于下界。');
  }
  const range = floorMax - floorMin + 1;
  if (range <= 0) {
    throw new Error('范围过大，无法生成随机数。');
  }
  const randomValue = Math.floor(Math.random() * range);
  return floorMin + randomValue;
}

export function randomIntInclusive(
  min: number,
  max: number,
  preferCrypto: boolean
): { value: number; usedCrypto: boolean } {
  if (preferCrypto && hasCrypto) {
    try {
      const value = secureRandomIntInclusive(min, max);
      return { value, usedCrypto: true };
    } catch (error) {
      console.warn('Secure random failed, falling back to Math.random()', error);
    }
  }
  const value = mathRandomIntInclusive(min, max);
  return { value, usedCrypto: false };
}

export function randomIntExclusive(
  min: number,
  maxExclusive: number,
  preferCrypto: boolean
): { value: number; usedCrypto: boolean } {
  if (maxExclusive <= min) {
    throw new Error('Exclusive upper bound must be greater than lower bound.');
  }
  const { value, usedCrypto } = randomIntInclusive(min, maxExclusive - 1, preferCrypto);
  return { value, usedCrypto };
}
