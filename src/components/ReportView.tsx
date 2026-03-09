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
  const [isEditing, setIsEditing] = useState(true);

  const handlePdfExport = useCallback(async () => {
    const element = reportRef.current;
    if (!element) return;

    const originalStyles: { el: HTMLElement; bg: string; color: string; border: string }[] = [];

    try {
      element.setAttribute("data-pdf-export", "true");
      const noPrintEls = element.querySelectorAll(".no-print");
      noPrintEls.forEach((el) => (el as HTMLElement).style.display = "none");

      // Fix for html2canvas not supporting lab()/oklch() color functions from Tailwind v4
      // Inject a style override to force RGB colors
      const fixStyle = document.createElement("style");
      fixStyle.id = "pdf-color-fix";
      fixStyle.textContent = `
        * { 
          color: inherit !important;
          border-color: inherit !important;
        }
        :root {
          color-scheme: light;
        }
      `;
      document.head.appendChild(fixStyle);

      // Compute and inline all colors to avoid lab()/oklch() parsing issues
      const allElements = element.querySelectorAll("*");
      allElements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        const computed = getComputedStyle(htmlEl);
        originalStyles.push({
          el: htmlEl,
          bg: htmlEl.style.backgroundColor,
          color: htmlEl.style.color,
          border: htmlEl.style.borderColor,
        });
        htmlEl.style.backgroundColor = computed.backgroundColor;
        htmlEl.style.color = computed.color;
        htmlEl.style.borderColor = computed.borderColor;
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const html2pdfModule = await import("html2pdf.js") as any;
      const html2pdf = html2pdfModule.default || html2pdfModule;
      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `面談レポート_${form.candidateName}_${form.interviewDate || "日付未設定"}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
        jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
      };

      await html2pdf().set(opt).from(element).save();

      // Restore original styles
      originalStyles.forEach(({ el, bg, color, border }) => {
        el.style.backgroundColor = bg;
        el.style.color = color;
        el.style.borderColor = border;
      });
      fixStyle.remove();

      element.removeAttribute("data-pdf-export");
      noPrintEls.forEach((el) => (el as HTMLElement).style.display = "");
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("PDF保存に失敗しました: " + (err instanceof Error ? err.message : String(err)));
      // Restore inlined styles
      originalStyles.forEach(({ el, bg, color, border }) => {
        el.style.backgroundColor = bg;
        el.style.color = color;
        el.style.borderColor = border;
      });
      element.removeAttribute("data-pdf-export");
      const restoreEls = element.querySelectorAll(".no-print");
      restoreEls.forEach((el) => (el as HTMLElement).style.display = "");
      document.getElementById("pdf-color-fix")?.remove();
    }
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
        setSaveResult("保存しました");
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

  // Render a text field: editable textarea or readonly display
  const renderTextField = (value: string, field: string, rows = 3) => {
    if (isEditing) {
      return (
        <textarea value={value} onChange={(e) => onUpdateReportField(field, e.target.value)}
          className="w-full border border-orange-200 rounded-xl p-4 text-gray-700 bg-orange-50/30 focus:bg-white focus:ring-2 focus:ring-orange-500/20 resize-y transition-all" rows={rows} />
      );
    }
    return (
      <div className="w-full rounded-xl p-4 text-gray-700 bg-gray-50/30 border border-gray-100 whitespace-pre-wrap leading-relaxed">
        {value || "-"}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="no-print flex gap-3 mb-6 flex-wrap">
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
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-medium hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg shadow-teal-500/25 cursor-pointer disabled:opacity-50">
            {saving ? "保存中..." : "レポートを保存"}
          </button>
          {saveResult && (
            <span className={`self-center text-sm font-medium ${saveResult.includes("保存しました") ? "text-teal-600" : "text-red-500"}`}>
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
              {isEditing ? (
                <textarea value={r.overallGradeReason} onChange={(e) => onUpdateReportField("overallGradeReason", e.target.value)}
                  className="text-sm text-gray-600 w-full bg-orange-50/30 border border-orange-200 rounded-lg p-2 focus:ring-2 focus:ring-orange-500/20 resize-none mt-2" rows={2} />
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
              <div className="bg-gradient-to-br from-gray-50 to-orange-50/30 rounded-xl p-6 border border-gray-100">
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
              <span className="text-xs text-gray-400 font-normal ml-2">クリックで評価の根拠を表示</span>
            </h2>
            <div className="bg-gradient-to-br from-gray-50 to-orange-50/30 rounded-xl p-4 border border-gray-100">
              {Object.entries(r.scores).map(([key, val]) => {
                const detail = val || { score: 0, comment: "", evidence: [] };
                return (
                  <ScoreBarToggle key={key} label={SCORE_LABELS[key] || key} score={detail.score ?? 0} comment={detail.comment ?? ""}
                    icon={SCORE_ICONS[key] || ""} evidence={Array.isArray(detail.evidence) ? detail.evidence : []} />
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
            {renderTextField(r.summary, "summary", 4)}
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
                <li key={i} className="flex items-center gap-3 bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-2.5">
                  <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs shrink-0">✓</span>
                  {isEditing ? (
                    <input type="text" value={item} onChange={(e) => onUpdatePositive(i, e.target.value)}
                      className="flex-1 bg-orange-50/30 border border-orange-200 rounded-lg px-2 py-1 text-gray-700 focus:ring-2 focus:ring-orange-500/20" />
                  ) : (
                    <span className="flex-1 text-gray-700">{item}</span>
                  )}
                </li>
              ))}
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
                  onUpdateIssue={onUpdateIssueField} onUpdateImprovement={onUpdateImprovement} isEditing={isEditing} />;
              })}
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
