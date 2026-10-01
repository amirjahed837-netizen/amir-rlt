import React from 'react';
import { ShieldAlert, PauseCircle, PlayCircle, AppWindow, FileCode2, Binary, Sliders, Languages } from 'lucide-react';

interface NavbarProps {
  activeTab: 'feasibility' | 'simulator' | 'bidi' | 'settings' | 'code';
  setActiveTab: (tab: 'feasibility' | 'simulator' | 'bidi' | 'settings' | 'code') => void;
  isPaused: boolean;
  onKillSwitch: () => void;
  onResume: () => void;
  lastKillTimeMs: number | null;
  onToggleTray: () => void;
  isTrayOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isPaused,
  onKillSwitch,
  onResume,
  lastKillTimeMs,
  onToggleTray,
  isTrayOpen,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 lg:px-8 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('simulator')}
            className="text-left group cursor-pointer focus:outline-none"
          >
            <span className="text-lg font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
              RastNegar <span className="text-cyan-400 font-persian font-normal mr-1">راست‌نگار</span>
            </span>
          </button>
          <span className="hidden sm:inline text-xs text-slate-500 border-l border-slate-800 pl-3">
            v2.6 Win32 / UIA RTL Engine
          </span>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => setActiveTab('feasibility')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'feasibility'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Feasibility Matrix
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'simulator'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Win32 Simulator & HWND Tree
          </button>

          <button
            onClick={() => setActiveTab('bidi')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'bidi'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Bidi & Script Sandbox
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'settings'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            WinUI Settings & UIPI
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'code'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            C# & C++ Source Studio
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2">
          {/* Emergency Kill Switch Button */}
          {isPaused ? (
            <button
              onClick={onResume}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/80 border border-emerald-700/50 rounded-lg hover:bg-emerald-900/80 transition-colors whitespace-nowrap cursor-pointer"
              title="Resume RTL Engine"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Resume Engine</span>
            </button>
          ) : (
            <button
              onClick={onKillSwitch}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-300 bg-rose-950/80 border border-rose-700/50 rounded-lg hover:bg-rose-900/80 transition-colors whitespace-nowrap cursor-pointer"
              title="Pause and instantly restore all modified windows in under 2 seconds"
            >
              <PauseCircle className="w-3.5 h-3.5" />
              <span>Kill Switch: Pause & Restore</span>
            </button>
          )}

          {lastKillTimeMs !== null && (
            <span className="hidden xl:inline text-[11px] font-mono tabular-nums text-slate-400">
              Restored in {lastKillTimeMs}ms
            </span>
          )}

          {/* Tray Companion Button */}
          <button
            onClick={onToggleTray}
            className={`p-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              isTrayOpen
                ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Toggle Windows 11 System Tray & Taskbar Companion"
          >
            <AppWindow className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
