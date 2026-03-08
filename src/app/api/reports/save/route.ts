import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const webhookUrl = process.env.N8N_WEBHOOK_SAVE_URL;

  if (!webhookUrl) {
    return NextResponse.json(
      { success: false, error: "N8N_WEBHOOK_SAVE_URL が設定されていません" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...body,
        savedAt: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `n8n webhook error: ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json().catch(() => ({}));
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Save report error:", error);
    return NextResponse.json(
      { success: false, error: "レポートの保存に失敗しました" },
      { status: 500 }
    );
  }
}
