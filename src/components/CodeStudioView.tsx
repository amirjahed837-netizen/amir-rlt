import React, { useState } from 'react';
import { PRODUCTION_SOURCE_FILES } from '../data/productionCode';
import { SourceCodeFile } from '../types';
import JSZip from 'jszip';
import { Download, Copy, Check, FileCode, Folder, Terminal, Sparkles } from 'lucide-react';

export const CodeStudioView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<SourceCodeFile>(PRODUCTION_SOURCE_FILES[1]); // Default: RtlEngine.cs
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsExporting(true);
    try {
      const zip = new JSZip();

      // Add all source files to the zip archive
      for (const file of PRODUCTION_SOURCE_FILES) {
        zip.file(file.path, file.content);
      }

      // Add convenient build script
      zip.file(
        'build.bat',
        `@echo off
echo Building RastNegar (راست‌نگار) Solution...
dotnet build RastNegar.sln -c Release
if %ERRORLEVEL% NEQ 0 (
    echo Build failed!
    exit /b %ERRORLEVEL%
)
echo Build completed successfully. Binaries located in bin/Release.
pause`
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'RastNegar-WinRTL-SourceSolution.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create zip bundle:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono tracking-wider uppercase">
            <span>Production Architecture</span>
            <span aria-hidden="true">·</span>
            <span>C# .NET 8 & Native C++ SEH Hooks</span>
            <span aria-hidden="true">·</span>
            <span>x64 / x86 Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Production C# .NET 8 & C++ Source Studio
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Complete, compilable solution files engineered to strict Windows systems standards: out-of-process first,
            SEH defensive hooking, rollback tracking, and zero telemetry.
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-cyan-950/40 transition-all cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isExporting ? 'Generating ZIP...' : 'Download Solution (.ZIP)'}</span>
        </button>
      </div>

      {/* Code Browser Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* File Tree Explorer (4 cols) */}
        <div className="lg:col-span-4 border border-slate-800 rounded-xl bg-slate-900/40 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Solution Explorer</span>
            <span className="font-mono text-[11px]">{PRODUCTION_SOURCE_FILES.length} Files</span>
          </div>

          <div className="space-y-1">
            {PRODUCTION_SOURCE_FILES.map((file) => {
              const isSelected = file.path === selectedFile.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/40'
                      : 'hover:bg-slate-800/60 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="font-mono text-[11px] truncate">{file.filename}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase shrink-0">
                    {file.category}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 leading-relaxed">
            Target Framework: <code className="text-slate-400">net8.0-windows10.0.19041.0</code>
            <br />
            Native Toolset: <code className="text-slate-400">MSVC v143 (x64 / Win32)</code>
          </div>
        </div>

        {/* Code Editor View (8 cols) */}
        <div className="lg:col-span-8 border border-slate-800 rounded-xl bg-slate-950 overflow-hidden flex flex-col">
          {/* File Tab Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold text-white">{selectedFile.filename}</span>
              <span className="text-slate-500 text-[11px]">({selectedFile.description})</span>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 text-slate-400 hover:text-white bg-slate-800 rounded text-xs transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          {/* Syntax Content */}
          <div className="p-4 overflow-x-auto max-h-[550px] font-mono text-xs text-slate-300 leading-relaxed bg-slate-950">
            <pre>
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
