// "Today" and the date picker share one handler; a linked task you no longer own is marked (F24, D20); every field
// has an accessible name (D14).
import { useEffect } from "react";
import { isCurrentUser } from "../state/identity";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  ListChecks,
  Plus,
  ShieldCheck,
  Sparkles,
  Target,
  Save,
  Trash2,
} from "lucide-react";
import type { PersonalScheduleStatus } from "../state/types";
import { plannerToday } from "../state/seed";
import { useJambavan } from "../state/JambavanProvider";
import { useMyDay } from "../state/MyDayProvider";

export function MyDayView() {
  const { activeView, tasks } = useJambavan();
  const {
    myDayDate,
    changeMyDayDate,
    editingBlockId,
    cancelScheduleEdit,
    loadReviewDraft,
    top3Draft,
    setTop3Draft,
    scheduleDraft,
    setScheduleDraft,
    actionableDraft,
    setActionableDraft,
    reviewDraft,
    setReviewDraft,
    myDayPlan,
    myDayDateLabel,
    addTop3,
    addScheduleBlock,
    addPersonalActionable,
    removeLinkedTask,
    toggleTop3,
    toggleActionable,
    updateScheduleStatus,
    editScheduleBlock,
    deleteScheduleBlock,
    deleteActionable,
    saveDayReview,
  } = useMyDay();
  const isMyDay = activeView === "myDay";
  // F20: entering My day loads the saved review for the selected date into the draft.
  useEffect(() => {
    if (isMyDay) loadReviewDraft();
  }, [isMyDay]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      {activeView === "myDay" && (
        <section className="my-day-view">
          <div className="personal-plan-controls">
            <label htmlFor="my-day-date">
              Plan for
              <input
                id="my-day-date"
                type="date"
                value={myDayDate}
                onChange={event => {
                  if (event.target.value) changeMyDayDate(event.target.value);
                }}
              />
            </label>
            <button
              type="button"
              className="outline-button"
              onClick={() => changeMyDayDate(plannerToday)}
            >
              Today
            </button>
            <span>
              <ShieldCheck size={16} aria-hidden="true" /> Your plan stays out
              of team reports and dashboards.
            </span>
          </div>
          <div className="my-day-grid">
            <section className="my-day-card top3-card">
              <div className="my-day-card-head">
                <div>
                  <span className="eyebrow">
                    <Target size={13} /> Focus
                  </span>
                  <h3>Top 3 priorities</h3>
                </div>
                <span className="my-day-count">{myDayPlan.top3.length}/3</span>
              </div>
              <div className="my-day-list">
                {myDayPlan.top3.map(item => (
                  <label
                    className={`my-day-check-row ${item.done ? "done" : ""}`}
                    key={item.id}
                  >
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => toggleTop3(item.id)}
                    />
                    <span>{item.title}</span>
                  </label>
                ))}
              </div>
              {myDayPlan.top3.length < 3 && (
                <div className="my-day-quick-add">
                  <input
                    value={top3Draft}
                    onChange={event => setTop3Draft(event.target.value)}
                    onKeyDown={event => {
                      if (event.key === "Enter") addTop3();
                    }}
                    aria-label="Add a priority"
                    placeholder="Add a priority..."
                  />
                  <button className="text-button" onClick={addTop3}>
                    <Plus size={13} /> Add
                  </button>
                </div>
              )}
            </section>
            <section className="my-day-card schedule-card">
              <div className="my-day-card-head">
                <div>
                  <span className="eyebrow">
                    <Clock3 size={13} /> Time blocks
                  </span>
                  <h3>Schedule</h3>
                </div>
                <span className="my-day-count">
                  {myDayPlan.scheduleBlocks.length}
                </span>
              </div>
              <div className="schedule-list">
                {myDayPlan.scheduleBlocks.map(block => (
                  <div
                    className={`schedule-row status-${block.status.toLowerCase().replace(" ", "-")}`}
                    key={block.id}
                  >
                    <span className="schedule-time">
                      {block.start}
                      <br />
                      {block.end}
                    </span>
                    <div>
                      <strong>{block.title}</strong>
                      <small>
                        {block.category} · {block.status}
                      </small>
                    </div>
                    <select
                      aria-label={`Status for ${block.title}`}
                      value={block.status}
                      onChange={event =>
                        updateScheduleStatus(
                          block.id,
                          event.target.value as PersonalScheduleStatus
                        )
                      }
                    >
                      <option>Planned</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                      <option>Missed</option>
                    </select>
                    <button
                      className="text-button"
                      aria-pressed={editingBlockId === block.id}
                      onClick={() => editScheduleBlock(block.id)}
                    >
                      {editingBlockId === block.id ? "Editing" : "Edit"}
                    </button>
                    <button
                      className="icon-button subtle"
                      onClick={() => deleteScheduleBlock(block.id)}
                      aria-label="Delete time block"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="schedule-add-grid">
                {editingBlockId !== null && (
                  <span className="schedule-edit-note" role="status">
                    Editing a time block. Save it or cancel to keep the
                    original.
                  </span>
                )}
                <label className="planner-field planner-field-input">
                  Start
                  <input
                    type="time"
                    aria-label="Start time"
                    value={scheduleDraft.start}
                    onChange={event =>
                      setScheduleDraft(current => ({
                        ...current,
                        start: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="planner-field planner-field-input">
                  End
                  <input
                    type="time"
                    aria-label="End time"
                    value={scheduleDraft.end}
                    onChange={event =>
                      setScheduleDraft(current => ({
                        ...current,
                        end: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="planner-field planner-field-input">
                  Activity
                  <input
                    value={scheduleDraft.title}
                    onChange={event =>
                      setScheduleDraft(current => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    onKeyDown={event => {
                      if (event.key === "Enter") addScheduleBlock();
                    }}
                    aria-label="Activity or time block"
                    placeholder="Activity or time block"
                  />
                </label>
                <label className="planner-field planner-field-input">
                  Category
                  <input
                    value={scheduleDraft.category}
                    onChange={event =>
                      setScheduleDraft(current => ({
                        ...current,
                        category: event.target.value,
                      }))
                    }
                    aria-label="Category"
                    placeholder="Category"
                  />
                </label>
                {editingBlockId !== null ? (
                  <>
                    <button className="text-button" onClick={addScheduleBlock}>
                      <Save size={13} /> Save block
                    </button>
                    <button
                      className="text-button"
                      onClick={cancelScheduleEdit}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button className="text-button" onClick={addScheduleBlock}>
                    <Plus size={13} /> Add block
                  </button>
                )}
              </div>
            </section>
            <section className="my-day-card actionable-card">
              <div className="my-day-card-head">
                <div>
                  <span className="eyebrow">
                    <CheckCircle2 size={13} /> Personal tasks
                  </span>
                  <h3>Personal tasks</h3>
                </div>
                <span className="my-day-count">
                  {myDayPlan.actionables.filter(item => !item.done).length} open
                </span>
              </div>
              <div className="actionable-list">
                {myDayPlan.actionables.map(item => (
                  <div
                    className={`actionable-row ${item.done ? "done" : ""}`}
                    key={item.id}
                  >
                    <label>
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => toggleActionable(item.id)}
                      />
                      <span>
                        <strong>{item.title}</strong>
                        <small>
                          {item.notes || "No note"} · Due {item.due} ·{" "}
                          {item.priority}
                        </small>
                      </span>
                    </label>
                    <button
                      className="icon-button subtle"
                      onClick={() => deleteActionable(item.id)}
                      aria-label="Delete actionable"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="actionable-add-grid">
                <label className="planner-field planner-field-input">
                  Task
                  <input
                    value={actionableDraft.title}
                    onChange={event =>
                      setActionableDraft(current => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    aria-label="Personal actionable"
                    placeholder="What do you want to remember?"
                  />
                </label>
                <label className="planner-field planner-field-input">
                  Notes, optional
                  <input
                    value={actionableDraft.notes}
                    onChange={event =>
                      setActionableDraft(current => ({
                        ...current,
                        notes: event.target.value,
                      }))
                    }
                    aria-label="Optional note"
                    placeholder="Optional note"
                  />
                </label>
                <label className="planner-field planner-field-input">
                  Due date
                  <input
                    type="date"
                    aria-label="Actionable due date"
                    value={actionableDraft.due}
                    onChange={event =>
                      setActionableDraft(current => ({
                        ...current,
                        due: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="planner-field planner-field-select">
                  Priority
                  <select
                    aria-label="Actionable priority"
                    value={actionableDraft.priority}
                    onChange={event =>
                      setActionableDraft(current => ({
                        ...current,
                        priority: event.target.value as
                          | "High"
                          | "Medium"
                          | "Low",
                      }))
                    }
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </label>
                <button className="text-button" onClick={addPersonalActionable}>
                  <Plus size={13} /> Add
                </button>
              </div>
            </section>
            <section className="my-day-card academy-day-card">
              <div className="my-day-card-head">
                <div>
                  <span className="eyebrow">
                    <ListChecks size={13} /> Institute tasks
                  </span>
                  <h3>Linked institute tasks</h3>
                </div>
                <span className="my-day-count">
                  {myDayPlan.linkedTaskIds.length}
                </span>
              </div>
              <p className="my-day-help">
                Keep the institute tasks you want to work on alongside your
                personal plan. Their ownership rules still apply.
              </p>
              <div className="linked-task-list">
                {myDayPlan.linkedTaskIds.length === 0 ? (
                  <p className="empty-state">
                    Use "Add to My day" on an academy task assigned to you.
                  </p>
                ) : (
                  myDayPlan.linkedTaskIds.map(taskId => {
                    const task = tasks.find(item => item.id === taskId);
                    if (!task) return null;
                    return (
                      <div className="linked-task-row" key={task.id}>
                        <span
                          className={`category-pill category-${(task.category || "Squirrel").toLowerCase()}`}
                        >
                          {task.category || "Squirrel"}
                        </span>
                        <div>
                          <strong>{task.title}</strong>
                          <small>
                            {task.status === "done"
                              ? "Completed in academy task system"
                              : `${task.due} · ${task.status === "progress" ? "In progress" : "Open"}`}
                          </small>
                          {!isCurrentUser(task.assignee) && (
                            <small className="handed-over-note">
                              Handed over to {task.assignee}. It stays here
                              until you remove it.
                            </small>
                          )}
                        </div>
                        <button
                          className="text-button"
                          onClick={() => removeLinkedTask(task.id)}
                        >
                          Remove from My day
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>
          <section className="my-day-card end-day-card">
            <div>
              <span className="eyebrow">
                <Sparkles size={13} /> Review
              </span>
              <h3>End-of-day review</h3>
              <p>
                This private reflection stays with your selected date and is
                never included in management reporting.
              </p>
            </div>
            <div className="review-grid">
              <label>
                What did I complete?
                <textarea
                  value={reviewDraft.completed}
                  onChange={event =>
                    setReviewDraft(current => ({
                      ...current,
                      completed: event.target.value,
                    }))
                  }
                  placeholder="Work you completed"
                />
              </label>
              <label>
                What is still pending?
                <textarea
                  value={reviewDraft.pending}
                  onChange={event =>
                    setReviewDraft(current => ({
                      ...current,
                      pending: event.target.value,
                    }))
                  }
                  placeholder="Work still pending"
                />
              </label>
              <label>
                Tomorrow's main priority
                <textarea
                  value={reviewDraft.tomorrowPriority}
                  onChange={event =>
                    setReviewDraft(current => ({
                      ...current,
                      tomorrowPriority: event.target.value,
                    }))
                  }
                  placeholder="Your first priority for tomorrow"
                />
              </label>
              <button className="primary-button" onClick={saveDayReview}>
                <Save size={14} /> Save review
              </button>
            </div>
          </section>
        </section>
      )}
    </>
  );
}
