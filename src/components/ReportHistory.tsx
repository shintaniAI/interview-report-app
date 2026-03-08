"use client";

import { useState, useEffect } from "react";

interface ReportSummary {
  id: string;
  candidateName: string;
  department: string;
  interviewDate: string;
  overallGrade: string;
  savedAt: string;
}

interface ReportHistoryProps {
  onBack: () => void;
}

export default function ReportHistory({ onBack }: ReportHistoryProps) {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch("/api/reports/list");
        const data = await res.json();
        if (data.success) {
          setReports(data.reports || []);
        } else {
          setError(data.error || "履歴の取得に失敗しました");
        }
      } catch {
        setError("履歴の取得に失敗しました（通信エラー）");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const gradeColor: Record<string, string> = {
    A: "bg-emerald-100 text-emerald-700",
    B: "bg-amber-100 text-amber-700",
    C: "bg-rose-100 text-rose-700",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack}
            className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm cursor-pointer">
            ← 戻る
          </button>
          <h1 className="text-2xl font-bold text-gray-800">📂 レポート履歴</h1>
        </div>

        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-200 border-t-orange-600 mx-auto" />
            <p className="text-gray-500 mt-4">読み込み中...</p>
          </div>
        )}

        {error && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <p className="text-amber-700 font-medium">{error}</p>
            <p className="text-amber-600 text-sm mt-2">n8n Webhookが設定されていない可能性があります。<br />環境変数 N8N_WEBHOOK_LIST_URL を確認してください。</p>
          </div>
        )}

        {!loading && !error && reports.length === 0 && (
          <div className="bg-white/80 rounded-2xl shadow-sm border border-white/60 p-12 text-center">
            <p className="text-gray-400 text-lg">保存されたレポートはありません</p>
          </div>
        )}

        {!loading && reports.length > 0 && (
          <div className="space-y-3">
            {reports.map((r) => (
              <div key={r.id} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/60 p-5 flex items-center gap-4">
                <span className={`text-lg font-bold px-3 py-1 rounded-lg ${gradeColor[r.overallGrade] || "bg-gray-100 text-gray-600"}`}>
                  {r.overallGrade}
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{r.candidateName}</p>
                  <p className="text-sm text-gray-500">{r.department || "-"} ・ {r.interviewDate || "-"}</p>
                </div>
                <p className="text-xs text-gray-400">{r.savedAt ? new Date(r.savedAt).toLocaleDateString("ja-JP") : "-"}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
