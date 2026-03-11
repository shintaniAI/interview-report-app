"use client";

import { useState, useEffect } from "react";

interface DriveFile {
  id: string;
  name: string;
  webViewLink: string;
  createdTime: string;
}

interface ReportHistoryProps {
  onBack: () => void;
}

export default function ReportHistory({ onBack }: ReportHistoryProps) {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch("/api/reports/list");
        const data = await res.json();
        if (data.success) {
          setFiles(data.files || []);
        } else {
          setError(data.error || "履歴の取得に失敗しました");
        }
      } catch {
        setError("履歴の取得に失敗しました（通信エラー）");
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack}
            className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm cursor-pointer">
            ← 戻る
          </button>
          <h1 className="text-2xl font-bold text-gray-800">📂 過去レポート</h1>
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
          </div>
        )}

        {!loading && !error && files.length === 0 && (
          <div className="bg-white/80 rounded-2xl shadow-sm border border-white/60 p-12 text-center">
            <p className="text-gray-400 text-lg">保存されたレポートはありません</p>
          </div>
        )}

        {!loading && files.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/60 divide-y divide-gray-100">
            {files.map((f) => (
              <a
                key={f.id}
                href={f.webViewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-5 py-4 hover:bg-orange-50/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-red-500 text-lg shrink-0">📄</span>
                  <span className="text-gray-800 font-medium truncate">{f.name}</span>
                </div>
                <span className="text-sm text-gray-400 shrink-0 ml-4">
                  {new Date(f.createdTime).toLocaleDateString("ja-JP")}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
