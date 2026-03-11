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
  onUpdateScore: (scoreKey: string, newScore: number) => void;
  onUpdateGrade: (grade: string) => void;
  onAddPositive: () => void;
  onRemovePositive: (index: number) => void;
  onAddIssue: () => void;
  onRemoveIssue: (index: number) => void;
  onAddImprovement: (issueIdx: number) => void;
  onRemoveImprovement: (issueIdx: number, impIdx: number) => void;
}

export default function ReportView({
  report: r,
  form,
  onBack,
  onUpdateReportField,
  onUpdatePositive,
  onUpdateIssueField,
  onUpdateImprovement,
  onUpdateScore,
  onUpdateGrade,
  onAddPositive,
  onRemovePositive,
  onAddIssue,
  onRemoveIssue,
  onAddImprovement,
  onRemoveImprovement,
}: ReportViewProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<string | null>(null);

  const handlePdfExport = useCallback(() => {
    window.print();
  }, []);

  const handleSaveToDrive = useCallback(async () => {
    setSaving(true);
    setSaveResult(null);
    try {
      const res = await fetch("/api/save-to-drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report: r, form }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveResult("Driveに保存されました");
      } else {
        setSaveResult(data.error || "保存に失敗しました");
      }
    } catch {
      setSaveResult("保存に失敗しました（通信エラー）");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveResult(null), 5000);
    }
  }, [r, form]);

  const renderTextField = (value: string, field: string, rows = 3) => {
    if (isEditing) {
      return (
        <textarea value={value} onChange={(e) => onUpdateReportField(field, e.target.value)}
          className="w-full border border-orange-200 rounded-xl p-4 text-gray-700 bg-orange-50/30 focus:bg-white focus:ring-2 focus:ring-orange-500/20 resize-y transition-all print:border-0 print:bg-transparent print:p-0 print:resize-none" rows={rows} />
      );
    }
    return (
      <div className="w-full rounded-xl p-4 text-gray-700 bg-gray-50/30 border border-gray-100 whitespace-pre-wrap leading-relaxed print:border-0 print:bg-transparent print:p-0">
        {value || "-"}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 print:bg-white print:min-h-0">
      <div className="max-w-4xl mx-auto py-10 px-4 print:py-0 print:px-0 print:max-w-none">
        {/* Action buttons - hidden in print */}
        <div className="flex gap-3 mb-6 flex-wrap print:hidden">
          <button onClick={onBack}
            className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm cursor-pointer">
            ← 入力に戻る
          </button>
          <button onClick={() => setIsEditing(!isEditing)}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm cursor-pointer ${
              isEditing
                ? "bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/25"
                : "bg-white border border-orange-300 text-orange-600 hover:bg-orange-50"
            }`}>
            {isEditing ? "編集を終了" : "編集する"}
          </button>
          <button onClick={handlePdfExport}
            className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl font-medium hover:from-rose-600 hover:to-rose-700 transition-all shadow-lg shadow-rose-500/25 cursor-pointer">
            PDF保存
          </button>
          <button onClick={handleSaveToDrive} disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/25 cursor-pointer disabled:opacity-50">
            {saving ? "保存中..." : "Driveに保存"}
          </button>
          {saveResult && (
            <span className={`self-center text-sm font-medium ${saveResult.includes("保存されました") ? "text-blue-600" : "text-red-500"}`}>
              {saveResult}
            </span>
          )}
        </div>

        <div ref={reportRef} className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-white/60 p-8 space-y-8 print:shadow-none print:border-0 print:rounded-none print:p-4">
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
                <div key={label} className="bg-gray-50 rounded-lg px-3 py-2 print:bg-transparent print:border print:border-gray-200">
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-semibold text-gray-700">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Overall Grade */}
          <div className={`flex items-center gap-5 p-5 rounded-xl border ${GRADE_BG[r.overallGrade] || "bg-gray-50 border-gray-200"}`}>
            {isEditing ? (
              <div className="flex flex-col gap-1 shrink-0">
                {["A", "B", "C"].map((g) => (
                  <button key={g} onClick={() => onUpdateGrade(g)}
                    className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold cursor-pointer transition-all ${
                      r.overallGrade === g
                        ? `bg-gradient-to-br ${GRADE_COLORS[g]} text-white shadow-lg`
                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                    }`}>
                    {g}
                  </button>
                ))}
              </div>
            ) : (
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${GRADE_COLORS[r.overallGrade] || "from-gray-400 to-gray-600"} flex items-center justify-center text-white text-4xl font-bold shadow-lg print:shadow-none`}>
                {r.overallGrade}
              </div>
            )}
            <div className="flex-1">
              <p className="text-xl font-bold text-gray-800">総合評価: {GRADE_LABELS[r.overallGrade] || r.overallGrade}
                {r.totalScore != null && <span className="ml-3 text-base font-semibold text-gray-500">({r.totalScore}/25点)</span>}
              </p>
              {isEditing ? (
                <textarea value={r.overallGradeReason} onChange={(e) => onUpdateReportField("overallGradeReason", e.target.value)}
                  className="text-sm text-gray-600 w-full bg-orange-50/30 border border-orange-200 rounded-lg p-2 focus:ring-2 focus:ring-orange-500/20 resize-none mt-2 print:border-0 print:bg-transparent print:p-0" rows={2} />
              ) : (
                <p className="text-sm text-gray-600 mt-2">{r.overallGradeReason}</p>
              )}
            </div>
          </div>

          {/* Radar Chart */}
          {r.radarScores && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 text-xs font-bold">1</span>
                総合マッチ度
              </h2>
              <div className="bg-gradient-to-br from-gray-50 to-orange-50/30 rounded-xl p-6 border border-gray-100 print:bg-transparent">
                <RadarChart scores={r.radarScores} />
              </div>
            </div>
          )}

          {/* Scores */}
          {r.scores && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 text-xs font-bold">2</span>
              スコア一覧
              <span className="text-xs text-gray-400 font-normal ml-2 print:hidden">クリックで評価の根拠を表示</span>
            </h2>
            <div className="bg-gradient-to-br from-gray-50 to-orange-50/30 rounded-xl p-4 border border-gray-100 print:bg-transparent">
              {Object.entries(r.scores).map(([key, val]) => {
                const detail = val || { score: 0, comment: "", evidence: [] };
                return (
                  <ScoreBarToggle key={key} label={SCORE_LABELS[key] || key} score={detail.score ?? 0} comment={detail.comment ?? ""}
                    icon={SCORE_ICONS[key] || ""} evidence={Array.isArray(detail.evidence) ? detail.evidence : []}
                    scoreKey={key} isEditing={isEditing} onUpdateScore={onUpdateScore} />
                );
              })}
            </div>
          </div>
          )}

          {/* Summary */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-7 h-7 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600 text-xs font-bold">3</span>
              面談サマリー
            </h2>
            {renderTextField(r.summary ?? "", "summary", 4)}
          </div>

          {/* Detail Sections */}
          {[
            { key: "retention", title: "定着・モチベーション状況", icon: "A" },
            { key: "workAdaptation", title: "業務適応状況", icon: "B" },
            { key: "workLifeBalance", title: "ワークライフバランス", icon: "C" },
            { key: "compensationConcerns", title: "評価・給与への理解や不安", icon: "D" },
            { key: "relationships", title: "人間関係・コミュニケーション", icon: "E" },
          ].map(({ key, title, icon }) => (
            <div key={key}>
              <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold text-gray-600">{icon}</span>
                {title}
              </h2>
              {renderTextField(((r as unknown as Record<string, unknown>)[key] as string) ?? "", key)}
            </div>
          ))}

          {/* Positives */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 text-xs font-bold">+</span>
              良かった点・強み
            </h2>
            <ul className="space-y-2.5">
              {(Array.isArray(r.positives) ? r.positives : []).map((item, i) => (
                <li key={i} className="flex items-center gap-3 bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-2.5 print:bg-transparent">
                  <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs shrink-0">✓</span>
                  {isEditing ? (
                    <>
                      <input type="text" value={item} onChange={(e) => onUpdatePositive(i, e.target.value)}
                        className="flex-1 bg-orange-50/30 border border-orange-200 rounded-lg px-2 py-1 text-gray-700 focus:ring-2 focus:ring-orange-500/20 print:border-0 print:bg-transparent print:p-0" />
                      <button onClick={() => onRemovePositive(i)} className="text-red-400 hover:text-red-600 text-lg cursor-pointer shrink-0 print:hidden">×</button>
                    </>
                  ) : (
                    <span className="flex-1 text-gray-700">{item}</span>
                  )}
                </li>
              ))}
              {isEditing && (
                <li className="print:hidden">
                  <button onClick={onAddPositive}
                    className="flex items-center gap-2 text-emerald-600 hover:text-emerald-800 text-sm font-medium cursor-pointer px-4 py-2">
                    + 項目を追加
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Issues */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600 text-xs font-bold">!</span>
              課題と改善策
            </h2>
            <div className="space-y-5">
              {(Array.isArray(r.issues) ? r.issues : []).map((issue, i) => {
                const sev = SEVERITY_LABELS[issue.severity] || SEVERITY_LABELS.medium;
                return <IssueCard key={i} issue={issue} index={i} severity={sev}
                  onUpdateIssue={onUpdateIssueField} onUpdateImprovement={onUpdateImprovement} isEditing={isEditing}
                  onRemoveIssue={onRemoveIssue} onAddImprovement={onAddImprovement} onRemoveImprovement={onRemoveImprovement} />;
              })}
              {isEditing && (
                <button onClick={onAddIssue}
                  className="flex items-center gap-2 text-rose-600 hover:text-rose-800 text-sm font-medium cursor-pointer px-1 py-2 print:hidden">
                  + 課題を追加
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 pt-5 flex justify-end">
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
