import type { L } from "@/lib/i18n";

export type User = {
  id: string;
  role: string;
  name: string;
  email: string;
  initials: string;
  timezone: string;
  status: "new" | "pending" | "active" | "rejected" | "suspended";
  createdUtc: string;
};

export type Session = {
  id: string;
  week: number;
  startUtc: string;
  endUtc: string;
  minutes: number | null;
  level: string;
  unitNo: number;
  topic: L;
  notes: L | null;
  status: "scheduled" | "completed" | "cancelled" | "missed";
  joinUrl: string;
  studentName?: string;
};

export type CheckIn = {
  id: string;
  week: number;
  studentName: string;
  tutorName: string;
  held: boolean;
  minutes: number | null;
  reason: string | null;
  note: string | null;
};

export type AbsenceReason = {
  value: string;
  side: "student" | "tutor";
  label: L;
};

export type Semester = {
  name: L;
  currentWeek: number;
  weeks: { week: number; start: string; end: string }[];
  absenceReasons: AbsenceReason[];
};

export type Pair = {
  pairId: string;
  student: string;
  studentLevel: string;
  studentTz: string;
  tutor: string;
  tutorTz: string;
  status: "active" | "paused" | "rematching";
  attendanceRate: number;
  health: "good" | "watch" | "at_risk";
  ungraded: number;
};

export type Incident = {
  id: string;
  reference: string;
  type: "safeguarding" | "plagiarism" | "conduct" | "technical";
  severity: "low" | "medium" | "high" | "critical";
  pair: string;
  status: "open" | "investigating" | "resolved";
  createdUtc: string;
  summary: L;
};

export type TutorProfile = {
  id: string;
  name: string;
  initials: string;
  country: L;
  timezone: string;
  languages: string[];
  bio: L;
};

export type AttendanceSummary = {
  totalSessions: number;
  attended: number;
  missed: number;
  rate: number;
  streak: number;
  weeks: { week: string; status: "attended" | "missed" | "pending" }[];
};

export type Resource = {
  id: string;
  title: L;
  level: string;
  skill: string;
  minutes: number;
  downloads: number;
  bandwidth: string;
};

export type TutorImpact = {
  hoursTaught: number;
  lessonsDelivered: number;
  studentsSupported: number;
  levelsUnlocked: number;
  retentionPct: number;
  monthly: { month: string; hours: number }[];
  milestones: { id: string; label: L; target: number; done: boolean }[];
  reference: string;
};

export type ProgramImpact = {
  activeLearners: number;
  activeTutors: number;
  countries: number;
  lessonHours: number;
  completionPct: number;
  costPerLearner: number;
  byCountry: { country: L; learners: number }[];
  outcomes: { id: string; label: L; value: number; of: number }[];
  quotes: { id: string; name: string; text: L }[];
};

export type WaitlistEntry = {
  id: string;
  name: string;
  level: string;
  timezone: string;
  waitingSince: string;
  priority: string;
  returning: boolean;
};

export type TutorOption = {
  id: string;
  name: string;
  timezone: string;
  levels: string[];
  capacity: number;
  load: number;
};

export type Suggestion = {
  studentId: string;
  tutorId: string;
  score: number;
  reasons: L;
};

export type ReturningRequest = {
  id: string;
  name: string;
  previousLevel: string;
  cohort: string;
  reason: L;
  status: string;
};

export type AnnouncementTemplate = { id: string; name: L; subject: L; body: L };

export type AnnouncementSent = {
  id: string;
  subject: L;
  body?: L;
  audience: string;
  sentUtc: string;
  recipients: number;
  openRate: number;
};

export type Analytics = {
  attendanceTrend: { week: string; rate: number }[];
  levelDistribution: { level: string; students: number }[];
};
