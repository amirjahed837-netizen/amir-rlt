import React, { useState } from 'react';
import { SimulatedProcess, Win32ControlNode, ApiCallLog } from '../types';
import { Win32SimEngine } from '../engine/win32SimEngine';
import { WIN32_FLAGS } from '../data/initialProcesses';
import {
  AppWindow,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Shield,
  Activity,
  Maximize2,
  Terminal,
  FileText,
  FileSpreadsheet,
  Database,
  LineChart,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

interface SimulatorViewProps {
  engine: Win32SimEngine;
  processes: SimulatedProcess[];
  logs: ApiCallLog[];
  onRefresh: () => void;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({
  engine,
  processes,
  logs,
  onRefresh,
}) => {
  const [selectedPid, setSelectedPid] = useState<number>(4892); // Default: Notepad
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const selectedProcess = processes.find((p) => p.pid === selectedPid) || processes[0];

  const getProcessIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText': return <FileText className="w-4 h-4 text-cyan-400" />;
      case 'FileSpreadsheet': return <FileSpreadsheet className="w-4 h-4 text-emerald-400" />;
      case 'Database': return <Database className="w-4 h-4 text-amber-400" />;
      case 'LineChart': return <LineChart className="w-4 h-4 text-indigo-400" />;
      case 'MessageSquare': return <MessageSquare className="w-4 h-4 text-purple-400" />;
      case 'Terminal': return <Terminal className="w-4 h-4 text-slate-300" />;
      case 'ShieldAlert': return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      default: return <AppWindow className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleApplyRtl = (pid: number) => {
    const result = engine.applyRtlToProcess(pid);
    setFeedbackMessage(result.message);
    onRefresh();
  };

  const handleRevert = (pid: number) => {
    const result = engine.revertProcess(pid);
    if (result.success) {
      setFeedbackMessage(`Reverted ${result.revertedCount} window handles to original state (${result.elapsedMs}ms).`);
    } else {
      setFeedbackMessage('Failed to revert window.');
    }
    onRefresh();
  };

  const handleTextChange = (ctrl: Win32ControlNode, newText: string) => {
    ctrl.text = newText;
    onRefresh();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono tracking-wider uppercase">
            <span>Live Window Inspector</span>
            <span aria-hidden="true">·</span>
            <span>WinEvent Foreground Hooks</span>
            <span aria-hidden="true">·</span>
            <span>Real-Time Bitmask Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Active Windows & Control Tree Inspector
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Inspect real Win32 window structures across diverse frameworks. Trigger out-of-process style modification,
            inspect hexadecimal bitmask transformations in real-time, and test instant undo restoration.
          </p>
        </div>

        {feedbackMessage && (
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-cyan-300">
            <CheckCircle className="w-4 h-4 shrink-0 text-cyan-400" />
            <span>{feedbackMessage}</span>
          </div>
        )}
      </div>

      {/* Main Grid: Left Process Selector / Right Inspector & Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Process List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-medium">
            <span>Running Processes ({processes.length})</span>
            <span className="font-mono text-[11px]">EVENT_SYSTEM_FOREGROUND</span>
          </div>

          <div className="space-y-2">
            {processes.map((proc) => {
              const isSelected = proc.pid === selectedPid;
              const hasModified = proc.controls.some((c) => c.isModified);

              return (
                <div
                  key={proc.pid}
                  onClick={() => {
                    setSelectedPid(proc.pid);
                    setFeedbackMessage(null);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900/90 border-cyan-500/50 shadow-md shadow-cyan-950/20'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                        {getProcessIcon(proc.icon)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">{proc.processName}</span>
                          <span className="text-[10px] font-mono text-slate-500">PID {proc.pid}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 truncate max-w-[180px] block">
                          {proc.windowTitle}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {proc.isExcluded ? (
                        <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/40">
                          Excluded
                        </span>
                      ) : hasModified ? (
                        <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                          RTL Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          LTR Default
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-slate-500">{proc.tech}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Window Simulator & Bitmask Inspector (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {selectedProcess && (
            <div className="border border-slate-800 rounded-xl bg-slate-900/40 overflow-hidden">
              {/* Simulated Window Title Bar */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  {getProcessIcon(selectedProcess.icon)}
                  <span className="font-medium text-slate-200 truncate max-w-sm">
                    {selectedProcess.windowTitle}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    HWND: {selectedProcess.mainHwnd}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {selectedProcess.isExcluded ? (
                    <span className="text-[11px] text-rose-400 font-medium">Protected Process</span>
                  ) : (
                    <>
                      <button
                        onClick={() => handleApplyRtl(selectedProcess.pid)}
                        className="px-2.5 py-1 text-xs font-medium text-cyan-300 bg-cyan-950 border border-cyan-800/50 rounded-md hover:bg-cyan-900 transition-colors cursor-pointer"
                      >
                        Apply RTL [Ctrl+Alt+R]
                      </button>
                      <button
                        onClick={() => handleRevert(selectedProcess.pid)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-400 bg-slate-800 hover:text-white rounded-md transition-colors cursor-pointer"
                        title="Revert to original window styles"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Revert</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Window Content Canvas Simulation */}
              <div className="p-5 space-y-6 bg-slate-950/70">
                {selectedProcess.isExcluded ? (
                  <div className="py-12 text-center space-y-2">
                    <ShieldAlert className="w-8 h-8 text-rose-400 mx-auto" />
                    <h3 className="text-sm font-semibold text-white">System Critical Subsystem</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      csrss.exe and core Windows subsystems are permanently blacklisted to maintain OS stability and anti-tamper compliance.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Controls rendering */}
                    {selectedProcess.controls.map((ctrl) => {
                      const isRtl = ctrl.isRtlApplied;

                      return (
                        <div key={ctrl.hwnd} className="space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-300">Control HWND: {ctrl.hwnd}</span>
                              <span className="text-[11px] font-mono text-cyan-400">Class: {ctrl.className}</span>
                            </div>
                            <span className="text-[11px] text-slate-500 font-mono">
                              Direction: {isRtl ? 'Right-to-Left (RTL)' : 'Left-to-Right (LTR)'}
                            </span>
                          </div>

                          {/* Editable Mock Window Canvas */}
                          <div
                            className={`p-4 rounded-lg border transition-all ${
                              isRtl
                                ? 'bg-slate-900/80 border-cyan-500/40 text-right'
                                : 'bg-slate-900/30 border-slate-800 text-left'
                            }`}
                            dir={isRtl ? 'rtl' : 'ltr'}
                          >
                            <label className="block text-[11px] font-mono text-slate-500 mb-1">
                              Simulated Control Viewport ({ctrl.className}):
                            </label>
                            <textarea
                              value={ctrl.text}
                              onChange={(e) => handleTextChange(ctrl, e.target.value)}
                              rows={3}
                              className={`w-full bg-slate-950/90 border border-slate-800 rounded-md p-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-all font-persian ${
                                isRtl ? 'text-right' : 'text-left'
                              }`}
                              placeholder="Type Persian, Arabic, or English text here..."
                            />
                            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                              <span>
                                {isRtl ? '✓ WS_EX_RTLREADING + WS_EX_RIGHT active' : '⚠ Standard LTR mode (unmirrored punctuation)'}
                              </span>
                              <span className="font-mono text-slate-500">
                                {ctrl.text.length} chars
                              </span>
                            </div>
                          </div>

                          {/* Bitmask Hex Inspector */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 space-y-1">
                              <div className="text-[11px] text-slate-400 font-mono">GWL_STYLE Bitmask:</div>
                              <div className="font-mono font-bold text-cyan-300 text-sm">
                                0x{ctrl.style.toString(16).toUpperCase().padStart(8, '0')}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                {ctrl.style & WIN32_FLAGS.ES_RIGHT ? 'ES_RIGHT | ' : ''}
                                {ctrl.style & WIN32_FLAGS.ES_MULTILINE ? 'ES_MULTILINE | ' : ''}
                                WS_CHILD | WS_VISIBLE
                              </div>
                            </div>

                            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 space-y-1">
                              <div className="text-[11px] text-slate-400 font-mono">GWL_EXSTYLE Bitmask:</div>
                              <div className="font-mono font-bold text-emerald-300 text-sm">
                                0x{ctrl.exStyle.toString(16).toUpperCase().padStart(8, '0')}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                {ctrl.exStyle & WIN32_FLAGS.WS_EX_RTLREADING ? 'WS_EX_RTLREADING | ' : ''}
                                {ctrl.exStyle & WIN32_FLAGS.WS_EX_RIGHT ? 'WS_EX_RIGHT | ' : ''}
                                {ctrl.exStyle & WIN32_FLAGS.WS_EX_LAYOUTRTL ? 'WS_EX_LAYOUTRTL | ' : ''}
                                {ctrl.exStyle & WIN32_FLAGS.WS_EX_CLIENTEDGE ? 'WS_EX_CLIENTEDGE' : '0x0'}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Win32 API Execution Trace Stream */}
          <div className="border border-slate-800 rounded-xl bg-slate-900/40 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Win32 API Execution Trace (Zero Polling, Event-Driven)</span>
              </div>
              <span className="font-mono text-[11px]">{logs.length} Operations Logged</span>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 font-mono text-[11px]">
              {logs.length === 0 ? (
                <div className="text-slate-500 text-center py-4">No API calls dispatched yet. Click "Apply RTL" above.</div>
              ) : (
                logs.slice(0, 10).map((log) => (
                  <div
                    key={log.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2 rounded bg-slate-950/80 border border-slate-800/70"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-slate-500">{log.timestamp}</span>
                      <span className="text-cyan-400 font-semibold">{log.functionName}</span>
                      <span className="text-slate-300 truncate">{log.parameters}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] ${
                          log.status === 'success'
                            ? 'bg-emerald-950 text-emerald-400'
                            : log.status === 'blocked'
                            ? 'bg-rose-950 text-rose-400'
                            : 'bg-amber-950 text-amber-400'
                        }`}
                      >
                        {log.returnValue}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
