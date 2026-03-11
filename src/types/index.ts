export interface Evidence {
  question: string;
  quote: string;
  interpretation: string;
}

export interface ScoreDetail {
  score: number;
  comment: string;
  evidence: Evidence[];
}

export interface Improvement {
  action: string;
  owner: string;
  timeline: string;
  method: string;
  expectedOutcome: string;
}

export interface Issue {
  issue: string;
  quote: string;
  severity: "high" | "medium" | "low";
  improvements: Improvement[];
}

export interface Report {
  summary: string;
  scores: {
    engagement: ScoreDetail;
    workAdaptation: ScoreDetail;
    wlb: ScoreDetail;
    expectationGap: ScoreDetail;
    growth: ScoreDetail;
  };
  radarScores: {
    engagement: number;
    workAdaptation: number;
    wlb: number;
    expectationGap: number;
    growth: number;
  };
  totalScore: number;
  overallGrade: string;
  overallGradeReason: string;
  retention: string;
  workAdaptation: string;
  workLifeBalance: string;
  compensationConcerns: string;
  relationships: string;
  positives: string[];
  issues: Issue[];
}

export interface FormData {
  candidateName: string;
  department: string;
  jobTitle: string;
  hireDate: string;
  interviewDate: string;
  interviewer: string;
  transcript: string;
  memo: string;
  placement: string;
  jobDescription: string;
  previousReport: string;
  companyValues: string;
}
