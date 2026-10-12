import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  Bell,
  BookOpenCheck,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  ClipboardCheck,
  Clock3,
  Filter,
  Flag,
  LayoutDashboard,
  ListChecks,
  LockKeyhole,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  NotebookPen,
  Paperclip,
  Download,
  FileText,
  ExternalLink,
  Upload,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Settings2,
  Sparkles,
  Target,
  Users,
  X,
  Trophy,
  Medal,
  CalendarRange,
  ListTodo,
  Megaphone,
  ImageIcon,
  Mic,
  Video,
  Send,
  MessageCircleQuestion,
  BarChart3,
  Star,
  ThumbsUp,
  CheckCheck,
  Archive,
  ArchiveRestore,
  Phone,
  UserRound,
  Save,
  UserPlus,
  Ban,
  Trash2,
} from "lucide-react";

type Status = "todo" | "progress" | "done" | "blocked";
type ViewKey = "feed" | "department" | "meetings" | "momDirectory" | "dashboard" | "calendar" | "eventPlanner" | "guide" | "projects" | "people" | "myProfile" | "roleMatrix" | "auditLog";
type AttachmentKind = "evidence" | "material";
type TaskKind = "Task" | "MOM action" | "Responsibility" | "HANUMAN";
type TaskCategory = "Squirrel" | "Angad" | "Sugriv" | "HANUMAN";
const taskCategories: TaskCategory[] = ["Squirrel", "Angad", "Sugriv", "HANUMAN"];

type AuditEntry = { id: number; action: string; subject: string; actor: string; at: string; detail?: string };
type AppNotification = { id: number; title: string; detail: string; at: string; read: boolean; kind: "assignment" | "reply" | "system" };
type ProgressUpdate = { id: number; text: string; addedBy: string; at: string };
type NoticeAudience = "Targeted" | "Candidates" | "Department" | "Everyone";
type Notice = { id: number; title: string; body: string; audience: NoticeAudience; recipients: string[]; sender: string; sentAt: string; requiresReply?: boolean; replies?: Record<string, string>; period?: "12 hours" | "24 hours" | "7 days" | "1 month"; expiresAt?: number; binnedAt?: number; media?: { name: string; type: string; url: string } };
type CalendarEventType = "Holiday" | "Festival" | "Academic program" | "Birthday" | "Other";
type CalendarEvent = { id: number; title: string; date: string; month: number; type: CalendarEventType; visibility: string[]; createdBy: string; };
type EventTaskPlan = { id: number; title: string; department: string; assignee: string; category: TaskCategory; note: string };
type EventRole = { id: number; role: string; inCharge: string; department: string };
type EventPlan = { id: number; title: string; date: string; venue: string; description: string; departments: string[]; roles: EventRole[]; tasks: EventTaskPlan[]; isTemplate: boolean; templateName?: string; createdBy: string; };
type FeedbackKind = "Poll" | "Open question" | "5-star rating";
type FeedbackRequest = { id: number; title: string; prompt: string; kind: FeedbackKind; options?: string[]; targets: string[]; eventId?: number; createdBy: string; responses: Record<string, string>; };
type AccessPermission = "View all departments" | "Manage employee access" | "Edit or reassign tasks" | "Create calendar events" | "Send targeted notices" | "View private tasks" | "Export reports";
type EmployeeProfile = { name: string; number: string; joiningYear: string; position: string; department: string; inTime: string; outTime: string; weeklyOff: string; status: "Available" | "On leave" | "Sick"; attendanceStatus?: "Present" | "Absent" | "Late" | "On leave"; statusNote?: string; access: "Active" | "Suspended"; photo?: string; };

type TaskAttachment = {
  id: number;
  name: string;
  kind: AttachmentKind;
  type: string;
  url?: string;
  addedBy: string;
};

type Subtask = { id: number; title: string; done: boolean; addedBy: string };

type Task = {
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
};

const initialTasks: Task[] = [
  {
    id: 1,
    title: "Finalize October JEE batch timetable",
    assignee: "Arjun Mehta",
    initials: "AM",
    team: "Academic Core",
    department: "Academic",
    due: "Today",
    status: "progress",
    priority: "High",
    visibility: "Department",
    progress: 68,
    kind: "MOM action",
    project: "October Launch",
    source: "Academic Huddle · 26 Sep",
    assistants: [{ name: "Priya Nair", initials: "PN", department: "Academic", completed: true }, { name: "Karan Joshi", initials: "KJ", department: "Academic", completed: false }],
  },
  {
    id: 2,
    title: "Call pending scholarship applicants",
    assignee: "Neha Kapoor",
    initials: "NK",
    team: "Admissions Desk",
    department: "Admissions",
    due: "Today",
    status: "todo",
    priority: "High",
    visibility: "Department",
    progress: 0,
    kind: "Task",
    isTeamTask: true,
    project: "October Launch",
    assistants: [{ name: "Aditi Rao", initials: "AR", department: "Admissions", completed: false }, { name: "Manav Shah", initials: "MS", department: "Admissions", completed: false }],
  },
  {
    id: 3,
    title: "Share weekly faculty attendance summary",
    assignee: "Ritesh Shah",
    initials: "RS",
    team: "Operations",
    department: "Operations",
    due: "Tomorrow",
    status: "progress",
    priority: "Medium",
    visibility: "Leadership",
    progress: 42,
    kind: "Responsibility",
    assistants: [{ name: "Vikram Nair", initials: "VN", department: "Operations", completed: true }],
  },
  {
    id: 4,
    title: "Approve parent orientation deck",
    assignee: "You",
    initials: "YO",
    team: "Leadership",
    department: "Leadership",
    due: "30 Sep",
    status: "todo",
    priority: "Medium",
    visibility: "Private",
    progress: 0,
    kind: "Task",
    project: "Parent Connect",
    assistants: [{ name: "You", initials: "YO", department: "Leadership", completed: false }],
  },
  {
    id: 5,
    title: "Upload student success stories for October campaign",
    assignee: "Sana Iyer",
    initials: "SI",
    team: "Marketing",
    department: "Marketing",
    due: "02 Oct",
    status: "done",
    priority: "Low",
    visibility: "Department",
    progress: 100,
    kind: "MOM action",
    source: "Growth Review · 25 Sep",
    assistants: [{ name: "Rhea Sen", initials: "RS", department: "Marketing", completed: true }],
  },
  {
    id: 6,
    title: "Resolve projector issue in Room 204",
    assignee: "Vikram Nair",
    initials: "VN",
    team: "Operations",
    department: "Operations",
    due: "Overdue by 2d",
    status: "blocked",
    priority: "High",
    visibility: "Department",
    progress: 20,
    kind: "Task",
    isTeamTask: true,
    assistants: [{ name: "Vikram Nair", initials: "VN", department: "Operations", completed: false }, { name: "Omkar Patil", initials: "OP", department: "Operations", completed: false }],
  },
  {
    id: 7,
    title: "Build the 2027 Coaching Excellence Gurukul",
    assignee: "Arjun Mehta",
    initials: "AM",
    team: "Strategic initiatives",
    department: "Academic",
    due: "30 Sep 2027",
    status: "progress",
    priority: "High",
    visibility: "Leadership",
    progress: 24,
    kind: "HANUMAN",
    longRunning: true,
    project: "Faculty Excellence",
    source: "Annual strategy council · 01 Oct",
    assistants: [{ name: "Neha Kapoor", initials: "NK", department: "Admissions", completed: false }, { name: "Ritesh Shah", initials: "RS", department: "Operations", completed: true }],
    subtasks: [{ id: 71, title: "Define the mentor cohort", done: true, addedBy: "Arjun Mehta" }, { id: 72, title: "Draft the year-long rollout", done: false, addedBy: "Neha Kapoor" }],
    updates: [{ id: 701, text: "Discovery phase complete; mentor interviews have started.", addedBy: "Arjun Mehta", at: "02 Oct 2026, 5:30 PM" }],
  },
];

const categoryByTaskId: Record<number, TaskCategory> = { 1: "Squirrel", 2: "Angad", 3: "Sugriv", 4: "Squirrel", 5: "Angad", 6: "Sugriv", 7: "HANUMAN" };
const initialTasksWithCategories: Task[] = initialTasks.map(task => ({ ...task, category: categoryByTaskId[task.id] || "Squirrel" }));

const noticeSeed: Notice[] = [
  { id: 501, title: "October test timetable", body: "The revised JEE test timetable is ready. Please check your assigned batch slot.", audience: "Department", recipients: ["Academic"], sender: "Arjun Mehta", sentAt: "05 Oct 2026, 9:10 AM", requiresReply: true, replies: { "Priya Nair": "Acknowledged. I will confirm the batch slots by 4 PM." } },
  { id: 502, title: "Parent orientation reminder", body: "All faculty coordinators: please be ready in Hall A by 8:30 AM.", audience: "Candidates", recipients: ["Priya Nair", "Karan Joshi"], sender: "Neha Kapoor", sentAt: "04 Oct 2026, 4:40 PM", media: { name: "orientation-note.mp3", type: "audio", url: "#" } },
];

const calendarMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const calendarVisibilityOptions = ["Directors", "Department heads", "Candidates", "Academic", "Admissions", "Operations", "Marketing"];
const calendarTypeOptions: CalendarEventType[] = ["Holiday", "Festival", "Academic program", "Birthday", "Other"];
const calendarSeed: CalendarEvent[] = [
  { id: 701, title: "Republic Day", date: "26 Jan 2026", month: 0, type: "Holiday", visibility: ["Everyone"], createdBy: "Arjun Mehta" },
  { id: 702, title: "Annual Faculty Excellence Day", date: "18 Apr 2026", month: 3, type: "Academic program", visibility: ["Directors", "Department heads", "Academic"], createdBy: "Arjun Mehta" },
  { id: 703, title: "Diwali holiday", date: "20 Oct 2026", month: 9, type: "Festival", visibility: ["Everyone"], createdBy: "Arjun Mehta" },
  { id: 704, title: "Arjun Mehta birthday", date: "12 Nov 2026", month: 10, type: "Birthday", visibility: ["Directors", "Department heads", "Academic"], createdBy: "Arjun Mehta" },
  { id: 705, title: "New academic session", date: "06 Jun 2026", month: 5, type: "Academic program", visibility: ["Candidates", "Academic", "Admissions"], createdBy: "Arjun Mehta" },
];

const feedbackSeed: FeedbackRequest[] = [
  { id: 801, title: "Batch 3 timetable check", prompt: "Does the proposed 7:00 PM slot work for your batch?", kind: "Poll", options: ["Yes, works", "Need another slot"], targets: ["Academic", "Candidates"], createdBy: "Arjun Mehta", responses: { "Priya Nair": "Yes, works", "Karan Joshi": "Yes, works" } },
  { id: 802, title: "Faculty development pulse", prompt: "What support would help you deliver better classes this month?", kind: "Open question", targets: ["Department heads", "Academic"], eventId: 2, createdBy: "Arjun Mehta", responses: {} },
];

const profileSeed: EmployeeProfile[] = [
  { name: "Arjun Mehta", number: "+91 98765 10001", joiningYear: "2018", position: "Department Head", department: "Academic", inTime: "08:30 AM", outTime: "05:30 PM", weeklyOff: "Sunday", status: "Available", attendanceStatus: "Present", access: "Active" },
  { name: "Priya Nair", number: "+91 98765 10002", joiningYear: "2020", position: "Meeting Secretary", department: "Academic", inTime: "09:00 AM", outTime: "06:00 PM", weeklyOff: "Sunday", status: "Available", attendanceStatus: "Present", access: "Active" },
  { name: "Karan Joshi", number: "+91 98765 10003", joiningYear: "2022", position: "Faculty Coordinator", department: "Academic", inTime: "09:00 AM", outTime: "06:00 PM", weeklyOff: "Saturday", status: "Available", attendanceStatus: "Present", access: "Active" },
  { name: "Neha Kapoor", number: "+91 98765 10004", joiningYear: "2019", position: "Department Head", department: "Admissions", inTime: "09:30 AM", outTime: "06:30 PM", weeklyOff: "Sunday", status: "Available", attendanceStatus: "Present", access: "Active" },
  { name: "Aditi Rao", number: "+91 98765 10005", joiningYear: "2021", position: "Admissions Lead", department: "Admissions", inTime: "09:30 AM", outTime: "06:30 PM", weeklyOff: "Monday", status: "On leave", statusNote: "Back on 08 Oct", attendanceStatus: "On leave", access: "Active" },
  { name: "Manav Shah", number: "+91 98765 10006", joiningYear: "2023", position: "Student Counsellor", department: "Admissions", inTime: "10:00 AM", outTime: "07:00 PM", weeklyOff: "Sunday", status: "Available", attendanceStatus: "Present", access: "Active" },
  { name: "Ritesh Shah", number: "+91 98765 10007", joiningYear: "2017", position: "Department Head", department: "Operations", inTime: "08:30 AM", outTime: "05:30 PM", weeklyOff: "Sunday", status: "Available", attendanceStatus: "Present", access: "Active" },
  { name: "Vikram Nair", number: "+91 98765 10008", joiningYear: "2020", position: "Facilities Coordinator", department: "Operations", inTime: "08:00 AM", outTime: "05:00 PM", weeklyOff: "Tuesday", status: "Sick", statusNote: "Updated today", attendanceStatus: "On leave", access: "Active" },
  { name: "Sana Iyer", number: "+91 98765 10009", joiningYear: "2019", position: "Department Head", department: "Marketing", inTime: "10:00 AM", outTime: "07:00 PM", weeklyOff: "Sunday", status: "Available", attendanceStatus: "Present", access: "Active" },
  { name: "Rhea Sen", number: "+91 98765 10010", joiningYear: "2022", position: "Content Lead", department: "Marketing", inTime: "10:00 AM", outTime: "07:00 PM", weeklyOff: "Saturday", status: "Available", attendanceStatus: "Present", access: "Active" },
  { name: "Omkar Patil", number: "+91 98765 10011", joiningYear: "2021", position: "Operations Associate", department: "Operations", inTime: "09:00 AM", outTime: "06:00 PM", weeklyOff: "Wednesday", status: "Available", attendanceStatus: "Present", access: "Active" },
];

const noticeTargetOptions = ["Directors", "Department heads", "Candidates", "Academic", "Admissions", "Operations", "Marketing"];

const departments = [
  { name: "Academic", people: 18, done: 76, open: 14, color: "saffron", lead: "Arjun Mehta" },
  { name: "Admissions", people: 9, done: 64, open: 11, color: "mint", lead: "Neha Kapoor" },
  { name: "Operations", people: 7, done: 52, open: 9, color: "blue", lead: "Ritesh Shah" },
  { name: "Marketing", people: 5, done: 83, open: 4, color: "coral", lead: "Sana Iyer" },
];

const staffOptions = ["Priya Nair", "Karan Joshi", "Neha Kapoor", "Aditi Rao", "Manav Shah", "Ritesh Shah", "Vikram Nair", "Sana Iyer", "Rhea Sen", "Omkar Patil"];
const employeeRoster = ["Arjun Mehta", ...staffOptions];
const employeeDepartments: Record<string, string> = { "Arjun Mehta": "Academic", "Priya Nair": "Academic", "Karan Joshi": "Academic", "Neha Kapoor": "Admissions", "Aditi Rao": "Admissions", "Manav Shah": "Admissions", "Ritesh Shah": "Operations", "Vikram Nair": "Operations", "Sana Iyer": "Marketing", "Rhea Sen": "Marketing", "Omkar Patil": "Operations" };

const meetings = [
  { title: "Academic Huddle", date: "26 Sep", meta: "26 Sep · 8 participants", participants: "Arjun, Priya, Karan + 5", participantNames: ["Arjun Mehta", "Priya Nair", "Karan Joshi"], count: 4, tone: "saffron", note: "October batch readiness, faculty backup plan", decisions: "Batch 3 gets a backup faculty roster.", actionItem: "Confirm faculty backup for Batch 3", followUp: "30 Sep" },
  { title: "Admissions Stand-up", date: "25 Sep", meta: "25 Sep · 6 participants", participants: "Neha, Aditi, Manav + 3", participantNames: ["Neha Kapoor", "Aditi Rao", "Manav Shah"], count: 3, tone: "mint", note: "Scholarship follow-ups and lead response time", decisions: "All scholarship calls close by Friday.", actionItem: "Call pending scholarship applicants", followUp: "Today" },
  { title: "Growth Review", date: "25 Sep", meta: "25 Sep · 5 participants", participants: "Sana, Rhea + 3", participantNames: ["Sana Iyer", "Rhea Sen"], count: 2, tone: "coral", note: "October campaign, student stories, referral push", decisions: "Student stories lead the first campaign week.", actionItem: "Upload student success stories", followUp: "02 Oct" },
];

const momDirectorySeed = [
  { id: 1, title: "Academic Huddle", date: "26 Sep 2026", department: "Academic", meetingHead: "Arjun Mehta", secretary: "Priya Nair", attendance: ["Arjun Mehta", "Priya Nair", "Karan Joshi", "Neha Kapoor"], absent: ["Ritesh Shah", "Sana Iyer"], content: "October batch readiness reviewed. Faculty backup for Batch 3 was approved and the timetable needs final confirmation.", nextMeeting: "30 Sep 2026", actionItem: "Confirm faculty backup for Batch 3", taskAssignee: "Arjun Mehta" },
  { id: 2, title: "Admissions Stand-up", date: "25 Sep 2026", department: "Admissions", meetingHead: "Neha Kapoor", secretary: "Aditi Rao", attendance: ["Neha Kapoor", "Aditi Rao", "Manav Shah", "Arjun Mehta"], absent: ["Priya Nair"], content: "Scholarship follow-ups and lead response time were reviewed. All scholarship calls close by Friday.", nextMeeting: "03 Oct 2026", actionItem: "Call pending scholarship applicants", taskAssignee: "Neha Kapoor" },
  { id: 3, title: "Growth Review", date: "25 Sep 2026", department: "Marketing", meetingHead: "Sana Iyer", secretary: "Rhea Sen", attendance: ["Sana Iyer", "Rhea Sen", "Arjun Mehta"], absent: ["Karan Joshi"], content: "October campaign, student stories, and referral push were discussed. Student stories lead the first campaign week.", nextMeeting: "02 Oct 2026", actionItem: "Upload student success stories", taskAssignee: "Sana Iyer" },
];

const projects = [
  { name: "October Launch", label: "Admissions + Academic", progress: 72, due: "Launches 03 Oct", tasks: "18 open tasks", color: "saffron" },
  { name: "Parent Connect", label: "Leadership + Operations", progress: 46, due: "Review 10 Oct", tasks: "9 open tasks", color: "blue" },
  { name: "Faculty Excellence", label: "Academic", progress: 81, due: "Quarterly", tasks: "6 open tasks", color: "mint" },
];

