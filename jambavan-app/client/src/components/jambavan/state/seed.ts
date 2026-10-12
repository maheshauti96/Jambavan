// Moved verbatim from pages/Home.tsx (checkpoint 5f248af) in increment 0 (§13). Do not change behaviour here.
import { TODAY_ISO } from "./clock";
import type { TaskCategory, BlockerReason, Notice, CalendarEventType, CalendarEvent, EventPlan, FeedbackRequest, AccessPermission, EmployeeProfile, PersonalPlan, Project, Task } from "./types";

export const blockerReasons: BlockerReason[] = ["I haven't started", "Waiting for someone", "Waiting for information", "Too much other work", "I don't understand the task", "Unexpected issue", "Forgot", "Other"];
export const taskCategories: TaskCategory[] = ["Squirrel", "Angad", "Sugriv", "HANUMAN"];

// F21 (D18): My Day opens on the seed clock's today, not the machine's UTC date.
export const plannerToday = TODAY_ISO;
export const emptyPersonalPlan = (date: string): PersonalPlan => ({ date, top3: [], scheduleBlocks: [], actionables: [], linkedTaskIds: [], review: { completed: "", pending: "", tomorrowPriority: "" } });

export const initialTasks: Task[] = [
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
    blocker: { reason: "Waiting for information", note: "Final batch count is still awaited.", reportedBy: "Arjun Mehta", reportedAt: "05 Oct 2026, 10:15 AM" },
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
    blocker: { reason: "I haven't started", reportedBy: "Neha Kapoor", reportedAt: "05 Oct 2026, 9:40 AM" },
    // F17(f) (D3): the seed package matches live behaviour: Aditi (on leave until 08 Oct) handed the task to its owner Neha.
    handover: { id: 1002, from: "Aditi Rao", to: "Neha Kapoor", createdBy: "Aditi Rao", createdAt: "05 Oct 2026, 4:20 PM", statusSummary: "Not started · 0% complete", lastAction: "Scholarship applicant list reviewed", waitingFor: "Applicant availability confirmation", nextAction: "Start the first call block on 06 Oct", notes: "Prioritize the five applicants marked urgent in the admissions sheet." },
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
    blocker: { reason: "Waiting for someone", note: "Need confirmation from the attendance owner.", reportedBy: "Ritesh Shah", reportedAt: "05 Oct 2026, 11:20 AM" },
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
    blocker: { reason: "Unexpected issue", note: "Projector replacement part has not arrived.", reportedBy: "Vikram Nair", reportedAt: "05 Oct 2026, 8:45 AM" },
  },
  { id: 8, title: "Prepare admission campaign poster", assignee: "Sana Iyer", initials: "SI", team: "Admission Campaign", department: "Marketing", due: "Today", status: "done", priority: "High", visibility: "Department", progress: 100, kind: "Responsibility", category: "Angad", project: "Admission Campaign", source: "Admission Campaign playbook", assistants: [{ name: "Rhea Sen", initials: "RS", department: "Marketing", completed: true }], completedBy: "Sana Iyer", completedAt: "05 Oct 2026, 2:10 PM" },
  { id: 9, title: "Approve admission campaign poster", assignee: "Arjun Mehta", initials: "AM", team: "Admission Campaign", department: "Academic", due: "Today", status: "blocked", priority: "High", visibility: "Leadership", progress: 60, kind: "Responsibility", category: "Sugriv", project: "Admission Campaign", source: "Admission Campaign playbook", assistants: [{ name: "Sana Iyer", initials: "SI", department: "Marketing", completed: true }], dependsOnTaskId: 8, blocker: { reason: "Waiting for someone", note: "Final course dates are needed before approval.", reportedBy: "Arjun Mehta", reportedAt: "05 Oct 2026, 1:20 PM" } },
  { id: 10, title: "Send approved poster to schools", assignee: "Neha Kapoor", initials: "NK", team: "Admission Campaign", department: "Admissions", due: "Tomorrow", status: "todo", priority: "High", visibility: "Department", progress: 0, kind: "Responsibility", category: "Sugriv", project: "Admission Campaign", source: "Admission Campaign playbook", assistants: [{ name: "Aditi Rao", initials: "AR", department: "Admissions", completed: false }], dependsOnTaskId: 9 },
  { id: 11, title: "Make school follow-up calls", assignee: "Manav Shah", initials: "MS", team: "Admission Campaign", department: "Admissions", due: "03 Oct", status: "todo", priority: "Medium", visibility: "Department", progress: 0, kind: "Responsibility", category: "Sugriv", project: "Admission Campaign", source: "Admission Campaign playbook", assistants: [{ name: "Aditi Rao", initials: "AR", department: "Admissions", completed: false }], dependsOnTaskId: 10 },
  { id: 12, title: "Update admission data", assignee: "Ritesh Shah", initials: "RS", team: "Admission Campaign", department: "Operations", due: "05 Oct", status: "todo", priority: "Medium", visibility: "Leadership", progress: 0, kind: "Responsibility", category: "Angad", project: "Admission Campaign", source: "Admission Campaign playbook", assistants: [], dependsOnTaskId: 11 },
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

