import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const GEMINI_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(GEMINI_KEY);

export async function POST(req: NextRequest) {
  try {
    if (!GEMINI_KEY) {
      return NextResponse.json(
        { success: false, error: "GEMINI_API_KEY 環境変数が設定されていません。Vercelの環境変数設定を確認してください。" },
        { status: 500 }
      );
    }

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
    "engagement": {
      "score": 1-5の数値,
      "comment": "一言コメント",
      "evidence": [
        {
          "question": "この評価に関連する質問や話題",
          "quote": "発言の要旨を端的に1文で（例: 裁量をもっと持ちたい）",
          "interpretation": "この発言からどう評価したかを端的に1文で"
        }
      ]
    },
    "workAdaptation": {
      "score": 1-5の数値,
      "comment": "一言コメント",
      "evidence": [同上の形式]
    },
    "wlb": {
      "score": 1-5の数値,
      "comment": "一言コメント",
      "evidence": [同上の形式]
    },
    "expectationGap": {
      "score": 1-5の数値,
      "comment": "一言コメント",
      "evidence": [同上の形式]
    },
    "growth": {
      "score": 1-5の数値,
      "comment": "一言コメント",
      "evidence": [同上の形式]
    }
  },
  "radarScores": {
    "engagement": 1-5の数値,
    "workAdaptation": 1-5の数値,
    "wlb": 1-5の数値,
    "expectationGap": 1-5の数値,
    "growth": 1-5の数値
  },
  "totalScore": 5項目の合計点（5〜25）,
  "overallGrade": "A or B or C",
  "overallGradeReason": "総合評価の理由（1〜2文）",
  "retention": "定着・モチベーション状況の詳細分析（2〜4文）",
  "workAdaptation": "業務適応状況の詳細分析（2〜4文）",
  "workLifeBalance": "ワークライフバランスの状況（2〜4文）",
  "compensationConcerns": "評価・給与への理解や不安（2〜4文）",
  "relationships": "人間関係やコミュニケーション面の状況（2〜4文）",
  "positives": ["良かった点・強み（箇条書き3〜5項目、配列）"],
  "issues": [
    {
      "issue": "特定された課題（具体的に）",
      "quote": "課題の根拠を端的に1文で",
      "severity": "high or medium or low",
      "improvements": [
        {
          "action": "具体的な改善施策（シート作成、定例MTG設計、仕組み化など）",
          "owner": "実施担当者",
          "timeline": "実施時期・頻度",
          "method": "具体的な実施方法・手順",
          "expectedOutcome": "期待される効果"
        }
      ]
    }
  ]
}

【最重要ルール】
- 入力された面談内容（文字起こし・メモ）に記載されている情報のみを使用してください
- 文字起こしに書かれていない内容を推測・創作・捏造しないでください
- evidenceのquoteは文字起こしテキストの実際の発言内容に基づき、意味を変えずに読みやすい文語体の日本語に整えて記載してください。存在しない発言を作らないでください
- 文字起こしの内容が不十分で評価できない項目がある場合、scoreを3（判断材料不足）とし、commentに「面談内容から十分な情報が得られませんでした」と記載してください
- issuesも文字起こしの中で実際に言及された内容からのみ抽出してください
- positivesも実際の発言内容に基づくもののみ記載してください

注意事項:
- evidenceのquoteは面談の文字起こしの実際の発言内容に基づき、口語をそのまま転記せず読みやすい文語体の日本語に整えて記載してください（意味は変えない。捏造禁止）
- 各スコアのevidenceは1〜3件程度記載してください
- issuesは面談から読み取れる課題を2〜5件抽出し、それぞれに具体的な改善策を提示してください
- 改善策は「シートを作成する」「週次MTGを設ける」「1on1の頻度を変える」など仕組みとして実行可能なレベルで具体化してください
- radarScoresは5項目すべて1-5の数値で記載（レーダーチャート描画用）
- growthは「成長意欲・キャリア展望」として評価してください
- スコアは1(懸念)〜5(良好)で評価してください
- totalScoreは5項目（engagement, workAdaptation, wlb, expectationGap, growth）のスコア合計（5〜25点）を算出してください
- overallGradeはtotalScoreに基づき判定: 20点以上→A（概ね順調）、15〜19点→B（要フォロー）、14点以下→C（早期対応推奨）
- issuesのseverity判定基準: high=離職リスクや業務継続に直結する課題、medium=放置すると悪化する可能性がある課題、low=改善推奨だが緊急性は低い
- 全テキストは口語をそのまま使わず、端的で読みやすい文語体の日本語に整えて出力してください
- evidenceのquoteとinterpretationは箇条書き的に1文で簡潔に書いてください（長文禁止）
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

    let report;
    try {
      report = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error("JSON parse failed. Raw response:", text.substring(0, 500));
      return NextResponse.json(
        { success: false, error: "AIの応答をJSONとして解析できませんでした。もう一度お試しください。" },
        { status: 500 }
      );
    }

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
