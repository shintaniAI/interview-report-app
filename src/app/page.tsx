"use client";

import { useState, useRef } from "react";
import type { Report, FormData, Improvement } from "@/types";
import InputForm from "@/components/InputForm";
import LoadingScreen from "@/components/LoadingScreen";
import ReportView from "@/components/ReportView";
import ReportHistory from "@/components/ReportHistory";

export default function Home() {
  const [step, setStep] = useState<"input" | "loading" | "report" | "history">("input");
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const [form, setForm] = useState<FormData>({
    candidateName: "",
    department: "",
    jobTitle: "",
    hireDate: "",
    interviewDate: "",
    interviewer: "",
    transcript: "",
    memo: "",
    placement: "",
    jobDescription: "",
    previousReport: "",
    companyValues: "",
  });

  const [editableReport, setEditableReport] = useState<Report | null>(null);

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.candidateName || !form.transcript) {
      setError("候補者名と面談データ（文字起こし）は必須です。");
      return;
    }
    setError("");
    setStep("loading");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        signal: controller.signal,
      });
      const data = await res.json();
      if (data.success) {
        setReport(data.report);
        setEditableReport(data.report);
        setStep("report");
      } else {
        setError(data.error || "エラーが発生しました");
        setStep("input");
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") {
        setError("生成をキャンセルしました。");
      } else {
        setError("通信エラーが発生しました。もう一度お試しください。");
      }
      setStep("input");
    } finally {
      abortRef.current = null;
    }
  };

  const handleCancel = () => {
    abortRef.current?.abort();
    setStep("input");
  };

  const updateReportField = (field: string, value: string) => {
    if (!editableReport) return;
    setEditableReport((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const updatePositive = (index: number, value: string) => {
    if (!editableReport) return;
    const newPositives = [...editableReport.positives];
    newPositives[index] = value;
    setEditableReport((prev) => (prev ? { ...prev, positives: newPositives } : prev));
  };

  const updateScore = (scoreKey: string, newScore: number) => {
    if (!editableReport) return;
    setEditableReport((prev) => {
      if (!prev) return prev;
      const newScores = { ...prev.scores };
      const existing = newScores[scoreKey as keyof typeof newScores];
      if (existing) {
        newScores[scoreKey as keyof typeof newScores] = { ...existing, score: newScore };
      }
      const newRadar = prev.radarScores ? { ...prev.radarScores, [scoreKey]: newScore } : prev.radarScores;
      return { ...prev, scores: newScores, radarScores: newRadar };
    });
  };

  const updateGrade = (grade: string) => {
    if (!editableReport) return;
    setEditableReport((prev) => (prev ? { ...prev, overallGrade: grade } : prev));
  };

  const addPositive = () => {
    if (!editableReport) return;
    setEditableReport((prev) => (prev ? { ...prev, positives: [...(prev.positives || []), ""] } : prev));
  };

  const removePositive = (index: number) => {
    if (!editableReport) return;
    const newPositives = editableReport.positives.filter((_, i) => i !== index);
    setEditableReport((prev) => (prev ? { ...prev, positives: newPositives } : prev));
  };

  const addIssue = () => {
    if (!editableReport) return;
    const newIssue = { issue: "", quote: "", severity: "medium" as const, improvements: [] };
    setEditableReport((prev) => (prev ? { ...prev, issues: [...(prev.issues || []), newIssue] } : prev));
  };

  const removeIssue = (index: number) => {
    if (!editableReport) return;
    const newIssues = editableReport.issues.filter((_, i) => i !== index);
    setEditableReport((prev) => (prev ? { ...prev, issues: newIssues } : prev));
  };

  const addImprovement = (issueIdx: number) => {
    if (!editableReport) return;
    const newIssues = [...editableReport.issues];
    const newImp = { action: "", owner: "", timeline: "", method: "", expectedOutcome: "" };
    newIssues[issueIdx] = { ...newIssues[issueIdx], improvements: [...(newIssues[issueIdx].improvements || []), newImp] };
    setEditableReport((prev) => (prev ? { ...prev, issues: newIssues } : prev));
  };

  const removeImprovement = (issueIdx: number, impIdx: number) => {
    if (!editableReport) return;
    const newIssues = [...editableReport.issues];
    newIssues[issueIdx] = { ...newIssues[issueIdx], improvements: newIssues[issueIdx].improvements.filter((_, i) => i !== impIdx) };
    setEditableReport((prev) => (prev ? { ...prev, issues: newIssues } : prev));
  };

  const updateIssueField = (issueIdx: number, field: string, value: string) => {
    if (!editableReport) return;
    const newIssues = [...editableReport.issues];
    newIssues[issueIdx] = { ...newIssues[issueIdx], [field]: value };
    setEditableReport((prev) => (prev ? { ...prev, issues: newIssues } : prev));
  };

  const updateImprovement = (issueIdx: number, impIdx: number, field: keyof Improvement, value: string) => {
    if (!editableReport) return;
    const newIssues = [...editableReport.issues];
    const newImps = [...newIssues[issueIdx].improvements];
    newImps[impIdx] = { ...newImps[impIdx], [field]: value };
    newIssues[issueIdx] = { ...newIssues[issueIdx], improvements: newImps };
    setEditableReport((prev) => (prev ? { ...prev, issues: newIssues } : prev));
  };

  if (step === "history") {
    return <ReportHistory onBack={() => setStep("input")} />;
  }

  if (step === "input") {
    return (
      <InputForm
        form={form}
        error={error}
        onUpdateForm={updateForm}
        onSubmit={handleSubmit}
        onShowHistory={() => setStep("history")}
      />
    );
  }

  if (step === "loading") {
    return <LoadingScreen onCancel={handleCancel} />;
  }

  if (step === "report" && editableReport) {
    return (
      <ReportView
        report={editableReport}
        form={form}
        onBack={() => setStep("input")}
        onUpdateReportField={updateReportField}
        onUpdatePositive={updatePositive}
        onUpdateIssueField={updateIssueField}
        onUpdateImprovement={updateImprovement}
        onUpdateScore={updateScore}
        onUpdateGrade={updateGrade}
        onAddPositive={addPositive}
        onRemovePositive={removePositive}
        onAddIssue={addIssue}
        onRemoveIssue={removeIssue}
        onAddImprovement={addImprovement}
        onRemoveImprovement={removeImprovement}
      />
    );
  }

  return null;
}
