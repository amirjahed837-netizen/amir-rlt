import React, { useState } from 'react';
import { analyzeBidiText } from '../engine/bidiEngine';
import { Languages, AlertCircle, CheckCircle, Sparkles, SlidersHorizontal, Info } from 'lucide-react';

const PRESET_SAMPLES = [
  {
    title: 'Persian Mixed with English & Version',
    text: 'نسخه ۲.۵ نرم‌افزار راست‌نگار (RastNegar Win32 Engine) با موفقیت کامپایل شد! شماره پشتیبانی: +98-912-345-6789',
  },
  {
    title: 'Arabic Sentence with Numbers & Punctuation',
    text: 'تم تحديث نظام الحسابات (الإصدار 4.2) بنجاح. يرجى مراجعة التقرير في المرفقات.',
  },
  {
    title: 'Hebrew with English Acronyms',
    text: 'המערכת עודכנה בהצלחה (גרסה 3.1) עם תמיכה מלאה ב-API ו-SDK של Windows.',
  },
  {
    title: 'Urdu Mixed Text',
    text: 'نیا ورژن 2.0 کامیابی سے ریلیز ہو گیا ہے۔ برائے مہربانی سیٹنگز کو چیک کریں!',
  },
  {
    title: 'English Programming Code (Should Stay LTR)',
    text: 'const handleRtl = (hwnd: IntPtr) => SetWindowLongPtr(hwnd, GWL_EXSTYLE, WS_EX_LAYOUTRTL);',
  },
];

export const BidiSandboxView: React.FC = () => {
  const [inputText, setInputText] = useState(PRESET_SAMPLES[0].text);
  const [threshold, setThreshold] = useState(30);

  const analysis = analyzeBidiText(inputText, threshold);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono tracking-wider uppercase">
          <span>Unicode Bidirectional Algorithm (UAX #9)</span>
          <span aria-hidden="true">·</span>
          <span>Bidi Class Classifier</span>
          <span aria-hidden="true">·</span>
          <span>Mixed Text Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
          Bidi Script Analyzer & Mixed Text Sandbox
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          Test real Persian, Arabic, Hebrew, and Urdu text streams. Learn how naive right-alignment causes punctuation to
          jump to the wrong side and how <code className="text-cyan-300">WS_EX_RTLREADING</code> and{' '}
          <code className="text-cyan-300">PFE_RTLPARA</code> preserve parenthesis mirroring and numeric runs.
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400">Presets:</span>
        {PRESET_SAMPLES.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => setInputText(preset.text)}
            className="px-2.5 py-1 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-md border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
          >
            {preset.title}
          </button>
        ))}
      </div>

      {/* Input Area & Live Rendering Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Text Box */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Interactive Input Text</span>
            <span className="font-mono text-[11px]">{inputText.length} Code Points</span>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={5}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-cyan-500 font-persian transition-colors"
            placeholder="Type or paste Persian, Arabic, Hebrew, or mixed English text..."
          />

          {/* Auto-Detect Ratio & Decision Card */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Auto-Detect RTL Decision</span>
              <span
                className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  analysis.shouldAutoTriggerRtl
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {analysis.shouldAutoTriggerRtl ? 'Trigger RTL Mode' : 'Retain LTR Mode'}
              </span>
            </div>

            {/* Threshold Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>RTL Script Density Threshold:</span>
                <span className="font-mono text-cyan-300">{threshold}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={90}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Script Composition Stats */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-center">
              <div>
                <div className="text-[11px] text-slate-400">RTL (AL/R)</div>
                <div className="font-mono font-bold text-cyan-400 text-sm">{analysis.rtlCharCount}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">LTR (L)</div>
                <div className="font-mono font-bold text-slate-300 text-sm">{analysis.ltrCharCount}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Numbers</div>
                <div className="font-mono font-bold text-amber-400 text-sm">{analysis.numberCount}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Neutrals</div>
                <div className="font-mono font-bold text-slate-400 text-sm">{analysis.neutralCount}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Rendering Comparison */}
        <div className="space-y-4">
          <div className="text-xs text-slate-400 font-semibold">
            Visual Comparison: Naive Right Align vs True Win32 RTL Reading
          </div>

          {/* Faulty Naive Rendering (e.g. text-align: right without dir="rtl") */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-rose-900/40 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-rose-300">1. Naive Right-Align (Broken Punctuation)</span>
              <span className="text-[10px] font-mono text-slate-500">ES_RIGHT only</span>
            </div>
            {/* Forced LTR container with text-align: right reproduces the common Windows bug */}
            <div
              className="p-3 bg-slate-900/90 rounded border border-slate-800 text-sm font-persian text-slate-300"
              style={{ direction: 'ltr', textAlign: 'right' }}
            >
              {inputText}
            </div>
            <p className="text-[11px] text-rose-300/80 leading-relaxed">
              Notice how the ending exclamation mark or parentheses appear reversed or jump to the wrong side because
              the reading order remains LTR.
            </p>
          </div>

          {/* Correct Win32 RTL Reading (WS_EX_RTLREADING / PFE_RTLPARA) */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-900/40 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-300">2. RastNegar RTL (WS_EX_RTLREADING + PFE_RTLPARA)</span>
              <span className="text-[10px] font-mono text-emerald-400">Proper UAX #9</span>
            </div>
            {/* Genuine RTL layout */}
            <div
              className="p-3 bg-slate-900/90 rounded border border-emerald-800/40 text-sm font-persian text-emerald-100"
              style={{ direction: 'rtl', textAlign: 'right' }}
            >
              {inputText}
            </div>
            <p className="text-[11px] text-emerald-400/90 leading-relaxed">
              Brackets are properly mirrored, numbers maintain their correct European/Arabic sequence, and punctuation
              anchors correctly at the sentence termination.
            </p>
          </div>

          {/* Detected Issues */}
          {analysis.issuesDetected.length > 0 && (
            <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/40 text-xs text-amber-300 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Detected Bidi Complexities in Current String:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-200/90 pl-1">
                {analysis.issuesDetected.map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Character-by-Character Bidi Inspector Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>Character Bidi Class Inspector (First 24 Characters)</span>
          <span className="font-mono text-[11px]">Unicode Standard UAX #9</span>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-medium border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Glyph</th>
                <th className="py-2.5 px-3">Code Point</th>
                <th className="py-2.5 px-3">Bidi Class</th>
                <th className="py-2.5 px-3">Script Classification</th>
                <th className="py-2.5 px-3 text-right">RTL Direction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300 text-[11px]">
              {analysis.characters.slice(0, 24).map((c, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40">
                  <td className="py-2 px-3 font-persian font-bold text-white text-sm">{c.char === ' ' ? '␣' : c.char}</td>
                  <td className="py-2 px-3 text-cyan-400">{c.hex}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        c.bidiClass === 'AL' || c.bidiClass === 'R'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/50'
                          : c.bidiClass === 'L'
                          ? 'bg-slate-800 text-slate-300'
                          : c.bidiClass === 'EN' || c.bidiClass === 'AN'
                          ? 'bg-amber-950 text-amber-300'
                          : 'bg-slate-900 text-slate-500'
                      }`}
                    >
                      {c.bidiClass}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-sans text-slate-300">{c.scriptName}</td>
                  <td className="py-2 px-3 text-right">
                    {c.isRtlScript ? (
                      <span className="text-emerald-400 font-sans font-medium">Right-to-Left</span>
                    ) : (
                      <span className="text-slate-500 font-sans">Left-to-Right / Neutral</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
