import React from 'react';
import { PauseCircle, PlayCircle, Settings, Power, RotateCcw, ShieldCheck, Check } from 'lucide-react';

interface TrayMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isPaused: boolean;
  onToggleActive: () => void;
  onKillSwitch: () => void;
  onResume: () => void;
  onOpenSettings: () => void;
}

export const TrayMenu: React.FC<TrayMenuProps> = ({
  isOpen,
  onClose,
  isPaused,
  onToggleActive,
  onKillSwitch,
  onResume,
  onOpenSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-72 bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-2xl shadow-black/80 backdrop-blur-md overflow-hidden text-xs text-slate-200">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-bold text-white tracking-wide">RastNegar راست‌نگار</span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors cursor-pointer text-sm"
        >
          ✕
        </button>
      </div>

      {/* Menu Actions */}
      <div className="p-2 space-y-1">
        <button
          onClick={() => {
            onToggleActive();
            onClose();
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800/80 transition-colors text-left cursor-pointer"
        >
          <span className="font-medium text-white">Toggle Active Window</span>
          <span className="font-mono text-[10px] text-cyan-400">Ctrl+Alt+R</span>
        </button>

        {isPaused ? (
          <button
            onClick={() => {
              onResume();
              onClose();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-emerald-950/60 text-emerald-400 transition-colors text-left cursor-pointer"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Resume RTL Engine</span>
          </button>
        ) : (
          <button
            onClick={() => {
              onKillSwitch();
              onClose();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-rose-950/60 text-rose-300 transition-colors text-left cursor-pointer"
          >
            <PauseCircle className="w-4 h-4" />
            <span>Pause & Restore All Windows</span>
          </button>
        )}

        <div className="h-px bg-slate-800 my-1" />

        <div className="px-3 py-1.5 flex items-center justify-between text-slate-400 text-[11px]">
          <span>Per-App Mode:</span>
          <span className="text-cyan-400 font-semibold">Auto-Detect (UAX #9)</span>
        </div>

        <button
          onClick={() => {
            onOpenSettings();
            onClose();
          }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-left text-slate-300 cursor-pointer"
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Open Settings...</span>
        </button>

        <div className="h-px bg-slate-800 my-1" />

        <div className="px-3 py-1 text-[10px] text-slate-500 flex items-center justify-between">
          <span>Memory Footprint:</span>
          <span className="font-mono tabular-nums text-slate-400">18.4 MB (0.0% CPU)</span>
        </div>
      </div>
    </div>
  );
};
