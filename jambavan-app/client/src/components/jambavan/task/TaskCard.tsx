// Moved from pages/Home.tsx (checkpoint 5f248af) in increment 0 (§13).
// Phase 5 fixes: status badge (F7, A9), Task Source via sourceLabel (F13), current-user identity for completion and
// "(you)" (F4, A4), "Waiting on" copy (F18, D8/D21), blocker aria-pressed, check mark, label and "It's moving again"
// (F22, D9/D15), handover history line (F17, D2), canHandOver gate (F17g, D24), pressed state on Mark seen and
// Acknowledge, named fields, grammar (C10), and a focusable heading for the ⌘K jump (IA-6).
import { useState } from "react";
import { AlertCircle, CalendarDays, Check, CheckCircle2, Circle, Flag, LockKeyhole, MessageSquareText, MoreHorizontal, Paperclip, FileText, ExternalLink, Upload, Plus, RotateCcw, ShieldCheck, Users, ListTodo, Send, ThumbsUp, CheckCheck, Archive, ArchiveRestore } from "lucide-react";
import type { AttachmentKind, BlockerReason, Task } from "../state/types";
import { blockerReasons } from "../state/seed";
import { initials, statusLabel } from "../state/format";
import { displayName, isCurrentUser } from "../state/identity";
import { sourceLabel } from "../state/selectors";
import { Avatar } from "../art/Avatar";
import { StatusBadge } from "../primitives/Badge";
import { useMyDay } from "../state/MyDayProvider";
import { useJambavan } from "../state/JambavanProvider";

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function TaskCard({ task, onComplete, onAssistantToggle, onReopen, onEdit, onAttach, onSubtaskToggle, onAddUpdate, onAddSubtask, onAcknowledge, onArchive, onReportBlocker, onHandover, blockingDependency, downstreamTasks }: { task: Task; onComplete: (id: number) => void; onAssistantToggle: (taskId: number, assistantName: string) => void; onReopen: (id: number) => void; onEdit: (task: Task) => void; onAttach: (taskId: number, kind: AttachmentKind) => void; onSubtaskToggle: (taskId: number, subtaskId: number) => void; onAddUpdate: (taskId: number, text: string) => void; onAddSubtask: (taskId: number, title: string) => void; onAcknowledge: (taskId: number, mode: "seen" | "ack") => void; onArchive: (taskId: number) => void; onReportBlocker: (taskId: number, reason: BlockerReason, note?: string) => void; onHandover: (task: Task) => void; blockingDependency?: Task; downstreamTasks: Task[] }) {
  const { addTaskToMyDay } = useMyDay();
  const { accessMatrix, clearTaskBlocker } = useJambavan();
  const [journalDraft, setJournalDraft] = useState("");
  const [subtaskDraft, setSubtaskDraft] = useState("");
  const [blockerNote, setBlockerNote] = useState("");
  const ownTask = isCurrentUser(task.assignee);
  // F17(g): the owner, or a role with "Edit or reassign tasks" (the signed-in Department Head in the seed), may hand over.
  const canHandOver = ownTask || accessMatrix["Department Head"]["Edit or reassign tasks"];
  const seen = (task.seenBy || []).some(isCurrentUser);
  const acknowledged = (task.acknowledgedBy || []).some(isCurrentUser);
  const seenCount = task.seenBy?.length || 0;
  const partsDone = task.assistants.filter(assistant => assistant.completed).length;
  return (
    <article className={`task-card ${task.status === "done" ? "is-done" : ""}`} aria-labelledby={`task-${task.id}-title`}>
      <div className="task-card-topline">
        <span className={`category-pill category-${(task.category || "Squirrel").toLowerCase()}`}>{task.category || "Squirrel"}</span><span className={`kind-pill kind-${task.kind.toLowerCase().replace(" ", "-")}`}>{sourceLabel(task)}</span>
        <StatusBadge value={task.status} className="task-status-badge" />
        {task.isTeamTask && <span className="team-pill"><Users size={12} /> Team task</span>} {task.longRunning && <span className="hanuman-pill">HANUMAN · year-long</span>}
        <button className="icon-button subtle" aria-label="Edit task" onClick={() => onEdit(task)}><MoreHorizontal size={17} /></button><button className="icon-button subtle archive-control" aria-label={task.archived ? "Restore task" : "Archive task"} onClick={() => onArchive(task.id)}>{task.archived ? <ArchiveRestore size={15} /> : <Archive size={15} />}</button>
      </div>
      <h3 id={`task-${task.id}-title`} tabIndex={-1}>{task.title}</h3>
      {blockingDependency && <div className="dependency-blocked"><span>Waiting on</span><strong>{blockingDependency.title}</strong><em>{statusLabel(blockingDependency.status)}</em></div>}
      {!blockingDependency && task.status !== "done" && downstreamTasks.length > 0 && <div className="dependency-downstream"><span>Downstream impact</span><strong>{downstreamTasks.length} follow-up task{downstreamTasks.length === 1 ? "" : "s"} waiting on this step</strong><small>{downstreamTasks.slice(0, 2).map(item => item.title).join(" · ")}{downstreamTasks.length > 2 ? " · …" : ""}</small></div>}
      <div className="ack-row"><span><CheckCheck size={12} /> {seenCount === 0 ? "No one has seen this yet" : `Seen by ${plural(seenCount, "person", "people")}`}</span><button className={seen ? "ack-button active" : "ack-button"} aria-pressed={seen} onClick={() => onAcknowledge(task.id, "seen")}><CheckCheck size={12} /> {seen ? "Seen" : "Mark seen"}</button><button className={acknowledged ? "ack-button active" : "ack-button"} aria-pressed={acknowledged} onClick={() => onAcknowledge(task.id, "ack")}><ThumbsUp size={12} /> {acknowledged ? "Acknowledged" : "Acknowledge"}</button>{ownTask && <button className="ack-button my-day-link" onClick={() => addTaskToMyDay(task.id)}><CalendarDays size={12} /> Add to My Day</button>}{task.status !== "done" && canHandOver && <button className="ack-button handover-button" onClick={() => onHandover(task)}><Send size={12} /> Handover Task</button>}</div>
      {task.status !== "done" && <details className="blocker-checkin" open={Boolean(task.blocker)}><summary><AlertCircle size={13} /> Why is this task not moving?</summary><p id={`task-${task.id}-blocker-help`}>One click helps management fix process bottlenecks instead of blaming people.</p><div className="blocker-options" role="group" aria-label="Blocker reason">{blockerReasons.map(reason => { const selected = task.blocker?.reason === reason; return <button key={reason} className={selected ? "selected" : ""} aria-pressed={selected} onClick={() => onReportBlocker(task.id, reason, blockerNote.trim() || undefined)}>{selected && <Check size={11} aria-hidden="true" />}{reason}</button>; })}</div><input value={blockerNote} onChange={event => setBlockerNote(event.target.value)} aria-label="Optional context for management" aria-describedby={`task-${task.id}-blocker-help`} placeholder="Optional context for management..." />{task.blocker && <div className="blocker-current"><strong>Current blocker: {task.blocker.reason}</strong><span>{task.blocker.note || "No extra context added."} · Reported by {displayName(task.blocker.reportedBy)}</span><button className="text-button blocker-clear" onClick={() => clearTaskBlocker(task.id)}><Check size={12} /> It's moving again</button></div>}</details>}
      <div className="task-meta-row">
        <span className={`due ${task.due.startsWith("Overdue") ? "overdue" : ""}`}><CalendarDays size={14} /> {task.due}</span>
        <span className={`priority priority-${task.priority.toLowerCase()}`}><Flag size={13} /> {task.priority}</span>
        {task.visibility === "Private" && <span className="visibility"><LockKeyhole size={12} /> Private</span>}
      </div>
      <div className="task-owner-row">
        <Avatar text={task.initials} name={task.assignee} tone={task.status === "done" ? "green" : task.department.toLowerCase()} />
        <div>
          <span className="owner-name">Task Owner · {displayName(task.assignee)}</span>
          <span className="owner-team">{task.team} · {task.department}</span>
        </div>
        {task.status !== "done" && ownTask && <button className="complete-button" onClick={() => onComplete(task.id)}><Check size={14} /> Complete task</button>}
        {task.status !== "done" && !ownTask && <span className="owner-only"><ShieldCheck size={13} /> Owner completes</span>}
        {task.status === "done" && <span className="done-stamp"><CheckCircle2 size={14} /> Completed by {displayName(task.completedBy || task.assignee)}</span>}
      </div>
      {task.handover && <div className="handover-summary"><div className="handover-summary-head"><div><span><Send size={12} /> Task Handover</span><strong>Ready for {displayName(task.handover.to)}</strong></div><small>From <b>{displayName(task.handover.from)}</b> · created by {displayName(task.handover.createdBy || task.handover.from)} · {task.handover.createdAt}</small></div><div className="handover-summary-grid"><div><small>Current status</small><strong>{task.handover.statusSummary}</strong></div><div><small>Last action</small><strong>{task.handover.lastAction}</strong></div><div><small>Waiting for</small><strong>{task.handover.waitingFor}</strong></div><div><small>Next action</small><strong>{task.handover.nextAction}</strong></div></div><div className="handover-notes"><small>Important notes</small><span>{task.handover.notes || "No additional notes."}</span></div></div>}
      <div className="assistant-strip"><div className="assistant-label"><Users size={13} /> Contributors <span>{partsDone} of {task.assistants.length} {task.assistants.length === 1 ? "part" : "parts"} done</span></div><div className="assistant-list">{task.assistants.map(assistant => <button key={assistant.name} className={`assistant-chip ${assistant.completed ? "complete" : ""}`} aria-pressed={assistant.completed} onClick={() => onAssistantToggle(task.id, assistant.name)}><Avatar text={assistant.initials} name={assistant.name} tone={assistant.department.toLowerCase()} /><span className="assistant-check">{assistant.completed ? <Check size={11} /> : <Circle size={10} />}</span><span>{displayName(assistant.name)}</span></button>)}</div>{task.assignmentNotes && Object.entries(task.assignmentNotes).filter(([, note]) => note).length > 0 && <div className="assignment-notes"><strong>Responsibility notes</strong>{Object.entries(task.assignmentNotes).map(([person, note]) => note ? <div key={person}><Avatar text={initials(person)} name={person} tone="indigo" /><span><b>{displayName(person)}</b> · {note}</span></div> : null)}</div>}</div>
      {task.progress > 0 && task.status !== "done" && (
        <div className="task-progress">
          <div className="progress-track"><span style={{ width: `${task.progress}%` }} /></div>
          <span>{task.progress}%</span>
        </div>
      )}
      {task.source && <div className="task-source"><MessageSquareText size={13} /> {task.source}</div>}
      {task.longRunning && <div className="hanuman-journal"><div className="hanuman-journal-head"><div><strong>HANUMAN task journal</strong><span>Keep the long journey visible without losing the next step.</span></div><span>{plural(task.updates?.length || 0, "update", "updates")}</span></div>{task.updates?.map(update => <div className="progress-update" key={update.id}><Avatar text={initials(update.addedBy)} name={update.addedBy} tone="saffron" /><div><p>{update.text}</p><small>{displayName(update.addedBy)} · {update.at}</small></div></div>)}<div className="journal-compose"><input value={journalDraft} onChange={event => setJournalDraft(event.target.value)} aria-label={`Progress update for ${task.title}`} placeholder="Write a progress update..." /><button className="outline-button" onClick={() => { onAddUpdate(task.id, journalDraft); setJournalDraft(""); }}><MessageSquareText size={13} /> Post update</button></div></div>}
      <div className="inline-subtask-add"><input value={subtaskDraft} onChange={event => setSubtaskDraft(event.target.value)} aria-label={`New subtask for ${task.title}`} placeholder="Add a subtask for this work..." /><button className="text-button" onClick={() => { onAddSubtask(task.id, subtaskDraft); setSubtaskDraft(""); }}><Plus size={13} /> Add subtask</button></div>
      {task.subtasks && task.subtasks.length > 0 && <div className="subtask-strip"><div className="subtask-heading"><ListTodo size={13} /> Subtasks <span>{task.subtasks.filter(subtask => subtask.done).length}/{task.subtasks.length}</span></div>{task.subtasks.map(subtask => <label className={`subtask-row ${subtask.done ? "done" : ""}`} key={subtask.id}><input type="checkbox" checked={subtask.done} onChange={() => onSubtaskToggle(task.id, subtask.id)} /><span>{subtask.title}</span><small>{displayName(subtask.addedBy)}</small></label>)}</div>}
      <div className="attachment-strip"><div className="attachment-heading"><Paperclip size={13} /> Files & links <span>{task.attachments?.length || 0}</span></div><div className="attachment-actions"><button onClick={() => onAttach(task.id, "evidence")}><Upload size={12} /> Add completion evidence</button><button onClick={() => onAttach(task.id, "material")}><FileText size={12} /> Add task guidance</button></div>{task.attachments && task.attachments.length > 0 && <div className="attachment-list">{task.attachments.map(attachment => <a key={attachment.id} href={attachment.url || "#"} target="_blank" rel="noreferrer" className={`attachment-chip ${attachment.kind}`} onClick={event => { if (!attachment.url) event.preventDefault(); }}><span>{attachment.type === "link" ? <ExternalLink size={12} /> : <Paperclip size={12} />}</span><strong>{attachment.name}</strong><small>{attachment.kind === "evidence" ? "Evidence" : "Helping material"} · {displayName(attachment.addedBy)}</small></a>)}</div>}</div>
      {task.status === "done" && <div className="completion-audit"><CheckCircle2 size={13} /> Marked complete by {displayName(task.completedBy || task.assignee)} · {task.completedAt || "29 Sep 2026, 4:12 PM"}<button className="text-button" onClick={() => onReopen(task.id)}><RotateCcw size={13} /> Reopen</button></div>}
    </article>
  );
}
