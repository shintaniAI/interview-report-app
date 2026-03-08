"use client";

interface LoadingScreenProps {
  onCancel: () => void;
}

export default function LoadingScreen({ onCancel }: LoadingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 flex flex-col items-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600" />
          <div className="absolute inset-0 flex items-center justify-center text-2xl">📋</div>
        </div>
        <p className="text-gray-700 text-lg font-semibold mt-6">レポートを生成中...</p>
        <p className="text-gray-400 text-sm mt-2">面談内容を分析しています</p>
        <div className="flex gap-1 mt-4">
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
        <button
          onClick={onCancel}
          className="mt-6 px-5 py-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all shadow-sm cursor-pointer text-sm"
        >
          ✕ キャンセル
        </button>
      </div>
    </div>
  );
}