const eventPlanSeed: EventPlan[] = [
  { id: 1, title: "Annual Parent Orientation", date: "18 Oct 2026", venue: "Main auditorium", description: "Coordinate batches, faculty, admissions, and facilities for parent orientation.", departments: ["Academic", "Admissions", "Operations"], roles: [{ id: 101, role: "Event head", inCharge: "Arjun Mehta", department: "Academic" }, { id: 102, role: "Venue and logistics", inCharge: "Vikram Nair", department: "Operations" }], isTemplate: false, createdBy: "Arjun Mehta", tasks: [
    { id: 11, title: "Finalize orientation presentation", department: "Academic", assignee: "Arjun Mehta", category: "Angad", note: "Own the final academic flow and speaker notes." },
    { id: 12, title: "Confirm parent registrations", department: "Admissions", assignee: "Neha Kapoor", category: "Sugriv", note: "Share the confirmed count and pending list." },
    { id: 13, title: "Prepare auditorium and signage", department: "Operations", assignee: "Vikram Nair", category: "Squirrel", note: "Complete room setup before 8:00 AM." },
  ] },
  { id: 2, title: "Monthly Test Series Launch", date: "01 Nov 2026", venue: "JAMBAVAN Institute", description: "Reusable launch plan for a new test series.", departments: ["Academic", "Admissions"], roles: [{ id: 201, role: "Test coordination", inCharge: "Arjun Mehta", department: "Academic" }, { id: 202, role: "Candidate communication", inCharge: "Manav Shah", department: "Admissions" }], isTemplate: true, templateName: "Test series launch", createdBy: "Arjun Mehta", tasks: [
    { id: 21, title: "Prepare test blueprint", department: "Academic", assignee: "Arjun Mehta", category: "Angad", note: "Complete syllabus coverage and difficulty split." },
    { id: 22, title: "Notify enrolled candidates", department: "Admissions", assignee: "Manav Shah", category: "Squirrel", note: "Send the schedule to all enrolled batches." },
  ] },
];
const accessPermissionList: AccessPermission[] = ["View all departments", "Manage employee access", "Edit or reassign tasks", "Create calendar events", "Send targeted notices", "View private tasks", "Export reports"];
const accessRoleList = ["CEO", "Director", "Department Head", "Employee"] as const;
type AccessRole = typeof accessRoleList[number];
const accessMatrixSeed: Record<AccessRole, Record<AccessPermission, boolean>> = {
  CEO: Object.fromEntries(accessPermissionList.map(permission => [permission, true])) as Record<AccessPermission, boolean>,
  Director: Object.fromEntries(accessPermissionList.map(permission => [permission, true])) as Record<AccessPermission, boolean>,
  "Department Head": { "View all departments": false, "Manage employee access": false, "Edit or reassign tasks": true, "Create calendar events": false, "Send targeted notices": true, "View private tasks": true, "Export reports": true },
  Employee: { "View all departments": false, "Manage employee access": false, "Edit or reassign tasks": false, "Create calendar events": false, "Send targeted notices": false, "View private tasks": false, "Export reports": false },
};

const navItems: { key: ViewKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "feed", label: "My feed", icon: LayoutDashboard },
  { key: "department", label: "Department", icon: Users },
  { key: "momDirectory", label: "MOM Directory", icon: NotebookPen },
  { key: "dashboard", label: "Dashboard", icon: ClipboardCheck },
  { key: "calendar", label: "Yearly Calendar", icon: CalendarRange },
  { key: "eventPlanner", label: "Event Planner", icon: CalendarDays },
  { key: "guide", label: "JAMBAVAN Guide", icon: BookOpenCheck },
];

const peoplePhotos: Record<string, string> = {
  "Arjun Mehta": "/manus-storage/async-images/UuSAJlzYvc759IyEod4JJP/image-1.webp",
  "You": "/manus-storage/async-images/UuSAJlzYvc759IyEod4JJP/image-1.webp",
  "Neha Kapoor": "/manus-storage/async-images/UuSAJlzYvc759IyEod4JJP/image-2.webp",
  "Ritesh Shah": "/manus-storage/async-images/UuSAJlzYvc759IyEod4JJP/image-3.webp",
  "Sana Iyer": "/manus-storage/async-images/UuSAJlzYvc759IyEod4JJP/image-4.webp",
  "Priya Nair": "/manus-storage/async-images/UuSAJlzYvc759IyEod4JJP/image-5.webp",
  "Karan Joshi": "/manus-storage/async-images/gZeTDdD1hYnrDJG0sjVeml/image-1.webp",
  "Aditi Rao": "/manus-storage/async-images/gZeTDdD1hYnrDJG0sjVeml/image-2.webp",
  "Manav Shah": "/manus-storage/async-images/gZeTDdD1hYnrDJG0sjVeml/image-3.webp",
  "Rhea Sen": "/manus-storage/async-images/gZeTDdD1hYnrDJG0sjVeml/image-4.webp",
  "Omkar Patil": "/manus-storage/async-images/gZeTDdD1hYnrDJG0sjVeml/image-5.webp",
  "Vikram Nair": "/manus-storage/async-images/gZeTDdD1hYnrDJG0sjVeml/image-5.webp",
};

