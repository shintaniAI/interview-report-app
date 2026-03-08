# 入社後面談レポート作成ツール

入社後の面談データ（文字起こし）をAIが分析し、構造化されたレポートを自動生成するWebアプリケーションです。

## 技術スタック

- **フレームワーク:** Next.js (App Router)
- **言語:** TypeScript
- **スタイリング:** Tailwind CSS
- **AI:** Google Gemini API
- **PDF出力:** html2pdf.js

## セットアップ

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env.local
# .env.local に Gemini API キーを設定

# 開発サーバー起動
npm run dev
```

## 環境変数

| 変数名 | 説明 |
|--------|------|
| `GEMINI_API_KEY` | Google Gemini API のAPIキー |

## 使い方

1. ブラウザで http://localhost:3000 を開く
2. 候補者名・所属などの基本情報を入力
3. 面談の文字起こしテキストを貼り付け
4. 「レポートを生成する」ボタンをクリック
5. 生成されたレポートを確認・編集
6. 必要に応じてPDFとして保存

## 機能

- 📊 6軸のスコア評価（レーダーチャート表示）
- 📝 面談サマリー・詳細セクションの自動生成
- 🔍 課題の抽出と改善施策の提案
- ✏️ 生成結果のインライン編集
- 📄 PDF出力
