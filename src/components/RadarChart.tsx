"use client";

import { RADAR_LABELS } from "@/constants";

interface RadarChartProps {
  scores: Record<string, number>;
  forPdf?: boolean;
}

export default function RadarChart({ scores, forPdf = false }: RadarChartProps) {
  const cx = 150, cy = 150, r = 110;
  const levels = [1, 2, 3, 4, 5];

  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / RADAR_LABELS.length - Math.PI / 2;
    const dist = (value / 5) * r;
    return {
      x: cx + dist * Math.cos(angle),
      y: cy + dist * Math.sin(angle),
    };
  };

  const dataPoints = RADAR_LABELS.map((l, i) => getPoint(i, scores[l.key] || 0));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  const labelClass = forPdf ? "text-[12px] fill-gray-600 font-medium" : "text-[10px] fill-gray-600 font-medium";

  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 300 300" className="w-72 h-72">
        {levels.map((level) => {
          const pts = RADAR_LABELS.map((_, i) => getPoint(i, level));
          const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
          return <path key={level} d={path} fill="none" stroke="#e5e7eb" strokeWidth={level === 5 ? 1.5 : 0.8} />;
        })}
        {RADAR_LABELS.map((_, i) => {
          const p = getPoint(i, 5);
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#d1d5db" strokeWidth={0.8} />;
        })}
        <path d={dataPath} fill="rgba(79, 70, 229, 0.15)" stroke="#4f46e5" strokeWidth={2.5} />
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4} fill="#4f46e5" stroke="white" strokeWidth={2} />
        ))}
        {RADAR_LABELS.map((l, i) => {
          const p = getPoint(i, 6.2);
          return (
            <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" className={labelClass}>
              {l.label}
            </text>
          );
        })}
        {RADAR_LABELS.map((l, i) => {
          const p = getPoint(i, (scores[l.key] || 0) + 0.7);
          return (
            <text key={`v-${i}`} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" className="text-[11px] fill-indigo-600 font-bold">
              {scores[l.key] || 0}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
