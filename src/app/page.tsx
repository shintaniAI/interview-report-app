"use client";

import { useState, useRef } from "react";

interface Score {
  score: number;
  comment: string;
}

interface NextAction {
  action: string;
  assignee: string;
  deadline: string;
  method: string;
}

interface Report {
  summary: string;
  scores: {
    engagement: Score;
    workAdaptation: Score;
    wlb: Score;
    expectationGap: Score;
    turnoverRisk: Score;
  };
  overallGrade: string;
  overallGradeReason: string;
  retention: string;
  workAdaptation: string;
  workLifeBalance: string;
  compensationConcerns: string;
  relationships: string;
  positives: string[];
  nextActions: NextAction[];
}

const SCORE_LABELS: Record<string, string> = {
  engagement: "エンゲージメント",
  workAdaptation: "業務適応",
  wlb: "WLB適応",
  expectationGap: "期待値ギャップ",
  turnoverRisk: "早期離職リスク",
};

const SCORE_ICONS: Record<string, string> = {
  engagement: "&#128170;",
  workAdaptation: "&#128736;",
  wlb: "&#9878;",
  expectationGap: "&#127919;",
  turnoverRisk: "&#128274;",
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

function ScoreBar({ label, score, comment, icon }: { label: string; score: number; comment: string; icon: string }) {
  const barColors = [
    "bg-rose-400",
    "bg-orange-400",
    "bg-amber-400",
    "bg-lime-400",
    "bg-emerald-400",
  ];
  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-white/60 transition-colors">
      <span className="text-lg shrink-0" dangerouslySetInnerHTML={{ __html: icon }} />
      <span className="w-36 text-sm font-medium text-gray-700 shrink-0">{label}</span>
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
      <span className="text-sm text-gray-500 ml-2 italic">{comment}</span>
    </div>
  );
}

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

  const updateNextAction = (index: number, field: keyof NextAction, value: string) => {
    if (!editableReport) return;
    const newActions = [...editableReport.nextActions];
    newActions[index] = { ...newActions[index], [field]: value };
    setEditableReport((prev) => (prev ? { ...prev, nextActions: newActions } : prev));
  };

  // INPUT FORM
  if (step === "input") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-3xl mx-auto py-10 px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
              <span>&#9889;</span> AI-Powered Report Generator
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              入社後面談レポート作成
            </h1>
            <p className="text-gray-500 mt-2">面談内容を入力してAIがレポートを自動生成します</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-5 py-4 rounded-r-lg mb-6 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-red-500 text-lg">&#9888;</span>
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
                <span className={`transition-transform duration-200 ${showOptional ? "rotate-90" : ""}`}>&#9654;</span>
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
              &#9889; レポートを生成する
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">Powered by Gemini AI</p>
        </div>
      </div>
    );
  }

  // LOADING
  if (step === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 flex flex-col items-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600" />
            <div className="absolute inset-0 flex items-center justify-center text-2xl">&#9889;</div>
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

  // REPORT VIEW
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
              &#8592; 入力に戻る
            </button>
            <button
              onClick={handlePdfExport}
              className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl font-medium hover:from-rose-600 hover:to-rose-700 transition-all shadow-lg shadow-rose-500/25 cursor-pointer"
            >
              &#128196; PDF保存
            </button>
          </div>

          {/* Report Content */}
          <div ref={reportRef} className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-white/60 p-8 space-y-8">
            {/* Header */}
            <div className="border-b border-gray-100 pb-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-lg">&#128203;</div>
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

            {/* Scores */}
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-xs">&#128202;</span>
                スコア一覧
              </h2>
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-100">
                {Object.entries(r.scores).map(([key, val]) => (
                  <ScoreBar
                    key={key}
                    label={SCORE_LABELS[key] || key}
                    score={val.score}
                    comment={val.comment}
                    icon={SCORE_ICONS[key] || "&#9679;"}
                  />
                ))}
              </div>
            </div>

            {/* Summary */}
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xs">&#128221;</span>
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
              { key: "retention", title: "定着・モチベーション状況", icon: "&#128293;", color: "orange" },
              { key: "workAdaptation", title: "業務適応状況", icon: "&#128736;", color: "blue" },
              { key: "workLifeBalance", title: "ワークライフバランス", icon: "&#9878;", color: "green" },
              { key: "compensationConcerns", title: "評価・給与への理解や不安", icon: "&#128176;", color: "amber" },
              { key: "relationships", title: "人間関係・コミュニケーション", icon: "&#129309;", color: "purple" },
            ].map(({ key, title, icon, color }) => (
              <div key={key}>
                <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className={`w-7 h-7 bg-${color}-100 rounded-lg flex items-center justify-center text-${color}-600 text-xs`} dangerouslySetInnerHTML={{ __html: icon }} />
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
                <span className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 text-xs">&#10024;</span>
                良かった点・強み
              </h2>
              <ul className="space-y-2.5">
                {r.positives.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-2.5">
                    <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs shrink-0">&#10003;</span>
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

            {/* Next Actions */}
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xs">&#127919;</span>
                次アクション提案
              </h2>
              <div className="space-y-4">
                {r.nextActions.map((action, i) => (
                  <div key={i} className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        Action {i + 1}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">アクション内容</label>
                        <input
                          type="text"
                          value={action.action}
                          onChange={(e) => updateNextAction(i, "action", e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-gray-700 bg-white/80 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">担当者</label>
                        <input
                          type="text"
                          value={action.assignee}
                          onChange={(e) => updateNextAction(i, "assignee", e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-gray-700 bg-white/80 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">期限</label>
                        <input
                          type="text"
                          value={action.deadline}
                          onChange={(e) => updateNextAction(i, "deadline", e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-gray-700 bg-white/80 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">確認方法</label>
                        <input
                          type="text"
                          value={action.method}
                          onChange={(e) => updateNextAction(i, "method", e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-gray-700 bg-white/80 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 pt-5 flex justify-between items-end">
              <div className="text-xs text-gray-400">
                <p>&#8251; このレポートはAIにより自動生成されたものです。</p>
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
