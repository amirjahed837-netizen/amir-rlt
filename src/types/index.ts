export type UITechnology =
  | 'Win32'
  | 'RichEdit'
  | 'WinForms_MFC'
  | 'WPF'
  | 'WinUI_UWP'
  | 'Chromium_Electron'
  | 'Qt_Custom'
  | 'Terminal_Console';

export interface FeasibilityRecord {
  id: string;
  technology: string;
  controlsCovered: string[];
  outOfProcessCapabilities: string;
  inProcessRequirements: string;
  hardLimits: string;
  fallbackStrategy: string;
  securityImpact: 'Low' | 'Medium' | 'High';
  successRate: number; // 0-100%
  recommendedAdapter: string;
  keyWin32Apis: string[];
}

export type RtlMode = 'Off' | 'RTL' | 'Auto-detect';

export interface AppRule {
  id: string;
  processName: string;
  windowClass?: string;
  controlClass?: string;
  mode: RtlMode;
  enabled: boolean;
  notes?: string;
}

export interface Win32ControlNode {
  hwnd: string; // e.g. "0x001A0452"
  className: string; // e.g. "Edit", "RICHEDIT50W", "Button"
  controlId: number;
  text: string;
  tech: UITechnology;
  style: number; // e.g. WS_CHILD | WS_VISIBLE | ES_MULTILINE | ES_RIGHT
  exStyle: number; // e.g. WS_EX_CLIENTEDGE | WS_EX_LAYOUTRTL | WS_EX_RTLREADING
  originalStyle: number;
  originalExStyle: number;
  isRtlApplied: boolean;
  isModified: boolean;
  bidiOptions?: number;
  paraFormatAlignment?: 'PFA_LEFT' | 'PFA_RIGHT' | 'PFA_CENTER';
  paraFormatEffects?: number; // PFE_RTLPARA
  children?: Win32ControlNode[];
}

export interface SimulatedProcess {
  pid: number;
  processName: string;
  windowTitle: string;
  mainHwnd: string;
  windowClass: string;
  tech: UITechnology;
  icon: string;
  integrityLevel: 'Low' | 'Medium' | 'High' | 'System';
  isElevated: boolean;
  isExcluded: boolean;
  controls: Win32ControlNode[];
}

export interface ApiCallLog {
  id: string;
  timestamp: string;
  hwnd: string;
  functionName: string;
  parameters: string;
  returnValue: string;
  adapter: string;
  status: 'success' | 'warning' | 'reverted' | 'blocked';
}

export type BidiClass =
  | 'L'   // Left-to-Right
  | 'R'   // Right-to-Left (Hebrew, etc.)
  | 'AL'  // Arabic Letter (Persian, Arabic, Urdu)
  | 'EN'  // European Number
  | 'ES'  // European Separator (+, -)
  | 'ET'  // European Terminator ($, %)
  | 'AN'  // Arabic-Indic Number
  | 'CS'  // Common Separator (comma, colon, period)
  | 'WS'  // Whitespace
  | 'ON'  // Other Neutral (parentheses, brackets, punctuation)
  | 'NSM'; // Nonspacing Mark

export interface BidiCharacterAnalysis {
  char: string;
  codePoint: number;
  hex: string;
  bidiClass: BidiClass;
  isRtlScript: boolean;
  scriptName: string;
}

export interface SourceCodeFile {
  path: string;
  filename: string;
  language: 'csharp' | 'cpp' | 'json' | 'markdown' | 'xml' | 'batch';
  category: 'Core' | 'Adapters' | 'NativeHooks' | 'Services' | 'Safety' | 'Config' | 'Project';
  description: string;
  content: string;
}
