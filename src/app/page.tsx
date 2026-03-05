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

const GRADE_COLORS: Record<string, string> = {
  A: "bg-green-500",
  B: "bg-yellow-500",
  C: "bg-red-500",
};

const GRADE_LABELS: Record<string, string> = {
  A: "概ね順調",
  B: "要フォロー",
  C: "早期対応推奨",
};

function ScoreBar({ label, score, comment }: { label: string; score: number; comment: string }) {
  const colors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-lime-400", "bg-green-400"];
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="w-40 text-sm font-medium text-gray-700 shrink-0">{label}</span>
      <div className="flex gap-1 shrink-0">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`w-6 h-6 rounded ${i <= score ? colors[score - 1] : "bg-gray-200"}`}
          />
        ))}
      </div>
      <span className="text-sm text-gray-500 ml-2">{comment}</span>
    </div>
  );
}

export default function Home() {
  const [step, setStep] = useState<"input" | "loading" | "report">("input");
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [showOptional, setShowOptional] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Form state
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

  // Editable report state
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
      <div className="max-w-3xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">入社後面談レポート作成</h1>
        <p className="text-gray-500 mb-8">面談内容を入力してAIがレポートを自動生成します</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">基本情報（必須）</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">候補者名 / 社員名 *</label>
              <input
                type="text"
                value={form.candidateName}
                onChange={(e) => updateForm("candidateName", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="山田 太郎"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">所属</label>
              <input
                type="text"
                value={form.department}
                onChange={(e) => updateForm("department", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="営業部"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">職種</label>
              <input
                type="text"
                value={form.jobTitle}
                onChange={(e) => updateForm("jobTitle", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="法人営業"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">入社日</label>
              <input
                type="date"
                value={form.hireDate}
                onChange={(e) => updateForm("hireDate", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">面談実施日</label>
              <input
                type="date"
                value={form.interviewDate}
                onChange={(e) => updateForm("interviewDate", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">面談担当者</label>
              <input
                type="text"
                value={form.interviewer}
                onChange={(e) => updateForm("interviewer", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="佐藤 花子"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              面談データ（文字起こしテキスト） *
            </label>
            <textarea
              value={form.transcript}
              onChange={(e) => updateForm("transcript", e.target.value)}
              rows={8}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="文字起こしテキストを貼り付けてください..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              担当者メモ / MTG内容
            </label>
            <textarea
              value={form.memo}
              onChange={(e) => updateForm("memo", e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="面談時のメモや気づきを入力..."
            />
          </div>

          {/* Optional Fields */}
          <div>
            <button
              type="button"
              onClick={() => setShowOptional(!showOptional)}
              className="text-blue-600 text-sm hover:underline"
            >
              {showOptional ? "▼ 追加情報を閉じる" : "▶ 追加情報を入力する（任意）"}
            </button>

            {showOptional && (
              <div className="mt-4 space-y-4 border-t pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">配属先情報</label>
                  <input
                    type="text"
                    value={form.placement}
                    onChange={(e) => updateForm("placement", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">求人票 / 期待役割</label>
                  <textarea
                    value={form.jobDescription}
                    onChange={(e) => updateForm("jobDescription", e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">前回面談レポート</label>
                  <textarea
                    value={form.previousReport}
                    onChange={(e) => updateForm("previousReport", e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">会社のMVV / 行動指針</label>
                  <textarea
                    value={form.companyValues}
                    onChange={(e) => updateForm("companyValues", e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 transition cursor-pointer"
          >
            レポートを生成する
          </button>
        </div>
      </div>
    );
  }

  // LOADING
  if (step === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
        <p className="text-gray-600 text-lg">レポートを生成中...</p>
        <p className="text-gray-400 text-sm mt-2">AIが面談内容を分析しています</p>
      </div>
    );
  }

  // REPORT VIEW
  if (step === "report" && editableReport) {
    const r = editableReport;
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        {/* Action buttons */}
        <div className="no-print flex gap-3 mb-6">
          <button
            onClick={() => setStep("input")}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition cursor-pointer"
          >
            ← 入力に戻る
          </button>
          <button
            onClick={handlePdfExport}
            className="px-6 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition cursor-pointer"
          >
            PDF保存
          </button>
        </div>

        {/* Report Content */}
        <div ref={reportRef} className="bg-white rounded-lg shadow p-8 space-y-8">
          {/* Header */}
          <div className="border-b pb-4">
            <h1 className="text-2xl font-bold text-gray-800">入社後面談レポート</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3 text-sm text-gray-600">
              <p>社員名: <strong>{form.candidateName}</strong></p>
              <p>所属: <strong>{form.department || "-"}</strong></p>
              <p>職種: <strong>{form.jobTitle || "-"}</strong></p>
              <p>入社日: <strong>{form.hireDate || "-"}</strong></p>
              <p>面談日: <strong>{form.interviewDate || "-"}</strong></p>
              <p>担当者: <strong>{form.interviewer || "-"}</strong></p>
            </div>
          </div>

          {/* Overall Grade */}
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-full ${GRADE_COLORS[r.overallGrade] || "bg-gray-400"} flex items-center justify-center text-white text-3xl font-bold`}
            >
              {r.overallGrade}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-800">
                総合評価: {GRADE_LABELS[r.overallGrade] || r.overallGrade}
              </p>
              <textarea
                value={r.overallGradeReason}
                onChange={(e) => updateReportField("overallGradeReason", e.target.value)}
                className="text-sm text-gray-600 w-full border-0 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-0 resize-none p-0 mt-1"
                rows={2}
              />
            </div>
          </div>

          {/* Scores */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">スコア一覧</h2>
            <div className="bg-gray-50 rounded-md p-4">
              {Object.entries(r.scores).map(([key, val]) => (
                <ScoreBar
                  key={key}
                  label={SCORE_LABELS[key] || key}
                  score={val.score}
                  comment={val.comment}
                />
              ))}
            </div>
          </div>

          {/* Summary */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">面談サマリー</h2>
            <textarea
              value={r.summary}
              onChange={(e) => updateReportField("summary", e.target.value)}
              className="w-full border border-gray-200 rounded-md p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 resize-y"
              rows={4}
            />
          </div>

          {/* Detail Sections */}
          {[
            { key: "retention", title: "定着・モチベーション状況" },
            { key: "workAdaptation", title: "業務適応状況" },
            { key: "workLifeBalance", title: "ワークライフバランス" },
            { key: "compensationConcerns", title: "評価・給与への理解や不安" },
            { key: "relationships", title: "人間関係・コミュニケーション" },
          ].map(({ key, title }) => (
            <div key={key}>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">{title}</h2>
              <textarea
                value={(r as unknown as Record<string, unknown>)[key] as string}
                onChange={(e) => updateReportField(key, e.target.value)}
                className="w-full border border-gray-200 rounded-md p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 resize-y"
                rows={3}
              />
            </div>
          ))}

          {/* Positives */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">良かった点</h2>
            <ul className="space-y-2">
              {r.positives.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1 shrink-0">&#10003;</span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updatePositive(i, e.target.value)}
                    className="flex-1 border border-gray-200 rounded px-2 py-1 text-gray-700 focus:ring-2 focus:ring-blue-500"
                  />
                </li>
              ))}
            </ul>
          </div>

          {/* Next Actions */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">次アクション提案</h2>
            <div className="space-y-4">
              {r.nextActions.map((action, i) => (
                <div key={i} className="bg-blue-50 border border-blue-100 rounded-md p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                      Action {i + 1}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <label className="text-xs text-gray-500">アクション内容</label>
                      <input
                        type="text"
                        value={action.action}
                        onChange={(e) => updateNextAction(i, "action", e.target.value)}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-gray-700 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">担当者</label>
                      <input
                        type="text"
                        value={action.assignee}
                        onChange={(e) => updateNextAction(i, "assignee", e.target.value)}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-gray-700 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">期限</label>
                      <input
                        type="text"
                        value={action.deadline}
                        onChange={(e) => updateNextAction(i, "deadline", e.target.value)}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-gray-700 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-gray-500">確認方法</label>
                      <input
                        type="text"
                        value={action.method}
                        onChange={(e) => updateNextAction(i, "method", e.target.value)}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-gray-700 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t pt-4 text-xs text-gray-400 text-right">
            <p>作成日時: {new Date().toLocaleString("ja-JP")}</p>
            <p>作成者: {form.interviewer || "-"}</p>
            <p className="mt-1">※ このレポートはAIにより自動生成されたものです。内容は担当者が確認・修正の上ご利用ください。</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
