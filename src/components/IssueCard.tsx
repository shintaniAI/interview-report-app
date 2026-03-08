"use client";

import { useState } from "react";
import type { Issue, Improvement } from "@/types";

interface IssueCardProps {
  issue: Issue;
  index: number;
  severity: { label: string; color: string; bg: string };
  onUpdateIssue: (idx: number, field: string, value: string) => void;
  onUpdateImprovement: (issueIdx: number, impIdx: number, field: keyof Improvement, value: string) => void;
  forceOpen?: boolean;
}

export default function IssueCard({ issue, index, severity, onUpdateIssue, onUpdateImprovement, forceOpen = false }: IssueCardProps) {
  const [open, setOpen] = useState(true);
  const isOpen = forceOpen || open;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-3 p-5 hover:bg-gray-50/50 transition-colors cursor-pointer text-left"
      >
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${severity.bg} ${severity.color} shrink-0 mt-0.5`}>
          {severity.label}
        </span>
        <div className="flex-1">
          <p className="font-semibold text-gray-800 text-sm">{issue.issue}</p>
          <div className="mt-2 bg-amber-50 border-l-3 border-amber-400 px-3 py-1.5 rounded-r-lg">
            <p className="text-xs text-gray-600 italic">「{issue.quote}」</p>
          </div>
        </div>
        <span className={`text-gray-400 transition-transform duration-200 shrink-0 mt-1 no-print ${isOpen ? "rotate-180" : ""}`}>▼</span>
      </button>

      {isOpen && issue.improvements && (
        <div className="border-t border-gray-100 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 p-5 space-y-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">💡 改善施策</p>
          {issue.improvements.map((imp, j) => (
            <div key={j} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  施策 {j + 1}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">改善アクション</label>
                  <input type="text" value={imp.action} onChange={(e) => onUpdateImprovement(index, j, "action", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-gray-700 bg-white/80 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">担当者</label>
                  <input type="text" value={imp.owner} onChange={(e) => onUpdateImprovement(index, j, "owner", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-gray-700 bg-white/80 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">時期・頻度</label>
                  <input type="text" value={imp.timeline} onChange={(e) => onUpdateImprovement(index, j, "timeline", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-gray-700 bg-white/80 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">具体的な実施方法</label>
                  <input type="text" value={imp.method} onChange={(e) => onUpdateImprovement(index, j, "method", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-gray-700 bg-white/80 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">期待される効果</label>
                  <input type="text" value={imp.expectedOutcome} onChange={(e) => onUpdateImprovement(index, j, "expectedOutcome", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-gray-700 bg-white/80 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
