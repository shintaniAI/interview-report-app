"use client";

import { useState, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────

interface Evidence {
  question: string;
  quote: string;
  interpretation: string;
}

interface ScoreDetail {
  score: number;
  comment: string;
  evidence: Evidence[];
}

interface Improvement {
  action: string;
  owner: string;
  timeline: string;
  method: string;
  expectedOutcome: string;
}

interface Issue {
  issue: string;
  quote: string;
  severity: "high" | "medium" | "low";
  improvements: Improvement[];
}

interface Report {
  summary: string;
  scores: {
    engagement: ScoreDetail;
    workAdaptation: ScoreDetail;
    wlb: ScoreDetail;
    expectationGap: ScoreDetail;
    turnoverRisk: ScoreDetail;
    growth: ScoreDetail;
  };
  radarScores: {
    engagement: number;
    workAdaptation: number;
    wlb: number;
    expectationGap: number;
    turnoverRisk: number;
    growth: number;
  };
  overallGrade: string;
  overallGradeReason: string;
  retention: string;
  workAdaptation: string;
  workLifeBalance: string;
  compensationConcerns: string;
  relationships: string;
  positives: string[];
  issues: Issue[];
}

// ─── Constants ────────────────────────────────────────────────────

const SCORE_LABELS: Record<string, string> = {
  engagement: "エンゲージメント",
  workAdaptation: "業務適応",
  wlb: "WLB適応",
  expectationGap: "期待値ギャップ",
  turnoverRisk: "早期離職リスク",
  growth: "成長意欲・キャリア",
};

const SCORE_ICONS: Record<string, string> = {
  engagement: "💪",
  workAdaptation: "🔧",
  wlb: "⚖️",
  expectationGap: "🎯",
  turnoverRisk: "🔒",
  growth: "🌱",
};

const GRADE_COLORS: Record<string, string> = {
  A: "from-emerald-400 to-emerald-600",
  B: "from-amber-400 to-amber-600",
  C: "from-rose-400 to-rose-600",
};

const GRADE_BG: Record<string, string> = {
  A: "bg-emerald-50 border-emerald-200",
  B: "bg-amber-50 border-amber-200",
  C: "bg-rose-50 border-rose-200",
};

const GRADE_LABELS: Record<string, string> = {
  A: "概ね順調",
  B: "要フォロー",
  C: "早期対応推奨",
};

const SEVERITY_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  high: { label: "重要", color: "text-rose-700", bg: "bg-rose-100" },
  medium: { label: "注意", color: "text-amber-700", bg: "bg-amber-100" },
  low: { label: "軽微", color: "text-blue-700", bg: "bg-blue-100" },
};

// ─── Radar Chart Component ───────────────────────────────────────

