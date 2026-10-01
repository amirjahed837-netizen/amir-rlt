import React, { useState } from 'react';
import { FEASIBILITY_DATA } from '../data/feasibilityData';
import { FeasibilityRecord } from '../types';
import { Search, ShieldAlert, CheckCircle2, AlertTriangle, Cpu, Terminal, Layers, ArrowUpRight } from 'lucide-react';

export const FeasibilityView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecordId, setSelectedRecordId] = useState<string>('win32-classic');

  const filteredData = FEASIBILITY_DATA.filter(
    (item) =>
      item.technology.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.controlsCovered.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.fallbackStrategy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.recommendedAdapter.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedRecord = FEASIBILITY_DATA.find((r) => r.id === selectedRecordId) || FEASIBILITY_DATA[0];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Title & Introduction */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono tracking-wider uppercase">
          <span>Step 0 Feasibility Analysis</span>
          <span aria-hidden="true">·</span>
          <span>Architectural Grounding</span>
          <span aria-hidden="true">·</span>
          <span>Windows 10 (1809+) & Windows 11</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Windows UI Subsystem & RTL Capability Matrix
        </h1>
        <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
          Windows applications span over three decades of divergent UI rendering architectures. A single technique
          will not work across all frameworks. Below is the rigorous engineering evaluation of what can be accomplished
          out-of-process, what demands in-process DLL injection, hard platform limits of the Windows GDI/DirectWrite
          subsystems, and proven fallbacks.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search UI technology, control class (Edit, RichEdit, WPF, Chromium)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>8 Subsystems Evaluated</span>
          <span aria-hidden="true">·</span>
          <span className="text-emerald-400 font-medium">Out-of-Process First</span>
        </div>
      </div>

      {/* Main Table: Concise Overview */}
      <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/70">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400 font-medium border-b border-slate-800 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">UI Technology & Classes</th>
              <th className="py-3 px-4">Out-of-Process Reality</th>
              <th className="py-3 px-4">In-Process Requirement</th>
              <th className="py-3 px-4">Hard Limit / Bottleneck</th>
              <th className="py-3 px-4">Recommended Fallback</th>
              <th className="py-3 px-4 text-right">Success Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {filteredData.map((item) => {
              const isSelected = item.id === selectedRecordId;
              return (
                <tr
                  key={item.id}
                  onClick={() => setSelectedRecordId(item.id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'bg-cyan-950/30' : 'hover:bg-slate-900/50'
                  }`}
                >
                  <td className="py-3 px-4 font-medium text-white whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-semibold text-cyan-200">{item.technology}</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {item.controlsCovered.slice(0, 2).join(', ')}
                        {item.controlsCovered.length > 2 && '...'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 max-w-xs truncate" title={item.outOfProcessCapabilities}>
                    {item.outOfProcessCapabilities}
                  </td>
                  <td className="py-3 px-4 max-w-xs truncate" title={item.inProcessRequirements}>
                    {item.inProcessRequirements}
                  </td>
                  <td className="py-3 px-4 max-w-xs truncate text-rose-300/90" title={item.hardLimits}>
                    {item.hardLimits}
                  </td>
                  <td className="py-3 px-4 max-w-xs truncate text-slate-400" title={item.fallbackStrategy}>
                    {item.fallbackStrategy}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap font-mono tabular-nums">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        item.successRate >= 90
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                          : item.successRate >= 75
                          ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/40'
                          : 'bg-amber-950 text-amber-400 border border-amber-800/40'
                      }`}
                    >
                      {item.successRate}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Deep-Dive Card for the Selected Technology */}
      {selectedRecord && (
        <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono">
                <span>Adapter: {selectedRecord.recommendedAdapter}</span>
                <span aria-hidden="true">·</span>
                <span>Security Footprint: {selectedRecord.securityImpact}</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">{selectedRecord.technology}</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Controls Covered:</span>
              <div className="flex flex-wrap gap-1">
                {selectedRecord.controlsCovered.map((c, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-[11px] font-mono bg-slate-800/80 text-slate-300 rounded border border-slate-700/50"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1: Out of Process vs In-Process */}
            <div className="space-y-4">
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Out-of-Process Capabilities</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedRecord.outOfProcessCapabilities}
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                  <Cpu className="w-4 h-4" />
                  <span>In-Process Injection Requirements</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedRecord.inProcessRequirements}
                </p>
              </div>
            </div>

            {/* Column 2: Hard Limits & Fallbacks */}
            <div className="space-y-4">
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Hard Windows Platform Limits</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedRecord.hardLimits}
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Production Fallback Strategy</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {selectedRecord.fallbackStrategy}
                </p>
              </div>
            </div>
          </div>

          {/* Key Win32 APIs */}
          <div className="border-t border-slate-800/60 pt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Key APIs & Message Constants:</span>
            {selectedRecord.keyWin32Apis.map((api, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-slate-950 text-cyan-300 font-mono text-[11px] rounded border border-slate-800"
              >
                {api}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
