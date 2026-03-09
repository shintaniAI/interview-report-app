import { NextRequest, NextResponse } from "next/server";

interface FormData {
  candidateName: string;
  department: string;
  jobTitle: string;
  hireDate: string;
  interviewDate: string;
  interviewer: string;
}

interface Evidence {
  question: string;
  quote: string;
  interpretation: string;
}

interface ScoreDetail {
  score: number;
  comment: string;
  evidence?: Evidence[];
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
  severity: string;
  improvements?: Improvement[];
}

interface ReportData {
  summary?: string;
  overallGrade?: string;
  overallGradeReason?: string;
  retention?: string;
  workAdaptation?: string;
  workLifeBalance?: string;
  compensationConcerns?: string;
  relationships?: string;
  positives?: string[];
  scores?: Record<string, ScoreDetail>;
  issues?: Issue[];
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Google OAuth credentials not configured");
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error("Token refresh error:", res.status, errBody);
    throw new Error(`Token refresh failed: ${res.status} - ${errBody}`);
  }

  const data = await res.json();
  return data.access_token;
}

function generateHtml(form: FormData, report: ReportData): string {
  const gradeColors: Record<string, string> = { A: "#059669", B: "#d97706", C: "#e11d48" };
  const gradeLabels: Record<string, string> = { A: "概ね順調", B: "要フォロー", C: "早期対応推奨" };
  const scoreLabels: Record<string, string> = {
    engagement: "エンゲージメント", workAdaptation: "業務適応", wlb: "WLB適応",
    expectationGap: "期待値ギャップ", turnoverRisk: "早期離職リスク", growth: "成長意欲・キャリア"
  };

  const grade = report.overallGrade || "-";
  const gradeColor = gradeColors[grade] || "#666";
  const gradeLabel = gradeLabels[grade] || grade;

  let scoresHtml = "";
  if (report.scores) {
    for (const [key, val] of Object.entries(report.scores)) {
      const label = scoreLabels[key] || key;
      const score = val?.score || 0;
      const comment = val?.comment || "";
      const colors = ["#f43f5e", "#f97316", "#f59e0b", "#84cc16", "#10b981"];
      const bars = Array.from({ length: 5 }, (_, i) => {
        const bg = i < score ? colors[score - 1] : "#e5e7eb";
        return `<span style="display:inline-block;width:18px;height:18px;border-radius:3px;background:${bg};margin-right:2px;"></span>`;
      }).join("");

      let evidenceHtml = "";
      if (val?.evidence && val.evidence.length > 0) {
        evidenceHtml = '<div style="margin-top:8px;padding:8px 12px;background:#fefce8;border-left:3px solid #f59e0b;border-radius:0 6px 6px 0;font-size:12px;">';
        for (const ev of val.evidence) {
          evidenceHtml += `<p style="margin:4px 0;"><strong>Q:</strong> ${ev.question}</p>`;
          evidenceHtml += `<p style="margin:4px 0;font-style:italic;">「${ev.quote}」</p>`;
          evidenceHtml += `<p style="margin:4px 0;color:#666;">→ ${ev.interpretation}</p>`;
        }
        evidenceHtml += "</div>";
      }

      scoresHtml += `<div style="padding:8px 0;border-bottom:1px solid #f3f4f6;">
        <strong>${label}</strong> ${bars} <span style="color:#666;font-size:13px;">${comment}</span>
        ${evidenceHtml}
      </div>`;
    }
  }

  const positivesHtml = (report.positives || []).map(p => `<li style="padding:4px 0;">✓ ${p}</li>`).join("");

  let issuesHtml = "";
  if (report.issues) {
    for (const issue of report.issues) {
      const sevColors: Record<string, string> = { high: "#e11d48", medium: "#d97706", low: "#2563eb" };
      const sevLabels: Record<string, string> = { high: "重要", medium: "注意", low: "軽微" };
      const sevColor = sevColors[issue.severity] || "#666";
      const sevLabel = sevLabels[issue.severity] || issue.severity;

      let impsHtml = "";
      if (issue.improvements) {
        for (let j = 0; j < issue.improvements.length; j++) {
          const imp = issue.improvements[j];
          impsHtml += `<div style="margin-top:8px;padding:8px 12px;background:#eff6ff;border-radius:6px;font-size:13px;">
            <strong>施策 ${j + 1}:</strong> ${imp.action}<br/>
            <span style="font-size:12px;color:#666;">担当: ${imp.owner} | 時期: ${imp.timeline}<br/>方法: ${imp.method}<br/>効果: ${imp.expectedOutcome}</span>
          </div>`;
        }
      }

      issuesHtml += `<div style="margin-bottom:16px;padding:12px;border:1px solid #e5e7eb;border-radius:8px;">
        <span style="background:${sevColor};color:white;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:bold;">${sevLabel}</span>
        <strong style="margin-left:8px;">${issue.issue}</strong>
        <div style="margin-top:8px;padding:6px 12px;background:#fefce8;border-left:3px solid #f59e0b;border-radius:0 6px 6px 0;font-size:12px;font-style:italic;">「${issue.quote}」</div>
        ${impsHtml}
      </div>`;
    }
  }

  const sections = [
    { title: "定着・モチベーション状況", content: report.retention },
    { title: "業務適応状況", content: report.workAdaptation },
    { title: "ワークライフバランス", content: report.workLifeBalance },
    { title: "評価・給与への理解や不安", content: report.compensationConcerns },
    { title: "人間関係・コミュニケーション", content: report.relationships },
  ].filter(s => s.content).map(s =>
    `<h3 style="margin-top:20px;color:#374151;font-size:15px;">${s.title}</h3>
     <p style="color:#4b5563;line-height:1.7;">${s.content}</p>`
  ).join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{font-family:'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif;max-width:800px;margin:0 auto;padding:24px;color:#1f2937;font-size:14px;line-height:1.6;}
h1{font-size:22px;margin-bottom:4px;}
h2{font-size:17px;border-bottom:2px solid #f97316;padding-bottom:6px;margin-top:28px;color:#1f2937;}
table{width:100%;border-collapse:collapse;margin:16px 0;}
td{padding:6px 10px;border:1px solid #e5e7eb;font-size:13px;}
</style></head><body>
<h1>入社後面談レポート</h1>
<table>
<tr><td style="background:#f9fafb;width:80px;color:#9ca3af;">社員名</td><td><strong>${form.candidateName}</strong></td><td style="background:#f9fafb;width:80px;color:#9ca3af;">所属</td><td>${form.department || "-"}</td></tr>
<tr><td style="background:#f9fafb;color:#9ca3af;">職種</td><td>${form.jobTitle || "-"}</td><td style="background:#f9fafb;color:#9ca3af;">入社日</td><td>${form.hireDate || "-"}</td></tr>
<tr><td style="background:#f9fafb;color:#9ca3af;">面談日</td><td>${form.interviewDate || "-"}</td><td style="background:#f9fafb;color:#9ca3af;">担当者</td><td>${form.interviewer || "-"}</td></tr>
</table>
<div style="display:flex;align-items:center;gap:16px;padding:16px;border-radius:12px;border:1px solid ${gradeColor}33;background:${gradeColor}0d;">
<div style="width:56px;height:56px;border-radius:12px;background:${gradeColor};display:flex;align-items:center;justify-content:center;color:white;font-size:28px;font-weight:bold;">${grade}</div>
<div><strong style="font-size:17px;">総合評価: ${gradeLabel}</strong><p style="margin:4px 0;color:#4b5563;font-size:13px;">${report.overallGradeReason || ""}</p></div>
</div>
<h2>スコア一覧</h2>${scoresHtml}
<h2>面談サマリー</h2><p style="color:#4b5563;line-height:1.7;">${report.summary || ""}</p>
${sections}
<h2>良かった点・強み</h2><ul style="list-style:none;padding:0;">${positivesHtml}</ul>
<h2>課題と改善策</h2>${issuesHtml}
<div style="margin-top:30px;padding-top:12px;border-top:1px solid #e5e7eb;text-align:right;font-size:11px;color:#9ca3af;">
<p>作成日時: ${new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}</p>
<p>作成者: ${form.interviewer || "-"}</p>
</div></body></html>`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { form, report } = body;

    if (!form || !report) {
      return NextResponse.json({ success: false, error: "データが不足しています" }, { status: 400 });
    }

    const accessToken = await getAccessToken();
    const html = generateHtml(form, report);
    const pdfFileName = `面談レポート_${form.candidateName}_${form.interviewDate || "日付未設定"}.pdf`;
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || "";

    // Step 1: Upload HTML as Google Doc (converts HTML to Docs format, preserving Japanese)
    const boundary = "----FormBoundary" + Date.now();
    const metadataObj: Record<string, string | string[]> = {
      name: "temp_report_" + Date.now(),
      mimeType: "application/vnd.google-apps.document",
    };
    if (folderId) {
      metadataObj.parents = [folderId];
    }

    const metadataJson = JSON.stringify(metadataObj);
    const encoder = new TextEncoder();
    const htmlBytes = encoder.encode(html);
    const metadataBytes = encoder.encode(metadataJson);

    // Build multipart body as binary
    const parts: Uint8Array[] = [];
    parts.push(encoder.encode(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`));
    parts.push(metadataBytes);
    parts.push(encoder.encode(`\r\n--${boundary}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n`));
    parts.push(htmlBytes);
    parts.push(encoder.encode(`\r\n--${boundary}--`));

    const totalLength = parts.reduce((sum, p) => sum + p.length, 0);
    const uploadBody = new Uint8Array(totalLength);
    let uploadOffset = 0;
    for (const part of parts) {
      uploadBody.set(part, uploadOffset);
      uploadOffset += part.length;
    }

    const uploadRes = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": `multipart/related; boundary=${boundary}`,
        },
        body: uploadBody,
      }
    );

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error("Drive upload error:", errText);
      return NextResponse.json({ success: false, error: `Drive保存に失敗しました (${uploadRes.status})` }, { status: 502 });
    }

    const tempDoc = await uploadRes.json();
    const tempDocId = tempDoc.id;

    // Step 2: Export Google Doc as PDF
    const pdfRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${tempDocId}/export?mimeType=application/pdf`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!pdfRes.ok) {
      // Cleanup temp doc
      await fetch(`https://www.googleapis.com/drive/v3/files/${tempDocId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return NextResponse.json({ success: false, error: `PDF変換に失敗しました (${pdfRes.status})` }, { status: 502 });
    }

    const pdfBuffer = await pdfRes.arrayBuffer();

    // Step 3: Upload PDF to Drive
    const pdfMetadata: Record<string, string | string[]> = {
      name: pdfFileName,
      mimeType: "application/pdf",
    };
    if (folderId) {
      pdfMetadata.parents = [folderId];
    }

    const pdfBoundary = "----PdfBoundary" + Date.now();
    const pdfMetaBytes = encoder.encode(JSON.stringify(pdfMetadata));
    const pdfDataBytes = new Uint8Array(pdfBuffer);

    const pdfParts: Uint8Array[] = [];
    pdfParts.push(encoder.encode(`--${pdfBoundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`));
    pdfParts.push(pdfMetaBytes);
    pdfParts.push(encoder.encode(`\r\n--${pdfBoundary}\r\nContent-Type: application/pdf\r\n\r\n`));
    pdfParts.push(pdfDataBytes);
    pdfParts.push(encoder.encode(`\r\n--${pdfBoundary}--`));

    const pdfTotal = pdfParts.reduce((sum, p) => sum + p.length, 0);
    const pdfBody = new Uint8Array(pdfTotal);
    let pdfOffset = 0;
    for (const part of pdfParts) {
      pdfBody.set(part, pdfOffset);
      pdfOffset += part.length;
    }

    const pdfUploadRes = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": `multipart/related; boundary=${pdfBoundary}`,
        },
        body: pdfBody,
      }
    );

    // Step 4: Delete temp Google Doc
    await fetch(`https://www.googleapis.com/drive/v3/files/${tempDocId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    }).catch(() => {}); // best effort cleanup

    if (!pdfUploadRes.ok) {
      const errText = await pdfUploadRes.text();
      console.error("PDF upload error:", errText);
      return NextResponse.json({ success: false, error: `PDF保存に失敗しました (${pdfUploadRes.status})` }, { status: 502 });
    }

    const fileData = await pdfUploadRes.json();

    return NextResponse.json({
      success: true,
      fileId: fileData.id,
      fileName: fileData.name,
      webViewLink: fileData.webViewLink,
    });
  } catch (error) {
    console.error("Save to Drive error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: `保存に失敗しました: ${msg}` }, { status: 500 });
  }
}
