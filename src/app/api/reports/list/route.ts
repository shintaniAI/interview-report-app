import { NextResponse } from "next/server";

export async function GET() {
  const webhookUrl = process.env.N8N_WEBHOOK_LIST_URL;

  if (!webhookUrl) {
    return NextResponse.json(
      { success: false, error: "N8N_WEBHOOK_LIST_URL が設定されていません" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `n8n webhook error: ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json({ success: true, reports: Array.isArray(data) ? data : data.reports || [] });
  } catch (error) {
    console.error("List reports error:", error);
    return NextResponse.json(
      { success: false, error: "履歴の取得に失敗しました" },
      { status: 500 }
    );
  }
}
