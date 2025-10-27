import { atom } from 'jotai';
import { List } from 'immutable';

// Types
export type ZipEntryInfo = {
  id: string;
  name: string;
  size: number;
  isDirectory: boolean;
  entry: any;
};

export type SelectedSource = {
  id: string;
  path: string;
  file: File;
};

export type CompressionProgress = {
  currentIndex: number;
  total: number;
  currentFile?: string;
};

export type ExtractionProgress = {
  targetName: string;
  current: number;
  total: number;
};

// Decompression atoms
export const zipEntriesAtom = atom<List<ZipEntryInfo>>(List());
export const zipLoadingAtom = atom<boolean>(false);
export const zipErrorAtom = atom<string | null>(null);
export const extractionProgressAtom = atom<ExtractionProgress | null>(null);
export const extractionSuccessAtom = atom<string | null>(null);

// Compression atoms
export const selectedSourcesAtom = atom<List<SelectedSource>>(List());
export const compressionProgressAtom = atom<CompressionProgress | null>(null);
export const compressionUrlAtom = atom<string | null>(null);
export const compressionErrorAtom = atom<string | null>(null);

// Derived atom for total selected size
export const totalSelectedSizeAtom = atom((get) => {
  const sources = get(selectedSourcesAtom);
  return sources.reduce((sum, source) => sum + source.file.size, 0);
});
