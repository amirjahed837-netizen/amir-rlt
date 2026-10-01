import { ApiCallLog, SimulatedProcess, Win32ControlNode } from '../types';
import { WIN32_FLAGS } from '../data/initialProcesses';

export interface ApplyRtlResult {
  success: boolean;
  message: string;
  logs: ApiCallLog[];
  modifiedHwnds: string[];
}

export interface RevertResult {
  success: boolean;
  revertedCount: number;
  elapsedMs: number;
  logs: ApiCallLog[];
}

export class Win32SimEngine {
  private processes: SimulatedProcess[];
  private logs: ApiCallLog[] = [];
  private modifiedHwndHistory: Set<string> = new Set();
  private isElevatedHelperRunning: boolean = false;
  private customExcludedProcesses: Set<string> = new Set([
    'csrss.exe',
    'winlogon.exe',
    'lsass.exe',
    'services.exe',
    'vgc.exe',
    'EasyAntiCheat.exe',
    '1password.exe',
    'keepass.exe',
    'steam.exe',
  ]);

  constructor(initialProcesses: SimulatedProcess[]) {
    this.processes = JSON.parse(JSON.stringify(initialProcesses));
  }

  public getProcesses(): SimulatedProcess[] {
    return this.processes;
  }

  public getLogs(): ApiCallLog[] {
    return this.logs;
  }

  public setElevatedHelper(enabled: boolean) {
    this.isElevatedHelperRunning = enabled;
  }

  public isElevatedHelperActive(): boolean {
    return this.isElevatedHelperRunning;
  }

  public getExcludedProcesses(): string[] {
    return Array.from(this.customExcludedProcesses);
  }

  public addExclusion(processName: string) {
    this.customExcludedProcesses.add(processName.toLowerCase());
  }

  public removeExclusion(processName: string) {
    this.customExcludedProcesses.delete(processName.toLowerCase());
  }

