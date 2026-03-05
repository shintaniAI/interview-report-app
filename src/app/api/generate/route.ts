import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const GEMINI_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(GEMINI_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      candidateName,
      department,
      jobTitle,
      hireDate,
      interviewDate,
      interviewer,
      transcript,
      memo,
      placement,
      jobDescription,
      previousReport,
      companyValues,
    } = body;

    const prompt = `あなたは人事コンサルタントです。以下の入社後フォロー面談の内容をもとに、構造化されたレポートをJSON形式で生成してください。

## 面談情報
- 候補者名/社員名: ${candidateName}
- 所属/職種: ${department} / ${jobTitle}
- 入社日: ${hireDate}
- 面談実施日: ${interviewDate}
- 面談担当者: ${interviewer}
${placement ? `- 配属先情報: ${placement}` : ""}
${jobDescription ? `- 求人票/期待役割: ${jobDescription}` : ""}
${previousReport ? `- 前回面談レポート: ${previousReport}` : ""}
${companyValues ? `- 会社のMVV/行動指針: ${companyValues}` : ""}

## 面談内容（文字起こし）
${transcript}

## 担当者メモ・MTG内容
${memo || "なし"}

## 出力形式
以下のJSON形式で出力してください。日本語で記載してください。

{
  "summary": "面談全体のサマリー（3〜5文で簡潔に）",
  "scores": {
    "engagement": { "score": 1-5の数値, "comment": "一言コメント" },
    "workAdaptation": { "score": 1-5の数値, "comment": "一言コメント" },
    "wlb": { "score": 1-5の数値, "comment": "一言コメント" },
    "expectationGap": { "score": 1-5の数値, "comment": "一言コメント" },
    "turnoverRisk": { "score": 1-5の数値(高いほどリスク低い), "comment": "一言コメント" }
  },
  "overallGrade": "A or B or C",
  "overallGradeReason": "総合評価の理由（1〜2文）",
  "retention": "定着・モチベーション状況の詳細分析（2〜4文）",
  "workAdaptation": "業務適応状況の詳細分析（2〜4文）",
  "workLifeBalance": "ワークライフバランスの状況（2〜4文）",
  "compensationConcerns": "評価・給与への理解や不安（2〜4文）",
  "relationships": "人間関係やコミュニケーション面の状況（2〜4文）",
  "positives": "良かった点・強み（箇条書き3〜5項目、配列）",
  "nextActions": [
    {
      "action": "具体的なアクション内容",
      "assignee": "担当者",
      "deadline": "期限の目安",
      "method": "確認方法"
    }
  ]
}

注意事項:
- 事実と推測を明確に分けてください
- スコアは1(懸念)〜5(良好)で評価してください
- 総合評価はA(概ね順調)、B(要フォロー)、C(早期対応推奨)で判定してください
- 次アクションは3件提案してください
- positivesは文字列の配列で返してください
- JSONのみを出力し、それ以外のテキストは含めないでください`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = text;
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    const report = JSON.parse(jsonStr);

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("Report generation error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: `レポート生成に失敗しました: ${errorMessage}` },
      { status: 500 }
    );
  }
}