function RadarChart({ scores }: { scores: Record<string, number> }) {
  const labels = [
    { key: "engagement", label: "エンゲージメント" },
    { key: "workAdaptation", label: "業務適応" },
    { key: "wlb", label: "WLB" },
    { key: "expectationGap", label: "期待値一致" },
    { key: "turnoverRisk", label: "定着度" },
    { key: "growth", label: "成長意欲" },
  ];

  const cx = 150, cy = 150, r = 110;
  const levels = [1, 2, 3, 4, 5];

  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / labels.length - Math.PI / 2;
    const dist = (value / 5) * r;
    return {
      x: cx + dist * Math.cos(angle),
      y: cy + dist * Math.sin(angle),
    };
  };

  const dataPoints = labels.map((l, i) => getPoint(i, scores[l.key] || 0));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 300 300" className="w-72 h-72">
        {/* Grid */}
        {levels.map((level) => {
          const pts = labels.map((_, i) => getPoint(i, level));
          const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
          return (
            <path key={level} d={path} fill="none" stroke="#e5e7eb" strokeWidth={level === 5 ? 1.5 : 0.8} />
          );
        })}
        {/* Axes */}
        {labels.map((_, i) => {
          const p = getPoint(i, 5);
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#d1d5db" strokeWidth={0.8} />;
        })}
        {/* Data */}
        <path d={dataPath} fill="rgba(79, 70, 229, 0.15)" stroke="#4f46e5" strokeWidth={2.5} />
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4} fill="#4f46e5" stroke="white" strokeWidth={2} />
        ))}
        {/* Labels */}
        {labels.map((l, i) => {
          const p = getPoint(i, 6.2);
          return (
            <text
              key={i}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[10px] fill-gray-600 font-medium"
            >
              {l.label}
            </text>
          );
        })}
        {/* Score values */}
        {labels.map((l, i) => {
          const p = getPoint(i, (scores[l.key] || 0) + 0.7);
          return (
            <text
              key={`v-${i}`}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[11px] fill-indigo-600 font-bold"
            >
              {scores[l.key] || 0}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Score Bar with Toggle ───────────────────────────────────────

function ScoreBarToggle({
  label,
  score,
  comment,
  icon,
  evidence,
}: {
  label: string;
  score: number;
  comment: string;
  icon: string;
  evidence: Evidence[];
}) {
  const [open, setOpen] = useState(false);

  const barColors = [
    "bg-rose-400",
    "bg-orange-400",
    "bg-amber-400",
    "bg-lime-400",
    "bg-emerald-400",
  ];

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden mb-2 transition-all">
      {/* Header - clickable */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 py-3 px-4 hover:bg-white/80 transition-colors cursor-pointer"
      >
        <span className="text-lg shrink-0">{icon}</span>
        <span className="w-36 text-sm font-medium text-gray-700 shrink-0 text-left">{label}</span>
        <div className="flex gap-1.5 shrink-0">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`w-7 h-7 rounded-md transition-all duration-300 ${
                i <= score
                  ? `${barColors[score - 1]} shadow-sm`
                  : "bg-gray-100 border border-gray-200"
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-500 ml-2 italic flex-1 text-left">{comment}</span>
        <span className={`text-gray-400 transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>

      {/* Evidence panel */}
      {open && evidence && evidence.length > 0 && (
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 border-t border-gray-100 px-5 py-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">📋 評価の根拠</p>
          {evidence.map((ev, i) => (
            <div key={i} className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
              <div className="flex items-start gap-2 mb-2">
                <span className="text-xs bg-indigo-100 text-indigo-700 font-medium px-2 py-0.5 rounded-full shrink-0 mt-0.5">
                  Q
                </span>
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

// ─── Main Component ──────────────────────────────────────────────

export default function Home() {
  const [step, setStep] = useState<"input" | "loading" | "report">("input");
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [showOptional, setShowOptional] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    candidateName: "",
    department: "",
    jobTitle: "",
    hireDate: "",
    interviewDate: "",
    interviewer: "",
    transcript: "",
    memo: "",
    placement: "",
    jobDescription: "",
    previousReport: "",
    companyValues: "",
  });

  const [editableReport, setEditableReport] = useState<Report | null>(null);

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.candidateName || !form.transcript) {
      setError("候補者名と面談データ（文字起こし）は必須です。");
      return;
    }
    setError("");
    setStep("loading");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setReport(data.report);
        setEditableReport(data.report);
        setStep("report");
      } else {
        setError(data.error || "エラーが発生しました");
        setStep("input");
      }
    } catch {
      setError("通信エラーが発生しました。もう一度お試しください。");
      setStep("input");
    }
  };

  const handlePdfExport = async () => {
    const element = reportRef.current;
    if (!element) return;

    const html2pdf = (await import("html2pdf.js")).default;
    const opt = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename: `面談レポート_${form.candidateName}_${form.interviewDate || "日付未設定"}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
    };
    html2pdf().set(opt).from(element).save();
  };

  const updateReportField = (field: string, value: string) => {
    if (!editableReport) return;
    setEditableReport((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const updatePositive = (index: number, value: string) => {
    if (!editableReport) return;
    const newPositives = [...editableReport.positives];
    newPositives[index] = value;
    setEditableReport((prev) => (prev ? { ...prev, positives: newPositives } : prev));
  };

  const updateIssueField = (issueIdx: number, field: string, value: string) => {
    if (!editableReport) return;
    const newIssues = [...editableReport.issues];
    newIssues[issueIdx] = { ...newIssues[issueIdx], [field]: value };
    setEditableReport((prev) => (prev ? { ...prev, issues: newIssues } : prev));
  };

  const updateImprovement = (issueIdx: number, impIdx: number, field: keyof Improvement, value: string) => {
    if (!editableReport) return;
    const newIssues = [...editableReport.issues];
    const newImps = [...newIssues[issueIdx].improvements];
    newImps[impIdx] = { ...newImps[impIdx], [field]: value };
    newIssues[issueIdx] = { ...newIssues[issueIdx], improvements: newImps };
    setEditableReport((prev) => (prev ? { ...prev, issues: newIssues } : prev));
  };

  // ─── INPUT FORM ──────────────────────────────────────────────────

  if (step === "input") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-3xl mx-auto py-10 px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
              <span>⚡</span> AI-Powered Report Generator
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              入社後面談レポート作成
            </h1>
            <p className="text-gray-500 mt-2">面談内容を入力してAIがレポートを自動生成します</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-5 py-4 rounded-r-lg mb-6 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-red-500 text-lg">⚠</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-white/60 p-8 space-y-6">
            {/* Section: Basic Info */}
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-sm font-bold">1</div>
              <h2 className="text-lg font-semibold text-gray-700">基本情報</h2>
              <span className="text-xs text-red-400 ml-1">* 必須</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">候補者名 / 社員名 <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={form.candidateName}
                  onChange={(e) => updateForm("candidateName", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  placeholder="山田 太郎"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">所属</label>
                <input
                  type="text"
                  value={form.department}
                  onChange={(e) => updateForm("department", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  placeholder="営業部"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">職種</label>
                <input
                  type="text"
                  value={form.jobTitle}
                  onChange={(e) => updateForm("jobTitle", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  placeholder="法人営業"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">入社日</label>
                <input
                  type="date"
                  value={form.hireDate}
                  onChange={(e) => updateForm("hireDate", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">面談実施日</label>
                <input
                  type="date"
                  value={form.interviewDate}
                  onChange={(e) => updateForm("interviewDate", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">面談担当者</label>
                <input
                  type="text"
                  value={form.interviewer}
                  onChange={(e) => updateForm("interviewer", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  placeholder="佐藤 花子"
                />
              </div>
            </div>

            {/* Section: Interview Data */}
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3 pt-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-sm font-bold">2</div>
              <h2 className="text-lg font-semibold text-gray-700">面談データ</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                文字起こしテキスト <span className="text-red-400">*</span>
              </label>
              <textarea
                value={form.transcript}
                onChange={(e) => updateForm("transcript", e.target.value)}
                rows={8}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                placeholder="面談の文字起こしテキストを貼り付けてください..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                担当者メモ / MTG内容
              </label>
              <textarea
                value={form.memo}
                onChange={(e) => updateForm("memo", e.target.value)}
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                placeholder="面談時のメモや気づきを入力..."
              />
            </div>

            {/* Optional Fields */}
            <div>
              <button
                type="button"
                onClick={() => setShowOptional(!showOptional)}
                className="flex items-center gap-2 text-indigo-600 text-sm font-medium hover:text-indigo-800 transition-colors cursor-pointer"
              >
                <span className={`transition-transform duration-200 ${showOptional ? "rotate-90" : ""}`}>▶</span>
                追加情報を入力する（任意）
              </button>

              {showOptional && (
                <div className="mt-5 space-y-4 border-t border-dashed border-gray-200 pt-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">配属先情報</label>
                    <input
                      type="text"
                      value={form.placement}
                      onChange={(e) => updateForm("placement", e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">求人票 / 期待役割</label>
                    <textarea
                      value={form.jobDescription}
                      onChange={(e) => updateForm("jobDescription", e.target.value)}
                      rows={3}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">前回面談レポート</label>
                    <textarea
                      value={form.previousReport}
                      onChange={(e) => updateForm("previousReport", e.target.value)}
                      rows={3}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">会社のMVV / 行動指針</label>
                    <textarea
                      value={form.companyValues}
                      onChange={(e) => updateForm("companyValues", e.target.value)}
                      rows={3}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-[0.99] cursor-pointer"
            >
              ⚡ レポートを生成する
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">Powered by Gemini AI</p>
        </div>
      </div>
    );
  }

  // ─── LOADING ──────────────────────────────────────────────────────

  if (step === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 flex flex-col items-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600" />
            <div className="absolute inset-0 flex items-center justify-center text-2xl">⚡</div>
          </div>
          <p className="text-gray-700 text-lg font-semibold mt-6">レポートを生成中...</p>
          <p className="text-gray-400 text-sm mt-2">AIが面談内容を分析しています</p>
          <div className="flex gap-1 mt-4">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    );
  }

  // ─── REPORT VIEW ──────────────────────────────────────────────────

  if (step === "report" && editableReport) {
    const r = editableReport;
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto py-10 px-4">
          {/* Action buttons */}
          <div className="no-print flex gap-3 mb-6">
            <button
              onClick={() => setStep("input")}
              className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm cursor-pointer"
            >
              ← 入力に戻る
            </button>
            <button
              onClick={handlePdfExport}
              className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl font-medium hover:from-rose-600 hover:to-rose-700 transition-all shadow-lg shadow-rose-500/25 cursor-pointer"
            >
              📄 PDF保存
            </button>
          </div>

          {/* Report Content */}
          <div ref={reportRef} className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-white/60 p-8 space-y-8">
            {/* Header */}
            <div className="border-b border-gray-100 pb-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-lg">📋</div>
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
              <div
                className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${GRADE_COLORS[r.overallGrade] || "from-gray-400 to-gray-600"} flex items-center justify-center text-white text-4xl font-bold shadow-lg`}
              >
                {r.overallGrade}
              </div>
              <div className="flex-1">
                <p className="text-xl font-bold text-gray-800">
                  総合評価: {GRADE_LABELS[r.overallGrade] || r.overallGrade}
                </p>
                <textarea
                  value={r.overallGradeReason}
                  onChange={(e) => updateReportField("overallGradeReason", e.target.value)}
                  className="text-sm text-gray-600 w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-0 resize-none p-0 mt-2"
                  rows={2}
                />
              </div>
            </div>

            {/* Radar Chart */}
            {r.radarScores && (
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-xs">⬡</span>
                  総合マッチ度
                </h2>
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-100">
                  <RadarChart scores={r.radarScores} />
                </div>
              </div>
            )}

            {/* Scores with Toggle */}
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-xs">📊</span>
                スコア一覧
                <span className="text-xs text-gray-400 font-normal ml-2">クリックで評価の根拠を表示</span>
              </h2>
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-100">
                {Object.entries(r.scores).map(([key, val]) => (
                  <ScoreBarToggle
                    key={key}
                    label={SCORE_LABELS[key] || key}
                    score={val.score}
                    comment={val.comment}
                    icon={SCORE_ICONS[key] || "●"}
                    evidence={val.evidence || []}
                  />
                ))}
              </div>
            </div>

            {/* Summary */}
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xs">📝</span>
                面談サマリー
              </h2>
              <textarea
                value={r.summary}
                onChange={(e) => updateReportField("summary", e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-4 text-gray-700 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 resize-y transition-all"
                rows={4}
              />
            </div>

            {/* Detail Sections */}
            {[
              { key: "retention", title: "定着・モチベーション状況", icon: "🔥", color: "orange" },
              { key: "workAdaptation", title: "業務適応状況", icon: "🔧", color: "blue" },
              { key: "workLifeBalance", title: "ワークライフバランス", icon: "⚖️", color: "green" },
              { key: "compensationConcerns", title: "評価・給与への理解や不安", icon: "💰", color: "amber" },
              { key: "relationships", title: "人間関係・コミュニケーション", icon: "🤝", color: "purple" },
            ].map(({ key, title, icon }) => (
              <div key={key}>
                <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-xs">{icon}</span>
                  {title}
                </h2>
                <textarea
                  value={(r as unknown as Record<string, unknown>)[key] as string}
                  onChange={(e) => updateReportField(key, e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-4 text-gray-700 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 resize-y transition-all"
                  rows={3}
                />
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
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updatePositive(i, e.target.value)}
                      className="flex-1 bg-transparent border-0 text-gray-700 focus:ring-0 p-0"
                    />
                  </li>
                ))}
              </ul>
            </div>

            {/* Issues & Improvements */}
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600 text-xs">🔍</span>
                課題と改善策
              </h2>
              <div className="space-y-5">
                {r.issues && r.issues.map((issue, i) => {
                  const sev = SEVERITY_LABELS[issue.severity] || SEVERITY_LABELS.medium;
                  return (
                    <IssueCard
                      key={i}
                      issue={issue}
                      index={i}
                      severity={sev}
                      onUpdateIssue={updateIssueField}
                      onUpdateImprovement={updateImprovement}
                    />
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 pt-5 flex justify-between items-end">
              <div className="text-xs text-gray-400">
                <p>※ このレポートはAIにより自動生成されたものです。</p>
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

  return null;
}

// ─── Issue Card Component ────────────────────────────────────────

function IssueCard({
  issue,
  index,
  severity,
  onUpdateIssue,
  onUpdateImprovement,
}: {
  issue: Issue;
  index: number;
  severity: { label: string; color: string; bg: string };
  onUpdateIssue: (idx: number, field: string, value: string) => void;
  onUpdateImprovement: (issueIdx: number, impIdx: number, field: keyof Improvement, value: string) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Issue header */}
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
        <span className={`text-gray-400 transition-transform duration-200 shrink-0 mt-1 ${open ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>

      {/* Improvements */}
      {open && issue.improvements && (
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
                  <input
                    type="text"
                    value={imp.action}
                    onChange={(e) => onUpdateImprovement(index, j, "action", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-gray-700 bg-white/80 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">担当者</label>
                  <input
                    type="text"
                    value={imp.owner}
                    onChange={(e) => onUpdateImprovement(index, j, "owner", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-gray-700 bg-white/80 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">時期・頻度</label>
                  <input
                    type="text"
                    value={imp.timeline}
                    onChange={(e) => onUpdateImprovement(index, j, "timeline", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-gray-700 bg-white/80 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">具体的な実施方法</label>
                  <input
                    type="text"
                    value={imp.method}
                    onChange={(e) => onUpdateImprovement(index, j, "method", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-gray-700 bg-white/80 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">期待される効果</label>
                  <input
                    type="text"
                    value={imp.expectedOutcome}
                    onChange={(e) => onUpdateImprovement(index, j, "expectedOutcome", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-gray-700 bg-white/80 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