  private addLog(
    hwnd: string,
    functionName: string,
    parameters: string,
    returnValue: string,
    adapter: string,
    status: 'success' | 'warning' | 'reverted' | 'blocked' = 'success'
  ): ApiCallLog {
    const log: ApiCallLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString().substring(11, 23),
      hwnd,
      functionName,
      parameters,
      returnValue,
      adapter,
      status,
    };
    this.logs.unshift(log);
    if (this.logs.length > 200) this.logs.pop();
    return log;
  }

  /**
   * Apply RTL to a specific window or its controls
   */
  public applyRtlToProcess(pid: number): ApplyRtlResult {
    const proc = this.processes.find((p) => p.pid === pid);
    if (!proc) {
      return { success: false, message: 'Process not found', logs: [], modifiedHwnds: [] };
    }

    // Safety checks
    if (this.customExcludedProcesses.has(proc.processName.toLowerCase()) || proc.isExcluded) {
      const blockedLog = this.addLog(
        proc.mainHwnd,
        'ProcessSecurityGuard.VerifyAccess',
        `PID=${proc.pid}, Image="${proc.processName}"`,
        'ACCESS_DENIED (Blacklisted System/Security Process)',
        'SecurityGuard',
        'blocked'
      );
      return {
        success: false,
        message: `Safety violation: Process "${proc.processName}" is in the security exclusion blacklist. Modifications blocked.`,
        logs: [blockedLog],
        modifiedHwnds: [],
      };
    }

    if (proc.isElevated && !this.isElevatedHelperRunning) {
      const uipiLog = this.addLog(
        proc.mainHwnd,
        'SetWindowLongPtrW',
        `HWND=${proc.mainHwnd}, nIndex=GWL_EXSTYLE`,
        'ERROR_ACCESS_DENIED (UIPI Integrity Level Mismatch)',
        'Win32Adapter',
        'blocked'
      );
      return {
        success: false,
        message: `UIPI Block: Process "${proc.processName}" runs with High integrity. Enable the RastNegar Elevated Helper daemon to bypass UIPI safely.`,
        logs: [uipiLog],
        modifiedHwnds: [],
      };
    }

    const appliedLogs: ApiCallLog[] = [];
    const modifiedHwnds: string[] = [];

    // Top level window apply
    if (proc.tech === 'Win32' || proc.tech === 'WinForms_MFC') {
      appliedLogs.push(
        this.addLog(
          proc.mainHwnd,
          'SetWindowLongPtrW',
          `HWND=${proc.mainHwnd}, GWL_EXSTYLE, dwNewLong=0x00402000 (WS_EX_LAYOUTRTL | WS_EX_RTLREADING)`,
          '0x00000000 (PrevStyle)',
          'Win32Adapter'
        )
      );
      appliedLogs.push(
        this.addLog(
          proc.mainHwnd,
          'SetWindowPos',
          `HWND=${proc.mainHwnd}, NULL, 0,0,0,0, SWP_NOMOVE | SWP_NOSIZE | SWP_NOZORDER | SWP_FRAMECHANGED`,
          'TRUE',
          'Win32Adapter'
        )
      );
      appliedLogs.push(
        this.addLog(
          proc.mainHwnd,
          'RedrawWindow',
          `HWND=${proc.mainHwnd}, NULL, NULL, RDW_INVALIDATE | RDW_UPDATENOW | RDW_ALLCHILDREN`,
          'TRUE',
          'Win32Adapter'
        )
      );
      this.modifiedHwndHistory.add(proc.mainHwnd);
      modifiedHwnds.push(proc.mainHwnd);
    }

    // Child controls apply
    for (const control of proc.controls) {
      const ctrlResult = this.applyRtlToControl(proc, control);
      appliedLogs.push(...ctrlResult.logs);
      modifiedHwnds.push(...ctrlResult.modifiedHwnds);
    }

    return {
      success: true,
      message: `RTL layout successfully applied to "${proc.windowTitle}" (${modifiedHwnds.length} HWND handles updated).`,
      logs: appliedLogs,
      modifiedHwnds,
    };
  }

  public applyRtlToControl(proc: SimulatedProcess, control: Win32ControlNode): { logs: ApiCallLog[]; modifiedHwnds: string[] } {
    const logs: ApiCallLog[] = [];

    if (control.tech === 'Win32' || control.tech === 'WinForms_MFC') {
      // Apply WS_EX_RTLREADING and WS_EX_RIGHT
      control.exStyle = control.exStyle | WIN32_FLAGS.WS_EX_RTLREADING | WIN32_FLAGS.WS_EX_RIGHT;
      control.style = control.style | WIN32_FLAGS.ES_RIGHT;
      control.isRtlApplied = true;
      control.isModified = true;

      logs.push(
        this.addLog(
          control.hwnd,
          'SetWindowLongPtrW',
          `HWND=${control.hwnd}, GWL_EXSTYLE, 0x${control.exStyle.toString(16).toUpperCase()}`,
          `0x${control.originalExStyle.toString(16).toUpperCase()}`,
          'Win32Adapter'
        )
      );
      logs.push(
        this.addLog(
          control.hwnd,
          'SetWindowPos',
          `HWND=${control.hwnd}, NULL, 0,0,0,0, SWP_FRAMECHANGED`,
          'TRUE',
          'Win32Adapter'
        )
      );
      logs.push(
        this.addLog(
          control.hwnd,
          'InvalidateRect',
          `HWND=${control.hwnd}, lpRect=NULL, bErase=TRUE`,
          'TRUE',
          'Win32Adapter'
        )
      );
      this.modifiedHwndHistory.add(control.hwnd);
    } else if (control.tech === 'RichEdit') {
      control.isRtlApplied = true;
      control.isModified = true;
      control.paraFormatAlignment = 'PFA_RIGHT';
      control.paraFormatEffects = WIN32_FLAGS.PFE_RTLPARA;
      control.bidiOptions = WIN32_FLAGS.BOPR_RTL;

      logs.push(
        this.addLog(
          control.hwnd,
          'SendMessageW',
          `HWND=${control.hwnd}, Msg=EM_SETBIDIOPTIONS, wParam=0, lParam=BOPR_RTL (0x01)`,
          '1 (Success)',
          'RichEditAdapter'
        )
      );
      logs.push(
        this.addLog(
          control.hwnd,
          'SendMessageW',
          `HWND=${control.hwnd}, Msg=EM_SETPARAFORMAT, wParam=0, &PARAFORMAT2{wAlignment=PFA_RIGHT, dwEffects=PFE_RTLPARA}`,
          '1 (Success)',
          'RichEditAdapter'
        )
      );
      this.modifiedHwndHistory.add(control.hwnd);
    } else if (control.tech === 'WPF') {
      control.isRtlApplied = true;
      control.isModified = true;

      logs.push(
        this.addLog(
          control.hwnd,
          'IUIAutomationElement::GetCurrentPattern',
          `UIA_ValuePatternId / FlowDirectionProperty`,
          'S_OK',
          'WpfAdapter'
        )
      );
      logs.push(
        this.addLog(
          control.hwnd,
          'FrameworkElement.FlowDirection',
          `Target="FlowDirection.RightToLeft"`,
          'Updated in VisualTree',
          'WpfAdapter'
        )
      );
      this.modifiedHwndHistory.add(control.hwnd);
    } else if (control.tech === 'Chromium_Electron') {
      control.isRtlApplied = true;
      control.isModified = true;

      logs.push(
        this.addLog(
          control.hwnd,
          'ChromeDevToolsProtocol.CSS.inject',
          `Rule: *[contenteditable], input, textarea { direction: rtl !important; text-align: right !important; }`,
          'HTTP 200 / WebSocket ACK',
          'ChromiumAdapter'
        )
      );
      logs.push(
        this.addLog(
          control.hwnd,
          'SendInput',
          `VirtualKey: VK_RCONTROL + VK_RSHIFT (Windows Native BiDi Toggle)`,
          'Keys Dispatched',
          'ChromiumAdapter'
        )
      );
      this.modifiedHwndHistory.add(control.hwnd);
    } else if (control.tech === 'Terminal_Console') {
      control.isRtlApplied = true;
      control.isModified = true;

      logs.push(
        this.addLog(
          control.hwnd,
          'DirectWrite.SetReadingDirection',
          `DWRITE_READING_DIRECTION_RIGHT_TO_LEFT`,
          'DirectWrite Layout Reflowed',
          'TerminalAdapter'
        )
      );
      this.modifiedHwndHistory.add(control.hwnd);
    }

    return { logs, modifiedHwnds: [control.hwnd] };
  }

  /**
   * Revert a single process to original state
   */
  public revertProcess(pid: number): RevertResult {
    const start = performance.now();
    const proc = this.processes.find((p) => p.pid === pid);
    if (!proc) return { success: false, revertedCount: 0, elapsedMs: 0, logs: [] };

    const logs: ApiCallLog[] = [];
    let count = 0;

    for (const control of proc.controls) {
      if (control.isModified) {
        control.style = control.originalStyle;
        control.exStyle = control.originalExStyle;
        control.isRtlApplied = false;
        control.isModified = false;
        if (control.paraFormatAlignment) control.paraFormatAlignment = 'PFA_LEFT';
        if (control.paraFormatEffects) control.paraFormatEffects = 0;
        if (control.bidiOptions) control.bidiOptions = WIN32_FLAGS.BOPR_LTR;

        logs.push(
          this.addLog(
            control.hwnd,
            'RollbackState (SetWindowLongPtrW / SendMessage)',
            `Restored to Original: Style=0x${control.originalStyle.toString(16)}, ExStyle=0x${control.originalExStyle.toString(16)}`,
            'SUCCESS',
            'Engine.Rollback',
            'reverted'
          )
        );
        this.modifiedHwndHistory.delete(control.hwnd);
        count++;
      }
    }

    const elapsedMs = Math.round((performance.now() - start) * 100) / 100;
    return { success: true, revertedCount: count, elapsedMs, logs };
  }

  /**
   * KILL SWITCH: Immediately pause and restore ALL modified windows
   * Must execute and revert every window in under 2 seconds (tested here).
   */
  public killSwitchRestoreAll(): RevertResult {
    const start = performance.now();
    const logs: ApiCallLog[] = [];
    let revertedCount = 0;

    for (const proc of this.processes) {
      for (const ctrl of proc.controls) {
        if (ctrl.isModified) {
          ctrl.style = ctrl.originalStyle;
          ctrl.exStyle = ctrl.originalExStyle;
          ctrl.isRtlApplied = false;
          ctrl.isModified = false;
          if (ctrl.paraFormatAlignment) ctrl.paraFormatAlignment = 'PFA_LEFT';
          if (ctrl.paraFormatEffects) ctrl.paraFormatEffects = 0;
          if (ctrl.bidiOptions) ctrl.bidiOptions = WIN32_FLAGS.BOPR_LTR;

          revertedCount++;
        }
      }
    }

    const elapsedMs = Math.round((performance.now() - start) * 100) / 100;
    const summaryLog = this.addLog(
      'SYSTEM_WIDE',
      'Engine.EmergencyKillSwitch',
      `Restored ${revertedCount} handles to original Win32/UIA geometry. Elapsed=${elapsedMs}ms`,
      'RESTORE_ALL_COMPLETED',
      'Engine.Safety',
      'reverted'
    );
    logs.push(summaryLog);
    this.modifiedHwndHistory.clear();

    return {
      success: true,
      revertedCount,
      elapsedMs,
      logs,
    };
  }
}
