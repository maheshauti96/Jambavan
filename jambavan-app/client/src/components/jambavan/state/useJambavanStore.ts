import { saveEventPlan, syncEventTasks } from "./eventPlans";
// Same names, same initial values, same handler bodies. My day state lives in MyDayProvider (§11 IA-10).
import { useEffect, useMemo, useState } from "react";
import type { Status, ViewKey, AttachmentKind, TaskKind, TaskCategory, BlockerReason, AuditEntry, AppNotification, NoticeAudience, Notice, CalendarEventType, CalendarEvent, EventTaskPlan, EventRole, EventPlan, FeedbackKind, FeedbackRequest, AccessPermission, EmployeeProfile, TaskAttachment, Subtask, TaskHandover, Task } from "./types";
import { blockerReasons, initialTasksWithCategories, noticeSeed, calendarSeed, feedbackSeed, profileSeed, departments, staffOptions, momDirectorySeed, projects, eventPlanSeed, accessMatrixSeed } from "./seed";
import { initials, statusLabel } from "./format";
import type { AccessRole } from "./seed";
import { findBlockingDependency, wouldCycle, clearDependentsOf } from "./dependencies";
import { downloadCsvFile, downloadPdfFile } from "./exports";
import { isCurrentUser, CURRENT_USER } from "./identity";
import { pendingAcknowledgementCount as pendingAckCount } from "./identity";
import { NOW_LABEL } from "./clock";
import { mergeTaskEdit, draftFromTask, emptyTaskDraft, type TaskDraft } from "./taskEdit";
import { completeTaskPure, setArchivedPure, clearBlockerPure, normaliseLink } from "./tasks";
import { defaultHandoverRecipient, handoverTaskPure } from "./handover";
import { applyAccessAction, SELF_GUARD_MESSAGE, duplicateProfileMessage } from "./people";

