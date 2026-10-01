import { BidiCharacterAnalysis, BidiClass } from '../types';

/**
 * Unicode Bidirectional Algorithm (UAX #9) & Script Range Classifier
 * Specialized for Persian, Arabic, Urdu, and Hebrew text streams.
 */

// Persian & Arabic specific character ranges
export const SCRIPT_RANGES = {
  ARABIC_STANDARD: [0x0600, 0x06FF],
  ARABIC_SUPPLEMENT: [0x0750, 0x077F],
  ARABIC_EXTENDED_A: [0x08A0, 0x08FF],
  ARABIC_EXTENDED_B: [0x0870, 0x089F],
  ARABIC_PRESENTATION_FORMS_A: [0xFB50, 0xFDFF],
  ARABIC_PRESENTATION_FORMS_B: [0xFE70, 0xFEFF],
  HEBREW: [0x0590, 0x05FF],
  PERSIAN_SPECIFIC_CHARS: [0x067E, 0x0686, 0x0698, 0x06AF, 0x06CC], // پ، چ، ژ، گ، ی
};

export function getBidiClass(codePoint: number): { bidiClass: BidiClass; scriptName: string; isRtlScript: boolean } {
  // Arabic & Persian scripts (Bidi Class AL)
  if (
    (codePoint >= 0x0600 && codePoint <= 0x06FF) ||
    (codePoint >= 0x0750 && codePoint <= 0x077F) ||
    (codePoint >= 0x0870 && codePoint <= 0x08FF) ||
    (codePoint >= 0xFB50 && codePoint <= 0xFDFF) ||
    (codePoint >= 0xFE70 && codePoint <= 0xFEFF)
  ) {
    const isPersianSpecific = SCRIPT_RANGES.PERSIAN_SPECIFIC_CHARS.includes(codePoint);
    return {
      bidiClass: 'AL',
      scriptName: isPersianSpecific ? 'Persian (Farsi)' : 'Arabic / Persian / Urdu',
      isRtlScript: true,
    };
  }

  // Hebrew script (Bidi Class R)
  if (codePoint >= 0x0590 && codePoint <= 0x05FF) {
    return { bidiClass: 'R', scriptName: 'Hebrew', isRtlScript: true };
  }

  // Arabic-Indic Digits (۰ ۱ ۲ ۳ ۴ ۵ ۶ ۷ ۸ ۹)
  if (codePoint >= 0x0660 && codePoint <= 0x0669) {
    return { bidiClass: 'AN', scriptName: 'Arabic-Indic Digit', isRtlScript: false };
  }
  // Eastern Arabic-Indic Digits (Persian/Urdu: ۰ ۱ ۲ ۳ ۴ ۵ ۶ ۷ ۸ ۹)
  if (codePoint >= 0x06F0 && codePoint <= 0x06F9) {
    return { bidiClass: 'AN', scriptName: 'Persian / Urdu Digit', isRtlScript: false };
  }

  // European Digits
  if (codePoint >= 0x0030 && codePoint <= 0x0039) {
    return { bidiClass: 'EN', scriptName: 'European Number', isRtlScript: false };
  }

  // Latin Letters (Bidi Class L)
  if (
    (codePoint >= 0x0041 && codePoint <= 0x005A) ||
    (codePoint >= 0x0061 && codePoint <= 0x007A) ||
    (codePoint >= 0x00C0 && codePoint <= 0x024F)
  ) {
    return { bidiClass: 'L', scriptName: 'Latin (LTR)', isRtlScript: false };
  }

  // Common Separators & Terminators
  if (codePoint === 0x002B || codePoint === 0x002D) { // +, -
    return { bidiClass: 'ES', scriptName: 'European Separator', isRtlScript: false };
  }
  if (codePoint === 0x0024 || codePoint === 0x0025 || codePoint === 0x066A) { // $, %, ٪
    return { bidiClass: 'ET', scriptName: 'European Terminator', isRtlScript: false };
  }
  if (codePoint === 0x002C || codePoint === 0x002E || codePoint === 0x003A || codePoint === 0x060C) { // , . : ،
    return { bidiClass: 'CS', scriptName: 'Common Separator', isRtlScript: false };
  }

  // Whitespace
  if (codePoint === 0x0020 || codePoint === 0x0009 || codePoint === 0x000A || codePoint === 0x200C) { // space, tab, newline, ZWNJ
    return { bidiClass: 'WS', scriptName: codePoint === 0x200C ? 'Zero-Width Non-Joiner (ZWNJ)' : 'Whitespace', isRtlScript: false };
  }

  // Neutral Punctuation & Brackets (ON)
  if (
    codePoint === 0x0028 || codePoint === 0x0029 || // ( )
    codePoint === 0x005B || codePoint === 0x005D || // [ ]
    codePoint === 0x007B || codePoint === 0x007D || // { }
    codePoint === 0x0021 || codePoint === 0x003F || // ! ?
    codePoint === 0x061F || codePoint === 0x061B    // ؟ ؛
  ) {
    return { bidiClass: 'ON', scriptName: 'Bidi Neutral (Bracket/Punctuation)', isRtlScript: false };
  }

  return { bidiClass: 'ON', scriptName: 'Other Symbol / Neutral', isRtlScript: false };
}

