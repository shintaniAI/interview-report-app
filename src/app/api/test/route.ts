import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function GET() {
  const results: Record<string, unknown> = {};

  // 1. Check if API key exists
  const apiKey = process.env.GEMINI_API_KEY;
  results.apiKeySet = !!apiKey;
  results.apiKeyLength = apiKey?.length ?? 0;
  results.apiKeyPrefix = apiKey?.substring(0, 8) ?? "not set";

  if (!apiKey) {
    return NextResponse.json({ ...results, error: "GEMINI_API_KEY is not set" });
  }

  // 2. Try Gemini API call
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const result = await model.generateContent("Say hello in Japanese. Reply with just the greeting.");
    const text = result.response.text();
    results.geminiResponse = text;
    results.success = true;
  } catch (error) {
    results.success = false;
    results.error = error instanceof Error ? error.message : String(error);
    results.errorType = error instanceof Error ? error.constructor.name : typeof error;
  }

  return NextResponse.json(results);
}