export function useJambavanStore() {
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
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [eventPlans, setEventPlans] = useState<EventPlan[]>(eventPlanSeed);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventDraft, setEventDraft] = useState({ title: "", date: "", venue: "", description: "", departments: ["Academic"] as string[], isTemplate: false, templateName: "", roles: [{ id: 1, role: "Event head", inCharge: "Arjun Mehta", department: "Academic" }] as EventRole[], tasks: [{ id: 1, title: "", department: "Academic", assignee: "Arjun Mehta", category: "Squirrel" as TaskCategory, note: "" }] as EventTaskPlan[] });
  const canManageCalendar = true;
  const calendarManagerLabel = "Assigned calendar manager";
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [handoverTaskId, setHandoverTaskId] = useState<number | null>(null);
  const [handoverDraft, setHandoverDraft] = useState({ to: "", lastAction: "", waitingFor: "", nextAction: "", notes: "" });
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
  const [notice, setNotice] = useState("");
  const [newTask, setNewTask] = useState<TaskDraft>(emptyTaskDraft);
  // IA-6: "View tasks" on a project card filters Task feed by project (null = no project filter).
  const [projectFilter, setProjectFilter] = useState<string | null>(null);
  // F6 (§12.3): People hides Removed profiles unless "Show removed" is on.
  const [showRemoved, setShowRemoved] = useState(false);
  // IA-6: the ⌘K command palette.
  const [showSearch, setShowSearch] = useState(false);
  const [subtaskDraft, setSubtaskDraft] = useState("");
  const [momList, setMomList] = useState(momDirectorySeed);
  const [momDepartmentFilter, setMomDepartmentFilter] = useState("All departments");
  const [showMomModal, setShowMomModal] = useState(false);
  const [momDraft, setMomDraft] = useState({ title: "", date: "02 Oct 2026", department: "Academic", meetingHead: "Arjun Mehta", secretary: "Priya Nair", present: ["Arjun Mehta", "Priya Nair"] as string[], absent: [] as string[], content: "", nextMeeting: "", quickTasks: [{ title: "", department: "Academic", assignee: "Arjun Mehta" }] });
  const attachmentTask = tasks.find(task => task.id === attachmentTaskId);
  const handoverTask = tasks.find(task => task.id === handoverTaskId);

  const visibleTasks = useMemo(() => tasks.filter(task => {
    const matchesDepartment = departmentFilter === "All departments" || task.department === departmentFilter;
    const matchesStatus = statusFilter === "All work" || task.status === statusFilter;
    const matchesCategory = categoryFilter === "All categories" || task.category === categoryFilter;
    const matchesArchive = archiveFilter === "Archived tasks" ? task.archived : !task.archived;
    const matchesProject = projectFilter === null || task.project === projectFilter;
    return matchesDepartment && matchesStatus && matchesCategory && matchesArchive && matchesProject;
  }), [tasks, departmentFilter, statusFilter, categoryFilter, archiveFilter, projectFilter]);

  const dependencyAlerts = useMemo(() => tasks.filter(task => !task.archived && task.status !== "done").map(task => ({ task, blocker: findBlockingDependency(task, tasks) })).filter(item => item.blocker), [tasks]);
  const downstreamByTask = useMemo(() => new Map(tasks.map(task => [task.id, tasks.filter(candidate => candidate.dependsOnTaskId === task.id && !candidate.archived && candidate.status !== "done")])), [tasks]);

  const deadlineReminders = useMemo(() => tasks.filter(task => !task.archived && task.status !== "done" && (["Today", "Tomorrow"].some(label => task.due.includes(label)) || task.due.startsWith("Overdue"))).map(task => ({
    id: task.id,
    task,
    people: [task.assignee, ...task.assistants.map(assistant => assistant.name)],
    urgency: task.due.startsWith("Overdue") ? "overdue" : task.due === "Today" ? "today" : "soon",
  })), [tasks]);

  const unreadReminders = deadlineReminders.filter(reminder => !readReminderIds.includes(reminder.id));
  const sensitiveAuditActions = ["Access matrix updated", "Employee added", "Employee suspended", "Employee reinstated", "Employee deactivated", "Employee reactivated", "Employee restored", "Employee removed", "Person removed", "Task deleted", "Notice moved to bin", "Profile updated", "Calendar event created"];
  const visibleAuditEntries = activity.filter(entry => { const matchesSearch = !auditSearch.trim() || `${entry.action} ${entry.subject} ${entry.actor} ${entry.detail || ""}`.toLowerCase().includes(auditSearch.trim().toLowerCase()); const matchesFilter = auditFilter === "All actions" || (auditFilter === "Permission changes" ? entry.action.includes("Access matrix") : sensitiveAuditActions.includes(entry.action)); return matchesSearch && matchesFilter; });
  const pendingAcknowledgementCount = pendingAckCount(tasks);
  const expiringNoticeCount = noticeList.filter(notice => !notice.binnedAt && notice.expiresAt).length;
  const auditTrend = { labels: ["24 Sep", "25 Sep", "26 Sep", "27 Sep", "28 Sep", "29 Sep", "30 Sep"], sensitive: [0, 0, 1, 0, 0, 1, 1], completion: [58, 64, 62, 71, 76, 82, Math.round((tasks.filter(task => task.status === "done").length / Math.max(1, tasks.length)) * 100)] };
  const completionByDepartment = departments.map(department => ({ name: department.name, value: department.done }));

  const logActivity = (action: string, subject: string, detail?: string, actor = "Arjun Mehta") => setActivity(current => [{ id: Date.now() + Math.random(), action, subject, actor, at: "05 Oct 2026, 3:15 PM", detail }, ...current]);
  const pushNotification = (title: string, detail: string, kind: AppNotification["kind"]) => setAppNotifications(current => [{ id: Date.now() + Math.random(), title, detail, at: "Just now", read: false, kind }, ...current].slice(0, 12));
  const downloadCsv = (filename: string, rows: string[][]) => {
    downloadCsvFile(filename, rows);
    setNotice(`${filename} downloaded.`);
  };
  const downloadPdf = (filename: string, title: string, rows: string[][]) => {
    downloadPdfFile(filename, title, rows);
    setNotice(`${filename} downloaded.`);
  };
  const eventReportRows = [["Event", "Date", "Departments", "Task count", "Categories", "Roles and in-charges", "Created by"], ...eventPlans.map(plan => [plan.title, plan.date, plan.departments.join(" | "), String(plan.tasks.length), plan.tasks.map(task => task.category).join(" | "), (plan.roles || []).map(role => `${role.role}: ${role.inCharge} (${role.department})`).join(" | "), plan.createdBy])];
  const attendanceReportRows = [["Employee", "Department", "Position", "Contact", "Joining year", "In time", "Out time", "Weekly off", "Availability", "Attendance", "Status note"], ...profiles.filter(profile => profile.access !== "Removed").map(profile => [profile.name, profile.department, profile.position, profile.number, profile.joiningYear, profile.inTime, profile.outTime, profile.weeklyOff, profile.status, profile.attendanceStatus || "Present", profile.statusNote || ""])];
  const exportEventAnalytics = () => downloadCsv("jambavan-event-task-analytics.csv", eventReportRows);
  const exportEventPdf = () => downloadPdf("jambavan-event-task-analytics.pdf", "JAMBAVAN Multi-Department Event Planning Report", eventReportRows);
  const exportAttendanceSummary = () => downloadCsv("jambavan-employee-attendance-summary.csv", attendanceReportRows);
  const exportAttendancePdf = () => downloadPdf("jambavan-employee-attendance-summary.pdf", "JAMBAVAN Employee Attendance Summary", attendanceReportRows);
  const exportLeadershipAnalytics = () => downloadPdf("jambavan-leadership-analytics.pdf", "JAMBAVAN Leadership Analytics", [["Metric", "Value"], ["Sensitive actions", String(activity.filter(entry => sensitiveAuditActions.includes(entry.action)).length)], ["Open acknowledgments", String(pendingAcknowledgementCount)], ["Expiring notices", String(expiringNoticeCount)], ...departments.map(department => [`${department.name} completion`, `${department.done}%`]), ...auditTrend.labels.map((label, index) => [`${label} completion`, `${auditTrend.completion[index]}%`]), ["Delayed tasks with blocker check-in", String(blockerAnalytics.reportedTasks.length)], ...blockerAnalytics.byReason.map(item => [`Blocker: ${item.reason}`, String(item.count)]), ["Dependency alerts", String(dependencyAlerts.length)], ...dependencyAlerts.slice(0, 10).map(item => [`Blocked task: ${item.task.title}`, `Waiting on ${item.blocker?.title || "upstream task"}`])]);

  // F4/F14/F22: completeTaskPure decides; a refused completion logs nothing and shows no toast.
  const completeTask = (id: number) => {
    const { tasks: next, result } = completeTaskPure(tasks, id);
    if (!result) return;
    setTasks(next);
    logActivity("Task completed", result.title, "Owner completion recorded");
    setNotice("Task completed.");
  };

  const openHandoverModal = (task: Task) => {
    const latestUpdate = task.updates?.[task.updates.length - 1];
    setHandoverTaskId(task.id);
    setHandoverDraft({
      to: defaultHandoverRecipient(task),
      lastAction: latestUpdate?.text || (task.progress > 0 ? `${task.progress}% progress recorded` : "No recent action recorded"),
      waitingFor: task.blocker?.note || task.blocker?.reason || "Nothing currently waiting",
      nextAction: task.dependsOnTaskId ? "Complete the upstream dependency first" : task.status === "blocked" ? "Resolve the current blocker" : "Continue the next assigned step",
      notes: task.assignmentNotes?.[task.assignee] || "",
    });
    setShowHandoverModal(true);
  };

  // F17: from = previous Task Owner, createdBy = current user, the recipient leaves Contributors.
  const createHandover = () => {
    if (!handoverTask) return;
    const outcome = handoverTaskPure(handoverTask, handoverDraft, Date.now());
    if (!outcome) return;
    setTasks(current => current.map(task => task.id === handoverTask.id ? outcome.task : task));
    logActivity("Task handed over", handoverTask.title, `From ${outcome.handover.from} to ${outcome.handover.to}`);
    pushNotification("Task handover received", `${handoverTask.title} · Ready for ${handoverDraft.to}`, "assignment");
    setShowHandoverModal(false);
    setHandoverTaskId(null);
    setNotice(`Handover package created for ${handoverDraft.to}.`);
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
    setNotice(`${additions.length} ${attachmentKind === "evidence" ? "completion evidence" : "guidance"} file${additions.length === 1 ? "" : "s"} added to the task.`);
  };

  // F10/M7: only absolute http(s) links are accepted; the dialog shows the inline error when this returns false.
  const addAttachmentLink = () => {
    const link = normaliseLink(attachmentLink);
    if (!link || attachmentTaskId === null) return false;
    const name = link.replace(/^https?:\/\//, "").split("/")[0] || "Shared link";
    setTasks(current => current.map(task => task.id === attachmentTaskId ? { ...task, attachments: [...(task.attachments || []), { id: Date.now(), name, kind: attachmentKind, type: "link", url: link, addedBy: "You" }] } : task));
    logActivity("Attachment added", attachmentTask?.title || "Task", `${attachmentKind} link added`);
    setShowAttachmentModal(false);
    setNotice(`${attachmentKind === "evidence" ? "Evidence" : "Guidance"} link added to the task.`);
    return true;
  };

  const reopenTask = (id: number) => {
    const subject = tasks.find(task => task.id === id)?.title || "Task";
    setTasks(current => current.map(task => task.id === id ? { ...task, status: "progress", progress: Math.min(task.progress || 40, 80), reopenedAt: "05 Oct 2026, 3:15 PM" } : task));
    logActivity("Task reopened", subject, "Reopened for quality review");
    setNotice("Task reopened.");
  };

  const editTask = (task: Task) => {
    setEditingTaskId(task.id);
    setNewTask(draftFromTask(task));
    setSubtaskDraft("");
    setShowTaskModal(true);
  };

  // F2 (A2): every close path (X, Cancel, backdrop, Escape, after save or delete) resets the edit target and draft.
  const closeTaskDialog = () => {
    setShowTaskModal(false);
    setEditingTaskId(null);
    setNewTask(emptyTaskDraft());
    setSubtaskDraft("");
  };
  /** The page's "Create task" always opens a fresh draft. */
  const openCreateTask = () => {
    setEditingTaskId(null);
    setNewTask(emptyTaskDraft());
    setSubtaskDraft("");
    setShowTaskModal(true);
  };

  const dependencyWouldCycle = (candidateId: number, editingId: number | null) => wouldCycle(tasks, candidateId, editingId);

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
      dependsOnTaskId: newTask.dependsOnTaskId,
    };
    if (editingTaskId) {
      // F1 (A1): merge field by field; journal, progress, subtask and part state, team and visibility are kept.
      const ctx = { departmentOf: (name: string) => profiles.find(profile => profile.name === name)?.department, nextId: () => Date.now() + Math.random() };
      setTasks(current => current.map(existing => existing.id === editingTaskId ? mergeTaskEdit(existing, newTask, ctx) : existing));
      logActivity("Task edited", task.title, "Task details updated by department head");
      setNotice("Task updated. The owner and contributors have been notified.");
    } else {
      setTasks(current => [task, ...current]);
      logActivity(task.kind === "HANUMAN" ? "HANUMAN task created" : "Task created", task.title, task.longRunning ? "Long-running workstream added to the feed" : "Visible to permitted people");
      setNotice("Task created.");
    }
    pushNotification(editingTaskId ? "Task assignment updated" : "New task assignment", `${task.title} · Owner ${task.assignee}${task.assistants.length ? ` · ${task.assistants.length} assistant${task.assistants.length === 1 ? "" : "s"}` : ""}`, "assignment");
    closeTaskDialog();
  };

  const archiveTask = (id: number) => {
    const subject = tasks.find(task => task.id === id)?.title || "Task";
    const archived = !tasks.find(task => task.id === id)?.archived;
    setTasks(current => current.map(task => task.id === id ? { ...task, archived, archivedBy: "Arjun Mehta", archivedAt: "05 Oct 2026, 3:45 PM" } : task));
    logActivity(archived ? "Task archived" : "Task restored", subject, archived ? "Archived by department head" : "Restored by department head");
    setNotice(archived ? "Task archived. You can restore it from archived tasks." : "Task restored.");
  };
  // §12.3: the delete confirmation's non-toggling Archive. Same fields, audit string and message as archiveTask.
  const setArchived = (id: number, archived: true) => {
    const task = tasks.find(item => item.id === id);
    if (!task || task.archived) { closeTaskDialog(); return; }
    setTasks(current => setArchivedPure(current, id, archived, "Arjun Mehta", "05 Oct 2026, 3:45 PM"));
    logActivity("Task archived", task.title, "Archived by department head");
    closeTaskDialog();
    setNotice("Task archived. You can restore it from archived tasks.");
  };
  // F6/F23: reached only through the confirmation; also clears every link to the deleted task.
  const deleteTask = (id: number) => {
    const subject = tasks.find(task => task.id === id)?.title || "Task";
    setTasks(current => clearDependentsOf(id, current.filter(task => task.id !== id)));
    logActivity("Task deleted", subject, "Deleted by department head");
    closeTaskDialog();
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

  const reportTaskBlocker = (taskId: number, reason: BlockerReason, note?: string) => {
    const task = tasks.find(item => item.id === taskId);
    if (!task || task.status === "done") return;
    setTasks(current => current.map(item => item.id === taskId ? { ...item, blocker: { reason, note: note?.trim() || undefined, reportedBy: "Arjun Mehta", reportedAt: "05 Oct 2026, 3:15 PM" } } : item));
    logActivity("Task blocker reported", task.title, `${reason}${note?.trim() ? ` · ${note.trim()}` : ""}`);
    setNotice("Thanks — this blocker is recorded as a process signal for management.");
  };
  // F22 (D9): "It's moving again" clears the check-in.
  const clearTaskBlocker = (taskId: number) => {
    const task = tasks.find(item => item.id === taskId);
    if (!task?.blocker) return;
    setTasks(current => clearBlockerPure(current, taskId));
    logActivity("Task blocker cleared", task.title, `Was: ${task.blocker.reason}`);
    setNotice("Check-in cleared. The task is moving again.");
  };

  const acknowledgeTask = (taskId: number, mode: "seen" | "ack") => {
    setTasks(current => current.map(task => task.id !== taskId ? task : mode === "seen" ? { ...task, seenBy: [...new Set([...(task.seenBy || []), "You"])] } : { ...task, acknowledgedBy: [...new Set([...(task.acknowledgedBy || []), "You"])] }));
    logActivity(mode === "seen" ? "Task seen" : "Task acknowledged", tasks.find(task => task.id === taskId)?.title || "Task", mode === "seen" ? "Employee marked it seen" : "Employee acknowledged it");
  };
  const acknowledgeNotice = (noticeId: number) => {
    // Phase 5: "seen" is recorded on the notice, not appended to its recipient list (which the card prints as "To: …").
    if (noticeList.find(notice => notice.id === noticeId)?.seenBy?.includes("You")) return;
    setNoticeList(current => current.map(notice => notice.id === noticeId ? { ...notice, seenBy: [...new Set([...(notice.seenBy || []), "You"])] } : notice));
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
    if (duplicateProfileMessage(newEmployee.name, profiles)) return;
    const profile: EmployeeProfile = { ...newEmployee, name: newEmployee.name.trim(), number: newEmployee.number.trim(), position: newEmployee.position.trim(), access: "Active", photo: newEmployeePhoto, status: "Available", attendanceStatus: newEmployee.attendanceStatus as EmployeeProfile["attendanceStatus"] };
    setProfiles(current => [profile, ...current]);
    logActivity("Employee added", profile.name, "Added by Director");
    setShowAccessModal(false); setNewEmployeePhoto("");
    setNewEmployee({ name: "", number: "", joiningYear: "2026", position: "", department: "Academic", inTime: "09:00 AM", outTime: "06:00 PM", weeklyOff: "Sunday", attendanceStatus: "Present" });
    setNotice("Employee added. Access is active and the profile is visible to the institute.");
  };
  // F6 (§12.3): Deactivate / Reactivate, with the self-protection guard.
  const toggleEmployeeSuspension = (name: string) => {
    if (!canManageEmployeeAccess) { setNotice("Only Directors and the CEO can deactivate or reactivate employees."); return; }
    const profile = profiles.find(item => item.name === name);
    const deactivate = profile?.access !== "Suspended";
    const next = applyAccessAction(profiles, name, deactivate ? "deactivate" : "reactivate");
    if (!next) { setNotice(SELF_GUARD_MESSAGE); return; }
    setProfiles(next);
    logActivity(deactivate ? "Employee deactivated" : "Employee reactivated", name, deactivate ? "Future institute changes paused" : "Access restored by Director");
    setNotice(deactivate ? `${name} is deactivated and will not see future institute changes.` : `${name} has been reactivated.`);
  };
  // F6: "Remove profile" is a soft removal reached through a confirmation; the record is kept.
  const removeEmployee = (name: string) => {
    if (!canManageEmployeeAccess) { setNotice("Only Directors and the CEO can remove employee profiles."); return; }
    const next = applyAccessAction(profiles, name, "remove");
    if (!next) { setNotice(SELF_GUARD_MESSAGE); return; }
    setProfiles(next);
    logActivity("Employee removed", name, "Profile hidden; record retained");
    setNotice(`${name}'s profile was removed. The record is kept; restore it from Show removed.`);
  };
  const restoreEmployee = (name: string) => {
    if (!canManageEmployeeAccess) { setNotice("Only Directors and the CEO can restore employee profiles."); return; }
    const next = applyAccessAction(profiles, name, "restore");
    if (!next) return;
    setProfiles(next);
    logActivity("Employee restored", name, "Profile restored by Director");
    setNotice(`${name}'s profile was restored.`);
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

  const openEventPlanner = (request: { kind: "new" } | { kind: "edit" | "copy"; plan: EventPlan } = { kind: "new" }) => {
    const plan = request.kind === "new" ? undefined : request.plan;
    const copying = request.kind === "copy";
    setEditingEventId(request.kind === "edit" ? request.plan.id : null);
    if (plan) {
      setEventDraft({ title: copying ? `${plan.title} · new event` : plan.title, date: copying ? "" : plan.date, venue: plan.venue, description: plan.description, departments: [...plan.departments], isTemplate: false, templateName: plan.templateName || plan.title, roles: (plan.roles || []).map(role => ({ ...role, id: copying ? Date.now() + Math.random() : role.id })), tasks: plan.tasks.map(task => ({ ...task, id: copying ? Date.now() + Math.random() : task.id })) });
    } else {
      setEventDraft({ title: "", date: "", venue: "", description: "", departments: ["Academic"], isTemplate: false, templateName: "", roles: [{ id: Date.now(), role: "Event head", inCharge: "Arjun Mehta", department: "Academic" }], tasks: [{ id: Date.now(), title: "", department: "Academic", assignee: "Arjun Mehta", category: "Squirrel", note: "" }] });
    }
    setShowEventModal(true);
  };
  const createEventPlan = () => {
    if (!eventDraft.title.trim()) return;
    const plannedTasks = eventDraft.tasks.filter(task => task.title.trim()).map(task => ({ ...task, title: task.title.trim() }));
    const previous = editingEventId !== null && !eventDraft.isTemplate ? eventPlans.find(plan => plan.id === editingEventId) : undefined;
    const event: EventPlan = { id: previous?.id ?? Date.now(), title: eventDraft.title.trim(), date: eventDraft.date || "Date to be confirmed", venue: eventDraft.venue || "Venue to be confirmed", description: eventDraft.description.trim(), departments: eventDraft.departments, roles: eventDraft.roles.filter(role => role.role.trim() && role.inCharge), tasks: plannedTasks, isTemplate: eventDraft.isTemplate, templateName: eventDraft.isTemplate ? (eventDraft.templateName.trim() || eventDraft.title.trim()) : undefined, createdBy: previous?.createdBy ?? "Arjun Mehta" };
    setEventPlans(current => saveEventPlan(current, event));
    setTasks(current => syncEventTasks(event, previous, current, { actor: "Arjun Mehta", at: "05 Oct 2026, 3:15 PM", nextId: () => Date.now() + Math.random() }));
    logActivity(previous ? "Event plan updated" : event.isTemplate ? "Event template created" : "Event planned", event.title, `${event.departments.join(", ")} · ${plannedTasks.length} task${plannedTasks.length === 1 ? "" : "s"}`);
    setShowEventModal(false);
    setNotice(previous ? "Event plan updated." : event.isTemplate ? "Event template saved." : `Event planned. ${plannedTasks.length} task${plannedTasks.length === 1 ? "" : "s"} assigned.`);
    setEditingEventId(null);
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
    setEditingTaskId(null);
    setNewTask({ title: "Confirm faculty backup for Batch 3", assignee: "You", department: "Academic", due: "30 Sep", priority: "Medium", teamTask: false, kind: "MOM action", category: "Angad", longRunning: false, source: "Academic Huddle · 26 Sep", assistants: ["Priya Nair", "Karan Joshi"], assignmentNotes: {}, subtasks: [], dependsOnTaskId: undefined });
    setShowTaskModal(true);
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
    setEditingTaskId(null);
    setNewTask({ title: mom.actionItem || `Follow up: ${mom.title}`, assignee: mom.taskAssignee, department: mom.department, due: mom.nextMeeting || "To be scheduled", priority: "Medium", teamTask: false, kind: "MOM action", category: "Angad", longRunning: false, source: `${mom.title} · ${mom.date}`, assistants: [], assignmentNotes: {}, subtasks: [], dependsOnTaskId: undefined });
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
  const blockerAnalytics = useMemo(() => {
    const delayedTasks = tasks.filter(task => !task.archived && task.status !== "done" && (task.status === "blocked" || task.due.startsWith("Overdue") || Boolean(task.blocker)));
    const reportedTasks = delayedTasks.filter(task => task.blocker);
    const byReason = blockerReasons.map(reason => ({ reason, count: reportedTasks.filter(task => task.blocker?.reason === reason).length })).sort((a, b) => b.count - a.count);
    const topReason = byReason[0] || { reason: "Other" as BlockerReason, count: 0 };
    return { delayedTasks, reportedTasks, byReason, topReason, topPercent: reportedTasks.length ? Math.round((topReason.count / reportedTasks.length) * 100) : 0 };
  }, [tasks]);

  return {
    activeView,
    setActiveView,
    tasks,
    setTasks,
    activity,
    setActivity,
    departmentFilter,
    setDepartmentFilter,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    archiveFilter,
    setArchiveFilter,
    showTaskModal,
    setShowTaskModal,
    showNoticeModal,
    setShowNoticeModal,
    noticeList,
    setNoticeList,
    showNoticeBin,
    setShowNoticeBin,
    noticeDraft,
    setNoticeDraft,
    calendarEvents,
    setCalendarEvents,
    feedbackRequests,
    setFeedbackRequests,
    showFeedbackModal,
    setShowFeedbackModal,
    feedbackDraft,
    setFeedbackDraft,
    profiles,
    setProfiles,
    showProfileModal,
    setShowProfileModal,
    showAccessModal,
    setShowAccessModal,
    newEmployeePhoto,
    setNewEmployeePhoto,
    newEmployee,
    setNewEmployee,
    profileDraft,
    setProfileDraft,
    showCalendarModal,
    setShowCalendarModal,
    calendarDraft,
    setCalendarDraft,
    eventPlans,
    editingEventId,
    setEventPlans,
    showEventModal,
    setShowEventModal,
    eventDraft,
    setEventDraft,
    canManageCalendar,
    calendarManagerLabel,
    showHandoverModal,
    setShowHandoverModal,
    handoverTaskId,
    setHandoverTaskId,
    handoverDraft,
    setHandoverDraft,
    showAttachmentModal,
    setShowAttachmentModal,
    attachmentTaskId,
    setAttachmentTaskId,
    attachmentKind,
    setAttachmentKind,
    attachmentLink,
    setAttachmentLink,
    showNotifications,
    setShowNotifications,
    appNotifications,
    setAppNotifications,
    leadershipRole,
    setLeadershipRole,
    accessMatrix,
    setAccessMatrix,
    auditSearch,
    setAuditSearch,
    auditFilter,
    setAuditFilter,
    canManageEmployeeAccess,
    toggleAccessPermission,
    readReminderIds,
    setReadReminderIds,
    editingTaskId,
    setEditingTaskId,
    showMobileNav,
    setShowMobileNav,
    notice,
    setNotice,
    newTask,
    setNewTask,
    subtaskDraft,
    setSubtaskDraft,
    momList,
    setMomList,
    momDepartmentFilter,
    setMomDepartmentFilter,
    showMomModal,
    setShowMomModal,
    momDraft,
    setMomDraft,
    attachmentTask,
    handoverTask,
    visibleTasks,
    dependencyAlerts,
    downstreamByTask,
    deadlineReminders,
    unreadReminders,
    sensitiveAuditActions,
    visibleAuditEntries,
    pendingAcknowledgementCount,
    expiringNoticeCount,
    auditTrend,
    completionByDepartment,
    logActivity,
    pushNotification,
    downloadCsv,
    downloadPdf,
    eventReportRows,
    attendanceReportRows,
    exportEventAnalytics,
    exportEventPdf,
    exportAttendanceSummary,
    exportAttendancePdf,
    exportLeadershipAnalytics,
    completeTask,
    closeTaskDialog,
    openCreateTask,
    setArchived,
    clearTaskBlocker,
    restoreEmployee,
    projectFilter,
    setProjectFilter,
    showRemoved,
    setShowRemoved,
    showSearch,
    setShowSearch,
    openHandoverModal,
    createHandover,
    toggleAssistant,
    toggleSubtask,
    addSubtaskToDraft,
    openAttachmentModal,
    addAttachments,
    addAttachmentLink,
    reopenTask,
    editTask,
    dependencyWouldCycle,
    createTask,
    archiveTask,
    deleteTask,
    addTaskUpdate,
    addTaskSubtask,
    reportTaskBlocker,
    acknowledgeTask,
    acknowledgeNotice,
    submitNoticeReply,
    openMyProfile,
    saveMyProfile,
    addEmployee,
    toggleEmployeeSuspension,
    removeEmployee,
    createFeedback,
    respondFeedback,
    createCalendarEvent,
    openEventPlanner,
    createEventPlan,
    createNotice,
    addNoticeMedia,
    openMomAction,
    createMomRecord,
    assignMomTask,
    plannerRange,
    setPlannerRange,
    rewardSummary,
    plannerTasks,
    acknowledgementSummary,
    blockerAnalytics,
  };
}

export type JambavanStore = ReturnType<typeof useJambavanStore>;
