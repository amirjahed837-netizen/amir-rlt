import { FeasibilityRecord } from '../types';

export const FEASIBILITY_DATA: FeasibilityRecord[] = [
  {
    id: 'win32-classic',
    technology: 'Classic Win32 Controls',
    controlsCovered: ['Edit', 'Static', 'ListBox', 'ComboBox', 'Button', 'SysListView32', 'SysTreeView32'],
    outOfProcessCapabilities:
      'SetWindowLongPtr(GWL_EXSTYLE) with WS_EX_LAYOUTRTL, WS_EX_RTLREADING, WS_EX_RIGHT, WS_EX_LEFTSCROLLBAR. Followed by SetWindowPos(SWP_FRAMECHANGED | SWP_NOMOVE | SWP_NOSIZE | SWP_NOZORDER) and InvalidateRect/RedrawWindow. Edit controls accept ES_RIGHT via GWL_STYLE (requires redraw).',
    inProcessRequirements:
      'None for basic controls. However, single-line Edit controls created without ES_MULTILINE ignore runtime ES_RIGHT style changes in Windows 10/11; subclassing via SetWindowSubclass or hook is needed if in-memory buffer reflow is required without destroying and recreating the HWND.',
    hardLimits:
      'Single-line Win32 EDIT ignores dynamic ES_RIGHT style addition after CreateWindowEx without control recreation; WS_EX_LAYOUTRTL mirrors the coordinate space causing visual inversion of glyphs in old GDI apps if font mirroring is unsupported.',
    fallbackStrategy:
      'Apply WS_EX_RTLREADING + WS_EX_RIGHT out-of-process. For stubborn single-line Edits, send EM_SETMARGINS to adjust padding, or trigger clipboard transform / LTR-to-RTL Unicode control characters (RLM U+200F / RLO U+202E injection).',
    securityImpact: 'Low',
    successRate: 94,
    recommendedAdapter: 'Win32Adapter',
    keyWin32Apis: ['SetWindowLongPtr', 'SetWindowPos', 'RedrawWindow', 'InvalidateRect', 'SendMessage(EM_SETMARGINS)']
  },
  {
    id: 'richedit',
    technology: 'RichEdit Controls',
    controlsCovered: ['RICHEDIT50W', 'Msftedit.dll', 'RichEdit20W', 'RichEdit60W (Office/WordPad)'],
    outOfProcessCapabilities:
      'Cross-process SendMessage with EM_SETPARAFORMAT is partially blocked across 32-bit/64-bit address spaces because PARAFORMAT2 struct contains pointer/size offsets. Out-of-process SendMessage(EM_SETBIDIOPTIONS, BOPR_RTL, ...) works across bitness.',
    inProcessRequirements:
      'Required for 100% reliable EM_SETPARAFORMAT (PFA_RIGHT, PFE_RTLPARA) when crossing bitness (32-bit to 64-bit or vice versa). A lightweight DLL injected via SetWindowsHookEx(WH_CALLWNDPROC) allocates PARAFORMAT2 locally inside host memory and invokes RichEdit internal ITextDocument/ITextRange COM interfaces.',
    hardLimits:
      'Microsoft Office Word and Outlook use custom Word RichEdit engines that maintain their own internal document DOM. While EM_SETPARAFORMAT works in WordPad and standard Msftedit, Word overrides raw Win32 messages with Office Ribbon commands.',
    fallbackStrategy:
      'Use EM_SETBIDIOPTIONS out-of-process first. If cross-process pointer marshaling fails, fall back to VirtualAllocEx + WriteProcessMemory to marshal the PARAFORMAT2 struct into the target process memory space without injecting a full DLL.',
    securityImpact: 'Low',
    successRate: 98,
    recommendedAdapter: 'RichEditAdapter',
    keyWin32Apis: ['SendMessage(EM_SETPARAFORMAT)', 'SendMessage(EM_SETBIDIOPTIONS)', 'VirtualAllocEx', 'WriteProcessMemory']
  },
  {
    id: 'winforms-mfc',
    technology: 'WinForms, MFC, Delphi/VCL',
    controlsCovered: ['System.Windows.Forms.Control', 'CWnd / CDialog', 'TWinControl', 'Delphi TEdit/TMemo'],
    outOfProcessCapabilities:
      'These frameworks wrap native Win32 HWNDs under the hood. SetWindowLongPtr(GWL_EXSTYLE) with WS_EX_LAYOUTRTL and WS_EX_RTLREADING succeeds out-of-process on almost all top-level forms and child container controls. WinForms RightToLeft.Yes can also be triggered via UI Automation.',
    inProcessRequirements:
      'Delphi VCL custom components that do their own Canvas.TextOut with hardcoded DT_LEFT require in-process hook or memory patch to redirect DrawTextW flags to DT_RIGHT | DT_RTLREADING.',
    hardLimits:
      'Custom owner-drawn controls in MFC (OnDraw) that compute text X-offset manually (`rect.left + 5`) instead of respecting DT_RIGHT or WS_EX_RTLREADING will render text on the left regardless of window style flags.',
    fallbackStrategy:
      'Enumerate all child HWNDs recursively with EnumChildWindows and apply WS_EX_LAYOUTRTL to containers and WS_EX_RTLREADING to text controls. For owner-drawn controls, use SetWindowsHookEx to hook DrawTextW/ExtTextOutW and inject ETO_RTLREADING.',
    securityImpact: 'Low',
    successRate: 90,
    recommendedAdapter: 'WinFormsMfcAdapter',
    keyWin32Apis: ['EnumChildWindows', 'SetWindowLongPtr', 'SetWindowPos', 'DrawTextW (hook)']
  },
  {
    id: 'wpf',
    technology: 'WPF (Windows Presentation Foundation)',
    controlsCovered: ['HwndWrapper[*]', 'TextBox', 'RichTextBox', 'TextBlock', 'FlowDocumentReader'],
    outOfProcessCapabilities:
      'WPF applications host their entire UI inside a single top-level HWND (HwndWrapper). Standard Win32 child HWNDs DO NOT exist for WPF elements! Out-of-process WS_EX_LAYOUTRTL on the HwndWrapper mirrors the entire rendering surface (including images and icons, which flips them horizontally). UI Automation (UIA) allows setting FlowDirection pattern externally.',
    inProcessRequirements:
      'Setting DependencyProperty FlowDirection = FlowDirection.RightToLeft on specific visual tree elements (TextBox, TextBlock) requires in-process managed code execution or UI Automation ValuePattern / TextPattern.',
    hardLimits:
      'Win32 SetWindowLongPtr on WPF main HWND causes entire window visual mirroring (rendering text backward like looking into a mirror unless DirectX text pipeline handles RTL).',
    fallbackStrategy:
      'Use Windows UI Automation (UIAutomationCore.dll / IUIAutomation) to locate text elements and invoke FlowDirection or TextPattern. Provide an in-process .NET CLR injection helper (RtlWpfHelper.dll) via CreateRemoteThread or SetWindowsHookEx to set FrameworkElement.FlowDirection.',
    securityImpact: 'Medium',
    successRate: 85,
    recommendedAdapter: 'WpfAdapter',
    keyWin32Apis: ['IUIAutomation', 'IUIAutomationElement', 'ValuePattern', 'SetWindowLongPtr(with caution)']
  },
  {
    id: 'uwp-winui',
    technology: 'UWP / WinUI 3 (Windows App SDK)',
    controlsCovered: ['Windows.UI.Core.CoreWindow', 'Microsoft.UI.Xaml.Controls', 'Windows Terminal', 'Settings app'],
    outOfProcessCapabilities:
      'UWP and modern packaged apps run in AppContainer sandboxes. Standard Win32 HWND manipulation is restricted. You cannot inject DLLs into AppContainers without ALL_APPLICATION_PACKAGES permissions. Top-level HWND exists (ApplicationFrameWindow or CoreWindow) but child controls are DirectComposition visuals without HWNDs.',
    inProcessRequirements:
      'In-process injection into AppContainers requires digitally signed DLLs with explicit AppContainer security descriptors and capabilities, which triggers Windows Defender and antimalware scans.',
    hardLimits:
      'Cannot subclass or hook internal DirectWrite text layout engines from external processes without breaking sandboxing or triggering anti-tamper.',
    fallbackStrategy:
      'Use UI Automation (UIA) client which has official OS permission to interact across AppContainer boundaries. Send standard Windows RTL keyboard shortcuts (Right Ctrl+Shift) or inject Unicode Right-to-Left Mark (RLM U+200F) before typed text.',
    securityImpact: 'Low',
    successRate: 78,
    recommendedAdapter: 'WinUiUwpAdapter',
    keyWin32Apis: ['IUIAutomationTreeWalker', 'SendInput(Ctrl+Shift)', 'RLM Unicode Injection']
  },
  {
    id: 'chromium-electron',
    technology: 'Chromium-based Apps & Electron',
    controlsCovered: ['Chrome_WidgetWin_1', 'VS Code', 'Slack', 'Discord', 'Microsoft Teams', 'Spotify', 'Notion'],
    outOfProcessCapabilities:
      'Electron/Chromium apps render via Skia/Blink into a DirectComposition surface. There are zero child Win32 HWNDs for inputs or chat channels. Changing GWL_EXSTYLE on Chrome_WidgetWin_1 does nothing to the internal web page layout.',
    inProcessRequirements:
      'DLL injection into Chromium is actively blocked by Chromium process sandboxing (Renderers run at Untrusted integrity level). Injected code in the browser process cannot touch renderer web DOM directly.',
    hardLimits:
      'Raw Win32 API has zero awareness of HTML DOM or CSS properties (`direction: rtl`, `text-align: right`, `unicode-bidi: bidi-override`).',
    fallbackStrategy:
      'Triple fallback strategy:\n1. Electron apps started with `--remote-debugging-port`: inject CSS stylesheet via Chrome DevTools Protocol (CDP) WebSocket.\n2. Browser extensions (for Chrome/Edge) injecting `* { unicode-bidi: plaintext; }`.\n3. Automatic Right-Ctrl+Shift hotkey emulation via SendInput when focused inside Chrome_RenderWidgetHostHWND.',
    securityImpact: 'Low',
    successRate: 88,
    recommendedAdapter: 'ChromiumAdapter',
    keyWin32Apis: ['CDP WebSocket Proxy', 'SendInput(VK_RCONTROL, VK_RSHIFT)', 'Chrome DevTools Protocol']
  },
  {
    id: 'qt-custom',
    technology: 'Qt, Java Swing & Custom-Drawn UIs',
    controlsCovered: ['QWidget', 'QQuickView', 'SunAwtFrame', 'JTextArea', 'Flutter for Windows', 'Dear ImGui'],
    outOfProcessCapabilities:
      'Qt apps often have only one top-level QWidget HWND. QLineEdit and QTextEdit do not have native HWNDs. WS_EX_LAYOUTRTL on the main window mirrors the Qt coordinate system, which Qt partially recognizes if QApplication::setLayoutDirection is listened to, but often causes clipped widgets.',
    inProcessRequirements:
      'For Qt: Calling `qApp->setLayoutDirection(Qt::RightToLeft)` in-process works flawlessly for the entire application.\nFor Java Swing: `component.applyComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT)`.',
    hardLimits:
      'Pure custom software renderers (Dear ImGui, Blender, game in-game text consoles) render glyphs directly into DirectX/OpenGL/Vulkan texture buffers with fixed X+advance coordinates; OS flags have no effect.',
    fallbackStrategy:
      'For Qt apps (e.g. Telegram Desktop): Send `Ctrl+Shift+X` (Telegram built-in RTL shortcut) or inject Unicode RLM prefix. For Java: UI Automation Java Access Bridge. Documented manual shortcut guide for proprietary graphics engines.',
    securityImpact: 'Medium',
    successRate: 72,
    recommendedAdapter: 'CustomUiAdapter',
    keyWin32Apis: ['Java Access Bridge', 'SendInput(Application-specific hotkeys)', 'SetWindowsHookEx']
  },
  {
    id: 'terminal-console',
    technology: 'Terminal & Console Windows',
    controlsCovered: ['ConsoleWindowClass (conhost.exe)', 'CASCADIA_HOSTING_WINDOW_CLASS (Windows Terminal)', 'PowerShell', 'CMD'],
    outOfProcessCapabilities:
      'Classic conhost.exe uses legacy console buffer architecture without native RTL text shaping (causes disconnected Persian/Arabic letters). Windows Terminal uses DirectWrite text layout engine which has modern complex text shaping and bidi support.',
    inProcessRequirements:
      'Not recommended. conhost is a protected system binary in Windows 10/11; injecting into it triggers security warnings.',
    hardLimits:
      'Classic CMD / conhost console buffer stores monospaced cell grid; RTL text without bidi shaping renders reversed and disconnected (e.g. "ی س ر ا ف" instead of "فارسی").',
    fallbackStrategy:
      'Recommend user switch to Windows Terminal (which natively shapes Persian/Arabic with Cascadia Code / Vazirmatn font). Send escape sequences or configure Terminal JSON settings for RTL profile.',
    securityImpact: 'Low',
    successRate: 65,
    recommendedAdapter: 'TerminalAdapter',
    keyWin32Apis: ['SetConsoleOutputCP(65001)', 'Windows Terminal Settings JSON Bridge']
  }
];
