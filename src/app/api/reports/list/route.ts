import { NextResponse } from "next/server";

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
    throw new Error(`Token refresh failed: ${res.status} - ${errBody}`);
  }

  const data = await res.json();
  return data.access_token;
}

export async function GET() {
  try {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (!folderId) {
      return NextResponse.json(
        { success: false, error: "GOOGLE_DRIVE_FOLDER_ID が設定されていません" },
        { status: 500 }
      );
    }

    const accessToken = await getAccessToken();

    const q = `'${folderId}' in parents and mimeType='application/pdf' and trashed=false`;
    const params = new URLSearchParams({
      q,
      orderBy: "createdTime desc",
      fields: "files(id,name,webViewLink,createdTime)",
      pageSize: "100",
    });

    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?${params.toString()}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("Drive list error:", errText);
      return NextResponse.json(
        { success: false, error: `Drive APIエラー (${res.status})` },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json({ success: true, files: data.files || [] });
  } catch (error) {
    console.error("Reports list error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
