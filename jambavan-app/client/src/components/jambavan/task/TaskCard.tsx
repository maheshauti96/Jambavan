import { useRef, useState } from "react";
import {
  AlertCircle,
  Archive,
  ArchiveRestore,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronDown,
  FileText,
  LockKeyhole,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sunrise,
  ThumbsUp,
  Upload,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AttachmentKind, BlockerReason, Task } from "../state/types";
import { blockerReasons } from "../state/seed";
import { initials, statusLabel } from "../state/format";
import { displayName, isCurrentUser } from "../state/identity";
import { journeyPct, projectProgress, todaysMission } from "../state/selectors";
import { Avatar } from "../art/Avatar";
import {
  FamilyBadge,
  PriorityBadge,
  SourceBadge,
  StatusBadge,
} from "../primitives/Badge";
import { MissionArrow, Sanjeevani, TargetHit } from "../icons/RamayanaIcons";
import { RamSetuProgress } from "../progress/RamSetuProgress";
import { useMyDay } from "../state/MyDayProvider";
import { useJambavan } from "../state/JambavanProvider";

type TaskCardProps = {
  task: Task;
  onComplete: (id: number) => void;
  onAssistantToggle: (taskId: number, assistantName: string) => void;
  onReopen: (id: number) => void;
  onEdit: (task: Task) => void;
  onAttach: (taskId: number, kind: AttachmentKind) => void;
  onSubtaskToggle: (taskId: number, subtaskId: number) => void;
  onAddUpdate: (taskId: number, text: string) => void;
  onAddSubtask: (taskId: number, title: string) => void;
  onAcknowledge: (taskId: number, mode: "seen" | "ack") => void;
  onArchive: (taskId: number) => void;
  onReportBlocker: (
    taskId: number,
    reason: BlockerReason,
    note?: string
  ) => void;
  onHandover: (task: Task) => void;
  blockingDependency?: Task;
  downstreamTasks: Task[];
};

