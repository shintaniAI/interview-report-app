"use client";

import { useRef, useCallback, useState } from "react";
import type { Report, FormData, Improvement } from "@/types";
import { SCORE_LABELS, SCORE_ICONS, GRADE_COLORS, GRADE_BG, GRADE_LABELS, SEVERITY_LABELS } from "@/constants";
import RadarChart from "./RadarChart";
import ScoreBarToggle from "./ScoreBarToggle";
import IssueCard from "./IssueCard";

interface ReportViewProps {
  report: Report;
  form: FormData;
  onBack: () => void;
  onUpdateReportField: (field: string, value: string) => void;
  onUpdatePositive: (index: number, value: string) => void;
  onUpdateIssueField: (issueIdx: number, field: string, value: string) => void;
  onUpdateImprovement: (issueIdx: number, impIdx: number, field: keyof Improvement, value: string) => void;
}

export default function ReportView({
  report: r,
  form,
  onBack,
  onUpdateReportField,
  onUpdatePositive,
  onUpdateIssueField,
  onUpdateImprovement,
}: ReportViewProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<string | null>(null);

  const handlePdfExport = useCallback(async () => {
    const element = reportRef.current;
    if (!element) return;

    element.setAttribute("data-pdf-export", "true");
    const noPrintEls = element.querySelectorAll(".no-print");
    noPrintEls.forEach((el) => (el as HTMLElement).style.display = "none");

    const html2pdf = (await import("html2pdf.js")).default;
    const opt = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename: `面談レポート_${form.candidateName}_${form.interviewDate || "日付未設定"}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
    };

    await html2pdf().set(opt).from(element).save();

    element.removeAttribute("data-pdf-export");
    noPrintEls.forEach((el) => (el as HTMLElement).style.display = "");
  }, [form.candidateName, form.interviewDate]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveResult(null);
    try {
      const res = await fetch("/api/reports/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report: r, form }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveResult("保存しました ✓");
      } else {
        setSaveResult(data.error || "保存に失敗しました");
      }
    } catch {
      setSaveResult("保存に失敗しました（通信エラー）");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveResult(null), 3000);
    }
  }, [r, form]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="no-print flex gap-3 mb-6 flex-wrap">
          <button onClick={onBack}
            className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm cursor-pointer">
            ← 入力に戻る
          </button>
          <button onClick={handlePdfExport}
            className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl font-medium hover:from-rose-600 hover:to-rose-700 transition-all shadow-lg shadow-rose-500/25 cursor-pointer">
            📄 PDF保存
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-medium hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg shadow-teal-500/25 cursor-pointer disabled:opacity-50">
            {saving ? "保存中..." : "💾 レポートを保存"}
          </button>
          {saveResult && (
            <span className={`self-center text-sm font-medium ${saveResult.includes("✓") ? "text-teal-600" : "text-red-500"}`}>
              {saveResult}
            </span>
          )}
        </div>

        <div ref={reportRef} className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-white/60 p-8 space-y-8">
          {/* Header */}
          <div className="border-b border-gray-100 pb-5">
            <div className="flex items-center gap-3 mb-3">
              <img src="/logo-202.png" alt="202" className="h-8" />
              <h1 className="text-2xl font-bold text-gray-800">入社後面談レポート</h1>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
              {[
                { label: "社員名", value: form.candidateName },
                { label: "所属", value: form.department || "-" },
                { label: "職種", value: form.jobTitle || "-" },
                { label: "入社日", value: form.hireDate || "-" },
                { label: "面談日", value: form.interviewDate || "-" },
                { label: "担当者", value: form.interviewer || "-" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-lg px-3 py-2">
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-semibold text-gray-700">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Overall Grade */}
          <div className={`flex items-center gap-5 p-5 rounded-xl border ${GRADE_BG[r.overallGrade] || "bg-gray-50 border-gray-200"}`}>
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${GRADE_COLORS[r.overallGrade] || "from-gray-400 to-gray-600"} flex items-center justify-center text-white text-4xl font-bold shadow-lg`}>
              {r.overallGrade}
            </div>
            <div className="flex-1">
              <p className="text-xl font-bold text-gray-800">総合評価: {GRADE_LABELS[r.overallGrade] || r.overallGrade}</p>
              <textarea value={r.overallGradeReason} onChange={(e) => onUpdateReportField("overallGradeReason", e.target.value)}
                className="text-sm text-gray-600 w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-orange-500 focus:ring-0 resize-none p-0 mt-2" rows={2} />
            </div>
          </div>

          {/* Radar Chart */}
          {r.radarScores && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 text-xs">⬡</span>
                総合マッチ度
              </h2>
              <div className="bg-gradient-to-br from-gray-50 to-orange-50/30 rounded-xl p-6 border border-gray-100">
                <RadarChart scores={r.radarScores} />
              </div>
            </div>
          )}

          {/* Scores */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 text-xs">📊</span>
              スコア一覧
              <span className="text-xs text-gray-400 font-normal ml-2">クリックで評価の根拠を表示</span>
            </h2>
            <div className="bg-gradient-to-br from-gray-50 to-orange-50/30 rounded-xl p-4 border border-gray-100">
              {Object.entries(r.scores).map(([key, val]) => (
                <ScoreBarToggle key={key} label={SCORE_LABELS[key] || key} score={val.score} comment={val.comment}
                  icon={SCORE_ICONS[key] || "●"} evidence={val.evidence || []} />
              ))}
            </div>
          </div>

          {/* Summary */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-7 h-7 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600 text-xs">📝</span>
              面談サマリー
            </h2>
            <textarea value={r.summary} onChange={(e) => onUpdateReportField("summary", e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-4 text-gray-700 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 resize-y transition-all" rows={4} />
          </div>

          {/* Detail Sections */}
          {[
            { key: "retention", title: "定着・モチベーション状況", icon: "🔥" },
            { key: "workAdaptation", title: "業務適応状況", icon: "🔧" },
            { key: "workLifeBalance", title: "ワークライフバランス", icon: "⚖️" },
            { key: "compensationConcerns", title: "評価・給与への理解や不安", icon: "💰" },
            { key: "relationships", title: "人間関係・コミュニケーション", icon: "🤝" },
          ].map(({ key, title, icon }) => (
            <div key={key}>
              <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-xs">{icon}</span>
                {title}
              </h2>
              <textarea value={(r as unknown as Record<string, unknown>)[key] as string}
                onChange={(e) => onUpdateReportField(key, e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-4 text-gray-700 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 resize-y transition-all" rows={3} />
            </div>
          ))}

          {/* Positives */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 text-xs">✨</span>
              良かった点・強み
            </h2>
            <ul className="space-y-2.5">
              {r.positives.map((item, i) => (
                <li key={i} className="flex items-center gap-3 bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-2.5">
                  <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs shrink-0">✓</span>
                  <input type="text" value={item} onChange={(e) => onUpdatePositive(i, e.target.value)}
                    className="flex-1 bg-transparent border-0 text-gray-700 focus:ring-0 p-0" />
                </li>
              ))}
            </ul>
          </div>

          {/* Issues */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600 text-xs">🔍</span>
              課題と改善策
            </h2>
            <div className="space-y-5">
              {r.issues && r.issues.map((issue, i) => {
                const sev = SEVERITY_LABELS[issue.severity] || SEVERITY_LABELS.medium;
                return <IssueCard key={i} issue={issue} index={i} severity={sev}
                  onUpdateIssue={onUpdateIssueField} onUpdateImprovement={onUpdateImprovement} />;
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 pt-5 flex justify-between items-end">
            <div className="text-xs text-gray-400">
              <p>※ このレポートは自動生成されたものです。</p>
              <p>内容は担当者が確認・修正の上ご利用ください。</p>
            </div>
            <div className="text-xs text-gray-400 text-right">
              <p>作成日時: {new Date().toLocaleString("ja-JP")}</p>
              <p>作成者: {form.interviewer || "-"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
