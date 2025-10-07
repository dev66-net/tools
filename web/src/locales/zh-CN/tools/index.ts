import type { ToolCopy } from '../../../i18n/types';
import type { ToolId } from '../../../tools';

import base64Converter from './base64Converter';
import escapeDecoder from './escapeDecoder';
import hashGenerator from './hashGenerator';
import hexConverter from './hexConverter';
import jsonFormatter from './jsonFormatter';
import jwtDecoder from './jwtDecoder';
import markdownRenderer from './markdownRenderer';
import qrGenerator from './qrGenerator';
import qrScanner from './qrScanner';
import randomNumberGenerator from './randomNumberGenerator';
import randomStringGenerator from './randomStringGenerator';
import urlParser from './urlParser';
import uuidGenerator from './uuidGenerator';

const tools: Record<ToolId, ToolCopy> = {
  qrGenerator,
  qrScanner,
  urlParser,
  jsonFormatter,
  markdownRenderer,
  jwtDecoder,
  base64Converter,
  hexConverter,
  escapeDecoder,
  hashGenerator,
  uuidGenerator,
  randomNumberGenerator,
  randomStringGenerator,
};

export default tools;
