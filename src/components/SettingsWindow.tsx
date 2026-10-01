import React, { useState } from 'react';
import { AppRule, RtlMode } from '../types';
import { Win32SimEngine } from '../engine/win32SimEngine';
import {
  Settings,
  Shield,
  Keyboard,
  Sliders,
  Plus,
  Trash2,
  Check,
  Languages,
  SunMoon,
  Laptop,
  AlertTriangle,
  FolderOpen,
  FileCode,
  Lock
} from 'lucide-react';

interface SettingsWindowProps {
  engine: Win32SimEngine;
  onRefresh: () => void;
}

export const SettingsWindow: React.FC<SettingsWindowProps> = ({ engine, onRefresh }) => {
  const [language, setLanguage] = useState<'en' | 'fa'>('en');
  const [theme, setTheme] = useState<'system' | 'dark' | 'light'>('dark');
  const [hotkey, setHotkey] = useState('Ctrl + Alt + R');
  const [isRecordingHotkey, setIsRecordingHotkey] = useState(false);
  const [startWithWindows, setStartWithWindows] = useState(true);
  const [startupMethod, setStartupMethod] = useState<'hkcu' | 'taskscheduler'>('hkcu');
  const [debugLogs, setDebugLogs] = useState(true);

  // App Rules state
  const [appRules, setAppRules] = useState<AppRule[]>([
    { id: '1', processName: 'notepad.exe', windowClass: 'Notepad', controlClass: 'Edit', mode: 'Auto-detect', enabled: true },
    { id: '2', processName: 'wordpad.exe', windowClass: 'WordPadClass', controlClass: 'RICHEDIT50W', mode: 'RTL', enabled: true },
    { id: '3', processName: 'slack.exe', windowClass: 'Chrome_WidgetWin_1', mode: 'Auto-detect', enabled: true },
    { id: '4', processName: 'devenv.exe', windowClass: 'HwndWrapper[*]', mode: 'Off', enabled: true },
  ]);

  const [newProcessName, setNewProcessName] = useState('');
  const [newMode, setNewMode] = useState<RtlMode>('Auto-detect');

  // Exclusion list state
  const [excludedProcesses, setExcludedProcesses] = useState<string[]>(engine.getExcludedProcesses());
  const [newExclusion, setNewExclusion] = useState('');

  const isPersian = language === 'fa';

  const handleAddRule = () => {
    if (!newProcessName.trim()) return;
    const rule: AppRule = {
      id: Math.random().toString(36).substring(2, 9),
      processName: newProcessName.trim().toLowerCase(),
      mode: newMode,
      enabled: true,
    };
    setAppRules([...appRules, rule]);
    setNewProcessName('');
  };

  const handleDeleteRule = (id: string) => {
    setAppRules(appRules.filter((r) => r.id !== id));
  };

  const handleAddExclusion = () => {
    if (!newExclusion.trim()) return;
    engine.addExclusion(newExclusion.trim());
    setExcludedProcesses(engine.getExcludedProcesses());
    setNewExclusion('');
    onRefresh();
  };

  const handleRemoveExclusion = (name: string) => {
    engine.removeExclusion(name);
    setExcludedProcesses(engine.getExcludedProcesses());
    onRefresh();
  };

  const handleToggleElevatedHelper = () => {
    engine.setElevatedHelper(!engine.isElevatedHelperActive());
    onRefresh();
  };

  return (
    <div
      className={`w-full max-w-5xl mx-auto px-4 lg:px-8 py-8 space-y-8 ${isPersian ? 'font-persian text-right' : ''}`}
      dir={isPersian ? 'rtl' : 'ltr'}
    >
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono tracking-wider uppercase">
            <span>{isPersian ? 'تنظیمات ویندوز ۱۱ / WinUI ۳' : 'WinUI 3 Mica Architecture'}</span>
            <span aria-hidden="true">·</span>
            <span>{isPersian ? 'قوانین و امنیت پردازش‌ها' : 'Per-App Rules & Safety'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            {isPersian ? 'تنظیمات راست‌نگار (RastNegar)' : 'Settings & UIPI Configuration'}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {isPersian
              ? 'پیکربندی کلید میانبر سراسری، قوانین به ازای هر برنامه، سطح دسترسی UAC و لیست سفید فرآیندهای سیستمی.'
              : 'Configure global hotkeys, per-application rules, UAC integrity elevation, and security exclusion lists.'}
          </p>
        </div>

        {/* Language & Theme selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLanguage(language === 'en' ? 'fa' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Languages className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'en' ? 'فارسی (Persian)' : 'English'}</span>
          </button>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: General & Hotkey */}
        <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Keyboard className="w-4 h-4 text-cyan-400" />
            <span>{isPersian ? 'کلید میانبر سراسری (Global Hotkey)' : 'Global Window Hotkey'}</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">
                {isPersian ? 'کلید تغییر جهت پنجره فعال:' : 'Toggle RTL for Active Window:'}
              </span>
              <button
                onClick={() => setIsRecordingHotkey(!isRecordingHotkey)}
                className={`px-3 py-1 font-mono text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
                  isRecordingHotkey
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500 animate-pulse'
                    : 'bg-slate-950 text-cyan-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {isRecordingHotkey ? (isPersian ? 'فشار دهید...' : 'Press keys...') : hotkey}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              {isPersian
                ? 'از طریق RegisterHotKey در ویندوز ثبت می‌شود تا بدون تاخیر جهت پنجره را معکوس کند.'
                : 'Registered via RegisterHotKey Win32 API. Directly triggers target adapter.'}
            </p>
          </div>

          {/* Startup with Windows */}
          <div className="pt-4 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">
                  {isPersian ? 'شروع خودکار با ویندوز' : 'Start with Windows'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {isPersian ? 'اجرای بی‌صدا در ناحیه System Tray' : 'Silent startup minimized to notification tray'}
                </div>
              </div>
              <input
                type="checkbox"
                checked={startWithWindows}
                onChange={(e) => setStartWithWindows(e.target.checked)}
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
            </div>

            {startWithWindows && (
              <div className="flex items-center gap-4 text-xs pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                  <input
                    type="radio"
                    name="startup"
                    checked={startupMethod === 'hkcu'}
                    onChange={() => setStartupMethod('hkcu')}
                    className="accent-cyan-400"
                  />
                  <span>HKCU\\...\\Run (Standard)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                  <input
                    type="radio"
                    name="startup"
                    checked={startupMethod === 'taskscheduler'}
                    onChange={() => setStartupMethod('taskscheduler')}
                    className="accent-cyan-400"
                  />
                  <span>Task Scheduler (Elevated)</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: UIPI & Elevation Helper */}
        <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>{isPersian ? 'مدیریت ایزولاسیون UIPI ویندوز' : 'UIPI & UAC Elevation Management'}</span>
            </div>
            <span
              className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                engine.isElevatedHelperActive()
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {engine.isElevatedHelperActive() ? 'ELEVATED ACTIVE' : 'STANDARD INTEGRITY'}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {isPersian
              ? 'مکانیسم امنیتی User Interface Privilege Isolation (UIPI) ویندوز از دسترسی برنامه‌های استاندارد به پنجره‌های دارای دسترسی Administrator جلوگیری می‌کند. برای اعمال راست‌به‌چپ روی برنامه‌های Elevated، دستیار امن را فعال کنید.'
              : 'Windows User Interface Privilege Isolation (UIPI) blocks standard-integrity processes from sending window messages or modifying styles of elevated (Admin) windows. The elevated helper runs as a lightweight daemon communicating over IPC.'}
          </p>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-white">
                {isPersian ? 'فعال‌سازی دستیار RastNegar.ElevatedHelper' : 'Enable Elevated Helper Daemon'}
              </div>
              <div className="text-[11px] text-slate-500">
                {isPersian ? 'ارتباط از طریق Named Pipe امن' : 'Communicates via Local Named Pipe IPC'}
              </div>
            </div>
            <button
              onClick={handleToggleElevatedHelper}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
                engine.isElevatedHelperActive()
                  ? 'bg-rose-950 text-rose-300 border-rose-800/50 hover:bg-rose-900'
                  : 'bg-cyan-950 text-cyan-300 border-cyan-800/50 hover:bg-cyan-900'
              }`}
            >
              {engine.isElevatedHelperActive()
                ? isPersian ? 'غیرفعال‌سازی' : 'Disable Daemon'
                : isPersian ? 'فعال‌سازی دستیار' : 'Enable Daemon'}
            </button>
          </div>
        </div>
      </div>

      {/* Per-App Rules Editor */}
      <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-white">
              {isPersian ? 'قوانین ذخیره شده به تفکیک برنامه (JSON Rules)' : 'Per-Application Rules Engine'}
            </h2>
            <p className="text-[11px] text-slate-500">
              %AppData%\RastNegar\rules.json · {isPersian ? 'اعمال خودکار هنگام تشخیص فوکوس' : 'Automatically applied via WinEvent hook'}
            </p>
          </div>

          {/* Add Rule Input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="process.exe"
              value={newProcessName}
              onChange={(e) => setNewProcessName(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <select
              value={newMode}
              onChange={(e) => setNewMode(e.target.value as RtlMode)}
              className="px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="Auto-detect">Auto-detect</option>
              <option value="RTL">Always RTL</option>
              <option value="Off">Off</option>
            </select>
            <button
              onClick={handleAddRule}
              className="p-1.5 bg-cyan-950 text-cyan-300 border border-cyan-800/50 rounded-md hover:bg-cyan-900 cursor-pointer"
              title="Add Rule"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-lg bg-slate-950">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Process Name</th>
                <th className="py-2.5 px-3">Window Class</th>
                <th className="py-2.5 px-3">Control Class</th>
                <th className="py-2.5 px-3">Target Mode</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300 text-[11px]">
              {appRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-900/40">
                  <td className="py-2.5 px-3 font-semibold text-white">{rule.processName}</td>
                  <td className="py-2.5 px-3 text-slate-400">{rule.windowClass || '*'}</td>
                  <td className="py-2.5 px-3 text-slate-400">{rule.controlClass || '*'}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        rule.mode === 'RTL'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/40'
                          : rule.mode === 'Auto-detect'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {rule.mode}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Safety & System Exclusion List */}
      <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Lock className="w-4 h-4 text-rose-400" />
              <span>{isPersian ? 'لیست سیاه فرآیندهای محافظت‌شده (Exclusion Blacklist)' : 'Security Exclusion Blacklist'}</span>
            </div>
            <p className="text-[11px] text-slate-500">
              {isPersian
                ? 'راست‌نگار هرگز به پردازش‌های امنیتی، بازی‌های دارای ضدتقلب یا فرآیندهای هسته ویندوز دسترسی نخواهد داشت.'
                : 'Zero-touch guarantee: Protected system binaries, anti-cheats (Vanguard, EAC), and password managers are strictly blocked.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g. game.exe"
              value={newExclusion}
              onChange={(e) => setNewExclusion(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
            <button
              onClick={handleAddExclusion}
              className="px-3 py-1.5 bg-rose-950 text-rose-300 border border-rose-800/50 rounded-md text-xs font-semibold hover:bg-rose-900 cursor-pointer"
            >
              Add Exclusion
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {excludedProcesses.map((procName) => (
            <span
              key={procName}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300"
            >
              <span>{procName}</span>
              <button
                onClick={() => handleRemoveExclusion(procName)}
                className="text-slate-500 hover:text-rose-400 cursor-pointer"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
