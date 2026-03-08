"use client";

import { useState } from "react";
import type { Evidence } from "@/types";

interface ScoreBarToggleProps {
  label: string;
  score: number;
  comment: string;
  icon: string;
  evidence: Evidence[];
  forceOpen?: boolean;
}

export default function ScoreBarToggle({ label, score, comment, icon, evidence, forceOpen = false }: ScoreBarToggleProps) {
  const [open, setOpen] = useState(false);
  const isOpen = forceOpen || open;

  const barColors = [
    "bg-rose-400",
    "bg-orange-400",
    "bg-amber-400",
    "bg-lime-400",
    "bg-emerald-400",
  ];

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden mb-2 transition-all">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 py-3 px-4 hover:bg-white/80 transition-colors cursor-pointer no-print-toggle"
      >
        <span className="text-lg shrink-0">{icon}</span>
        <span className="w-36 text-sm font-medium text-gray-700 shrink-0 text-left">{label}</span>
        <div className="flex gap-1.5 shrink-0">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`w-7 h-7 rounded-md transition-all duration-300 ${
                i <= score ? `${barColors[score - 1]} shadow-sm` : "bg-gray-100 border border-gray-200"
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-500 ml-2 italic flex-1 text-left">{comment}</span>
        <span className={`text-gray-400 transition-transform duration-200 shrink-0 no-print ${isOpen ? "rotate-180" : ""}`}>▼</span>
      </button>

      {isOpen && evidence && evidence.length > 0 && (
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 border-t border-gray-100 px-5 py-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">📋 評価の根拠</p>
          {evidence.map((ev, i) => (
            <div key={i} className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
              <div className="flex items-start gap-2 mb-2">
                <span className="text-xs bg-indigo-100 text-indigo-700 font-medium px-2 py-0.5 rounded-full shrink-0 mt-0.5">Q</span>
                <p className="text-sm font-medium text-gray-700">{ev.question}</p>
              </div>
              <div className="ml-6 mb-2">
                <div className="bg-amber-50 border-l-3 border-amber-400 px-3 py-2 rounded-r-lg">
                  <p className="text-sm text-gray-700 italic">「{ev.quote}」</p>
                </div>
              </div>
              <div className="ml-6">
                <p className="text-xs text-gray-500">
                  <span className="font-medium text-gray-600">→ 解釈:</span> {ev.interpretation}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