export interface BidiTextInspection {
  totalChars: number;
  rtlCharCount: number;
  ltrCharCount: number;
  neutralCount: number;
  numberCount: number;
  rtlRatio: number;
  detectedPrimaryDirection: 'RTL' | 'LTR' | 'Neutral';
  shouldAutoTriggerRtl: boolean;
  characters: BidiCharacterAnalysis[];
  issuesDetected: string[];
}

export function analyzeBidiText(text: string, thresholdPercent: number = 30): BidiTextInspection {
  if (!text) {
    return {
      totalChars: 0,
      rtlCharCount: 0,
      ltrCharCount: 0,
      neutralCount: 0,
      numberCount: 0,
      rtlRatio: 0,
      detectedPrimaryDirection: 'Neutral',
      shouldAutoTriggerRtl: false,
      characters: [],
      issuesDetected: [],
    };
  }

  const characters: BidiCharacterAnalysis[] = [];
  let rtlCharCount = 0;
  let ltrCharCount = 0;
  let neutralCount = 0;
  let numberCount = 0;

  for (let i = 0; i < text.length; i++) {
    const codePoint = text.codePointAt(i) || 0;
    const { bidiClass, scriptName, isRtlScript } = getBidiClass(codePoint);

    if (isRtlScript) rtlCharCount++;
    else if (bidiClass === 'L') ltrCharCount++;
    else if (bidiClass === 'EN' || bidiClass === 'AN') numberCount++;
    else neutralCount++;

    characters.push({
      char: text[i],
      codePoint,
      hex: 'U+' + codePoint.toString(16).toUpperCase().padStart(4, '0'),
      bidiClass,
      isRtlScript,
      scriptName,
    });
  }

  const strongTotal = rtlCharCount + ltrCharCount;
  const rtlRatio = strongTotal > 0 ? (rtlCharCount / strongTotal) * 100 : (rtlCharCount / text.length) * 100;
  const shouldAutoTriggerRtl = rtlRatio >= thresholdPercent;
  const detectedPrimaryDirection = rtlCharCount > ltrCharCount ? 'RTL' : ltrCharCount > rtlCharCount ? 'LTR' : 'Neutral';

  const issuesDetected: string[] = [];
  // Check for common LTR artifacts
  if (text.includes('(') || text.includes(')')) {
    if (shouldAutoTriggerRtl) {
      issuesDetected.push('Unmirrored parentheses: Without WS_EX_RTLREADING or PFE_RTLPARA, opening bracket "(" will render on left side of Persian phrase.');
    }
  }
  if (text.endsWith('.') || text.endsWith('!') || text.endsWith('؟')) {
    if (shouldAutoTriggerRtl) {
      issuesDetected.push('Trailing punctuation displacement: Period or exclamation will snap to the start of the line under plain LTR alignment.');
    }
  }
  if (numberCount > 0 && rtlCharCount > 0) {
    issuesDetected.push('Mixed phone numbers/versions: Digits need European Number (EN) run isolation to prevent phone parts reversing (e.g. +98-912).');
  }

  return {
    totalChars: text.length,
    rtlCharCount,
    ltrCharCount,
    neutralCount,
    numberCount,
    rtlRatio: Math.round(rtlRatio),
    detectedPrimaryDirection,
    shouldAutoTriggerRtl,
    characters,
    issuesDetected,
  };
}