export const categoryByTaskId: Record<number, TaskCategory> = { 1: "Squirrel", 2: "Angad", 3: "Sugriv", 4: "Squirrel", 5: "Angad", 6: "Sugriv", 7: "HANUMAN" };
// F16 (D7): a seed task's own family is kept; the lookup only fills tasks 1–7, which declare none.
export const initialTasksWithCategories: Task[] = initialTasks.map(task => ({ ...task, category: task.category ?? categoryByTaskId[task.id] ?? "Squirrel" }));

export const noticeSeed: Notice[] = [
  { id: 501, title: "October test timetable", body: "The revised JEE test timetable is ready. Please check your assigned batch slot.", audience: "Department", recipients: ["Academic"], sender: "Arjun Mehta", sentAt: "05 Oct 2026, 9:10 AM", requiresReply: true, replies: { "Priya Nair": "Acknowledged. I will confirm the batch slots by 4 PM." } },
  { id: 502, title: "Parent orientation reminder", body: "All faculty coordinators: please be ready in Hall A by 8:30 AM.", audience: "Candidates", recipients: ["Priya Nair", "Karan Joshi"], sender: "Neha Kapoor", sentAt: "04 Oct 2026, 4:40 PM", media: { name: "orientation-note.mp3", type: "audio", url: "#" } },
];

export const calendarMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const calendarVisibilityOptions = ["Directors", "Department heads", "Candidates", "Academic", "Admissions", "Operations", "Marketing"];
export const calendarTypeOptions: CalendarEventType[] = ["Holiday", "Festival", "Academic program", "Birthday", "Other"];
export const calendarSeed: CalendarEvent[] = [
  { id: 701, title: "Republic Day", date: "26 Jan 2026", month: 0, type: "Holiday", visibility: ["Everyone"], createdBy: "Arjun Mehta" },
  { id: 702, title: "Annual Faculty Excellence Day", date: "18 Apr 2026", month: 3, type: "Academic program", visibility: ["Directors", "Department heads", "Academic"], createdBy: "Arjun Mehta" },
  { id: 703, title: "Diwali holiday", date: "20 Oct 2026", month: 9, type: "Festival", visibility: ["Everyone"], createdBy: "Arjun Mehta" },
  { id: 704, title: "Arjun Mehta birthday", date: "12 Nov 2026", month: 10, type: "Birthday", visibility: ["Directors", "Department heads", "Academic"], createdBy: "Arjun Mehta" },
  { id: 705, title: "New academic session", date: "06 Jun 2026", month: 5, type: "Academic program", visibility: ["Candidates", "Academic", "Admissions"], createdBy: "Arjun Mehta" },
];

export const feedbackSeed: FeedbackRequest[] = [
  { id: 801, title: "Batch 3 timetable check", prompt: "Does the proposed 7:00 PM slot work for your batch?", kind: "Poll", options: ["Yes, works", "Need another slot"], targets: ["Academic", "Candidates"], createdBy: "Arjun Mehta", responses: { "Priya Nair": "Yes, works", "Karan Joshi": "Yes, works" } },
  { id: 802, title: "Faculty development pulse", prompt: "What support would help you deliver better classes this month?", kind: "Open question", targets: ["Department heads", "Academic"], eventId: 2, createdBy: "Arjun Mehta", responses: {} },
];

