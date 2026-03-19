import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "入社後面談レポート作成",
  description: "面談内容からレポートを自動生成するツール",
};

const polyfillScript = `
if(!Object.hasOwn){Object.hasOwn=function(o,p){return Object.prototype.hasOwnProperty.call(o,p)}}
if(!Array.prototype.at){Array.prototype.at=function(n){n=Math.trunc(n)||0;if(n<0)n+=this.length;if(n<0||n>=this.length)return undefined;return this[n]}}
if(!String.prototype.at){String.prototype.at=function(n){n=Math.trunc(n)||0;if(n<0)n+=this.length;if(n<0||n>=this.length)return undefined;return this[n]}}
if(!String.prototype.replaceAll){String.prototype.replaceAll=function(s,r){return this.split(s).join(r)}}
if(typeof structuredClone==='undefined'){window.structuredClone=function(v){return JSON.parse(JSON.stringify(v))}}
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" translate="no">
      <head>
        <meta name="google" content="notranslate" />
        <script dangerouslySetInnerHTML={{ __html: polyfillScript }} />
      </head>
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
