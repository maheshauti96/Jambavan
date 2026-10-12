// Moved verbatim from pages/Home.tsx (checkpoint 5f248af) in increment 0 (§13). Do not change behaviour here.

export type Status = "todo" | "progress" | "done" | "blocked";
export type ViewKey = "feed" | "myDay" | "department" | "meetings" | "momDirectory" | "dashboard" | "calendar" | "eventPlanner" | "guide" | "projects" | "notices" | "people" | "myProfile" | "roleMatrix" | "auditLog";
export type AttachmentKind = "evidence" | "material";
export type TaskKind = "Task" | "MOM action" | "Responsibility" | "HANUMAN";
export type TaskCategory = "Squirrel" | "Angad" | "Sugriv" | "HANUMAN";
export type BlockerReason = "I haven't started" | "Waiting for someone" | "Waiting for information" | "Too much other work" | "I don't understand the task" | "Unexpected issue" | "Forgot" | "Other";

export type AuditEntry = { id: number; action: string; subject: string; actor: string; at: string; detail?: string };
export type AppNotification = { id: number; title: string; detail: string; at: string; read: boolean; kind: "assignment" | "reply" | "system" };
export type ProgressUpdate = { id: number; text: string; addedBy: string; at: string };
export type NoticeAudience = "Targeted" | "Candidates" | "Department" | "Everyone";
export type Notice = { id: number; title: string; body: string; audience: NoticeAudience; recipients: string[]; sender: string; sentAt: string; requiresReply?: boolean; replies?: Record<string, string>; period?: "12 hours" | "24 hours" | "7 days" | "1 month"; expiresAt?: number; binnedAt?: number; media?: { name: string; type: string; url: string }; seenBy?: string[] };
export type CalendarEventType = "Holiday" | "Festival" | "Academic program" | "Birthday" | "Other";
export type CalendarEvent = { id: number; title: string; date: string; month: number; type: CalendarEventType; visibility: string[]; createdBy: string; };
export type EventTaskPlan = { id: number; title: string; department: string; assignee: string; category: TaskCategory; note: string };
export type EventRole = { id: number; role: string; inCharge: string; department: string };
export type EventPlan = { id: number; title: string; date: string; venue: string; description: string; departments: string[]; roles: EventRole[]; tasks: EventTaskPlan[]; isTemplate: boolean; templateName?: string; createdBy: string; };
export type FeedbackKind = "Poll" | "Open question" | "5-star rating";
export type FeedbackRequest = { id: number; title: string; prompt: string; kind: FeedbackKind; options?: string[]; targets: string[]; eventId?: number; createdBy: string; responses: Record<string, string>; };
export type AccessPermission = "View all departments" | "Manage employee access" | "Edit or reassign tasks" | "Create calendar events" | "Send targeted notices" | "View private tasks" | "Export reports";
export type EmployeeProfile = { name: string; number: string; joiningYear: string; position: string; department: string; inTime: string; outTime: string; weeklyOff: string; status: "Available" | "On leave" | "Sick"; attendanceStatus?: "Present" | "Absent" | "Late" | "On leave"; statusNote?: string; access: "Active" | "Suspended" | "Removed"; photo?: string; };

export type TaskAttachment = {
  id: number;
  name: string;
  kind: AttachmentKind;
  type: string;
  url?: string;
  addedBy: string;
};

export type Subtask = { id: number; title: string; done: boolean; addedBy: string };
export type TaskHandover = { id: number; from: string; to: string; createdBy?: string; createdAt: string; statusSummary: string; lastAction: string; waitingFor: string; nextAction: string; notes: string };

export type PersonalScheduleStatus = "Planned" | "In Progress" | "Completed" | "Missed";
export type PersonalPlan = {
  date: string;
  top3: { id: number; title: string; done: boolean }[];
  scheduleBlocks: { id: number; start: string; end: string; title: string; category: string; status: PersonalScheduleStatus }[];
  actionables: { id: number; title: string; notes: string; due: string; priority: "High" | "Medium" | "Low"; done: boolean }[];
  linkedTaskIds: number[];
  review: { completed: string; pending: string; tomorrowPriority: string };
};

export type Task = {
  eventLink?: { eventId: number; rowId: number };
  id: number;
  title: string;
  assignee: string;
  initials: string;
  team: string;
  department: string;
  due: string;
  status: Status;
  priority: "High" | "Medium" | "Low";
  visibility: "Department" | "Private" | "Leadership";
  progress: number;
  isTeamTask?: boolean;
  kind: TaskKind;
  category?: TaskCategory;
  project?: string;
  source?: string;
  assistants: { name: string; initials: string; department: string; completed: boolean; note?: string }[];
  assignmentNotes?: Record<string, string>;
  completedBy?: string;
  completedAt?: string;
  reopenedAt?: string;
  attachments?: TaskAttachment[];
  subtasks?: Subtask[];
  longRunning?: boolean;
  updates?: ProgressUpdate[];
  seenBy?: string[];
  acknowledgedBy?: string[];
  archived?: boolean;
  archivedBy?: string;
  archivedAt?: string;
  blocker?: { reason: BlockerReason; note?: string; reportedBy: string; reportedAt: string };
  dependsOnTaskId?: number;
  handover?: TaskHandover;
};

// Increment 1 (§10.1): the seed `projects` const is typed for the first time. Fields exactly as the seed has them;
// `tasks` ("18 open tasks") stays in the seed but is no longer rendered once ProjectsView is ported (C12).
export type Project = { name: string; label: string; progress: number; due: string; tasks: string; color: string };