export const profileSeed: EmployeeProfile[] = [
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

export const noticeTargetOptions = ["Directors", "Department heads", "Candidates", "Academic", "Admissions", "Operations", "Marketing"];

export const departments = [
  { name: "Academic", people: 18, done: 76, open: 14, color: "saffron", lead: "Arjun Mehta" },
  { name: "Admissions", people: 9, done: 64, open: 11, color: "mint", lead: "Neha Kapoor" },
  { name: "Operations", people: 7, done: 52, open: 9, color: "blue", lead: "Ritesh Shah" },
  { name: "Marketing", people: 5, done: 83, open: 4, color: "coral", lead: "Sana Iyer" },
];

export const staffOptions = ["Priya Nair", "Karan Joshi", "Neha Kapoor", "Aditi Rao", "Manav Shah", "Ritesh Shah", "Vikram Nair", "Sana Iyer", "Rhea Sen", "Omkar Patil"];
export const employeeRoster = ["Arjun Mehta", ...staffOptions];
export const employeeDepartments: Record<string, string> = { "Arjun Mehta": "Academic", "Priya Nair": "Academic", "Karan Joshi": "Academic", "Neha Kapoor": "Admissions", "Aditi Rao": "Admissions", "Manav Shah": "Admissions", "Ritesh Shah": "Operations", "Vikram Nair": "Operations", "Sana Iyer": "Marketing", "Rhea Sen": "Marketing", "Omkar Patil": "Operations" };


export const momDirectorySeed = [
  { id: 1, title: "Academic Huddle", date: "26 Sep 2026", department: "Academic", meetingHead: "Arjun Mehta", secretary: "Priya Nair", attendance: ["Arjun Mehta", "Priya Nair", "Karan Joshi", "Neha Kapoor"], absent: ["Ritesh Shah", "Sana Iyer"], content: "October batch readiness reviewed. Faculty backup for Batch 3 was approved and the timetable needs final confirmation.", nextMeeting: "30 Sep 2026", actionItem: "Confirm faculty backup for Batch 3", taskAssignee: "Arjun Mehta" },
  { id: 2, title: "Admissions Stand-up", date: "25 Sep 2026", department: "Admissions", meetingHead: "Neha Kapoor", secretary: "Aditi Rao", attendance: ["Neha Kapoor", "Aditi Rao", "Manav Shah", "Arjun Mehta"], absent: ["Priya Nair"], content: "Scholarship follow-ups and lead response time were reviewed. All scholarship calls close by Friday.", nextMeeting: "03 Oct 2026", actionItem: "Call pending scholarship applicants", taskAssignee: "Neha Kapoor" },
  { id: 3, title: "Growth Review", date: "25 Sep 2026", department: "Marketing", meetingHead: "Sana Iyer", secretary: "Rhea Sen", attendance: ["Sana Iyer", "Rhea Sen", "Arjun Mehta"], absent: ["Karan Joshi"], content: "October campaign, student stories, and referral push were discussed. Student stories lead the first campaign week.", nextMeeting: "02 Oct 2026", actionItem: "Upload student success stories", taskAssignee: "Sana Iyer" },
];

export const projects: Project[] = [
  { name: "October Launch", label: "Admissions + Academic", progress: 72, due: "Launches 03 Oct", tasks: "18 open tasks", color: "saffron" },
  { name: "Parent Connect", label: "Leadership + Operations", progress: 46, due: "Review 10 Oct", tasks: "9 open tasks", color: "blue" },
  { name: "Faculty Excellence", label: "Academic", progress: 81, due: "Quarterly", tasks: "6 open tasks", color: "mint" },
];

export const eventPlanSeed: EventPlan[] = [
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
export const accessPermissionList: AccessPermission[] = ["View all departments", "Manage employee access", "Edit or reassign tasks", "Create calendar events", "Send targeted notices", "View private tasks", "Export reports"];
export const accessRoleList = ["CEO", "Director", "Department Head", "Employee"] as const;
export type AccessRole = typeof accessRoleList[number];
export const accessMatrixSeed: Record<AccessRole, Record<AccessPermission, boolean>> = {
  CEO: Object.fromEntries(accessPermissionList.map(permission => [permission, true])) as Record<AccessPermission, boolean>,
  Director: Object.fromEntries(accessPermissionList.map(permission => [permission, true])) as Record<AccessPermission, boolean>,
  "Department Head": { "View all departments": false, "Manage employee access": false, "Edit or reassign tasks": true, "Create calendar events": false, "Send targeted notices": true, "View private tasks": true, "Export reports": true },
  Employee: { "View all departments": false, "Manage employee access": false, "Edit or reassign tasks": false, "Create calendar events": false, "Send targeted notices": false, "View private tasks": false, "Export reports": false },
};
