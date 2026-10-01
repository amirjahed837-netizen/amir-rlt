/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Win32SimEngine } from './engine/win32SimEngine';
import { INITIAL_PROCESSES } from './data/initialProcesses';
import { Navbar } from './components/Navbar';
import { FeasibilityView } from './components/FeasibilityView';
import { SimulatorView } from './components/SimulatorView';
import { BidiSandboxView } from './components/BidiSandboxView';
import { SettingsWindow } from './components/SettingsWindow';
import { CodeStudioView } from './components/CodeStudioView';
import { TrayMenu } from './components/TrayMenu';

export default function App() {
  const engine = useMemo(() => new Win32SimEngine(INITIAL_PROCESSES), []);
  const [activeTab, setActiveTab] = useState<'feasibility' | 'simulator' | 'bidi' | 'settings' | 'code'>('feasibility');
  const [isPaused, setIsPaused] = useState(false);
  const [lastKillTimeMs, setLastKillTimeMs] = useState<number | null>(null);
  const [isTrayOpen, setIsTrayOpen] = useState(false);
  const [, setTick] = useState(0);

  const forceRefresh = () => setTick((t) => t + 1);

  const handleKillSwitch = () => {
    const result = engine.killSwitchRestoreAll();
    setIsPaused(true);
    setLastKillTimeMs(result.elapsedMs);
    forceRefresh();
  };

  const handleResume = () => {
    setIsPaused(false);
    forceRefresh();
  };

  const handleToggleActiveWindow = () => {
    // Toggle active window (e.g. process pid 4892 Notepad)
    const procs = engine.getProcesses();
    const active = procs[0];
    if (active) {
      if (active.controls.some((c) => c.isModified)) {
        engine.revertProcess(active.pid);
      } else {
        engine.applyRtlToProcess(active.pid);
      }
      forceRefresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Bar following Top Bar Contract */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isPaused={isPaused}
        onKillSwitch={handleKillSwitch}
        onResume={handleResume}
        lastKillTimeMs={lastKillTimeMs}
        onToggleTray={() => setIsTrayOpen(!isTrayOpen)}
        isTrayOpen={isTrayOpen}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 pb-16">
        {activeTab === 'feasibility' && <FeasibilityView />}
        {activeTab === 'simulator' && (
          <SimulatorView
            engine={engine}
            processes={engine.getProcesses()}
            logs={engine.getLogs()}
            onRefresh={forceRefresh}
          />
        )}
        {activeTab === 'bidi' && <BidiSandboxView />}
        {activeTab === 'settings' && <SettingsWindow engine={engine} onRefresh={forceRefresh} />}
        {activeTab === 'code' && <CodeStudioView />}
      </main>

      {/* Windows 11 Taskbar Tray Menu Companion */}
      <TrayMenu
        isOpen={isTrayOpen}
        onClose={() => setIsTrayOpen(false)}
        isPaused={isPaused}
        onToggleActive={handleToggleActiveWindow}
        onKillSwitch={handleKillSwitch}
        onResume={handleResume}
        onOpenSettings={() => setActiveTab('settings')}
      />

      {/* Footer following Anti-Slop Guidelines */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/80 px-4 lg:px-8 py-4 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-400">RastNegar (راست‌نگار)</span>
          <span aria-hidden="true">·</span>
          <span>Zero Telemetry · Pure Local Win32/UIA</span>
          <span aria-hidden="true">·</span>
          <span>Windows 10/11 x64, x86 & ARM64</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <button
            onClick={() => setActiveTab('feasibility')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Step 0 Feasibility
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Export .NET 8 Project
          </button>
        </div>
      </footer>
    </div>
  );
}
