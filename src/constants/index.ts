export const SCORE_LABELS: Record<string, string> = {
  engagement: "エンゲージメント",
  workAdaptation: "業務適応",
  wlb: "WLB適応",
  expectationGap: "期待値ギャップ",
  growth: "成長意欲・キャリア",
};

export const SCORE_ICONS: Record<string, string> = {
  engagement: "",
  workAdaptation: "",
  wlb: "",
  expectationGap: "",
  growth: "",
};

export const GRADE_COLORS: Record<string, string> = {
  A: "from-emerald-400 to-emerald-600",
  B: "from-amber-400 to-amber-600",
  C: "from-rose-400 to-rose-600",
};

export const GRADE_BG: Record<string, string> = {
  A: "bg-emerald-50 border-emerald-200",
  B: "bg-amber-50 border-amber-200",
  C: "bg-rose-50 border-rose-200",
};

export const GRADE_LABELS: Record<string, string> = {
  A: "概ね順調",
  B: "要フォロー",
  C: "早期対応推奨",
};

export const SEVERITY_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  high: { label: "重要", color: "text-rose-700", bg: "bg-rose-100" },
  medium: { label: "注意", color: "text-amber-700", bg: "bg-amber-100" },
  low: { label: "軽微", color: "text-blue-700", bg: "bg-blue-100" },
};

export const RADAR_LABELS = [
  { key: "engagement", label: "エンゲージメント" },
  { key: "workAdaptation", label: "業務適応" },
  { key: "wlb", label: "WLB" },
  { key: "expectationGap", label: "期待値一致" },
  { key: "growth", label: "成長意欲" },
];