function initials(name: string) {
  return name
    .split(" ")
    .map(part => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function statusLabel(status: Status) {
  return { todo: "Not started", progress: "In progress", done: "Completed", blocked: "Blocked" }[status];
}

function StatusIcon({ status }: { status: Status }) {
  if (status === "done") return <CheckCircle2 size={15} />;
  if (status === "progress") return <Clock3 size={15} />;
  if (status === "blocked") return <AlertCircle size={15} />;
  return <Circle size={15} />;
}

function Avatar({ text, tone = "indigo", name, photoOverride }: { text: string; tone?: string; name?: string; photoOverride?: string }) {
  const photo = photoOverride || (name ? peoplePhotos[name] : undefined);
  return <span className={`avatar avatar-${tone} ${photo ? "has-photo" : ""}`}>{photo ? <img src={photo} alt={`${name} profile`} /> : text}</span>;
}

function TrendChart({ title, subtitle, labels, series, colors }: { title: string; subtitle: string; labels: string[]; series: { name: string; values: number[] }[]; colors: string[] }) {
  const max = Math.max(1, ...series.flatMap(item => item.values));
  return <article className="trend-chart-card"><div className="trend-chart-head"><div><span className="eyebrow"><BarChart3 size={13} /> Visual analytics</span><h3>{title}</h3><p>{subtitle}</p></div><div className="trend-legend">{series.map((item, index) => <span key={item.name}><i style={{ background: colors[index] }} />{item.name}</span>)}</div></div><div className="trend-chart" role="img" aria-label={`${title}: ${series.map(item => `${item.name} ${item.values.join(", ")}`).join("; ")}`}>{labels.map((label, index) => <div className="trend-column" key={label}><div className="trend-bars">{series.map((item, seriesIndex) => <span key={item.name} title={`${item.name}: ${item.values[index]}`} style={{ height: `${Math.max(8, (item.values[index] / max) * 100)}%`, background: colors[seriesIndex] }} />)}</div><strong>{label}</strong></div>)}</div></article>
}

function TaskCard({ task, onComplete, onAssistantToggle, onReopen, onEdit, onAttach, onSubtaskToggle, onAddUpdate, onAddSubtask, onAcknowledge, onArchive }: { task: Task; onComplete: (id: number) => void; onAssistantToggle: (taskId: number, assistantName: string) => void; onReopen: (id: number) => void; onEdit: (task: Task) => void; onAttach: (taskId: number, kind: AttachmentKind) => void; onSubtaskToggle: (taskId: number, subtaskId: number) => void; onAddUpdate: (taskId: number, text: string) => void; onAddSubtask: (taskId: number, title: string) => void; onAcknowledge: (taskId: number, mode: "seen" | "ack") => void; onArchive: (taskId: number) => void }) {
  const [journalDraft, setJournalDraft] = useState("");
  const [subtaskDraft, setSubtaskDraft] = useState("");
  return (
    <article className={`task-card ${task.status === "done" ? "is-done" : ""}`}>
      <div className="task-card-topline">
        <span className={`category-pill category-${(task.category || "Squirrel").toLowerCase()}`}>{task.category || "Squirrel"}</span><span className={`kind-pill kind-${task.kind.toLowerCase().replace(" ", "-")}`}>{task.kind === "MOM action" ? "MOM task" : task.kind === "Task" ? "Manual task" : task.kind}</span>
        {task.isTeamTask && <span className="team-pill"><Users size={12} /> Team task</span>} {task.longRunning && <span className="hanuman-pill">HANUMAN · year-long</span>}
        <button className="icon-button subtle" aria-label="Edit task" onClick={() => onEdit(task)}><MoreHorizontal size={17} /></button><button className="icon-button subtle archive-control" aria-label={task.archived ? "Restore task" : "Archive task"} onClick={() => onArchive(task.id)}>{task.archived ? <ArchiveRestore size={15} /> : <Archive size={15} />}</button>
      </div>
      <h3>{task.title}</h3>
      <div className="ack-row"><span><CheckCheck size={12} /> {task.seenBy?.length || 0} people seen</span><button className={task.seenBy?.includes("You") ? "ack-button active" : "ack-button"} onClick={() => onAcknowledge(task.id, "seen")}><CheckCheck size={12} /> {task.seenBy?.includes("You") ? "Seen" : "Mark seen"}</button><button className={task.acknowledgedBy?.includes("You") ? "ack-button active" : "ack-button"} onClick={() => onAcknowledge(task.id, "ack")}><ThumbsUp size={12} /> {task.acknowledgedBy?.includes("You") ? "Acknowledged" : "Acknowledge"}</button></div>
      <div className="task-meta-row">
        <span className={`due ${task.due.startsWith("Overdue") ? "overdue" : ""}`}><CalendarDays size={14} /> {task.due}</span>
        <span className={`priority priority-${task.priority.toLowerCase()}`}><Flag size={13} /> {task.priority}</span>
        {task.visibility === "Private" && <span className="visibility"><LockKeyhole size={12} /> Private</span>}
      </div>
      <div className="task-owner-row">
        <Avatar text={task.initials} name={task.assignee} tone={task.status === "done" ? "green" : task.department.toLowerCase()} />
        <div>
          <span className="owner-name">Task Owner · {task.assignee}</span>
          <span className="owner-team">{task.team} · {task.department}</span>
        </div>
        {task.status !== "done" && task.assignee === "You" && <button className="complete-button" onClick={() => onComplete(task.id)}><Check size={14} /> Complete task</button>}
        {task.status !== "done" && task.assignee !== "You" && <span className="owner-only"><ShieldCheck size={13} /> Owner completes</span>}
        {task.status === "done" && <span className="done-stamp"><CheckCircle2 size={14} /> Completed by {task.completedBy || task.assignee}</span>}
      </div>
      <div className="assistant-strip"><div className="assistant-label"><Users size={13} /> Contributors <span>{task.assistants.filter(assistant => assistant.completed).length}/{task.assistants.length} parts done</span></div><div className="assistant-list">{task.assistants.map(assistant => <button key={assistant.name} className={`assistant-chip ${assistant.completed ? "complete" : ""}`} onClick={() => onAssistantToggle(task.id, assistant.name)}><Avatar text={assistant.initials} name={assistant.name} tone={assistant.department.toLowerCase()} /><span className="assistant-check">{assistant.completed ? <Check size={11} /> : <Circle size={10} />}</span><span>{assistant.name}{assistant.name === "You" ? " (you)" : ""}</span></button>)}</div>{task.assignmentNotes && Object.entries(task.assignmentNotes).filter(([, note]) => note).length > 0 && <div className="assignment-notes"><strong>Responsibility notes</strong>{Object.entries(task.assignmentNotes).map(([person, note]) => note ? <div key={person}><Avatar text={initials(person)} name={person} tone="indigo" /><span><b>{person}</b> · {note}</span></div> : null)}</div>}</div>
      {task.progress > 0 && task.status !== "done" && (
        <div className="task-progress">
          <div className="progress-track"><span style={{ width: `${task.progress}%` }} /></div>
          <span>{task.progress}%</span>
        </div>
      )}
      {task.source && <div className="task-source"><MessageSquareText size={13} /> {task.source}</div>}
      {task.longRunning && <div className="hanuman-journal"><div className="hanuman-journal-head"><div><strong>HANUMAN task journal</strong><span>Keep the long journey visible without losing the next step.</span></div><span>{task.updates?.length || 0} updates</span></div>{task.updates?.map(update => <div className="progress-update" key={update.id}><Avatar text={initials(update.addedBy)} name={update.addedBy} tone="saffron" /><div><p>{update.text}</p><small>{update.addedBy} · {update.at}</small></div></div>)}<div className="journal-compose"><input value={journalDraft} onChange={event => setJournalDraft(event.target.value)} placeholder="Write a progress update..." /><button className="outline-button" onClick={() => { onAddUpdate(task.id, journalDraft); setJournalDraft(""); }}><MessageSquareText size={13} /> Post update</button></div></div>}
      <div className="inline-subtask-add"><input value={subtaskDraft} onChange={event => setSubtaskDraft(event.target.value)} placeholder="Add a subtask for this work..." /><button className="text-button" onClick={() => { onAddSubtask(task.id, subtaskDraft); setSubtaskDraft(""); }}><Plus size={13} /> Add subtask</button></div>
      {task.subtasks && task.subtasks.length > 0 && <div className="subtask-strip"><div className="subtask-heading"><ListTodo size={13} /> Subtasks <span>{task.subtasks.filter(subtask => subtask.done).length}/{task.subtasks.length}</span></div>{task.subtasks.map(subtask => <label className={`subtask-row ${subtask.done ? "done" : ""}`} key={subtask.id}><input type="checkbox" checked={subtask.done} onChange={() => onSubtaskToggle(task.id, subtask.id)} /><span>{subtask.title}</span><small>{subtask.addedBy}</small></label>)}</div>}
      <div className="attachment-strip"><div className="attachment-heading"><Paperclip size={13} /> Files & links <span>{task.attachments?.length || 0}</span></div><div className="attachment-actions"><button onClick={() => onAttach(task.id, "evidence")}><Upload size={12} /> Add completion evidence</button><button onClick={() => onAttach(task.id, "material")}><FileText size={12} /> Add task guidance</button></div>{task.attachments && task.attachments.length > 0 && <div className="attachment-list">{task.attachments.map(attachment => <a key={attachment.id} href={attachment.url || "#"} target="_blank" rel="noreferrer" className={`attachment-chip ${attachment.kind}`} onClick={event => { if (!attachment.url) event.preventDefault(); }}><span>{attachment.type === "link" ? <ExternalLink size={12} /> : <Paperclip size={12} />}</span><strong>{attachment.name}</strong><small>{attachment.kind === "evidence" ? "Evidence" : "Helping material"} · {attachment.addedBy}</small></a>)}</div>}</div>
      {task.status === "done" && <div className="completion-audit"><CheckCircle2 size={13} /> Marked complete by {task.completedBy || task.assignee} · {task.completedAt || "29 Sep 2026, 4:12 PM"}<button className="text-button" onClick={() => onReopen(task.id)}><RotateCcw size={13} /> Reopen</button></div>}
    </article>
  );
}

export default function Home() {
  const [activeView, setActiveView] = useState<ViewKey>("feed");
  const [tasks, setTasks] = useState<Task[]>(initialTasksWithCategories);
  const [activity, setActivity] = useState<AuditEntry[]>([
    { id: 9001, action: "Task completed", subject: "Upload student success stories for October campaign", actor: "Sana Iyer", at: "29 Sep 2026, 4:12 PM" },
    { id: 9002, action: "MOM created", subject: "Academic Huddle", actor: "Priya Nair", at: "26 Sep 2026, 5:06 PM", detail: "4 present · 2 absent" },
    { id: 9003, action: "Person removed", subject: "Demo profile · Rohit Verma", actor: "Arjun Mehta", at: "24 Sep 2026, 11:20 AM", detail: "Access revoked; record retained" },
  ]);
  const [departmentFilter, setDepartmentFilter] = useState("All departments");
  const [categoryFilter, setCategoryFilter] = useState<"All categories" | TaskCategory>("All categories");
  const [statusFilter, setStatusFilter] = useState<"All work" | Status>("All work");
  const [archiveFilter, setArchiveFilter] = useState<"Active tasks" | "Archived tasks">("Active tasks");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeList, setNoticeList] = useState<Notice[]>(noticeSeed);
  const [showNoticeBin, setShowNoticeBin] = useState(false);
  const [noticeDraft, setNoticeDraft] = useState({ title: "", body: "", audience: "Targeted" as NoticeAudience, recipients: ["Academic"] as string[], requiresReply: false, period: "24 hours" as Notice["period"], media: undefined as Notice["media"] });
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(calendarSeed);
  const [feedbackRequests, setFeedbackRequests] = useState<FeedbackRequest[]>(feedbackSeed);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackDraft, setFeedbackDraft] = useState({ title: "", prompt: "", kind: "Poll" as FeedbackKind, options: ["Yes", "No"], targets: ["Academic"] as string[], eventId: 1 });
  const [profiles, setProfiles] = useState<EmployeeProfile[]>(profileSeed);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [newEmployeePhoto, setNewEmployeePhoto] = useState("");
  const [newEmployee, setNewEmployee] = useState({ name: "", number: "", joiningYear: "2026", position: "", department: "Academic", inTime: "09:00 AM", outTime: "06:00 PM", weeklyOff: "Sunday", attendanceStatus: "Present" });
  const [profileDraft, setProfileDraft] = useState<EmployeeProfile>(profileSeed[0]);
  useEffect(() => {
    const expireNotices = () => {
      const now = Date.now();
      setNoticeList(current => current.flatMap(notice => {
        if (notice.binnedAt && now - notice.binnedAt >= 30 * 24 * 60 * 60 * 1000) return [];
        if (!notice.binnedAt && notice.expiresAt && notice.expiresAt <= now) {
          logActivity("Notice moved to bin", notice.title, "Expired notice retained for 30 days");
          return [{ ...notice, binnedAt: now }];
        }
        return [notice];
      }));
    };
    expireNotices();
    const timer = window.setInterval(expireNotices, 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarDraft, setCalendarDraft] = useState({ title: "", date: "", month: 0, type: "Academic program" as CalendarEventType, visibility: ["Academic"] as string[] });
  const [eventPlans, setEventPlans] = useState<EventPlan[]>(eventPlanSeed);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventDraft, setEventDraft] = useState({ title: "", date: "", venue: "", description: "", departments: ["Academic"] as string[], isTemplate: false, templateName: "", roles: [{ id: 1, role: "Event head", inCharge: "Arjun Mehta", department: "Academic" }] as EventRole[], tasks: [{ id: 1, title: "", department: "Academic", assignee: "Arjun Mehta", category: "Squirrel" as TaskCategory, note: "" }] as EventTaskPlan[] });
  const canManageCalendar = true;
  const calendarManagerLabel = "Assigned calendar manager";
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [attachmentTaskId, setAttachmentTaskId] = useState<number | null>(null);
  const [attachmentKind, setAttachmentKind] = useState<AttachmentKind>("evidence");
  const [attachmentLink, setAttachmentLink] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [appNotifications, setAppNotifications] = useState<AppNotification[]>([{ id: 1, title: "Deadline reminder", detail: "2 tasks need your attention today.", at: "Now", read: false, kind: "system" }]);
  const [leadershipRole, setLeadershipRole] = useState<"CEO" | "Director">("CEO");
  const [accessMatrix, setAccessMatrix] = useState(accessMatrixSeed);
  const [auditSearch, setAuditSearch] = useState("");
  const [auditFilter, setAuditFilter] = useState<"All actions" | "Permission changes" | "Sensitive actions">("All actions");
  const canManageEmployeeAccess = leadershipRole === "CEO" || leadershipRole === "Director";
  const toggleAccessPermission = (role: AccessRole, permission: AccessPermission) => {
    if (!canManageEmployeeAccess) { setNotice("Only Directors and the CEO can edit the access matrix."); return; }
    setAccessMatrix(current => ({ ...current, [role]: { ...current[role], [permission]: !current[role][permission] } }));
    logActivity("Access matrix updated", `${role} · ${permission}`, `Updated by ${leadershipRole}`);
    setNotice(`${role} permission updated: ${permission}.`);
  };
  const [readReminderIds, setReadReminderIds] = useState<number[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [notice, setNotice] = useState("Welcome back. 3 tasks need your attention today.");
  const [newTask, setNewTask] = useState({ title: "", assignee: "You", department: "Academic", due: "03 Oct", priority: "Medium" as Task["priority"], teamTask: false, kind: "Task" as TaskKind, category: "Squirrel" as TaskCategory, longRunning: false, source: "", assistants: [] as string[], assignmentNotes: {} as Record<string, string>, subtasks: [] as string[] });
  const [subtaskDraft, setSubtaskDraft] = useState("");
  const [meetingDraft, setMeetingDraft] = useState({ title: "", date: "30 Sep", participants: "", notes: "", decisions: "", actionItem: "", followUp: "03 Oct", department: "Academic" });
  const [meetingList, setMeetingList] = useState(meetings);
  const [momList, setMomList] = useState(momDirectorySeed);
  const [momDepartmentFilter, setMomDepartmentFilter] = useState("All departments");
  const [showMomModal, setShowMomModal] = useState(false);
  const [momDraft, setMomDraft] = useState({ title: "", date: "02 Oct 2026", department: "Academic", meetingHead: "Arjun Mehta", secretary: "Priya Nair", present: ["Arjun Mehta", "Priya Nair"] as string[], absent: [] as string[], content: "", nextMeeting: "", quickTasks: [{ title: "", department: "Academic", assignee: "Arjun Mehta" }] });
  const attachmentTask = tasks.find(task => task.id === attachmentTaskId);

  const visibleTasks = useMemo(() => tasks.filter(task => {
    const matchesDepartment = departmentFilter === "All departments" || task.department === departmentFilter;
    const matchesStatus = statusFilter === "All work" || task.status === statusFilter;
    const matchesCategory = categoryFilter === "All categories" || task.category === categoryFilter;
    const matchesArchive = archiveFilter === "Archived tasks" ? task.archived : !task.archived;
    return matchesDepartment && matchesStatus && matchesCategory && matchesArchive;
  }), [tasks, departmentFilter, statusFilter, categoryFilter, archiveFilter]);

  const deadlineReminders = useMemo(() => tasks.filter(task => !task.archived && task.status !== "done" && (["Today", "Tomorrow"].some(label => task.due.includes(label)) || task.due.startsWith("Overdue"))).map(task => ({
    id: task.id,
    task,
    people: [task.assignee, ...task.assistants.map(assistant => assistant.name)],
    urgency: task.due.startsWith("Overdue") ? "overdue" : task.due === "Today" ? "today" : "soon",
  })), [tasks]);

  const unreadReminders = deadlineReminders.filter(reminder => !readReminderIds.includes(reminder.id));
  const sensitiveAuditActions = ["Access matrix updated", "Employee added", "Employee suspended", "Employee reinstated", "Employee removed", "Person removed", "Task deleted", "Notice moved to bin", "Profile updated", "Calendar event created"];
  const visibleAuditEntries = activity.filter(entry => { const matchesSearch = !auditSearch.trim() || `${entry.action} ${entry.subject} ${entry.actor} ${entry.detail || ""}`.toLowerCase().includes(auditSearch.trim().toLowerCase()); const matchesFilter = auditFilter === "All actions" || (auditFilter === "Permission changes" ? entry.action.includes("Access matrix") : sensitiveAuditActions.includes(entry.action)); return matchesSearch && matchesFilter; });
  const pendingAcknowledgementCount = tasks.filter(task => !task.archived && !(task.acknowledgedBy || []).includes("You")).length;
  const expiringNoticeCount = noticeList.filter(notice => !notice.binnedAt && notice.expiresAt).length;
  const auditTrend = { labels: ["24 Sep", "25 Sep", "26 Sep", "27 Sep", "28 Sep", "29 Sep", "30 Sep"], sensitive: [0, 0, 1, 0, 0, 1, 1], completion: [58, 64, 62, 71, 76, 82, Math.round((tasks.filter(task => task.status === "done").length / Math.max(1, tasks.length)) * 100)] };
  const completionByDepartment = departments.map(department => ({ name: department.name, value: department.done }));

  const logActivity = (action: string, subject: string, detail?: string, actor = "Arjun Mehta") => setActivity(current => [{ id: Date.now() + Math.random(), action, subject, actor, at: "05 Oct 2026, 3:15 PM", detail }, ...current]);
  const pushNotification = (title: string, detail: string, kind: AppNotification["kind"]) => setAppNotifications(current => [{ id: Date.now() + Math.random(), title, detail, at: "Just now", read: false, kind }, ...current].slice(0, 12));
  const downloadCsv = (filename: string, rows: string[][]) => {
    const csv = rows.map(row => row.map(cell => `"${String(cell ?? "").replaceAll("\"", "\"\"")}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; anchor.click(); URL.revokeObjectURL(url);
    setNotice(`${filename} downloaded.`);
  };
  const downloadPdf = (filename: string, title: string, rows: string[][]) => {
    const escapePdf = (value: string) => String(value ?? "").replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/[\r\n]+/g, " ");
    const lines = [title, `Generated by JAMBAVAN · ${new Date().toLocaleDateString()}`, "", ...rows.map(row => row.join("  |  "))];
    const pageLines = 42;
    const pages = Array.from({ length: Math.max(1, Math.ceil(lines.length / pageLines)) }, (_, index) => lines.slice(index * pageLines, (index + 1) * pageLines));
    const objects: string[] = [];
    const pageRefs: number[] = [];
    const fontRef = 3;
    objects.push("<< /Type /Catalog /Pages 2 0 R >>");
    objects.push(`<< /Type /Pages /Kids [${pages.map((_, index) => `${4 + index * 2} 0 R`).join(" ")}] /Count ${pages.length} >>`);
    objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
    pages.forEach((page, index) => {
      const pageRef = 4 + index * 2;
      const contentRef = pageRef + 1;
      pageRefs.push(pageRef);
      const content = ["BT", "/F1 10 Tf", "50 770 Td", ...page.map((line, lineIndex) => `${lineIndex ? "0 -17 Td" : ""} (${escapePdf(line.slice(0, 150))}) Tj`), "ET"].join("\n");
      objects.push(`<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 ${fontRef} 0 R >> >> /MediaBox [0 0 612 792] /Contents ${contentRef} 0 R >>`);
      objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    });
    let pdf = "%PDF-1.4\n";
    const offsets: number[] = [0];
    objects.forEach((object, index) => { offsets.push(pdf.length); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
    const xref = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, "0")} 00000 n `).join("\n")}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
    const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; anchor.click(); URL.revokeObjectURL(url);
    setNotice(`${filename} downloaded.`);
  };
  const eventReportRows = [["Event", "Date", "Departments", "Task count", "Categories", "Roles and in-charges", "Created by"], ...eventPlans.map(plan => [plan.title, plan.date, plan.departments.join(" | "), String(plan.tasks.length), plan.tasks.map(task => task.category).join(" | "), (plan.roles || []).map(role => `${role.role}: ${role.inCharge} (${role.department})`).join(" | "), plan.createdBy])];
  const attendanceReportRows = [["Employee", "Department", "Position", "Contact", "Joining year", "In time", "Out time", "Weekly off", "Availability", "Attendance", "Status note"], ...profiles.map(profile => [profile.name, profile.department, profile.position, profile.number, profile.joiningYear, profile.inTime, profile.outTime, profile.weeklyOff, profile.status, profile.attendanceStatus || "Present", profile.statusNote || ""])];
  const exportEventAnalytics = () => downloadCsv("jambavan-event-task-analytics.csv", eventReportRows);
  const exportEventPdf = () => downloadPdf("jambavan-event-task-analytics.pdf", "JAMBAVAN Multi-Department Event Planning Report", eventReportRows);
  const exportAttendanceSummary = () => downloadCsv("jambavan-employee-attendance-summary.csv", attendanceReportRows);
  const exportAttendancePdf = () => downloadPdf("jambavan-employee-attendance-summary.pdf", "JAMBAVAN Employee Attendance Summary", attendanceReportRows);
  const exportLeadershipAnalytics = () => downloadPdf("jambavan-leadership-analytics.pdf", "JAMBAVAN Leadership Analytics", [["Metric", "Value"], ["Sensitive actions", String(activity.filter(entry => sensitiveAuditActions.includes(entry.action)).length)], ["Open acknowledgments", String(pendingAcknowledgementCount)], ["Expiring notices", String(expiringNoticeCount)], ...departments.map(department => [`${department.name} completion`, `${department.done}%`]), ...auditTrend.labels.map((label, index) => [`${label} completion`, `${auditTrend.completion[index]}%`])]);

  const completeTask = (id: number) => {
    const subject = tasks.find(task => task.id === id)?.title || "Task";
    setTasks(current => current.map(task => task.id === id && task.assignee === "You" ? { ...task, status: "done", progress: 100, completedBy: "You", completedAt: "05 Oct 2026, 3:15 PM" } : task));
    logActivity("Task completed", subject, "Owner completion recorded");
    setNotice("Nice work — task marked complete and the team feed is updated.");
  };

  const toggleAssistant = (taskId: number, assistantName: string) => {
    const subject = tasks.find(task => task.id === taskId)?.title || "Task";
    setTasks(current => current.map(task => task.id !== taskId ? task : { ...task, assistants: task.assistants.map(assistant => assistant.name === assistantName ? { ...assistant, completed: !assistant.completed } : assistant) }));
    logActivity("Assistant update", subject, `${assistantName} reported their part`);
    setNotice(`${assistantName}'s part was updated. The task stays open until the owner completes it.`);
  };

  const toggleSubtask = (taskId: number, subtaskId: number) => {
    const subject = tasks.find(task => task.id === taskId)?.title || "Task";
    setTasks(current => current.map(task => task.id === taskId ? { ...task, subtasks: task.subtasks?.map(subtask => subtask.id === subtaskId ? { ...subtask, done: !subtask.done } : subtask) } : task));
    logActivity("Subtask updated", subject, "Progress changed by employee");
    setNotice("Subtask progress updated.");
  };

  const addSubtaskToDraft = () => {
    if (!subtaskDraft.trim()) return;
    setNewTask(current => ({ ...current, subtasks: [...current.subtasks, subtaskDraft.trim()] }));
    setSubtaskDraft("");
  };

  const openAttachmentModal = (taskId: number, kind: AttachmentKind) => {
    setAttachmentTaskId(taskId);
    setAttachmentKind(kind);
    setAttachmentLink("");
    setShowAttachmentModal(true);
  };

  const addAttachments = (files: FileList | null) => {
    if (!files || attachmentTaskId === null) return;
    const additions: TaskAttachment[] = Array.from(files).map(file => ({ id: Date.now() + Math.random(), name: file.name, kind: attachmentKind, type: file.type || "file", url: URL.createObjectURL(file), addedBy: "You" }));
    setTasks(current => current.map(task => task.id === attachmentTaskId ? { ...task, attachments: [...(task.attachments || []), ...additions] } : task));
    logActivity("Attachment added", attachmentTask?.title || "Task", `${additions.length} ${attachmentKind} file${additions.length === 1 ? "" : "s"}`);
    setShowAttachmentModal(false);
    setNotice(`${additions.length} ${attachmentKind === "evidence" ? "completion evidence" : "helping material"} file${additions.length === 1 ? "" : "s"} added to the task.`);
  };

  const addAttachmentLink = () => {
    if (!attachmentLink.trim() || attachmentTaskId === null) return;
    const link = attachmentLink.trim();
    const name = link.replace(/^https?:\/\//, "").split("/")[0] || "Shared link";
    setTasks(current => current.map(task => task.id === attachmentTaskId ? { ...task, attachments: [...(task.attachments || []), { id: Date.now(), name, kind: attachmentKind, type: "link", url: link, addedBy: "You" }] } : task));
    logActivity("Attachment added", attachmentTask?.title || "Task", `${attachmentKind} link added`);
    setShowAttachmentModal(false);
    setNotice(`${attachmentKind === "evidence" ? "Evidence" : "Helping material"} link added to the task.`);
  };

  const reopenTask = (id: number) => {
    const subject = tasks.find(task => task.id === id)?.title || "Task";
    setTasks(current => current.map(task => task.id === id ? { ...task, status: "progress", progress: Math.min(task.progress || 40, 80), reopenedAt: "05 Oct 2026, 3:15 PM" } : task));
    logActivity("Task reopened", subject, "Reopened for quality review");
    setNotice("Task reopened by the department head for another review.");
  };

  const editTask = (task: Task) => {
    setEditingTaskId(task.id);
    setNewTask({ title: task.title, assignee: task.assignee, department: task.department, due: task.due, priority: task.priority, teamTask: Boolean(task.isTeamTask), kind: task.kind, category: task.category || "Squirrel", source: task.source || "", longRunning: Boolean(task.longRunning), assistants: task.assistants.map(assistant => assistant.name), assignmentNotes: task.assignmentNotes || Object.fromEntries(task.assistants.filter(assistant => assistant.note).map(assistant => [assistant.name, assistant.note || ""])), subtasks: task.subtasks?.map(subtask => subtask.title) || [] });
    setShowTaskModal(true);
  };

  const createTask = () => {
    if (!newTask.title.trim()) return;
    const task: Task = {
      id: Date.now(),
      title: newTask.title.trim(),
      assignee: newTask.assignee,
      initials: initials(newTask.assignee),
      team: newTask.teamTask ? "Shared team task" : "Leadership",
      department: newTask.department,
      due: newTask.due,
      status: "todo",
      priority: newTask.priority,
      visibility: newTask.teamTask ? "Department" : "Leadership",
      progress: 0,
      kind: newTask.kind,
      category: newTask.category,
      longRunning: newTask.longRunning,
      updates: newTask.longRunning ? [] : undefined,
      isTeamTask: newTask.teamTask,
      source: newTask.source || undefined,
      assistants: newTask.assistants.map(name => ({ name, initials: initials(name), department: newTask.department, completed: false, note: newTask.assignmentNotes[name] || "" })),
      assignmentNotes: { [newTask.assignee]: newTask.assignmentNotes[newTask.assignee] || "", ...Object.fromEntries(newTask.assistants.map(name => [name, newTask.assignmentNotes[name] || ""])) },
      subtasks: newTask.subtasks.map(title => ({ id: Date.now() + Math.random(), title, done: false, addedBy: "You" })),
    };
    if (editingTaskId) {
      setTasks(current => current.map(existing => existing.id === editingTaskId ? { ...existing, ...task, id: editingTaskId, status: existing.status, completedBy: existing.completedBy, completedAt: existing.completedAt } : existing));
      logActivity("Task edited", task.title, "Task details updated by department head");
      setNotice("Task updated by the department head. Owner and assistants have been notified.");
    } else {
      setTasks(current => [task, ...current]);
      logActivity(task.kind === "HANUMAN" ? "HANUMAN task created" : "Task created", task.title, task.longRunning ? "Long-running workstream added to the feed" : "Visible to permitted people");
      setNotice("Task created. It is now visible to the right people in their feed.");
    }
    pushNotification(editingTaskId ? "Task assignment updated" : "New task assignment", `${task.title} · Owner ${task.assignee}${task.assistants.length ? ` · ${task.assistants.length} assistant${task.assistants.length === 1 ? "" : "s"}` : ""}`, "assignment");
    setShowTaskModal(false);
    setEditingTaskId(null);
    setNewTask({ title: "", assignee: "You", department: "Academic", due: "03 Oct", priority: "Medium", teamTask: false, kind: "Task", category: "Squirrel", longRunning: false, source: "", assistants: [], assignmentNotes: {}, subtasks: [] });
  };

  const archiveTask = (id: number) => {
    const subject = tasks.find(task => task.id === id)?.title || "Task";
    const archived = !tasks.find(task => task.id === id)?.archived;
    setTasks(current => current.map(task => task.id === id ? { ...task, archived, archivedBy: "Arjun Mehta", archivedAt: "05 Oct 2026, 3:45 PM" } : task));
    logActivity(archived ? "Task archived" : "Task restored", subject, archived ? "Archived by department head" : "Restored by department head");
    setNotice(archived ? "Task archived. It is hidden from active feeds but retained for future reference." : "Task restored to the active task feed.");
  };
  const deleteTask = (id: number) => {
    const subject = tasks.find(task => task.id === id)?.title || "Task";
    setTasks(current => current.filter(task => task.id !== id));
    logActivity("Task deleted", subject, "Deleted by department head");
    setShowTaskModal(false);
    setEditingTaskId(null);
    setNotice("Task deleted. The audit trail keeps who did it and when.");
  };

  const addTaskUpdate = (taskId: number, text: string) => {
    const clean = text.trim();
    if (!clean) return;
    const subject = tasks.find(task => task.id === taskId)?.title || "HANUMAN task";
    setTasks(current => current.map(task => task.id === taskId ? { ...task, updates: [...(task.updates || []), { id: Date.now(), text: clean, addedBy: "Arjun Mehta", at: "05 Oct 2026, 3:15 PM" }] } : task));
    logActivity("Progress update posted", subject, clean);
    setNotice("Progress update posted to the HANUMAN task journal.");
  };

  const addTaskSubtask = (taskId: number, title: string) => {
    const clean = title.trim();
    if (!clean) return;
    const subject = tasks.find(task => task.id === taskId)?.title || "Task";
    setTasks(current => current.map(task => task.id === taskId ? { ...task, subtasks: [...(task.subtasks || []), { id: Date.now(), title: clean, done: false, addedBy: "Arjun Mehta" }] } : task));
    logActivity("Subtask added", subject, clean);
    setNotice("Subtask added to the task.");
  };

  const acknowledgeTask = (taskId: number, mode: "seen" | "ack") => {
    setTasks(current => current.map(task => task.id !== taskId ? task : mode === "seen" ? { ...task, seenBy: [...new Set([...(task.seenBy || []), "You"])] } : { ...task, acknowledgedBy: [...new Set([...(task.acknowledgedBy || []), "You"])] }));
    logActivity(mode === "seen" ? "Task seen" : "Task acknowledged", tasks.find(task => task.id === taskId)?.title || "Task", mode === "seen" ? "Employee marked it seen" : "Employee acknowledged it");
  };
  const acknowledgeNotice = (noticeId: number) => {
    setNoticeList(current => current.map(notice => notice.id === noticeId ? { ...notice, recipients: [...new Set([...notice.recipients, "You · seen"])] } : notice));
    logActivity("Notice seen", noticeList.find(notice => notice.id === noticeId)?.title || "Notice", "Employee marked the notice seen");
  };
  const submitNoticeReply = (noticeId: number, reply: string) => {
    const clean = reply.trim();
    if (!clean) return;
    setNoticeList(current => current.map(notice => notice.id === noticeId ? { ...notice, replies: { ...(notice.replies || {}), "You": clean } } : notice));
    logActivity("Notice reply submitted", noticeList.find(notice => notice.id === noticeId)?.title || "Notice", "Reply visible only to sender and leadership");
    const repliedNotice = noticeList.find(notice => notice.id === noticeId);
    pushNotification("Confidential reply received", `${repliedNotice?.title || "Notice"} · Reply from You`, "reply");
    setNotice("Your reply was sent privately to the notice sender and leadership.");
  };

  const openMyProfile = () => {
    setProfileDraft(profiles.find(profile => profile.name === "Arjun Mehta") || profileSeed[0]);
    setShowProfileModal(true);
  };
  const saveMyProfile = () => {
    setProfiles(current => current.map(profile => profile.name === profileDraft.name ? profileDraft : profile));
    logActivity("Profile updated", profileDraft.name, "Employee self-service update");
    setShowProfileModal(false);
    setNotice("Your employee profile was updated and is visible to the team.");
  };

  const addEmployee = () => {
    if (!canManageEmployeeAccess) { setNotice("Only Directors and the CEO can manage employee access."); return; }
    if (!newEmployee.name.trim() || !newEmployee.number.trim() || !newEmployee.position.trim() || !newEmployeePhoto) { setNotice("A name, contact number, position, and profile photograph are required."); return; }
    const profile: EmployeeProfile = { ...newEmployee, name: newEmployee.name.trim(), number: newEmployee.number.trim(), position: newEmployee.position.trim(), access: "Active", photo: newEmployeePhoto, status: "Available", attendanceStatus: newEmployee.attendanceStatus as EmployeeProfile["attendanceStatus"] };
    setProfiles(current => [profile, ...current]);
    logActivity("Employee added", profile.name, "Added by Director");
    setShowAccessModal(false); setNewEmployeePhoto("");
    setNewEmployee({ name: "", number: "", joiningYear: "2026", position: "", department: "Academic", inTime: "09:00 AM", outTime: "06:00 PM", weeklyOff: "Sunday", attendanceStatus: "Present" });
    setNotice("Employee added. Access is active and the profile is visible to the institute.");
  };
  const toggleEmployeeSuspension = (name: string) => {
    if (!canManageEmployeeAccess) { setNotice("Only Directors and the CEO can suspend or reinstate employees."); return; }
    setProfiles(current => current.map(profile => profile.name === name ? { ...profile, access: profile.access === "Suspended" ? "Active" : "Suspended" } : profile));
    const profile = profiles.find(item => item.name === name);
    const suspended = profile?.access !== "Suspended";
    logActivity(suspended ? "Employee suspended" : "Employee reinstated", name, suspended ? "Future institute changes paused" : "Access restored by Director");
    setNotice(suspended ? `${name} is suspended and will not see future institute changes.` : `${name} has been reinstated.`);
  };
  const removeEmployee = (name: string) => {
    if (!canManageEmployeeAccess) { setNotice("Only Directors and the CEO can terminate employees."); return; }
    setProfiles(current => current.filter(profile => profile.name !== name));
    logActivity("Employee removed", name, "Institute access and profile data removed by Director");
    setNotice(`${name} was removed. Their institute access and profile data are no longer available.`);
  };

  const createFeedback = () => {
    if (!feedbackDraft.title.trim() || !feedbackDraft.prompt.trim() || !feedbackDraft.targets.length) return;
    const request: FeedbackRequest = { id: Date.now(), title: feedbackDraft.title.trim(), prompt: feedbackDraft.prompt.trim(), kind: feedbackDraft.kind, options: feedbackDraft.kind === "Poll" ? feedbackDraft.options.filter(Boolean) : undefined, targets: feedbackDraft.targets, eventId: feedbackDraft.eventId, createdBy: "Arjun Mehta", responses: {} };
    setFeedbackRequests(current => [request, ...current]);
    logActivity("Feedback request created", request.title, `${request.kind} · ${request.targets.join(", ")}`);
    setShowFeedbackModal(false);
    setFeedbackDraft({ title: "", prompt: "", kind: "Poll", options: ["Yes", "No"], targets: ["Academic"], eventId: 1 });
    setNotice("Feedback request sent to the selected people or groups.");
  };
  const respondFeedback = (feedbackId: number, answer: string) => {
    setFeedbackRequests(current => current.map(request => request.id === feedbackId ? { ...request, responses: { ...request.responses, You: answer } } : request));
    logActivity("Feedback submitted", feedbackRequests.find(request => request.id === feedbackId)?.title || "Feedback", answer);
    setNotice("Your feedback has been recorded.");
  };

  const createCalendarEvent = () => {
    if (!canManageCalendar || !calendarDraft.title.trim() || !calendarDraft.date.trim()) return;
    const event: CalendarEvent = { id: Date.now(), title: calendarDraft.title.trim(), date: calendarDraft.date.trim(), month: calendarDraft.month, type: calendarDraft.type, visibility: calendarDraft.visibility, createdBy: "Arjun Mehta" };
    setCalendarEvents(current => [...current, event]);
    logActivity("Calendar event created", event.title, `${event.type} · ${event.visibility.join(", ")}`);
    setShowCalendarModal(false);
    setCalendarDraft({ title: "", date: "", month: 0, type: "Academic program", visibility: ["Academic"] });
    setNotice("Yearly calendar event added for the selected audience.");
  };

  const openEventPlanner = (plan?: EventPlan) => {
    if (plan) {
      setEventDraft({ title: plan.isTemplate ? `${plan.title} · new event` : plan.title, date: plan.isTemplate ? "" : plan.date, venue: plan.venue, description: plan.description, departments: [...plan.departments], isTemplate: false, templateName: plan.templateName || plan.title, roles: (plan.roles || []).map(role => ({ ...role, id: Date.now() + Math.random() })), tasks: plan.tasks.map(task => ({ ...task, id: Date.now() + Math.random() })) });
    } else {
      setEventDraft({ title: "", date: "", venue: "", description: "", departments: ["Academic"], isTemplate: false, templateName: "", roles: [{ id: Date.now(), role: "Event head", inCharge: "Arjun Mehta", department: "Academic" }], tasks: [{ id: Date.now(), title: "", department: "Academic", assignee: "Arjun Mehta", category: "Squirrel", note: "" }] });
    }
    setShowEventModal(true);
  };
  const createEventPlan = () => {
    if (!eventDraft.title.trim()) return;
    const plannedTasks = eventDraft.tasks.filter(task => task.title.trim()).map(task => ({ ...task, title: task.title.trim() }));
    const event: EventPlan = { id: Date.now(), title: eventDraft.title.trim(), date: eventDraft.date || "Date to be confirmed", venue: eventDraft.venue || "Venue to be confirmed", description: eventDraft.description.trim() || "Event plan created in JAMBAVAN.", departments: eventDraft.departments, roles: eventDraft.roles.filter(role => role.role.trim() && role.inCharge), tasks: plannedTasks, isTemplate: eventDraft.isTemplate, templateName: eventDraft.isTemplate ? (eventDraft.templateName.trim() || eventDraft.title.trim()) : undefined, createdBy: "Arjun Mehta" };
    setEventPlans(current => [event, ...current]);
    if (plannedTasks.length) {
      setTasks(current => [...plannedTasks.map((planned, index) => ({ id: Date.now() + index + 1, title: planned.title, assignee: planned.assignee, initials: initials(planned.assignee), team: event.title, department: planned.department, due: event.date, status: "todo" as Status, priority: "Medium" as Task["priority"], visibility: "Department" as Task["visibility"], progress: 0, kind: "Responsibility" as TaskKind, category: planned.category, project: event.title, source: `Event plan · ${event.title}`, assistants: [], assignmentNotes: { [planned.assignee]: planned.note } })), ...current]);
    }
    logActivity(event.isTemplate ? "Event template created" : "Event planned", event.title, `${event.departments.join(", ")} · ${plannedTasks.length} task${plannedTasks.length === 1 ? "" : "s"}`);
    setShowEventModal(false);
    setNotice(event.isTemplate ? "Event template saved for reuse." : `Event planned. ${plannedTasks.length} task${plannedTasks.length === 1 ? "" : "s"} added to the task feed.`);
  };
  const createNotice = () => {
    if (!noticeDraft.title.trim() && !noticeDraft.body.trim() && !noticeDraft.media) return;
    const periodMs: Record<NonNullable<Notice["period"]>, number> = { "12 hours": 12 * 60 * 60 * 1000, "24 hours": 24 * 60 * 60 * 1000, "7 days": 7 * 24 * 60 * 60 * 1000, "1 month": 30 * 24 * 60 * 60 * 1000 };
    const notice: Notice = { id: Date.now(), title: noticeDraft.title.trim() || "JAMBAVAN notice", body: noticeDraft.body.trim(), audience: noticeDraft.audience, recipients: noticeDraft.audience === "Everyone" ? ["Entire institute"] : noticeDraft.recipients, sender: "Arjun Mehta", sentAt: "05 Oct 2026, 3:30 PM", requiresReply: noticeDraft.requiresReply, replies: {}, period: noticeDraft.period, expiresAt: Date.now() + periodMs[noticeDraft.period || "24 hours"], media: noticeDraft.media };
    setNoticeList(current => [notice, ...current]);
    logActivity("Notice sent", notice.title, `${notice.audience} · ${notice.recipients.join(", ")}`);
    setShowNoticeModal(false);
    setNoticeDraft({ title: "", body: "", audience: "Targeted", recipients: ["Academic"], requiresReply: false, period: "24 hours", media: undefined });
    setNotice("Notice sent to the selected audience.");
  };

  const addNoticeMedia = (file: File | undefined) => {
    if (!file) return;
    const type = file.type.startsWith("image/") ? "image" : file.type.startsWith("audio/") ? "audio" : file.type.startsWith("video/") ? "video" : "file";
    setNoticeDraft(current => ({ ...current, media: { name: file.name, type, url: URL.createObjectURL(file) } }));
  };

  const openMomAction = () => {
    setNewTask({ title: "Confirm faculty backup for Batch 3", assignee: "You", department: "Academic", due: "30 Sep", priority: "Medium", teamTask: false, kind: "MOM action", category: "Angad", longRunning: false, source: "Academic Huddle · 26 Sep", assistants: ["Priya Nair", "Karan Joshi"], assignmentNotes: {}, subtasks: [] });
    setShowTaskModal(true);
  };

  const openNewMeeting = () => {
    setMeetingDraft({ title: "", date: "30 Sep", participants: "", notes: "", decisions: "", actionItem: "", followUp: "03 Oct", department: "Academic" });
    setShowMeetingModal(true);
  };

  const createMeeting = () => {
    if (!meetingDraft.title.trim()) return;
    const createdMeeting = { title: meetingDraft.title.trim(), date: meetingDraft.date, meta: `${meetingDraft.date} · ${meetingDraft.participants || "No participants listed"}`, participants: meetingDraft.participants || "Participants to be added", participantNames: meetingDraft.participants ? meetingDraft.participants.split(",").map(name => name.trim()).filter(Boolean) : [], count: meetingDraft.participants ? meetingDraft.participants.split(",").length : 0, tone: "saffron", note: meetingDraft.notes || "Meeting notes captured in JAMBAVAN", decisions: meetingDraft.decisions || "No decisions recorded", actionItem: meetingDraft.actionItem || "No action item", followUp: meetingDraft.followUp };
    setMeetingList(current => [createdMeeting, ...current]);
    logActivity("Meeting posted", createdMeeting.title, `${meetingDraft.department} · ${meetingDraft.date}`);
    if (meetingDraft.actionItem.trim()) {
      setTasks(current => [{ id: Date.now(), title: meetingDraft.actionItem.trim(), assignee: "You", initials: "YO", team: "Meeting action", department: meetingDraft.department, due: meetingDraft.followUp, status: "todo", priority: "Medium", visibility: "Department", progress: 0, kind: "MOM action", category: "Angad", longRunning: false, source: `${meetingDraft.title.trim()} · ${meetingDraft.date}`, assistants: [] }, ...current]);
    }
    setShowMeetingModal(false);
    setNotice(meetingDraft.actionItem.trim() ? "Meeting saved and its action item became a task." : "Meeting saved with MOM details.");
  };

  const createMomRecord = () => {
    if (!momDraft.title.trim() || !momDraft.content.trim() || !momDraft.meetingHead || !momDraft.secretary) return;
    const present = Array.from(new Set([momDraft.meetingHead, momDraft.secretary, ...momDraft.present]));
    const absent = momDraft.absent.filter(name => !present.includes(name));
    const quickTasks = momDraft.quickTasks.filter(row => row.title.trim());
    const record = { id: Date.now(), title: momDraft.title.trim(), date: momDraft.date, department: momDraft.department, meetingHead: momDraft.meetingHead, secretary: momDraft.secretary, attendance: present, absent, content: momDraft.content.trim(), nextMeeting: momDraft.nextMeeting.trim(), actionItem: quickTasks[0]?.title || "No task assigned", taskAssignee: quickTasks[0]?.assignee || "—" };
    setMomList(current => [record, ...current]);
    logActivity("MOM posted", record.title, `${record.department} · ${record.attendance.length} present · ${record.absent.length} absent`, record.secretary);
    if (quickTasks.length) setTasks(current => [...quickTasks.map((row, index) => ({ id: Date.now() + index + 1, title: row.title.trim(), assignee: row.assignee, initials: initials(row.assignee), team: "MOM follow-up", department: row.department, due: record.nextMeeting || "To be scheduled", status: "todo" as Status, priority: "Medium" as Task["priority"], visibility: "Department" as Task["visibility"], progress: 0, kind: "MOM action" as Task["kind"], category: "Angad" as TaskCategory, longRunning: false, source: `${record.title} · ${record.date}`, assistants: [] })), ...current]);
    setShowMomModal(false);
    setNotice(quickTasks.length ? `MOM locked. ${quickTasks.length} quick task${quickTasks.length === 1 ? "" : "s"} assigned.` : "MOM locked in the department directory. No task was auto-generated from the written MOM.");
    setMomDraft({ title: "", date: "02 Oct 2026", department: "Academic", meetingHead: "Arjun Mehta", secretary: "Priya Nair", present: ["Arjun Mehta", "Priya Nair"], absent: [], content: "", nextMeeting: "", quickTasks: [{ title: "", department: "Academic", assignee: "Arjun Mehta" }] });
  };

  const assignMomTask = (mom: (typeof momDirectorySeed)[number]) => {
    setNewTask({ title: mom.actionItem || `Follow up: ${mom.title}`, assignee: mom.taskAssignee, department: mom.department, due: mom.nextMeeting || "To be scheduled", priority: "Medium", teamTask: false, kind: "MOM action", category: "Angad", longRunning: false, source: `${mom.title} · ${mom.date}`, assistants: [], assignmentNotes: {}, subtasks: [] });
    setShowTaskModal(true);
    setNotice("Task assignment opened from the locked MOM. The MOM content remains unchanged.");
  };

  const [plannerRange, setPlannerRange] = useState<"day" | "week" | "month">("week");
  const rewardSummary = useMemo(() => {
    const completed = tasks.filter(task => task.status === "done").length;
    const onTime = tasks.filter(task => task.status === "done" && !task.due.startsWith("Overdue")).length;
    const missed = tasks.filter(task => task.status !== "done" && task.due.startsWith("Overdue")).length;
    const points = completed * 10 + onTime * 5 - missed * 5;
    return { points, completed, onTime, missed, tier: points >= 45 ? "Gold" : points >= 25 ? "Silver" : "Bronze" };
  }, [tasks]);

  const plannerTasks = useMemo(() => {
    const slots = plannerRange === "day" ? ["Today"] : plannerRange === "week" ? ["Today", "Tomorrow", "30 Sep", "01 Oct", "02 Oct", "03 Oct", "04 Oct"] : ["Today", "Tomorrow", "30 Sep", "01 Oct", "02 Oct", "03 Oct", "04 Oct", "05 Oct", "06 Oct", "07 Oct", "08 Oct", "09 Oct", "10 Oct"];
    return slots.map(slot => ({ slot, tasks: tasks.filter(task => task.due.includes(slot) || (slot === "Today" && task.due.startsWith("Overdue"))) }));
  }, [tasks, plannerRange]);

  const acknowledgementSummary = useMemo(() => {
    const openTasks = tasks.filter(task => !task.archived && task.status !== "done");
    const byDepartment = departments.map(department => {
      const departmentTasks = openTasks.filter(task => task.department === department.name);
      return { ...department, tasks: departmentTasks.length, seen: departmentTasks.reduce((sum, task) => sum + (task.seenBy?.length || 0), 0), acknowledgements: departmentTasks.reduce((sum, task) => sum + (task.acknowledgedBy?.length || 0), 0) };
    });
    return { openTasks, byDepartment, pending: openTasks.filter(task => !(task.acknowledgedBy || []).includes("You")).length, seen: openTasks.reduce((sum, task) => sum + (task.seenBy?.length || 0), 0), acknowledged: openTasks.reduce((sum, task) => sum + (task.acknowledgedBy?.length || 0), 0) };
  }, [tasks]);
  const viewTitle = {
    feed: "Good morning, Arjun",
    department: "Department pulse",
    meetings: "Meeting execution",
    momDirectory: "MOM Directory",
    dashboard: "Execution dashboard",
    calendar: "Yearly Calendar",
    eventPlanner: "Event Planner",
    guide: "JAMBAVAN Guide",
    projects: "Major responsibilities",
    people: "People & hierarchy",
    myProfile: "My employee profile",
    roleMatrix: "Role access matrix",
    auditLog: "Audit log",
  }[activeView];

  const viewSubtitle = {
    feed: "Here’s the work that keeps JAMBAVAN moving today.",
    department: "See what your department is moving, finishing, and waiting on.",
    meetings: "Use the MOM Directory to record attendance, decisions, and explicitly assigned tasks.",
    momDirectory: "Locked meeting records by department, with tasks assigned from the MOM.",
    dashboard: "A clear view of execution across your reporting hierarchy.",
    calendar: "Holidays, festivals, programs, and birthdays in one permission-aware calendar.",
    eventPlanner: "Plan an event once, assign every department, and reuse the playbook next time.",
    guide: "A simple field guide to task families, event playbooks, and accountable execution.",
    projects: "Keep the big rocks visible beside daily action items.",
    people: "Shared teams, department heads, and the reporting view in one place.",
    myProfile: "Keep your attendance, schedule, weekly off, and leave status current for the whole team.",
    roleMatrix: "Define what each institute role can see and manage, without losing leadership control.",
    auditLog: "Review permission changes and sensitive institute actions with actor, time, and context.",
  }[activeView];

  return (
    <div className="jambavan-app">
      <aside className={`sidebar ${showMobileNav ? "mobile-open" : ""}`}>
        <div className="brand-lockup">
          <div className="brand-mark"><span>J</span><i /></div>
          <div><strong>JAMBAVAN</strong><small>Execution workspace</small></div>
        </div>
        <div className="workspace-switcher"><span className="workspace-dot" /> <span>JAMBAVAN Institute</span><ChevronDown size={15} /></div>
        <div className="nav-label">Workspace</div>
        <nav className="main-nav">
          {navItems.filter(item => ["feed", "department", "dashboard"].includes(item.key)).map(item => {
            const Icon = item.icon;
            return <button key={item.key} className={activeView === item.key ? "active" : ""} onClick={() => { setActiveView(item.key); setShowMobileNav(false); }}><Icon size={18} /><span>{item.label}</span>{item.key === "feed" && <em>3</em>}</button>;
          })}
        </nav>
        <div className="nav-label manage-label">Execution</div>
        <nav className="main-nav">
          {navItems.filter(item => ["momDirectory", "eventPlanner", "projects"].includes(item.key)).map(item => {
            const Icon = item.icon;
            return <button key={item.key} className={activeView === item.key ? "active" : ""} onClick={() => { setActiveView(item.key); setShowMobileNav(false); }}><Icon size={18} /><span>{item.label}</span></button>;
          })}
        </nav>
        <div className="nav-label manage-label">Communication</div>
        <nav className="main-nav">
          {navItems.filter(item => item.key === "calendar").map(item => {
            const Icon = item.icon;
            return <button key={item.key} className={activeView === item.key ? "active" : ""} onClick={() => { setActiveView(item.key); setShowMobileNav(false); }}><Icon size={18} /><span>{item.label}</span></button>;
          })}
          <button onClick={() => { setActiveView("feed"); setShowMobileNav(false); }}><Megaphone size={18} /><span>Notices & feedback</span></button>
        </nav>
        <div className="nav-label manage-label">People & control</div>
        <nav className="main-nav">
          <button className={activeView === "people" ? "active" : ""} onClick={() => { setActiveView("people"); setShowMobileNav(false); }}><Users size={18} /><span>People</span></button>
          <button className={activeView === "myProfile" ? "active" : ""} onClick={() => { openMyProfile(); setActiveView("myProfile"); setShowMobileNav(false); }}><UserRound size={18} /><span>My profile</span></button>
          {canManageEmployeeAccess && <button className={activeView === "roleMatrix" ? "active" : ""} onClick={() => { setActiveView("roleMatrix"); setShowMobileNav(false); }}><ShieldCheck size={18} /><span>Access matrix</span></button>}
          {canManageEmployeeAccess && <button className={activeView === "auditLog" ? "active" : ""} onClick={() => { setActiveView("auditLog"); setShowMobileNav(false); }}><Clock3 size={18} /><span>Audit log</span></button>}
        </nav>
        <div className="sidebar-spacer" />
        <div className="head-card"><Avatar text="AM" name="Arjun Mehta" tone="saffron" /><div><strong>Arjun Mehta</strong><span>Department Head · Academic</span></div><MoreHorizontal size={16} /></div>
        <button className="settings-link"><Settings2 size={17} /> Workspace settings</button>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu icon-button" onClick={() => setShowMobileNav(true)} aria-label="Open menu"><Menu size={20} /></button>
          <div className="crumbs"><span>Workspace</span><span>/</span><strong>{activeView === "feed" ? "My feed" : viewTitle}</strong></div>
          <div className="top-actions"><button className="search-button"><Search size={17} /><span>Search tasks, people...</span><kbd>⌘ K</kbd></button><div className="notification-wrap"><button className="icon-button notification-button" aria-label="Deadline reminders" onClick={() => setShowNotifications(current => !current)}><Bell size={18} />{(unreadReminders.length + appNotifications.filter(item => !item.read).length) > 0 && <i />}</button>{showNotifications && <div className="notification-panel"><div className="notification-head"><div><strong>Live notifications</strong><span>Assignments, private replies, deadline reminders, and system updates.</span></div><button className="text-button" onClick={() => { setAppNotifications(current => current.map(item => ({ ...item, read: true }))); setReadReminderIds(deadlineReminders.map(reminder => reminder.id)); }}>Mark all read</button></div><div className="notification-preference-note"><Bell size={12} /> In-app alerts are active. Daily email digest can be enabled when an email connector is connected.</div>{appNotifications.map(item => <button key={item.id} className={`live-notification ${item.kind}`} onClick={() => setAppNotifications(current => current.map(entry => entry.id === item.id ? { ...entry, read: true } : entry))}><span className="reminder-icon"><Bell size={14} /></span><span className="reminder-copy"><strong>{item.title}</strong><small>{item.detail}</small></span><em>{item.at}</em></button>)}{deadlineReminders.map(reminder => <button key={`deadline-${reminder.id}`} className={`reminder-item ${reminder.urgency}`} onClick={() => { setReadReminderIds(current => current.includes(reminder.id) ? current : [...current, reminder.id]); setShowNotifications(false); setActiveView("feed"); }}><span className="reminder-icon"><Clock3 size={14} /></span><span className="reminder-copy"><strong>{reminder.task.title}</strong><small><Avatar text={reminder.task.initials} name={reminder.task.assignee} tone={reminder.task.department.toLowerCase()} /> {reminder.task.assignee} + {reminder.task.assistants.length} assistant{reminder.task.assistants.length === 1 ? "" : "s"}</small></span><em>{reminder.task.due}</em></button>)}{appNotifications.length === 0 && deadlineReminders.length === 0 && <p className="empty-notice">No new notifications.</p>}</div>}</div><Avatar text="AM" name="Arjun Mehta" tone="saffron" /></div>
        </header>

        <div className="content-wrap">
          <div className="ramayana-ribbon"><div><span>JAMBAVAN · Ramayana-inspired execution</span><strong>Small steps. Brave journeys. Work that reaches its destination.</strong></div><span className="ribbon-symbol">॥ श्री राम ॥</span></div>
          <div className="page-heading">
            <div><div className="eyebrow"><Sparkles size={14} /> Tuesday, 29 September 2026</div><h1>{viewTitle}</h1><p>{viewSubtitle}</p></div>
            <button className="primary-button" onClick={() => setShowTaskModal(true)}><Plus size={18} /> Create task</button>
          </div>

          {activeView === "feed" && <>
            <section className="focus-banner">
              <div className="focus-icon"><Target size={22} /></div>
              <div><strong>Keep the October Launch moving.</strong><p>2 open actions came from yesterday’s meetings. You’re 68% through today’s focus.</p></div>
              <div className="focus-progress"><span>68%</span><div className="progress-track"><span style={{ width: "68%" }} /></div></div>
              <button className="banner-arrow" aria-label="Open focus details"><ArrowUpRight size={19} /></button>
            </section>

            <section className="hanuman-overview"><div className="hanuman-overview-mark">ॐ</div><div className="hanuman-overview-copy"><span className="eyebrow">HANUMAN tasks · long journeys</span><h2>Big responsibilities stay visible.</h2><p>Year-long workstreams remain in the feed with their own progress journal and growing subtask map.</p></div><div className="hanuman-mini-list">{tasks.filter(task => task.longRunning).map(task => <div key={task.id}><Avatar text={task.initials} name={task.assignee} tone="saffron" /><span><strong>{task.title}</strong><small>{task.progress}% · {task.updates?.length || 0} updates · Owner {task.assignee}</small></span></div>)}</div></section>

            <section className="notice-board"><div className="notice-board-head"><div><span className="eyebrow"><Megaphone size={14} /> Notice board</span><h2>Schedules, timetables & notices</h2><p>Coordinators, department heads, Directors, and the CEO can send text, image, audio, or video to selected candidates, a department, or everybody.</p></div><div className="notice-head-actions"><button className="outline-button" onClick={() => setShowNoticeBin(current => !current)}><Archive size={14} /> Notice bin ({noticeList.filter(notice => notice.binnedAt).length})</button><button className="primary-button" onClick={() => setShowNoticeModal(true)}><Send size={15} /> Send notice</button></div></div><div className="notice-list">{noticeList.filter(notice => !notice.binnedAt).slice(0, 3).map(notice => <article className="notice-card" key={notice.id}><div className="notice-card-icon"><Megaphone size={16} /></div><div className="notice-card-copy"><div className="notice-card-top"><strong>{notice.title}</strong><span>{notice.sentAt}</span></div><p>{notice.body || "Media notice attached."}</p><small>To: {notice.audience} · {notice.recipients.join(", ")} · Sent by {notice.sender} · Active for {notice.period || "No expiry"}</small><button className="notice-seen-button" onClick={() => acknowledgeNotice(notice.id)}><CheckCheck size={12} /> Seen by me</button>{notice.requiresReply && <><span className="reply-required-badge"><MessageCircleQuestion size={11} /> Reply requested · {Object.keys(notice.replies || {}).length}</span><div className="notice-reply-box"><input placeholder="Write a reply to the sender..." onKeyDown={event => { if (event.key === "Enter" && event.currentTarget.value.trim()) { submitNoticeReply(notice.id, event.currentTarget.value); event.currentTarget.value = ""; } }} /><button className="outline-button" onClick={() => setNotice("Press Enter to send your private reply.")}>Reply</button></div><small className="reply-privacy"><LockKeyhole size={10} /> Replies are visible only to the sender, Department Heads, Directors, and CEO.</small></>}{notice.media && <a href={notice.media.url} target="_blank" rel="noreferrer" className="notice-media"><span>{notice.media.type === "image" ? <ImageIcon size={13} /> : notice.media.type === "audio" ? <Mic size={13} /> : <Video size={13} />}</span>{notice.media.name}</a>}</div></article>)}</div>{showNoticeBin && <div className="notice-bin-panel"><div className="section-header"><div><span className="eyebrow"><Archive size={13} /> Notice bin</span><p>Expired notices stay here for 30 days before automatic permanent deletion.</p></div></div>{noticeList.filter(notice => notice.binnedAt).length === 0 ? <p className="empty-state">No expired notices in the bin.</p> : <div className="notice-bin-list">{noticeList.filter(notice => notice.binnedAt).map(notice => <div className="notice-bin-row" key={notice.id}><strong>{notice.title}</strong><span>Expired after {notice.period || "set period"} · Deleted automatically after 30 days</span></div>)}</div>}</div>}</section>

            <section className="feedback-board"><div className="feedback-board-head"><div><span className="eyebrow"><MessageCircleQuestion size={14} /> Feedback requests</span><h2>Ask, listen, improve.</h2><p>Department Heads, Directors, and the CEO can request a poll, open answer, or star rating from selected people.</p></div><button className="primary-button" onClick={() => setShowFeedbackModal(true)}><Plus size={15} /> Request feedback</button></div><div className="feedback-list">{feedbackRequests.map(request => <article className="feedback-card" key={request.id}><div className="feedback-card-top"><span className={`feedback-kind ${request.kind.toLowerCase().replace(" ", "-")}`}>{request.kind === "Poll" ? <BarChart3 size={12} /> : request.kind === "5-star rating" ? <Star size={12} /> : <MessageCircleQuestion size={12} />}{request.kind}</span><small>For {request.targets.join(", ")} {request.eventId ? `· Event: ${eventPlans.find(plan => plan.id === request.eventId)?.title || "Event"}` : ""} · {Object.keys(request.responses).length} response{Object.keys(request.responses).length === 1 ? "" : "s"}</small></div><h3>{request.title}</h3><p>{request.prompt}</p>{request.kind === "Poll" && <div className="feedback-options">{request.options?.map(option => <button key={option} className={request.responses.You === option ? "selected" : ""} onClick={() => respondFeedback(request.id, option)}>{option}</button>)}</div>}{request.kind === "5-star rating" && <div className="star-options">{[1, 2, 3, 4, 5].map(star => <button key={star} className={request.responses.You === String(star) ? "selected" : ""} onClick={() => respondFeedback(request.id, String(star))}><Star size={17} fill="currentColor" /></button>)}</div>}{request.kind === "Open question" && <div className="feedback-open"><input placeholder="Write your feedback..." onKeyDown={event => { if (event.key === "Enter" && event.currentTarget.value.trim()) { respondFeedback(request.id, event.currentTarget.value.trim()); event.currentTarget.value = ""; } }} /><button className="outline-button" onClick={() => setNotice("Press Enter to submit your answer.")}>Submit</button></div>}</article>)}</div></section>

            <section className="metric-grid">
              <div className="metric-card"><span className="metric-icon blue"><ListChecks size={18} /></span><div><span>My open work</span><strong>{tasks.filter(t => t.assignee === "You" && t.status !== "done").length + 2}</strong></div><small>2 due today</small></div>
              <div className="metric-card"><span className="metric-icon saffron"><Clock3 size={18} /></span><div><span>Team follow-ups</span><strong>8</strong></div><small>3 from MOM</small></div>
              <div className="metric-card"><span className="metric-icon mint"><CheckCircle2 size={18} /></span><div><span>Completed this week</span><strong>24</strong></div><small className="positive">+18% vs last week</small></div>
              <div className="metric-card"><span className="metric-icon coral"><AlertCircle size={18} /></span><div><span>Needs attention</span><strong>3</strong></div><small className="negative">1 overdue</small></div>
            </section>

            <div className="category-strip"><div className="category-strip-head"><div><span className="eyebrow"><ListTodo size={13} /> Task families</span><h2>See work in its natural category.</h2></div><span>{categoryFilter === "All categories" ? "All four categories" : `${categoryFilter} tasks`}</span></div><div className="category-tabs"><button className={categoryFilter === "All categories" ? "active" : ""} onClick={() => setCategoryFilter("All categories")}>All <small>{tasks.length}</small></button>{taskCategories.map(category => <button key={category} className={categoryFilter === category ? `active category-${category.toLowerCase()}` : `category-${category.toLowerCase()}`} onClick={() => setCategoryFilter(category)}><span>{category}</span><small>{tasks.filter(task => task.category === category).length}</small></button>)}</div></div>
            <div className="section-header"><div><h2>Work in motion</h2><p>Tasks across you, your team, and your department.</p></div><div className="filter-row"><div className="select-wrap"><Filter size={14} /><select value={departmentFilter} onChange={event => setDepartmentFilter(event.target.value)}><option>All departments</option>{departments.map(dept => <option key={dept.name}>{dept.name}</option>)}</select></div><div className="select-wrap"><select value={categoryFilter} onChange={event => setCategoryFilter(event.target.value as "All categories" | TaskCategory)}><option>All categories</option>{taskCategories.map(category => <option key={category}>{category}</option>)}</select><ChevronDown size={14} /></div><div className="select-wrap"><select value={statusFilter} onChange={event => setStatusFilter(event.target.value as "All work" | Status)}><option>All work</option><option value="todo">Not started</option><option value="progress">In progress</option><option value="blocked">Blocked</option><option value="done">Completed</option></select><ChevronDown size={14} /></div><div className="select-wrap"><select value={archiveFilter} onChange={event => setArchiveFilter(event.target.value as "Active tasks" | "Archived tasks")}><option>Active tasks</option><option>Archived tasks</option></select><Archive size={13} /></div></div></div>
            <div className="task-list">{visibleTasks.map(task => <TaskCard key={task.id} task={task} onComplete={completeTask} onAssistantToggle={toggleAssistant} onReopen={reopenTask} onEdit={editTask} onAttach={openAttachmentModal} onSubtaskToggle={toggleSubtask} onAddUpdate={addTaskUpdate} onAddSubtask={addTaskSubtask} onAcknowledge={acknowledgeTask} onArchive={archiveTask} />)}</div>
          </>}

          {activeView === "department" && <>
            <section className="department-hero"><div><span className="eyebrow">Academic · 18 people</span><h2>Academic department</h2><p>Everyone can see shared execution here. Private work remains private, while department heads retain full visibility.</p></div><div className="department-score"><strong>76%</strong><span>completion this week</span><div className="progress-track"><span style={{ width: "76%" }} /></div></div></section>
            <div className="section-header"><div><h2>Department work</h2><p>Open tasks and completion details from Academic.</p></div><div className="filter-row"><div className="select-wrap"><select value={departmentFilter} onChange={event => setDepartmentFilter(event.target.value)}><option>Academic</option><option>All departments</option>{departments.filter(d => d.name !== "Academic").map(dept => <option key={dept.name}>{dept.name}</option>)}</select><ChevronDown size={14} /></div></div></div>
            <div className="task-list">{tasks.filter(task => !task.archived && task.department === (departmentFilter === "All departments" ? "Academic" : departmentFilter)).map(task => <TaskCard key={task.id} task={task} onComplete={completeTask} onAssistantToggle={toggleAssistant} onReopen={reopenTask} onEdit={editTask} onAttach={openAttachmentModal} onSubtaskToggle={toggleSubtask} onAddUpdate={addTaskUpdate} onAddSubtask={addTaskSubtask} onAcknowledge={acknowledgeTask} onArchive={archiveTask} />)}</div>
          </>}

          {activeView === "momDirectory" && <>
            <section className="mom-directory-banner"><div className="mom-directory-icon"><NotebookPen size={25} /></div><div><span className="eyebrow">Permanent meeting record</span><h2>Write it once. Review it anytime.</h2><p>MOM content is locked after saving. Meeting heads, department heads, Directors, and the CEO can continue assigning follow-up tasks without changing the written record.</p></div><button className="primary-button" onClick={() => setShowMomModal(true)}><Plus size={17} /> Write new MOM</button></section>
            <div className="section-header"><div><h2>Department-wise MOMs</h2><p>Review attendance, roles, decisions, and tasks from previous meetings.</p></div><div className="select-wrap"><Filter size={14} /><select value={momDepartmentFilter} onChange={event => setMomDepartmentFilter(event.target.value)}><option>All departments</option>{departments.map(dept => <option key={dept.name}>{dept.name}</option>)}</select></div></div>
            <div className="mom-directory-list">{momList.filter(mom => momDepartmentFilter === "All departments" || mom.department === momDepartmentFilter).map(mom => <article className="mom-record" key={mom.id}><div className="mom-record-head"><div><span className={`dept-bullet ${mom.department.toLowerCase()}`} /><span className="mom-record-department">{mom.department}</span><h3>{mom.title}</h3><small><CalendarDays size={12} /> {mom.date}{mom.nextMeeting ? ` · Next meeting ${mom.nextMeeting}` : " · Next meeting not scheduled"}</small></div><span className="locked-pill"><LockKeyhole size={12} /> Locked</span></div><div className="mom-record-grid"><div className="mom-record-copy"><span className="record-label">MOM / written record</span><p>{mom.content}</p><div className="mom-role-row"><span><Avatar text={initials(mom.meetingHead)} name={mom.meetingHead} tone="saffron" /><small>Meeting head<strong>{mom.meetingHead}</strong></small></span><span><Avatar text={initials(mom.secretary)} name={mom.secretary} tone="mint" /><small>Meeting secretary<strong>{mom.secretary}</strong></small></span></div></div><div className="mom-record-attendance"><span className="record-label">Attendance · {mom.attendance.length} present</span><div className="attendance-avatars">{mom.attendance.map(name => <span key={name} title={name}><Avatar text={initials(name)} name={name} tone="indigo" /></span>)}</div><p>{mom.attendance.join(", ")}</p>{mom.absent?.length ? <p className="absent-line">Absent · {mom.absent.join(", ")}</p> : null}</div></div><div className="mom-record-footer"><div><span className="record-label">MOM action item</span><strong>{mom.actionItem || "No task assigned"}</strong><small>Current assignee · {mom.taskAssignee}</small></div><button className="outline-button" onClick={() => assignMomTask(mom)}><ClipboardCheck size={15} /> Assign / add task</button></div></article>)}</div>
          </>}

          {activeView === "dashboard" && <>
            <section className="leadership-banner"><div className="leadership-mark"><ShieldCheck size={22} /></div><div><span className="eyebrow">Leadership control room · cross-department visibility</span><h2>{leadershipRole} lens across JAMBAVAN</h2><p>Aggregated completion, open work, department heads, and people needing attention in one view.</p></div><div className="role-switch"><button className={leadershipRole === "CEO" ? "active" : ""} onClick={() => setLeadershipRole("CEO")}>CEO</button><button className={leadershipRole === "Director" ? "active" : ""} onClick={() => setLeadershipRole("Director")}>Director</button></div></section>
            <section className="dashboard-summary"><div><span>Institute completion</span><strong>69%</strong><p>Across all departments this week</p><div className="leadership-avatars">{departments.map(dept => <span key={dept.name} title={`${dept.lead} · ${dept.name}`}><Avatar text={initials(dept.lead)} name={dept.lead} tone={dept.color} /></span>)}</div><small>Department heads reporting into this view</small></div><div className="summary-bars"><div><span>Academic</span><i><b style={{ width: "76%" }} /></i><strong>76%</strong></div><div><span>Admissions</span><i><b style={{ width: "64%" }} /></i><strong>64%</strong></div><div><span>Operations</span><i><b style={{ width: "52%" }} /></i><strong>52%</strong></div><div><span>Marketing</span><i><b style={{ width: "83%" }} /></i><strong>83%</strong></div></div></section>
            <div className="section-header"><div><h2>Department pulse</h2><p>Completion, open work, and department head.</p></div><div className="report-actions"><button className="outline-button" onClick={exportLeadershipAnalytics}><FileText size={14} /> Export leadership PDF</button><button className="outline-button"><Filter size={15} /> This week</button></div></div>
            <div className="department-table">{departments.map(dept => <div className="department-row" key={dept.name}><span className={`dept-bullet ${dept.color}`} /><div className="dept-name"><strong>{dept.name}</strong><span>{dept.people} people</span></div><div className="dept-progress"><div className="progress-track"><span style={{ width: `${dept.done}%` }} /></div><strong>{dept.done}%</strong></div><span className="open-count">{dept.open} open</span><span className="dept-lead"><Avatar text={initials(dept.lead)} name={dept.lead} tone={dept.color} />{dept.lead}</span><ArrowUpRight size={16} /></div>)}</div>
            <section className="attention-grid"><div className="attention-card"><div className="attention-card-head"><div><span className="eyebrow"><Bell size={13} /> Deadline watch</span><h3>Owners and assistants needing a nudge</h3></div><strong>{deadlineReminders.length}</strong></div>{deadlineReminders.slice(0, 4).map(reminder => <div className="attention-row" key={reminder.id}><Avatar text={reminder.task.initials} name={reminder.task.assignee} tone={reminder.task.department.toLowerCase()} /><div><strong>{reminder.task.title}</strong><span>{reminder.task.department} · {reminder.task.assignee} + {reminder.task.assistants.length} assistant{reminder.task.assistants.length === 1 ? "" : "s"}</span></div><em className={reminder.urgency}>{reminder.task.due}</em></div>)}</div><div className="attention-card people-attention"><div className="attention-card-head"><div><span className="eyebrow"><Users size={13} /> Photo indicators</span><h3>Leadership coverage</h3></div><strong>4/4</strong></div><p>Every department head is represented with a profile photo so leadership can scan ownership at a glance.</p><div className="coverage-list">{departments.map(dept => <span key={dept.name}><Avatar text={initials(dept.lead)} name={dept.lead} tone={dept.color} /><small>{dept.name}</small></span>)}</div></div></section>
            <section className="ack-dashboard"><div className="ack-dashboard-head"><div><span className="eyebrow"><CheckCheck size={13} /> Acknowledgment dashboard</span><h3>Who has seen and acknowledged open work?</h3><p>Leadership can track confirmation across departments without opening every task.</p></div><div className="ack-metrics"><span><strong>{acknowledgementSummary.pending}</strong> pending</span><span><strong>{acknowledgementSummary.seen}</strong> seen</span><span><strong>{acknowledgementSummary.acknowledged}</strong> acknowledged</span></div></div><div className="ack-department-grid">{acknowledgementSummary.byDepartment.map(department => <div className="ack-department-card" key={department.name}><div><Avatar text={initials(department.lead)} name={department.lead} tone={department.color} /><span><strong>{department.name}</strong><small>{department.tasks} open task{department.tasks === 1 ? "" : "s"}</small></span></div><div className="ack-bar"><i style={{ width: `${department.tasks ? Math.min(100, (department.acknowledgements / department.tasks) * 100) : 0}%` }} /></div><small>{department.seen} seen · {department.acknowledgements} acknowledged</small></div>)}</div><div className="ack-task-list">{acknowledgementSummary.openTasks.slice(0, 5).map(task => <div className="ack-task-row" key={task.id}><Avatar text={task.initials} name={task.assignee} tone={task.department.toLowerCase()} /><div><strong>{task.title}</strong><span>{task.department} · Owner {task.assignee}</span></div><span>{task.seenBy?.length || 0} seen</span><span className={(task.acknowledgedBy?.length || 0) ? "ack-ok" : "ack-pending"}>{task.acknowledgedBy?.length || 0} acknowledged</span></div>)}</div></section>
<section className="analytics-grid"><TrendChart title="Completion rate over time" subtitle="Institute completion trend across the recent execution cycle." labels={auditTrend.labels} series={[{ name: "Completion %", values: auditTrend.completion }]} colors={["#d58a42"]} /><TrendChart title="Department completion snapshot" subtitle="Current completion rate by department, with photo-led ownership elsewhere in the dashboard." labels={completionByDepartment.map(item => item.name.slice(0, 3))} series={[{ name: "Done %", values: completionByDepartment.map(item => item.value) }]} colors={["#4b76a8"]} /></section>
                        <section className="reward-planner-grid"><article className="reward-card"><div className="reward-card-top"><div className="reward-icon"><Trophy size={21} /></div><span className="eyebrow">Encouragement, not competition</span></div><h3>Arjun’s progress this cycle</h3><div className="reward-score"><strong>{rewardSummary.points}</strong><span>points</span><b className={`reward-tier ${rewardSummary.tier.toLowerCase()}`}><Medal size={14} /> {rewardSummary.tier}</b></div><p>On-time completion earns recognition. Missed tasks are a reminder to ask for help, not a public penalty.</p><div className="reward-stats"><span><strong>+10</strong> completed on time</span><span><strong>{rewardSummary.completed}</strong> tasks completed</span><span><strong>{rewardSummary.missed}</strong> overdue to recover</span></div></article><article className="planner-card"><div className="planner-head"><div><span className="eyebrow"><CalendarRange size={13} /> Task planner</span><h3>Assigned work at a glance</h3></div><div className="planner-switch">{(["day", "week", "month"] as const).map(range => <button key={range} className={plannerRange === range ? "active" : ""} onClick={() => setPlannerRange(range)}>{range}</button>)}</div></div><div className={`planner-grid ${plannerRange}`}>{plannerTasks.map(day => <div className="planner-day" key={day.slot}><strong>{day.slot}</strong><span>{day.tasks.length} task{day.tasks.length === 1 ? "" : "s"}</span>{day.tasks.slice(0, 3).map(task => <div className={`planner-task ${task.status}`} key={task.id}><i />{task.title}</div>)}</div>)}</div></article></section>
          </>}

          {activeView === "guide" && <section className="guide-view"><section className="guide-hero"><div className="guide-hero-mark"><BookOpenCheck size={28} /></div><div><span className="eyebrow">Simple execution · coaching institute edition</span><h2>JAMBAVAN is a field guide, not a maze.</h2><p>Use the task family that matches the size of the responsibility, then let the Event Planner turn a real institute program into a reusable execution playbook.</p></div></section><section className="guide-section"><div className="section-header"><div><span className="eyebrow"><Target size={13} /> Task families</span><h2>Choose the right level of work.</h2><p>Every person can filter their feed by these categories. The category tells the team how much coordination and endurance the work needs.</p></div></div><div className="guide-task-grid"><article className="guide-task-card squirrel"><span className="guide-token">S</span><div><h3>Squirrel tasks</h3><p><strong>Small, focused contributions.</strong> One person, short horizon, clear finish line.</p><ul><li>Best for quick follow-ups and simple actions</li><li>Usually one owner and no assistants</li><li>Example: confirm a batch-room booking</li></ul></div></article><article className="guide-task-card angad"><span className="guide-token">A</span><div><h3>Angad tasks</h3><p><strong>One-person deliverables with weight.</strong> Bigger than a quick action, but still owned by one person.</p><ul><li>Use for decks, reports, calls, and planned deliverables</li><li>One owner can add optional subtasks</li><li>Example: prepare the parent orientation deck</li></ul></div></article><article className="guide-task-card sugriv"><span className="guide-token">Su</span><div><h3>Sugriv tasks</h3><p><strong>Coordinated team responsibilities.</strong> Multiple people contribute and everyone sees the shared progress.</p><ul><li>Assign an owner plus multiple assistants</li><li>Add a separate responsibility note for each person</li><li>Only the owner marks the parent task complete</li></ul></div></article><article className="guide-task-card hanuman"><span className="guide-token">H</span><div><h3>HANUMAN tasks</h3><p><strong>Long journeys and major responsibilities.</strong> Work that may run for months or a full year.</p><ul><li>Keep progress updates and a growing subtask map</li><li>Use for strategic programs and institutional missions</li><li>Visible in the dedicated long-running workstream area</li></ul></div></article></div></section><section className="guide-section guide-workflow"><div className="guide-workflow-copy"><span className="eyebrow"><CalendarDays size={13} /> Event Planner workflow</span><h2>Turn a program into a repeatable playbook.</h2><p>Use this for parent orientations, admission drives, test series, faculty programs, and any event involving more than one department.</p><div className="guide-steps"><div><b>1</b><span><strong>Choose departments</strong><small>Select every department involved, even when the event belongs to one department.</small></span></div><div><b>2</b><span><strong>Add roles and in-charges</strong><small>Record event head, coordinators, venue lead, or any other named responsibility.</small></span></div><div><b>3</b><span><strong>Add task rows</strong><small>Each row gets a department, employee, category, and responsibility note.</small></span></div><div><b>4</b><span><strong>Save and reuse</strong><small>Create the event and tasks now, or save the whole plan as a template for the next cycle.</small></span></div></div><button className="primary-button" onClick={() => setActiveView("eventPlanner")}><CalendarDays size={15} /> Open Event Planner</button></div><div className="guide-playbook"><div className="playbook-top"><span className="event-plan-badge">Example playbook</span><span>4 departments</span></div><h3>Parent Orientation 2026</h3><p>One event · four department feeds · named roles · accountable task rows</p><div className="playbook-row"><Avatar text="AM" name="Arjun Mehta" tone="saffron" /><span><strong>Event head</strong><small>Arjun Mehta · Academic</small></span></div><div className="playbook-row"><Avatar text="NK" name="Neha Kapoor" tone="mint" /><span><strong>Admissions in-charge</strong><small>Neha Kapoor · Admissions</small></span></div><div className="playbook-row"><Avatar text="RS" name="Ritesh Shah" tone="blue" /><span><strong>Venue & logistics</strong><small>Ritesh Shah · Operations</small></span></div><div className="playbook-row"><Avatar text="SI" name="Sana Iyer" tone="coral" /><span><strong>Communications</strong><small>Sana Iyer · Marketing</small></span></div></div></section><section className="guide-section guide-rules"><div><span className="eyebrow"><ShieldCheck size={13} /> Accountability rules</span><h2>Simple permissions, visible responsibility.</h2></div><div className="guide-rule-grid"><span><CheckCircle2 size={15} /> Owner marks the parent task complete</span><span><CheckCircle2 size={15} /> Assistants report their own part</span><span><CheckCircle2 size={15} /> Managers can edit or reassign department work</span><span><CheckCircle2 size={15} /> Directors and CEO can see across departments</span><span><CheckCircle2 size={15} /> Every sensitive action keeps actor and time</span><span><CheckCircle2 size={15} /> Templates preserve roles, categories, and notes</span></div></section></section>}
          {activeView === "eventPlanner" && <section className="event-planner-view"><div className="event-planner-hero"><div className="event-planner-icon"><CalendarDays size={25} /></div><div><span className="eyebrow">Plan · assign · reuse</span><h2>Turn an event into an execution playbook.</h2><p>Choose departments, add task rows, assign owners, and save the whole plan as a reusable template.</p></div><button className="primary-button" onClick={() => openEventPlanner()}><Plus size={16} /> Plan an event</button></div><div className="section-header"><div><h2>Events and templates</h2><p>Every event keeps its departments, task owners, categories, and responsibility notes together.</p></div><div className="report-actions"><button className="outline-button" onClick={exportEventAnalytics}><Download size={14} /> Event CSV</button><button className="outline-button" onClick={exportEventPdf}><FileText size={14} /> Event PDF</button><span className="event-count">{eventPlans.length} plans · {eventPlans.filter(plan => plan.isTemplate).length} templates</span></div></div><div className="event-plan-grid">{eventPlans.map(plan => <article className={`event-plan-card ${plan.isTemplate ? "is-template" : ""}`} key={plan.id}><div className="event-plan-top"><span className="event-plan-badge">{plan.isTemplate ? "Template" : "Event plan"}</span><small>{plan.date}</small></div><h3>{plan.title}</h3><p>{plan.description}</p><div className="event-departments">{plan.departments.map(department => <span key={department}>{department}</span>)}</div><div className="event-role-summary"><strong>Roles and in-charges</strong>{(plan.roles || []).map(role => <span key={role.id}><b>{role.role}</b> · {role.inCharge} <em>{role.department}</em></span>)}</div><div className="event-task-summary"><strong>{plan.tasks.length} task{plan.tasks.length === 1 ? "" : "s"}</strong><span>{plan.tasks.slice(0, 3).map(task => task.title).join(" · ") || "No tasks added yet"}</span></div><div className="event-plan-actions"><button className="outline-button" onClick={() => openEventPlanner(plan)}>{plan.isTemplate ? "Use template" : "Reuse plan"}</button><button className="text-button" onClick={() => openEventPlanner(plan)}><RotateCcw size={13} /> Edit plan</button></div></article>)}</div></section>}
          {activeView === "calendar" && <section className="calendar-view"><div className="calendar-permission-banner"><div className="calendar-permission-icon"><CalendarRange size={24} /></div><div><span className="eyebrow">Restricted calendar controls</span><h2>Only CEO, Directors, or their assigned manager can edit this calendar.</h2><p>{calendarManagerLabel} · Changes are recorded in the audit trail. Everybody only sees events included in their selected visibility.</p></div><button className="primary-button" onClick={() => setShowCalendarModal(true)}><Plus size={15} /> Add calendar event</button></div><div className="calendar-legend">{calendarTypeOptions.map(type => <span key={type} className={`calendar-legend-item type-${type.toLowerCase().replace(" ", "-")}`}><i />{type}</span>)}</div><div className="year-calendar">{calendarMonths.map((month, index) => <article className="month-card" key={month}><div className="month-card-head"><h3>{month}</h3><span>2026</span></div><div className="month-events">{calendarEvents.filter(event => event.month === index).map(event => <div className={`calendar-event type-${event.type.toLowerCase().replace(" ", "-")}`} key={event.id}><div className="calendar-event-date">{event.date.split(" ")[0]}</div><div><strong>{event.title}</strong><small>{event.type} · {event.visibility.includes("Everyone") ? "Everyone" : event.visibility.join(", ")}</small></div></div>)}{calendarEvents.every(event => event.month !== index) && <span className="empty-month">No events added</span>}</div></article>)}</div></section>}

          {activeView === "projects" && <><div className="section-header"><div><h2>What must not get lost</h2><p>Projects and major responsibilities stay above the daily noise.</p></div><button className="outline-button"><Plus size={16} /> New project</button></div><div className="project-grid">{projects.map(project => <article className="project-card" key={project.name}><div className="project-card-head"><span className={`project-dot ${project.color}`} /><span>{project.label}</span><MoreHorizontal size={17} /></div><h3>{project.name}</h3><div className="project-progress"><div className="progress-track"><span style={{ width: `${project.progress}%` }} /></div><strong>{project.progress}%</strong></div><div className="project-footer"><span>{project.tasks}</span><span>{project.due}</span></div><button className="text-button">Open project <ArrowUpRight size={15} /></button></article>)}</div></>}

          {activeView === "roleMatrix" && canManageEmployeeAccess && <section className="access-matrix-view"><section className="access-matrix-hero"><div className="access-matrix-mark"><ShieldCheck size={25} /></div><div><span className="eyebrow">Restricted leadership control</span><h2>Who can see and do what?</h2><p>Only Directors and the CEO can change this matrix. Changes are recorded in the audit trail and apply across the institute workspace.</p></div><span className="matrix-role-pill">Editing as {leadershipRole}</span></section><div className="access-matrix-card"><div className="section-header"><div><h2>Permission matrix</h2><p>Toggle permissions for each role. Department and personal visibility rules still apply.</p></div><span className="audit-lock"><LockKeyhole size={13} /> Leadership only</span></div><div className="access-matrix-scroll"><div className="access-matrix-grid"><div className="matrix-corner">Permission</div>{accessRoleList.map(role => <div className="matrix-role" key={role}>{role}</div>)}{accessPermissionList.map(permission => <><div className="matrix-permission" key={`${permission}-label`}><strong>{permission}</strong><small>{permission === "View private tasks" ? "Personal and confidential work" : permission === "Export reports" ? "Download institute summaries" : "Workspace capability"}</small></div>{accessRoleList.map(role => <label className={`matrix-toggle ${accessMatrix[role][permission] ? "enabled" : ""}`} key={`${role}-${permission}`}><input type="checkbox" checked={accessMatrix[role][permission]} onChange={() => toggleAccessPermission(role, permission)} /><span>{accessMatrix[role][permission] ? "Allowed" : "Restricted"}</span></label>)}</>)}</div></div></div><div className="access-matrix-footer"><ShieldCheck size={16} /><span><strong>Guardrail</strong><small>CEO and Directors retain full visibility. This matrix controls role defaults; a specific assignment or higher hierarchy can still grant additional visibility where your policy allows.</small></span></div></section>}
          {activeView === "auditLog" && canManageEmployeeAccess && <section className="audit-log-view"><section className="audit-log-hero"><div className="access-matrix-mark"><Clock3 size={25} /></div><div><span className="eyebrow">Director / CEO oversight</span><h2>A complete history of sensitive actions.</h2><p>Search permission changes, employee access events, task deletions, notice expiry, profile updates, calendar edits, and other leadership-sensitive activity.</p></div><span className="matrix-role-pill">{activity.length} records</span></section><div className="audit-summary-grid"><article><span>All records</span><strong>{activity.length}</strong><small>Actor and timestamp retained</small></article><article><span>Permission changes</span><strong>{activity.filter(entry => entry.action.includes("Access matrix")).length}</strong><small>Role defaults changed</small></article><article><span>Sensitive actions</span><strong>{activity.filter(entry => sensitiveAuditActions.includes(entry.action)).length}</strong><small>Leadership review queue</small></article><article><span>Daily digest</span><strong>{pendingAcknowledgementCount + expiringNoticeCount}</strong><small>{pendingAcknowledgementCount} acknowledgments · {expiringNoticeCount} expiring notices</small></article></div><TrendChart title="Sensitive actions and completion rate" subtitle="The leadership view pairs sensitive-action volume with task completion progress over time." labels={auditTrend.labels} series={[{ name: "Sensitive actions", values: auditTrend.sensitive }, { name: "Completion %", values: auditTrend.completion }]} colors={["#c44d5f", "#d58a42"]} /><div className="audit-log-card"><div className="section-header"><div><h2>Activity ledger</h2><p>Every entry includes who acted, what changed, when it happened, and supporting context.</p></div><div className="report-actions"><button className="outline-button" onClick={() => downloadCsv("jambavan-audit-log.csv", [["Action", "Subject", "Actor", "Timestamp", "Detail"], ...visibleAuditEntries.map(entry => [entry.action, entry.subject, entry.actor, entry.at, entry.detail || ""])])}><Download size={14} /> Export audit CSV</button></div></div><div className="audit-log-filters"><input value={auditSearch} onChange={event => setAuditSearch(event.target.value)} placeholder="Search actor, action, subject..." /><select value={auditFilter} onChange={event => setAuditFilter(event.target.value as typeof auditFilter)}><option>All actions</option><option>Permission changes</option><option>Sensitive actions</option></select></div><div className="audit-ledger">{visibleAuditEntries.length === 0 ? <p className="empty-state">No audit records match these filters.</p> : visibleAuditEntries.map(entry => <article className={`audit-ledger-row ${sensitiveAuditActions.includes(entry.action) ? "is-sensitive" : ""}`} key={entry.id}><div className="audit-ledger-icon"><Clock3 size={14} /></div><div className="audit-ledger-main"><strong>{entry.action}</strong><span>{entry.subject}</span><small>{entry.detail || "No additional context"}</small></div><div className="audit-ledger-actor"><Avatar text={initials(entry.actor)} name={entry.actor} tone="saffron" /><span><strong>{entry.actor}</strong><small>{entry.at}</small></span></div></article>)}</div></div><div className="daily-digest-card"><div><span className="eyebrow"><Bell size={13} /> Daily notification digest</span><h3>Pending acknowledgments and expiring notices</h3><p>The digest is ready to send each day. Email delivery needs an enabled Resend or Elastic Email connector; until then, the same digest appears in the in-app notification center.</p></div><div className="daily-digest-metrics"><strong>{pendingAcknowledgementCount}</strong><span>pending acknowledgments</span><strong>{expiringNoticeCount}</strong><span>expiring notices</span></div><span className="connector-pending">Email connector required</span></div></section>}
          {activeView === "myProfile" && <section className="self-profile-page"><div className="self-profile-hero"><div><span className="eyebrow"><UserRound size={14} /> Self-service profile</span><h2>Your work identity, kept current.</h2><p>Update the details your colleagues use to coordinate with you. Changes are recorded with your name and time.</p></div><button className="primary-button" onClick={openMyProfile}><UserRound size={15} /> Edit my profile</button></div><div className="self-profile-grid"><article className="self-profile-card identity"><Avatar text={initials(profileDraft.name)} name={profileDraft.name} photoOverride={profileDraft.photo} tone="indigo" /><h3>{profileDraft.name}</h3><p>{profileDraft.position} · {profileDraft.department}</p><span className="profile-status status-active">{profileDraft.access}</span><small>Profile photograph is compulsory and visible across JAMBAVAN.</small></article><article className="self-profile-card"><span className="eyebrow">Today</span><h3>Attendance today</h3><strong className="profile-big-status">{profileDraft.attendanceStatus || "Present"}</strong><p>{profileDraft.statusNote || "No leave or health note added."}</p><button className="outline-button" onClick={openMyProfile}>Update attendance and availability</button></article><article className="self-profile-card"><span className="eyebrow">Work schedule</span><h3>Working pattern</h3><div className="self-profile-facts"><span><b>In time</b>{profileDraft.inTime}</span><span><b>Out time</b>{profileDraft.outTime}</span><span><b>Weekly off</b>{profileDraft.weeklyOff}</span><span><b>Joined</b>{profileDraft.joiningYear}</span></div></article></div><div className="self-profile-note"><ShieldCheck size={16} /><span><strong>Visible to the team</strong><small>Your name, photograph, position, contact number, working hours, weekly off, attendance status, and leave note are visible in the employee directory.</small></span></div></section>}
          {activeView === "people" && <><section className="people-banner"><div className="people-illustration"><Users size={27} /></div><div><span className="eyebrow">CEO → Directors → Department Heads → Members</span><h2>One team, many responsibilities.</h2><p>CEO and Directors can see all departments, personal notes, and private tasks. Employees who belong to multiple departments keep separate department feeds. Every member profile requires a photo before activation.</p></div><button className="outline-button" disabled={!canManageEmployeeAccess} onClick={() => setShowAccessModal(true)}><UserPlus size={15} /> Manage access <ArrowUpRight size={15} /></button></section><section className="profile-directory"><div className="section-header"><div><span className="eyebrow"><UserRound size={14} /> Employee profiles</span><h2>Know the people behind the work.</h2><p>Every employee profile includes a photograph, contact number, joining year, position, working hours, weekly off, and availability status.</p></div><div className="report-actions"><button className="outline-button" onClick={exportAttendanceSummary}><Download size={14} /> Attendance CSV</button><button className="outline-button" onClick={exportAttendancePdf}><FileText size={14} /> Attendance PDF</button><button className="primary-button" onClick={openMyProfile}><UserRound size={15} /> Manage my profile</button></div></div><div className="profile-grid">{profiles.map(profile => <article className="profile-card" key={profile.name}><div className="profile-card-head"><Avatar text={initials(profile.name)} name={profile.name} photoOverride={profile.photo} tone={profile.department.toLowerCase()} /><div><h3>{profile.name}</h3><span>{profile.position} · {profile.department}</span></div><span className={`profile-status status-${profile.access.toLowerCase()} ${profile.access === "Suspended" ? "status-suspended" : `status-${profile.status.toLowerCase().replace(" ", "-")}`}`}>{profile.access === "Suspended" ? "Suspended" : profile.status}</span></div><div className="profile-details"><span><Phone size={12} /> {profile.number}</span><span>Joined {profile.joiningYear}</span><span>{profile.inTime} – {profile.outTime}</span><span>Weekly off: {profile.weeklyOff}</span><span>Attendance: {profile.attendanceStatus || "Present"}</span></div>{profile.statusNote && <div className="profile-note">{profile.statusNote}</div>}{profile.access === "Suspended" && <div className="profile-note suspended-note"><Ban size={11} /> Suspended: future institute changes are paused.</div>}<div className="profile-admin-actions">{canManageEmployeeAccess && <><button className="text-button" onClick={() => toggleEmployeeSuspension(profile.name)}>{profile.access === "Suspended" ? <><UserRound size={12} /> Reinstate</> : <><Ban size={12} /> Suspend</>}</button><button className="text-button danger-text" onClick={() => removeEmployee(profile.name)}><Trash2 size={12} /> Remove</button></>} </div></article>)}</div></section><div className="people-grid">{departments.map(dept => <article className="people-card" key={dept.name}><div className="people-card-top"><span className={`dept-bullet ${dept.color}`} /><span>{dept.people} people</span></div><h3>{dept.name}</h3><div className="people-lead"><Avatar text={initials(dept.lead)} name={dept.lead} tone={dept.color} /><div><strong>{dept.lead}</strong><span>Department head / manager</span></div></div><div className="people-card-foot"><span>{dept.open} open tasks</span><span>{dept.done}% done</span></div></article>)}</div><section className="audit-panel"><div className="section-header"><div><h2>Audit trail</h2><p>Every task, post, MOM, attachment, deletion, and update keeps the actor and timestamp.</p></div><span className="audit-lock"><ShieldCheck size={14} /> Leadership record</span></div><div className="audit-list">{activity.slice(0, 8).map(entry => <div className="audit-row" key={entry.id}><div className="audit-icon"><Clock3 size={14} /></div><div><strong>{entry.action}</strong><span>{entry.subject}{entry.detail ? ` · ${entry.detail}` : ""}</span></div><div className="audit-actor"><Avatar text={initials(entry.actor)} name={entry.actor} tone="saffron" /><span><strong>{entry.actor}</strong><small>{entry.at}</small></span></div></div>)}</div></section></>}
        </div>
        <footer className="app-footer"><span><span className="footer-dot" /> All systems clear</span><span>JAMBAVAN workspace · Simple execution for coaching teams</span></footer>
      </main>

      {notice && <div className="toast"><CheckCircle2 size={16} /><span>{notice}</span><button onClick={() => setNotice("")}><X size={14} /></button></div>}

      {showAccessModal && <div className="modal-backdrop" onClick={() => setShowAccessModal(false)}><div className="task-modal profile-modal" onClick={event => event.stopPropagation()}><div className="modal-head"><div><span className="eyebrow"><ShieldCheck size={14} /> Protected employee access</span><h2>Add employee</h2><p>Only Directors and the CEO can add, suspend, reinstate, or remove employees.</p></div><button className="icon-button" onClick={() => setShowAccessModal(false)}><X size={18} /></button></div><div className="form-grid"><label>Full name<input autoFocus value={newEmployee.name} onChange={event => setNewEmployee({ ...newEmployee, name: event.target.value })} /></label><label>Contact number<input value={newEmployee.number} onChange={event => setNewEmployee({ ...newEmployee, number: event.target.value })} /></label><label>Year of joining<input value={newEmployee.joiningYear} onChange={event => setNewEmployee({ ...newEmployee, joiningYear: event.target.value })} /></label><label>Position<input value={newEmployee.position} onChange={event => setNewEmployee({ ...newEmployee, position: event.target.value })} /></label><label>Department<select value={newEmployee.department} onChange={event => setNewEmployee({ ...newEmployee, department: event.target.value })}>{departments.map(dept => <option key={dept.name}>{dept.name}</option>)}</select></label><label>Weekly off<select value={newEmployee.weeklyOff} onChange={event => setNewEmployee({ ...newEmployee, weeklyOff: event.target.value })}><option>Sunday</option><option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option><option>Saturday</option></select></label></div><label className="notice-upload"><Upload size={18} /><span><strong>{newEmployeePhoto ? "Profile photograph selected" : "Profile photograph required"}</strong><small>Required before activation · JPG, PNG, WEBP</small></span><input type="file" accept="image/*" onChange={event => { const file = event.target.files?.[0]; if (file) setNewEmployeePhoto(URL.createObjectURL(file)); }} /></label><div className="manager-rule"><ShieldCheck size={15} /><span><strong>Access rule</strong><small>Remove permanently revokes institute access and removes profile data. Suspension keeps the profile but pauses future institute changes.</small></span></div><div className="modal-actions"><button className="outline-button" onClick={() => setShowAccessModal(false)}>Cancel</button><button className="primary-button" onClick={addEmployee}><UserPlus size={15} /> Add employee</button></div></div></div>}

      {showProfileModal && <div className="modal-backdrop" onClick={() => setShowProfileModal(false)}><div className="task-modal profile-modal" onClick={event => event.stopPropagation()}><div className="modal-head"><div><span className="eyebrow"><UserRound size={14} /> My employee profile</span><h2>Manage my profile</h2><p>Keep your contact, work schedule, availability, and daily attendance current for the whole team.</p></div><button className="icon-button" onClick={() => setShowProfileModal(false)}><X size={18} /></button></div><div className="profile-edit-identity"><Avatar text={initials(profileDraft.name)} name={profileDraft.name} tone="indigo" /><div><strong>{profileDraft.name}</strong><span>{profileDraft.position} · {profileDraft.department}</span><small>Profile photograph is compulsory and already on file.</small></div></div><div className="form-grid"><label>Contact number<input value={profileDraft.number} onChange={event => setProfileDraft({ ...profileDraft, number: event.target.value })} /></label><label>Year of joining<input value={profileDraft.joiningYear} onChange={event => setProfileDraft({ ...profileDraft, joiningYear: event.target.value })} /></label><label>In time<input value={profileDraft.inTime} onChange={event => setProfileDraft({ ...profileDraft, inTime: event.target.value })} /></label><label>Out time<input value={profileDraft.outTime} onChange={event => setProfileDraft({ ...profileDraft, outTime: event.target.value })} /></label><label>Weekly off<select value={profileDraft.weeklyOff} onChange={event => setProfileDraft({ ...profileDraft, weeklyOff: event.target.value })}><option>Sunday</option><option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option><option>Saturday</option></select></label><label>Availability<select value={profileDraft.status} onChange={event => setProfileDraft({ ...profileDraft, status: event.target.value as EmployeeProfile["status"] })}><option>Available</option><option>On leave</option><option>Sick</option></select></label><label>Attendance today<select value={profileDraft.attendanceStatus || "Present"} onChange={event => setProfileDraft({ ...profileDraft, attendanceStatus: event.target.value as EmployeeProfile["attendanceStatus"] })}><option>Present</option><option>Late</option><option>Absent</option><option>On leave</option></select></label><label className="wide-field">Availability note<input value={profileDraft.statusNote || ""} onChange={event => setProfileDraft({ ...profileDraft, statusNote: event.target.value })} placeholder="e.g. Back on 08 Oct" /></label></div><div className="modal-actions"><button className="outline-button" onClick={() => setShowProfileModal(false)}>Cancel</button><button className="primary-button" onClick={saveMyProfile}><Save size={15} /> Save profile</button></div></div></div>}

      {showFeedbackModal && <div className="modal-backdrop" onClick={() => setShowFeedbackModal(false)}><div className="task-modal feedback-modal" onClick={event => event.stopPropagation()}><div className="modal-head"><div><span className="eyebrow"><MessageCircleQuestion size={14} /> Feedback request</span><h2>Ask for feedback</h2><p>Choose a response format and select who should receive it.</p></div><button className="icon-button" onClick={() => setShowFeedbackModal(false)}><X size={18} /></button></div><div className="form-grid"><label>Request title<input autoFocus value={feedbackDraft.title} onChange={event => setFeedbackDraft({ ...feedbackDraft, title: event.target.value })} placeholder="e.g. Faculty room arrangement" /></label><label>Event<select value={feedbackDraft.eventId} onChange={event => setFeedbackDraft({ ...feedbackDraft, eventId: Number(event.target.value) })}>{eventPlans.filter(plan => !plan.isTemplate).map(plan => <option key={plan.id} value={plan.id}>{plan.title}</option>)}</select></label><label>Response type<select value={feedbackDraft.kind} onChange={event => setFeedbackDraft({ ...feedbackDraft, kind: event.target.value as FeedbackKind })}><option>Poll</option><option>Open question</option><option>5-star rating</option></select></label></div><label>Question<input value={feedbackDraft.prompt} onChange={event => setFeedbackDraft({ ...feedbackDraft, prompt: event.target.value })} placeholder="What would you like people to answer?" /></label>{feedbackDraft.kind === "Poll" && <div className="feedback-option-editor"><div className="assistant-picker-head"><span><BarChart3 size={14} /> Poll choices</span><button className="text-button" onClick={() => setFeedbackDraft(current => ({ ...current, options: [...current.options, `Option ${current.options.length + 1}`] }))}><Plus size={13} /> Add choice</button></div>{feedbackDraft.options.map((option, index) => <input key={index} value={option} onChange={event => setFeedbackDraft(current => ({ ...current, options: current.options.map((item, itemIndex) => itemIndex === index ? event.target.value : item) }))} />)}</div>}<div className="feedback-recipient-picker"><div className="assistant-picker-head"><span><Users size={15} /> Select recipients</span><small>{feedbackDraft.targets.length} selected</small></div><div className="notice-target-grid">{["Directors", "Department heads", "Candidates", "Academic", "Admissions", "Operations", "Marketing"].map(target => <label key={target}><input type="checkbox" checked={feedbackDraft.targets.includes(target)} onChange={event => setFeedbackDraft(current => ({ ...current, targets: event.target.checked ? [...current.targets, target] : current.targets.filter(name => name !== target) }))} /><span>{target}</span><small>group</small></label>)}</div></div><div className="modal-actions"><button className="outline-button" onClick={() => setShowFeedbackModal(false)}>Cancel</button><button className="primary-button" onClick={createFeedback}><Send size={15} /> Send request</button></div></div></div>}

      {showEventModal && <div className="modal-backdrop" onClick={() => setShowEventModal(false)}><div className="task-modal event-modal" onClick={event => event.stopPropagation()}><div className="modal-head"><div><span className="eyebrow"><CalendarDays size={14} /> Event Planner</span><h2>Plan an event</h2><p>Add departments and assign tasks while planning. Save it as a template to reuse later.</p></div><button className="icon-button" onClick={() => setShowEventModal(false)}><X size={18} /></button></div><div className="form-grid"><label>Event title<input autoFocus value={eventDraft.title} onChange={event => setEventDraft({ ...eventDraft, title: event.target.value })} placeholder="e.g. Parent orientation" /></label><label>Date<input value={eventDraft.date} onChange={event => setEventDraft({ ...eventDraft, date: event.target.value })} placeholder="18 Oct 2026" /></label><label>Venue<input value={eventDraft.venue} onChange={event => setEventDraft({ ...eventDraft, venue: event.target.value })} placeholder="Main auditorium" /></label><label className="wide-field">Event brief<textarea value={eventDraft.description} onChange={event => setEventDraft({ ...eventDraft, description: event.target.value })} placeholder="What needs to happen?" /></label></div><div className="event-department-picker"><div className="assistant-picker-head"><span><Users size={15} /> Departments involved</span><small>{eventDraft.departments.length} selected</small></div><div className="notice-target-grid">{departments.map(department => <label key={department.name}><input type="checkbox" checked={eventDraft.departments.includes(department.name)} onChange={event => setEventDraft(current => ({ ...current, departments: event.target.checked ? [...current.departments, department.name] : current.departments.filter(name => name !== department.name) }))} /><span>{department.name}</span><small>{department.people} people</small></label>)}</div></div><div className="event-role-builder"><div className="section-header compact"><div><span className="eyebrow"><Users size={13} /> Roles and in-charges</span><h3>Who is responsible for the event?</h3><p>Record the event head, coordinators, venue lead, or any other role.</p></div><button className="outline-button" onClick={() => setEventDraft(current => ({ ...current, roles: [...current.roles, { id: Date.now(), role: "", inCharge: "Arjun Mehta", department: current.departments[0] || "Academic" }] }))}><Plus size={14} /> Add role</button></div><div className="event-role-rows">{eventDraft.roles.map((role, index) => <div className="event-role-row" key={role.id}><input value={role.role} onChange={event => setEventDraft(current => ({ ...current, roles: current.roles.map((item, itemIndex) => itemIndex === index ? { ...item, role: event.target.value } : item) }))} placeholder="Role e.g. Event head" /><select value={role.inCharge} onChange={event => setEventDraft(current => ({ ...current, roles: current.roles.map((item, itemIndex) => itemIndex === index ? { ...item, inCharge: event.target.value } : item) }))}>{employeeRoster.map(person => <option key={person}>{person}</option>)}</select><select value={role.department} onChange={event => setEventDraft(current => ({ ...current, roles: current.roles.map((item, itemIndex) => itemIndex === index ? { ...item, department: event.target.value } : item) }))}>{departments.map(department => <option key={department.name}>{department.name}</option>)}</select>{eventDraft.roles.length > 1 && <button className="icon-button" onClick={() => setEventDraft(current => ({ ...current, roles: current.roles.filter((_, itemIndex) => itemIndex !== index) }))}><X size={14} /></button>}</div>)}</div></div><div className="event-task-builder"><div className="section-header compact"><div><span className="eyebrow"><ListTodo size={13} /> Task rows</span><h3>Assign work during event planning</h3><p>Each row becomes a task in the assigned person's feed.</p></div><button className="outline-button" onClick={() => setEventDraft(current => ({ ...current, tasks: [...current.tasks, { id: Date.now(), title: "", department: current.departments[0] || "Academic", assignee: "Arjun Mehta", category: "Squirrel", note: "" }] }))}><Plus size={14} /> Add task</button></div><div className="event-task-rows">{eventDraft.tasks.map((task, index) => <div className="event-task-row" key={task.id}><input value={task.title} onChange={event => setEventDraft(current => ({ ...current, tasks: current.tasks.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item) }))} placeholder="Task to complete for this event" /><select value={task.department} onChange={event => setEventDraft(current => ({ ...current, tasks: current.tasks.map((item, itemIndex) => itemIndex === index ? { ...item, department: event.target.value } : item) }))}>{departments.map(department => <option key={department.name}>{department.name}</option>)}</select><select value={task.assignee} onChange={event => setEventDraft(current => ({ ...current, tasks: current.tasks.map((item, itemIndex) => itemIndex === index ? { ...item, assignee: event.target.value } : item) }))}>{employeeRoster.map(person => <option key={person}>{person}</option>)}</select><select value={task.category} onChange={event => setEventDraft(current => ({ ...current, tasks: current.tasks.map((item, itemIndex) => itemIndex === index ? { ...item, category: event.target.value as TaskCategory } : item) }))}><option>Squirrel</option><option>Angad</option><option>Sugriv</option><option>HANUMAN</option></select><input value={task.note} onChange={event => setEventDraft(current => ({ ...current, tasks: current.tasks.map((item, itemIndex) => itemIndex === index ? { ...item, note: event.target.value } : item) }))} placeholder="Responsibility note" />{eventDraft.tasks.length > 1 && <button className="icon-button" onClick={() => setEventDraft(current => ({ ...current, tasks: current.tasks.filter((_, itemIndex) => itemIndex !== index) }))}><X size={14} /></button>}</div>)}</div></div><label className="team-toggle"><input type="checkbox" checked={eventDraft.isTemplate} onChange={event => setEventDraft({ ...eventDraft, isTemplate: event.target.checked })} /><span><Save size={16} /><strong>Save as reusable template</strong><small>Keep the event, departments, and task assignments ready for the next occurrence.</small></span></label>{eventDraft.isTemplate && <label>Template name<input value={eventDraft.templateName} onChange={event => setEventDraft({ ...eventDraft, templateName: event.target.value })} placeholder="e.g. Parent orientation playbook" /></label>}<div className="modal-actions"><button className="outline-button" onClick={() => setShowEventModal(false)}>Cancel</button><button className="primary-button" onClick={createEventPlan}><CalendarDays size={15} /> {eventDraft.isTemplate ? "Save template" : "Create event & tasks"}</button></div></div></div>}
      {showCalendarModal && <div className="modal-backdrop" onClick={() => setShowCalendarModal(false)}><div className="task-modal calendar-modal" onClick={event => event.stopPropagation()}><div className="modal-head"><div><span className="eyebrow"><CalendarRange size={14} /> Yearly Calendar · {calendarManagerLabel}</span><h2>Add calendar event</h2><p>Only the CEO, Directors, or an assigned calendar manager can create or edit these records.</p></div><button className="icon-button" onClick={() => setShowCalendarModal(false)}><X size={18} /></button></div><div className="form-grid"><label>Event title<input autoFocus value={calendarDraft.title} onChange={event => setCalendarDraft({ ...calendarDraft, title: event.target.value })} placeholder="e.g. Faculty training day" /></label><label>Event type<select value={calendarDraft.type} onChange={event => setCalendarDraft({ ...calendarDraft, type: event.target.value as CalendarEventType })}>{calendarTypeOptions.map(type => <option key={type}>{type}</option>)}</select></label><label>Date<input value={calendarDraft.date} onChange={event => setCalendarDraft({ ...calendarDraft, date: event.target.value })} placeholder="18 Dec 2026" /></label><label>Month<select value={calendarDraft.month} onChange={event => setCalendarDraft({ ...calendarDraft, month: Number(event.target.value) })}>{calendarMonths.map((month, index) => <option value={index} key={month}>{month}</option>)}</select></label></div><div className="calendar-visibility-picker"><div className="assistant-picker-head"><span><Users size={15} /> Who can see this event?</span><small>{calendarDraft.visibility.includes("Everyone") ? "Everyone" : `${calendarDraft.visibility.length} groups selected`}</small></div><div className="notice-target-grid">{["Everyone", ...calendarVisibilityOptions].map(target => <label key={target}><input type="checkbox" checked={calendarDraft.visibility.includes(target)} onChange={event => setCalendarDraft(current => ({ ...current, visibility: event.target.checked ? target === "Everyone" ? ["Everyone"] : [...current.visibility.filter(name => name !== "Everyone"), target] : current.visibility.filter(name => name !== target) }))} /><span>{target}</span><small>{target === "Everyone" ? "all users" : "group"}</small></label>)}</div></div><div className="manager-rule"><ShieldCheck size={15} /><span><strong>Protected record</strong><small>Other employees can view according to visibility, but cannot create or change the event.</small></span></div><div className="modal-actions"><button className="outline-button" onClick={() => setShowCalendarModal(false)}>Cancel</button><button className="primary-button" onClick={createCalendarEvent}><CalendarDays size={15} /> Save event</button></div></div></div>}

      {showNoticeModal && <div className="modal-backdrop" onClick={() => setShowNoticeModal(false)}><div className="task-modal notice-modal" onClick={event => event.stopPropagation()}><div className="modal-head"><div><span className="eyebrow"><Megaphone size={14} /> Notice board</span><h2>Send a notice</h2><p>Choose exactly who should receive the timetable, schedule, announcement, or media update.</p></div><button className="icon-button" onClick={() => setShowNoticeModal(false)}><X size={18} /></button></div><div className="form-grid"><label>Notice title<input autoFocus value={noticeDraft.title} onChange={event => setNoticeDraft({ ...noticeDraft, title: event.target.value })} placeholder="e.g. Sunday mock-test schedule" /></label><label>Delivery mode<select value={noticeDraft.audience} onChange={event => setNoticeDraft({ ...noticeDraft, audience: event.target.value as NoticeAudience, recipients: event.target.value === "Everyone" ? ["Entire institute"] : ["Academic"] })}><option>Targeted groups</option><option>Everyone</option></select></label></div>{noticeDraft.audience === "Everyone" ? <div className="notice-everyone"><Megaphone size={15} /><strong>Everyone in the institute</strong><span>All Directors, Department Heads, candidates, and departments will receive this notice.</span></div> : <div className="notice-recipient-picker"><div className="assistant-picker-head"><span><Users size={15} /> Select any combination of recipients</span><small>{noticeDraft.recipients.length} selected</small></div><div className="notice-target-grid">{noticeTargetOptions.map(target => <label key={target}><input type="checkbox" checked={noticeDraft.recipients.includes(target)} onChange={event => setNoticeDraft(current => ({ ...current, recipients: event.target.checked ? [...current.recipients, target] : current.recipients.filter(name => name !== target) }))} /><span>{target}</span>{target === "Directors" || target === "Department heads" || target === "Candidates" ? <small>role group</small> : <small>department</small>}</label>)}</div></div>}<label>Message / notice<textarea value={noticeDraft.body} onChange={event => setNoticeDraft({ ...noticeDraft, body: event.target.value })} placeholder="Write the schedule, instruction, or announcement..." /></label><label className="notice-upload"><Upload size={18} /><span><strong>{noticeDraft.media ? noticeDraft.media.name : "Attach image, audio, or video"}</strong><small>Optional · image/*, audio/*, video/*</small></span><input type="file" accept="image/*,audio/*,video/*" onChange={event => addNoticeMedia(event.target.files?.[0])} /></label><label>Notice period<select value={noticeDraft.period} onChange={event => setNoticeDraft({ ...noticeDraft, period: event.target.value as Notice["period"] })}><option>12 hours</option><option>24 hours</option><option>7 days</option><option>1 month</option></select><small>After this period the notice moves to the bin and is retained for 30 days.</small></label><label className="team-toggle notice-reply-toggle"><input type="checkbox" checked={noticeDraft.requiresReply} onChange={event => setNoticeDraft({ ...noticeDraft, requiresReply: event.target.checked })} /><span><MessageCircleQuestion size={16} /><strong>Ask recipients to reply</strong><small>Replies are private to the sender, Department Heads, Directors, and CEO.</small></span></label><div className="manager-rule"><ShieldCheck size={15} /><span><strong>Audience visibility</strong><small>Recipients see this in their feed. Department heads and above can review institute notices.</small></span></div><div className="modal-actions"><button className="outline-button" onClick={() => setShowNoticeModal(false)}>Cancel</button><button className="primary-button" onClick={createNotice}><Send size={15} /> Send notice</button></div></div></div>}

      {showTaskModal && <div className="modal-backdrop" onClick={() => setShowTaskModal(false)}><div className="task-modal" onClick={event => event.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">{editingTaskId ? "Manager edit" : newTask.kind === "MOM action" ? "From meeting MOM" : "Quick capture"}</span><h2>{editingTaskId ? "Edit task" : "Create a task"}</h2><p>Only the Task Owner can complete the task. Contributors report their own part.</p></div><button className="icon-button" onClick={() => setShowTaskModal(false)}><X size={18} /></button></div><label>What needs to move forward?<input autoFocus value={newTask.title} onChange={event => setNewTask({ ...newTask, title: event.target.value })} placeholder="e.g. Confirm next week's faculty roster" /></label><div className="form-grid"><label>Task owner<select value={newTask.assignee} onChange={event => setNewTask({ ...newTask, assignee: event.target.value })}><option>You</option><option>Neha Kapoor</option><option>Ritesh Shah</option><option>Sana Iyer</option><option>Vikram Nair</option></select></label><label>Department<select value={newTask.department} onChange={event => setNewTask({ ...newTask, department: event.target.value })}>{departments.map(dept => <option key={dept.name}>{dept.name}</option>)}</select></label><label>Due date<select value={newTask.due} onChange={event => setNewTask({ ...newTask, due: event.target.value })}><option>Today</option><option>Tomorrow</option><option>30 Sep</option><option>03 Oct</option><option>10 Oct</option></select></label><label>Priority<select value={newTask.priority} onChange={event => setNewTask({ ...newTask, priority: event.target.value as Task["priority"] })}><option>High</option><option>Medium</option><option>Low</option></select></label></div><div className="form-grid task-type-row"><label>Task family<select value={newTask.category} onChange={event => setNewTask({ ...newTask, category: event.target.value as TaskCategory, assistants: event.target.value === "Sugriv" || event.target.value === "HANUMAN" ? newTask.assistants : [], assignmentNotes: event.target.value === "Sugriv" || event.target.value === "HANUMAN" ? newTask.assignmentNotes : { [newTask.assignee]: newTask.assignmentNotes[newTask.assignee] || "" }, longRunning: event.target.value === "HANUMAN" || newTask.longRunning, kind: event.target.value === "HANUMAN" ? "HANUMAN" : newTask.kind })}>{taskCategories.map(category => <option key={category}>{category}</option>)}</select></label><label>Task source<select value={newTask.kind} onChange={event => setNewTask({ ...newTask, kind: event.target.value as TaskKind, longRunning: event.target.value === "HANUMAN" || newTask.longRunning })}><option value="Task">Manual task</option><option value="MOM action">MOM task</option><option value="Responsibility">Project responsibility</option><option value="HANUMAN">HANUMAN mission</option></select></label><label className="hanuman-toggle"><input type="checkbox" checked={newTask.longRunning} onChange={event => setNewTask({ ...newTask, longRunning: event.target.checked, kind: event.target.checked ? "HANUMAN" : newTask.kind === "HANUMAN" ? "Task" : newTask.kind })} /><span><strong>Keep as HANUMAN task</strong><small>For work that may take months or a year.</small></span></label></div><label className="wide-field assignment-note-field">What should {newTask.assignee} do?<textarea value={newTask.assignmentNotes[newTask.assignee] || ""} onChange={event => setNewTask(current => ({ ...current, assignmentNotes: { ...current.assignmentNotes, [current.assignee]: event.target.value } }))} placeholder="Add the specific responsibility for this person..." /></label>{(newTask.category === "Sugriv" || newTask.category === "HANUMAN") ? <div className="assistant-picker"><div className="assistant-picker-head"><span><Users size={15} /> People assigned to this {newTask.category} task</span><small>Everyone sees shared progress · multiple allowed</small></div><div className="assistant-options">{staffOptions.filter(person => person !== newTask.assignee).map(person => <label key={person}><input type="checkbox" checked={newTask.assistants.includes(person)} onChange={event => setNewTask(current => ({ ...current, assistants: event.target.checked ? [...current.assistants, person] : current.assistants.filter(name => name !== person) } ))} />{person}</label>)}</div>{newTask.assistants.map(person => <label className="assignment-note-row" key={person}><strong>{person}</strong><input value={newTask.assignmentNotes[person] || ""} onChange={event => setNewTask(current => ({ ...current, assignmentNotes: { ...current.assignmentNotes, [person]: event.target.value } }))} placeholder={`What should ${person} do?`} /></label>)}</div> : <div className="category-rule"><strong>{newTask.category} task</strong><span>{newTask.category === "Squirrel" ? "One person · simple task" : "One person · bigger task"}</span></div>}<div className="subtask-editor"><div className="assistant-picker-head"><span><ListTodo size={15} /> Optional subtasks</span><small>Owner or higher authority can add</small></div><div className="subtask-add-row"><input value={subtaskDraft} onChange={event => setSubtaskDraft(event.target.value)} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); addSubtaskToDraft(); } }} placeholder="e.g. Collect faculty availability" /><button className="outline-button" onClick={addSubtaskToDraft}><Plus size={14} /> Add</button></div>{newTask.subtasks.length > 0 && <div className="draft-subtasks">{newTask.subtasks.map((subtask, index) => <span key={`${subtask}-${index}`}><Circle size={10} /> {subtask}<button onClick={() => setNewTask(current => ({ ...current, subtasks: current.subtasks.filter((_, itemIndex) => itemIndex !== index) }))}><X size={11} /></button></span>)}</div>}</div><label className="team-toggle"><input type="checkbox" checked={newTask.teamTask} onChange={event => setNewTask({ ...newTask, teamTask: event.target.checked })} /><span><Users size={16} /><strong>Show as team task</strong><small>Keep it in every contributor's feed until the Task Owner completes it.</small></span></label><div className="manager-rule"><ShieldCheck size={15} /><span><strong>Manager control</strong><small>Department Heads can edit or reassign this task. Owners and assistants cannot reassign it.</small></span></div><div className="modal-actions">{editingTaskId && <button className="danger-button" onClick={() => deleteTask(editingTaskId)}><X size={14} /> Delete task</button>}<button className="outline-button" onClick={() => setShowTaskModal(false)}>Cancel</button><button className="primary-button" onClick={createTask}>{editingTaskId ? <RotateCcw size={16} /> : <Plus size={17} />} {editingTaskId ? "Save changes" : "Create task"}</button></div></div></div>}

      {showMomModal && <div className="modal-backdrop" onClick={() => setShowMomModal(false)}><div className="task-modal mom-entry-modal" onClick={event => event.stopPropagation()}><div className="modal-head"><div><span className="eyebrow"><NotebookPen size={14} /> MOM Directory</span><h2>Write meeting MOM</h2><p>Start with attendance. Written MOM is locked after saving; only the quick task rows below create tasks.</p></div><button className="icon-button" onClick={() => setShowMomModal(false)}><X size={18} /></button></div><section className="mom-attendance-first"><div className="attendance-section-head"><div><span className="record-label">1 · Attendance</span><h3>Tick present and absent employees</h3><p>Prefilled institute roster · meeting head and secretary are included as present.</p></div><span className="attendance-count">{momDraft.present.length} present · {momDraft.absent.length} absent</span></div><div className="attendance-picker-grid">{employeeRoster.map(person => <div className="attendance-picker-row" key={person}><Avatar text={initials(person)} name={person} tone="indigo" /><strong>{person}</strong><small>{employeeDepartments[person]}</small><label className="attendance-check present"><input type="checkbox" checked={momDraft.present.includes(person)} onChange={event => setMomDraft(current => ({ ...current, present: event.target.checked ? [...current.present, person] : current.present.filter(name => name !== person), absent: current.absent.filter(name => name !== person) }))} /> Present</label><label className="attendance-check absent"><input type="checkbox" checked={momDraft.absent.includes(person)} onChange={event => setMomDraft(current => ({ ...current, absent: event.target.checked ? [...current.absent, person] : current.absent.filter(name => name !== person), present: current.present.filter(name => name !== person) }))} /> Absent</label></div>)}</div></section><div className="form-grid"><label>Meeting title<input autoFocus value={momDraft.title} onChange={event => setMomDraft({ ...momDraft, title: event.target.value })} placeholder="e.g. Faculty review" /></label><label>Date<input value={momDraft.date} onChange={event => setMomDraft({ ...momDraft, date: event.target.value })} placeholder="02 Oct 2026" /></label><label>Department<select value={momDraft.department} onChange={event => setMomDraft({ ...momDraft, department: event.target.value })}>{departments.map(dept => <option key={dept.name}>{dept.name}</option>)}</select></label><label>Meeting head<select value={momDraft.meetingHead} onChange={event => setMomDraft({ ...momDraft, meetingHead: event.target.value })}>{employeeRoster.map(person => <option key={person}>{person}</option>)}</select></label><label>Meeting secretary<select value={momDraft.secretary} onChange={event => setMomDraft({ ...momDraft, secretary: event.target.value })}>{employeeRoster.map(person => <option key={person}>{person}</option>)}</select></label><label>Next meeting (optional)<input value={momDraft.nextMeeting} onChange={event => setMomDraft({ ...momDraft, nextMeeting: event.target.value })} placeholder="e.g. 10 Oct 2026" /></label><label className="wide-field">2 · MOM / written record<textarea value={momDraft.content} onChange={event => setMomDraft({ ...momDraft, content: event.target.value })} placeholder="Write discussions, decisions, and context here..." /></label></div><section className="quick-task-section"><div className="attendance-section-head"><div><span className="record-label">3 · Quick task assignment</span><h3>Add tasks row by row while the meeting is happening</h3><p>Select the department and employee separately. A meeting can assign work across any department.</p></div><button className="outline-button" onClick={() => setMomDraft(current => ({ ...current, quickTasks: [...current.quickTasks, { title: "", department: current.department, assignee: "Arjun Mehta" }] }))}><Plus size={14} /> Add task row</button></div><div className="quick-task-table"><div className="quick-task-table-head"><span>Task</span><span>Department</span><span>Employee</span><span /></div>{momDraft.quickTasks.map((row, index) => <div className="quick-task-row" key={index}><input value={row.title} onChange={event => setMomDraft(current => ({ ...current, quickTasks: current.quickTasks.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item) }))} placeholder="Task to assign" /><select value={row.department} onChange={event => setMomDraft(current => ({ ...current, quickTasks: current.quickTasks.map((item, itemIndex) => itemIndex === index ? { ...item, department: event.target.value } : item) }))}>{departments.map(dept => <option key={dept.name}>{dept.name}</option>)}</select><select value={row.assignee} onChange={event => setMomDraft(current => ({ ...current, quickTasks: current.quickTasks.map((item, itemIndex) => itemIndex === index ? { ...item, assignee: event.target.value } : item) }))}>{employeeRoster.map(person => <option key={person}>{person}</option>)}</select>{momDraft.quickTasks.length > 1 && <button className="icon-button" onClick={() => setMomDraft(current => ({ ...current, quickTasks: current.quickTasks.filter((_, itemIndex) => itemIndex !== index) }))}><X size={14} /></button>}</div>)}</div></section><div className="manager-rule"><LockKeyhole size={15} /><span><strong>Immutable MOM</strong><small>Saving does not auto-create a task from the written MOM. Only the explicit quick task rows create assigned tasks, and later authorized users can add more from the locked record.</small></span></div><div className="modal-actions"><button className="outline-button" onClick={() => setShowMomModal(false)}>Cancel</button><button className="primary-button" onClick={createMomRecord}><NotebookPen size={16} /> Lock MOM & save</button></div></div></div>}

      {showAttachmentModal && <div className="modal-backdrop" onClick={() => setShowAttachmentModal(false)}><div className="task-modal attachment-modal" onClick={event => event.stopPropagation()}><div className="modal-head"><div><span className="eyebrow"><Paperclip size={14} /> Task attachments</span><h2>{attachmentKind === "evidence" ? "Add completion evidence" : "Add task guidance"}</h2><p>{attachmentTask?.title || "Selected task"}</p></div><button className="icon-button" onClick={() => setShowAttachmentModal(false)}><X size={18} /></button></div><div className="attachment-type-switch"><button className={attachmentKind === "evidence" ? "active" : ""} onClick={() => setAttachmentKind("evidence")}><CheckCircle2 size={14} /> Completion evidence</button><button className={attachmentKind === "material" ? "active" : ""} onClick={() => setAttachmentKind("material")}><BookOpenCheck size={14} /> Helping material</button></div><label className="upload-dropzone"><Upload size={22} /><strong>Upload files</strong><span>Photo, PDF, Word, audio, or video</span><input type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,audio/*,video/*" onChange={event => addAttachments(event.target.files)} /></label><div className="attachment-or"><span>or add a link</span></div><div className="link-entry"><input value={attachmentLink} onChange={event => setAttachmentLink(event.target.value)} placeholder="https://example.com/resource" /><button className="primary-button" onClick={addAttachmentLink} disabled={!attachmentLink.trim()}><ExternalLink size={15} /> Add link</button></div><div className="attachment-note"><ShieldCheck size={14} /><span><strong>Visible with the task</strong><small>Evidence documents what was completed. Helping material gives the owner and assistants context before they begin.</small></span></div></div></div>}

      {showMeetingModal && <div className="modal-backdrop" onClick={() => setShowMeetingModal(false)}><div className="task-modal meeting-modal" onClick={event => event.stopPropagation()}><div className="modal-head"><div><span className="eyebrow"><NotebookPen size={14} /> Meeting record</span><h2>Capture meeting MOM</h2><p>Use MOM Directory for the official attendance-first meeting record and explicit task rows.</p></div><button className="icon-button" onClick={() => setShowMeetingModal(false)}><X size={18} /></button></div><div className="form-grid"><label>Meeting title<input value={meetingDraft.title} onChange={event => setMeetingDraft({ ...meetingDraft, title: event.target.value })} placeholder="e.g. Faculty review" /></label><label>Date<input value={meetingDraft.date} onChange={event => setMeetingDraft({ ...meetingDraft, date: event.target.value })} placeholder="30 Sep" /></label><label className="wide-field">Participants<input value={meetingDraft.participants} onChange={event => setMeetingDraft({ ...meetingDraft, participants: event.target.value })} placeholder="Comma-separated names" /></label><label className="wide-field">Notes / MOM<textarea value={meetingDraft.notes} onChange={event => setMeetingDraft({ ...meetingDraft, notes: event.target.value })} placeholder="What was discussed?" /></label><label className="wide-field">Decisions<textarea value={meetingDraft.decisions} onChange={event => setMeetingDraft({ ...meetingDraft, decisions: event.target.value })} placeholder="What was decided?" /></label><label className="wide-field">Action item<textarea value={meetingDraft.actionItem} onChange={event => setMeetingDraft({ ...meetingDraft, actionItem: event.target.value })} placeholder="Add this as an explicit MOM task row" /></label><label>Task department<select value={meetingDraft.department} onChange={event => setMeetingDraft({ ...meetingDraft, department: event.target.value })}>{departments.map(dept => <option key={dept.name}>{dept.name}</option>)}</select></label><label>Follow-up date<input value={meetingDraft.followUp} onChange={event => setMeetingDraft({ ...meetingDraft, followUp: event.target.value })} /></label></div><div className="manager-rule"><CheckCircle2 size={15} /><span><strong>Explicit MOM task assignment</strong><small>Only explicitly assigned MOM task rows create tasks; written MOM content stays locked after saving.</small></span></div><div className="modal-actions"><button className="outline-button" onClick={() => setShowMeetingModal(false)}>Cancel</button><button className="primary-button" onClick={createMeeting}><NotebookPen size={16} /> Save meeting record</button></div></div></div>}
    </div>
  );
}