export function TaskCard({
  task,
  onComplete,
  onAssistantToggle,
  onReopen,
  onEdit,
  onAttach,
  onSubtaskToggle,
  onAddUpdate,
  onAddSubtask,
  onAcknowledge,
  onArchive,
  onReportBlocker,
  onHandover,
  blockingDependency,
  downstreamTasks,
}: TaskCardProps) {
  const { addTaskToMyDay, myDayPlan } = useMyDay();
  const { accessMatrix, clearTaskBlocker, tasks } = useJambavan();
  const [journalDraft, setJournalDraft] = useState("");
  const [subtaskDraft, setSubtaskDraft] = useState("");
  const [blockerNote, setBlockerNote] = useState("");
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const handoverPending = useRef(false);
  const [completionFrom, setCompletionFrom] = useState<number | null>(null);
  const ownTask = isCurrentUser(task.assignee);
  const inMyDay = myDayPlan.linkedTaskIds.includes(task.id);
  const canHandOver =
    ownTask || accessMatrix["Department Head"]["Edit or reassign tasks"];
  const seen = (task.seenBy || []).some(isCurrentUser);
  const acknowledged = (task.acknowledgedBy || []).some(isCurrentUser);
  const partsDone = task.assistants.filter(
    assistant => assistant.completed
  ).length;
  const progress = task.project
    ? projectProgress(task.project, tasks).pct
    : journeyPct(todaysMission(tasks));
  const finishTask = () => {
    setCompletionFrom(progress);
    onComplete(task.id);
  };
  const addSubtask = () => {
    if (!subtaskDraft.trim()) return;
    onAddSubtask(task.id, subtaskDraft.trim());
    setSubtaskDraft("");
  };
  const postUpdate = () => {
    if (!journalDraft.trim()) return;
    onAddUpdate(task.id, journalDraft.trim());
    setJournalDraft("");
  };

  return (
    <article
      className={`task-card ${task.status === "done" ? "is-done" : ""}`}
      data-family={task.category || "Squirrel"}
      aria-labelledby={`task-${task.id}-title`}
    >
      <div className="task-card-header">
        <div className="task-badges">
          <FamilyBadge category={task.category || "Squirrel"} />
          <SourceBadge task={task} className="task-source-badge" />
          <StatusBadge value={task.status} />
        </div>
        <div className="task-card-actions">
          <button
            type="button"
            className="icon-button"
            aria-label={`Edit task: ${task.title}`}
            onClick={() => onEdit(task)}
          >
            <Pencil size={18} />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="icon-button"
                ref={moreButtonRef}
                aria-label={`More actions: ${task.title}`}
              >
                <MoreHorizontal size={19} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onCloseAutoFocus={event => {
                if (handoverPending.current) {
                  event.preventDefault();
                  moreButtonRef.current?.focus();
                  handoverPending.current = false;
                  onHandover(task);
                } else if (!moreButtonRef.current?.isConnected) {
                  event.preventDefault();
                  document
                    .querySelector<HTMLElement>(
                      ".task-filter-disclosure summary, .page-action"
                    )
                    ?.focus();
                }
              }}
            >
              {task.status !== "done" && canHandOver && (
                <DropdownMenuItem
                  onSelect={() => {
                    handoverPending.current = true;
                  }}
                >
                  Hand over task
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onSelect={() => onArchive(task.id)}>
                {task.archived ? (
                  <ArchiveRestore size={16} />
                ) : (
                  <Archive size={16} />
                )}
                {task.archived ? "Restore task" : "Archive task"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <h3 id={`task-${task.id}-title`} tabIndex={-1}>
        {task.title}
      </h3>
      <div className="task-meta-row">
        <span className={task.due.startsWith("Overdue") ? "overdue" : ""}>
          <CalendarDays size={16} />
          {task.due}
        </span>
        <PriorityBadge value={task.priority} />
        {task.visibility === "Private" && (
          <span>
            <LockKeyhole size={15} />
            Private
          </span>
        )}
        {task.isTeamTask && (
          <span>
            <Users size={15} />
            Team task
          </span>
        )}
        {task.project && <span>{task.project}</span>}
      </div>
      {blockingDependency && (
        <div className="dependency-blocked">
          <AlertCircle size={17} />
          <span>
            Waiting on <strong>{blockingDependency.title}</strong> ·{" "}
            {statusLabel(blockingDependency.status)}
            {blockingDependency.archived ? " · Archived" : ""}
          </span>
        </div>
      )}
      {!blockingDependency &&
        task.status !== "done" &&
        downstreamTasks.length > 0 && (
          <p className="dependency-downstream">
            {downstreamTasks.length}{" "}
            {downstreamTasks.length === 1 ? "task waits" : "tasks wait"} on this
            task.
          </p>
        )}
      {task.status !== "done" && task.blocker && (
        <div className="blocker-summary">
          <Sanjeevani size={18} />
          <span>
            <strong>{task.blocker.reason}</strong>
            {task.blocker.note ? ` · ${task.blocker.note}` : ""}
          </span>
        </div>
      )}
      <div className="task-owner-row">
        <Avatar
          text={task.initials}
          name={task.assignee}
          tone={task.department.toLowerCase()}
        />
        <div>
          <span className="owner-name">{displayName(task.assignee)}</span>
          <span className="owner-team">
            Task owner ·{" "}
            {task.team === task.department
              ? task.department
              : `${task.team} · ${task.department}`}
          </span>
        </div>
        {task.assistants.length > 0 && (
          <span className="task-contributors">
            <Users size={15} />
            {partsDone}/{task.assistants.length} parts done
          </span>
        )}
      </div>
      {task.progress > 0 && task.status !== "done" && (
        <div className="task-progress">
          {task.longRunning ? (
            <RamSetuProgress
              value={task.progress}
              label={task.title}
              size="sm"
              showStage={false}
            />
          ) : (
            <div className="task-progress-bar">
              <div
                className="progress-track"
                role="progressbar"
                aria-label={`${task.title} progress`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={task.progress}
              >
                <span style={{ width: `${task.progress}%` }} />
              </div>
              <span>{task.progress}%</span>
            </div>
          )}
        </div>
      )}
      <div className="task-card-footer">
        {task.status !== "done" ? (
          ownTask ? (
            <button
              type="button"
              className="complete-button"
              onClick={finishTask}
            >
              <MissionArrow size={18} />
              Complete task
            </button>
          ) : (
            <span className="owner-only">
              <ShieldCheck size={16} />
              Only the owner completes
            </span>
          )
        ) : (
          <span className="done-stamp">
            <TargetHit size={18} />
            Completed by {displayName(task.completedBy || task.assignee)}
          </span>
        )}
        <button
          type="button"
          className={`ack-button ${seen ? "active" : ""}`}
          aria-pressed={seen}
          onClick={() => onAcknowledge(task.id, "seen")}
        >
          <CheckCheck size={16} />
          {seen ? "Seen" : "Mark seen"}
        </button>
        <button
          type="button"
          className={`ack-button ${acknowledged ? "active" : ""}`}
          aria-pressed={acknowledged}
          onClick={() => onAcknowledge(task.id, "ack")}
        >
          <ThumbsUp size={16} />
          {acknowledged ? "Acknowledged" : "Acknowledge"}
        </button>
        {ownTask && (
          <button
            type="button"
            className="text-button"
            aria-pressed={inMyDay}
            onClick={() => {
              if (!inMyDay) addTaskToMyDay(task.id);
            }}
          >
            {inMyDay ? <Check size={17} /> : <Sunrise size={17} />}
            {inMyDay ? "In My day" : "Add to My day"}
          </button>
        )}
        {task.status === "done" && (
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setCompletionFrom(null);
              onReopen(task.id);
            }}
          >
            <RotateCcw size={16} />
            Reopen
          </button>
        )}
      </div>
      {task.status === "done" && completionFrom !== null && (
        <div className="completion-reward" role="status">
          <RamSetuProgress
            value={progress}
            from={completionFrom}
            label={task.project || "Today's work"}
            size="sm"
            showStage={false}
          />
          <span>Task completed. Your Setu is {progress}% complete.</span>
        </div>
      )}
      <div className="task-disclosures">
        {task.status !== "done" && (
          <details className="blocker-checkin">
            <summary>
              <Sanjeevani size={17} />
              {task.blocker ? "Update blocker" : "Report a blocker"}
              <ChevronDown size={16} />
            </summary>
            <p>
              Choose what is holding up the task. A reason is recorded as soon
              as you select it.
            </p>
            <div
              className="blocker-options"
              role="group"
              aria-label={`Blocker reason for ${task.title}`}
            >
              {blockerReasons.map(reason => (
                <button
                  type="button"
                  key={reason}
                  className={task.blocker?.reason === reason ? "selected" : ""}
                  aria-pressed={task.blocker?.reason === reason}
                  onClick={() =>
                    onReportBlocker(
                      task.id,
                      reason,
                      blockerNote.trim() || undefined
                    )
                  }
                >
                  {task.blocker?.reason === reason && <Check size={14} />}
                  {reason}
                </button>
              ))}
            </div>
            <label className="blocker-note">
              Context, optional
              <input
                value={blockerNote}
                onChange={event => setBlockerNote(event.target.value)}
                placeholder="What would help you continue?"
              />
            </label>
            {task.blocker && (
              <div className="blocker-current">
                <small>
                  Reported by {displayName(task.blocker.reportedBy)}
                </small>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => clearTaskBlocker(task.id)}
                >
                  <Check size={16} />
                  Clear blocker
                </button>
              </div>
            )}
          </details>
        )}
        {task.handover && (
          <details className="handover-summary">
            <summary>
              Handed over by {displayName(task.handover.from)}
              <ChevronDown size={16} />
            </summary>
            <small>
              For {displayName(task.handover.to)} · {task.handover.createdAt}
            </small>
            <dl className="handover-summary-grid">
              <div>
                <dt>Status at handover</dt>
                <dd>{task.handover.statusSummary}</dd>
              </div>
              <div>
                <dt>Last action</dt>
                <dd>{task.handover.lastAction}</dd>
              </div>
              <div>
                <dt>Waiting for</dt>
                <dd>{task.handover.waitingFor}</dd>
              </div>
              <div>
                <dt>Next action</dt>
                <dd>{task.handover.nextAction}</dd>
              </div>
              <div>
                <dt>Notes</dt>
                <dd>{task.handover.notes || "No notes added."}</dd>
              </div>
              <div>
                <dt>Recorded by</dt>
                <dd>
                  {displayName(task.handover.createdBy || task.handover.from)}
                </dd>
              </div>
            </dl>
          </details>
        )}
        <details className="task-details">
          <summary>
            {task.longRunning ? "Updates & details" : "Task details"}
            <ChevronDown size={16} />
          </summary>
          <div className="task-detail-body">
            {task.source && (
              <div>
                <h4>Source</h4>
                <p>{task.source}</p>
              </div>
            )}
            {task.assistants.length > 0 && (
              <div>
                <h4>
                  Contributors · {partsDone} of {task.assistants.length} parts
                  done
                </h4>
                <div className="assistant-list">
                  {task.assistants.map(assistant => (
                    <button
                      type="button"
                      key={assistant.name}
                      className={`assistant-chip ${assistant.completed ? "complete" : ""}`}
                      aria-pressed={assistant.completed}
                      onClick={() => onAssistantToggle(task.id, assistant.name)}
                    >
                      <Avatar
                        text={assistant.initials}
                        name={assistant.name}
                        tone={assistant.department.toLowerCase()}
                      />
                      {assistant.completed && <Check size={15} />}
                      {displayName(assistant.name)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {task.assignmentNotes &&
              Object.entries(task.assignmentNotes).some(([, note]) => note) && (
                <div className="assignment-notes">
                  <h4>Responsibilities</h4>
                  {Object.entries(task.assignmentNotes)
                    .filter(([, note]) => note)
                    .map(([person, note]) => (
                      <div key={person}>
                        <Avatar text={initials(person)} name={person} />
                        <span>
                          <strong>{displayName(person)}</strong> · {note}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            {task.longRunning && (
              <div className="hanuman-journal">
                <h4>Progress updates · {task.updates?.length || 0}</h4>
                {task.updates?.map(update => (
                  <div className="progress-update" key={update.id}>
                    <Avatar
                      text={initials(update.addedBy)}
                      name={update.addedBy}
                    />
                    <div>
                      <p>{update.text}</p>
                      <small>
                        {displayName(update.addedBy)} · {update.at}
                      </small>
                    </div>
                  </div>
                ))}
                <label htmlFor={`journal-${task.id}`}>
                  Add a progress update
                </label>
                <div className="journal-compose">
                  <input
                    id={`journal-${task.id}`}
                    value={journalDraft}
                    onChange={event => setJournalDraft(event.target.value)}
                    onKeyDown={event => {
                      if (event.key === "Enter") postUpdate();
                    }}
                  />
                  <button
                    type="button"
                    className="outline-button"
                    disabled={!journalDraft.trim()}
                    onClick={postUpdate}
                  >
                    Post update
                  </button>
                </div>
              </div>
            )}
            <div>
              <h4>
                Subtasks ·{" "}
                {task.subtasks?.filter(item => item.done).length || 0}/
                {task.subtasks?.length || 0}
              </h4>
              {task.subtasks?.map(subtask => (
                <label
                  className={`subtask-row ${subtask.done ? "done" : ""}`}
                  key={subtask.id}
                >
                  <input
                    type="checkbox"
                    checked={subtask.done}
                    onChange={() => onSubtaskToggle(task.id, subtask.id)}
                  />
                  <span>{subtask.title}</span>
                  <small>{displayName(subtask.addedBy)}</small>
                </label>
              ))}
              <label htmlFor={`subtask-${task.id}`}>Add a subtask</label>
              <div className="inline-subtask-add">
                <input
                  id={`subtask-${task.id}`}
                  value={subtaskDraft}
                  onChange={event => setSubtaskDraft(event.target.value)}
                  onKeyDown={event => {
                    if (event.key === "Enter") addSubtask();
                  }}
                />
                <button
                  type="button"
                  className="outline-button"
                  disabled={!subtaskDraft.trim()}
                  onClick={addSubtask}
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
            </div>
            <div>
              <h4>Files & links · {task.attachments?.length || 0}</h4>
              <div className="attachment-actions">
                <button
                  type="button"
                  className="outline-button"
                  onClick={() => onAttach(task.id, "evidence")}
                >
                  <Upload size={16} />
                  Add evidence
                </button>
                <button
                  type="button"
                  className="outline-button"
                  onClick={() => onAttach(task.id, "material")}
                >
                  <FileText size={16} />
                  Add guidance
                </button>
              </div>
              <div className="attachment-list">
                {task.attachments?.map(attachment => (
                  <a
                    key={attachment.id}
                    href={attachment.url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="attachment-chip"
                    onClick={event => {
                      if (!attachment.url) event.preventDefault();
                    }}
                  >
                    <Paperclip size={16} />
                    <strong>{attachment.name}</strong>
                    <small>
                      {attachment.kind === "evidence" ? "Evidence" : "Guidance"}{" "}
                      · {displayName(attachment.addedBy)}
                    </small>
                  </a>
                ))}
              </div>
            </div>
            <small>
              {(task.seenBy?.length || 0) === 0
                ? "No views recorded yet."
                : `Seen by ${task.seenBy?.length} people.`}
              {task.completedAt ? ` Completed ${task.completedAt}.` : ""}
            </small>
          </div>
        </details>
      </div>
    </article>
  );
}
