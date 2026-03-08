"use client";

import { useState } from "react";
import type { FormData } from "@/types";

interface InputFormProps {
  form: FormData;
  error: string;
  onUpdateForm: (field: string, value: string) => void;
  onSubmit: () => void;
}

export default function InputForm({ form, error, onUpdateForm, onSubmit }: InputFormProps) {
  const [showOptional, setShowOptional] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-3xl mx-auto py-10 px-4">
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-red-500 text-lg">⚠</span>
                <span>{error}</span>
              </div>
              <button onClick={onSubmit}
                className="px-4 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors cursor-pointer shrink-0 ml-3">
                🔄 リトライ
              </button>
            </div>
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-white/60 p-8 space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-sm font-bold">1</div>
            <h2 className="text-lg font-semibold text-gray-700">基本情報</h2>
            <span className="text-xs text-red-400 ml-1">* 必須</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">候補者名 / 社員名 <span className="text-red-400">*</span></label>
              <input type="text" value={form.candidateName} onChange={(e) => onUpdateForm("candidateName", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                placeholder="山田 太郎" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">所属</label>
              <input type="text" value={form.department} onChange={(e) => onUpdateForm("department", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                placeholder="営業部" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">職種</label>
              <input type="text" value={form.jobTitle} onChange={(e) => onUpdateForm("jobTitle", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                placeholder="法人営業" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">入社日</label>
              <input type="date" value={form.hireDate} onChange={(e) => onUpdateForm("hireDate", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">面談実施日</label>
              <input type="date" value={form.interviewDate} onChange={(e) => onUpdateForm("interviewDate", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">面談担当者</label>
              <input type="text" value={form.interviewer} onChange={(e) => onUpdateForm("interviewer", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                placeholder="佐藤 花子" />
            </div>
          </div>

          <div className="flex items-center gap-2 border-b border-gray-100 pb-3 pt-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-sm font-bold">2</div>
            <h2 className="text-lg font-semibold text-gray-700">面談データ</h2>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-600">
                文字起こしテキスト <span className="text-red-400">*</span>
              </label>
              <span className="text-xs text-gray-400">{form.transcript.length.toLocaleString()} 文字</span>
            </div>
            <textarea value={form.transcript} onChange={(e) => onUpdateForm("transcript", e.target.value)} rows={8}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              placeholder="面談の文字起こしテキストを貼り付けてください..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">担当者メモ / MTG内容</label>
            <textarea value={form.memo} onChange={(e) => onUpdateForm("memo", e.target.value)} rows={4}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              placeholder="面談時のメモや気づきを入力..." />
          </div>

          <div>
            <button type="button" onClick={() => setShowOptional(!showOptional)}
              className="flex items-center gap-2 text-indigo-600 text-sm font-medium hover:text-indigo-800 transition-colors cursor-pointer">
              <span className={`transition-transform duration-200 ${showOptional ? "rotate-90" : ""}`}>▶</span>
              追加情報を入力する（任意）
            </button>

            {showOptional && (
              <div className="mt-5 space-y-4 border-t border-dashed border-gray-200 pt-5">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">配属先情報</label>
                  <input type="text" value={form.placement} onChange={(e) => onUpdateForm("placement", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">求人票 / 期待役割</label>
                  <textarea value={form.jobDescription} onChange={(e) => onUpdateForm("jobDescription", e.target.value)} rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">前回面談レポート</label>
                  <textarea value={form.previousReport} onChange={(e) => onUpdateForm("previousReport", e.target.value)} rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">会社のMVV / 行動指針</label>
                  <textarea value={form.companyValues} onChange={(e) => onUpdateForm("companyValues", e.target.value)} rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                </div>
              </div>
            )}
          </div>

          <button onClick={onSubmit}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-[0.99] cursor-pointer">
            ⚡ レポートを生成する
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">Powered by Gemini AI</p>
      </div>
    </div>
  );
}
