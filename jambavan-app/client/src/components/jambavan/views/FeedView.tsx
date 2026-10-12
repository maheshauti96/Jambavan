import { CheckCheck, ChevronDown, Filter, X } from "lucide-react";
import { taskCategories, departments } from "../state/seed";
import {
  dueTodayCount,
  familyCounts,
  journeyPct,
  myOpenTasks,
  needsAttention,
  teamFollowUps,
  todaysMission,
} from "../state/selectors";
import { findBlockingDependency } from "../state/dependencies";
import { TaskCard } from "../task/TaskCard";
import { EmptyState } from "../primitives/EmptyState";
import { RamSetuProgress } from "../progress/RamSetuProgress";
import { useJambavan } from "../state/JambavanProvider";

export function FeedView() {
  const {
    activeView,
    setActiveView,
    projectFilter,
    setProjectFilter,
    tasks,
    departmentFilter,
    setDepartmentFilter,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    archiveFilter,
    setArchiveFilter,
    noticeList,
    feedbackRequests,
    visibleTasks,
    downstreamByTask,
    completeTask,
    openHandoverModal,
    toggleAssistant,
    toggleSubtask,
    openAttachmentModal,
    reopenTask,
    editTask,
    archiveTask,
    addTaskUpdate,
    addTaskSubtask,
    reportTaskBlocker,
    acknowledgeTask,
    acknowledgeNotice,
  } = useJambavan();
  if (activeView !== "feed") return null;
  const owned = myOpenTasks(tasks);
  const attention = needsAttention(tasks);
  const counts = familyCounts(
    tasks.filter(task =>
      archiveFilter === "Archived tasks" ? task.archived : !task.archived
    )
  );
  const familyTotal = Object.values(counts).reduce(
    (sum, count) => sum + count,
    0
  );
  const feedbackCount = feedbackRequests.filter(
    request => !request.responses.You
  ).length;
  return (
    <>
      <section className="feed-stats" aria-label="Task summary">
        <div className="feed-stat">
          <div>
            <span>Your open tasks</span>
            <small>{dueTodayCount(owned)} due today</small>
          </div>
          <strong>{owned.length}</strong>
        </div>
        <div className="feed-stat">
          <div>
            <span>Needs attention</span>
            <small>
              {attention.overdue} overdue · {attention.blocked} blocked
            </small>
          </div>
          <strong>{attention.count}</strong>
        </div>
        <div className="feed-stat">
          <div>
            <span>Team follow-ups</span>
            <small>Tasks with contributors</small>
          </div>
          <strong>{teamFollowUps(tasks).length}</strong>
        </div>
        <div className="feed-stat">
          <div>
            <span>Completed tasks</span>
            <small>Confirmed by their owners</small>
          </div>
          <strong>
            {
              tasks.filter(task => !task.archived && task.status === "done")
                .length
            }
          </strong>
        </div>
      </section>
      <div className="feed-body">
        <div className="feed-work">
          <div className="task-toolbar">
            <h2>Tasks</h2>
            <details className="task-filter-disclosure">
              <summary>
                <Filter size={17} />
                Filters
                <ChevronDown size={16} />
              </summary>
              <div className="task-filter-fields">
                <label>
                  Department
                  <select
                    aria-label="Filter by department"
                    value={departmentFilter}
                    onChange={event => setDepartmentFilter(event.target.value)}
                  >
                    <option>All departments</option>
                    {departments.map(item => (
                      <option key={item.name}>{item.name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Status
                  <select
                    aria-label="Filter by status"
                    value={statusFilter}
                    onChange={event => {
                      const value = event.target.value;
                      if (
                        value === "All work" ||
                        value === "todo" ||
                        value === "progress" ||
                        value === "blocked" ||
                        value === "done"
                      )
                        setStatusFilter(value);
                    }}
                  >
                    <option value="All work">All work</option>
                    <option value="todo">Not started</option>
                    <option value="progress">In progress</option>
                    <option value="blocked">Blocked</option>
                    <option value="done">Completed</option>
                  </select>
                </label>
                <label>
                  Show
                  <select
                    aria-label="Show active or archived tasks"
                    value={archiveFilter}
                    onChange={event => {
                      const value = event.target.value;
                      if (
                        value === "Active tasks" ||
                        value === "Archived tasks"
                      )
                        setArchiveFilter(value);
                    }}
                  >
                    <option>Active tasks</option>
                    <option>Archived tasks</option>
                  </select>
                </label>
              </div>
            </details>
          </div>
          <div
            className="category-tabs"
            role="group"
            aria-label="Filter by task family"
          >
            <button
              type="button"
              className={categoryFilter === "All categories" ? "active" : ""}
              aria-pressed={categoryFilter === "All categories"}
              onClick={() => setCategoryFilter("All categories")}
            >
              All<span>{familyTotal}</span>
            </button>
            {taskCategories.map(category => (
              <button
                type="button"
                key={category}
                className={categoryFilter === category ? "active" : ""}
                aria-pressed={categoryFilter === category}
                onClick={() => setCategoryFilter(category)}
              >
                {category}
                <span>{counts[category]}</span>
              </button>
            ))}
          </div>
          {projectFilter && (
            <div className="project-filter-chip">
              <span>Project · {projectFilter}</span>
              <button
                type="button"
                className="icon-button"
                aria-label="Clear project filter"
                onClick={() => setProjectFilter(null)}
              >
                <X size={17} />
              </button>
            </div>
          )}
          {visibleTasks.length === 0 && (
            <EmptyState
              symbol={archiveFilter === "Archived tasks" ? "diya" : "path"}
              title="No tasks match these filters"
            >
              <span>Change a filter to see more work.</span>
              <button
                type="button"
                className="outline-button"
                onClick={() => {
                  setDepartmentFilter("All departments");
                  setCategoryFilter("All categories");
                  setStatusFilter("All work");
                  setProjectFilter(null);
                  setArchiveFilter("Active tasks");
                }}
              >
                Reset filters
              </button>
            </EmptyState>
          )}
          <div className="task-list">
            {visibleTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={completeTask}
                onAssistantToggle={toggleAssistant}
                onReopen={reopenTask}
                onEdit={editTask}
                onAttach={openAttachmentModal}
                onSubtaskToggle={toggleSubtask}
                onAddUpdate={addTaskUpdate}
                onAddSubtask={addTaskSubtask}
                onAcknowledge={acknowledgeTask}
                onArchive={archiveTask}
                onReportBlocker={reportTaskBlocker}
                onHandover={openHandoverModal}
                blockingDependency={findBlockingDependency(task, tasks)}
                downstreamTasks={downstreamByTask.get(task.id) || []}
              />
            ))}
          </div>
        </div>
        <aside
          className="feed-rail"
          aria-label="Progress and institute updates"
        >
          <section>
            <h2>Your Setu</h2>
            <RamSetuProgress
              value={journeyPct(todaysMission(tasks))}
              label="Today's work"
              size="md"
            />
            <p className="latest-notices-foot">
              Progress across your daily tasks. Completed tasks add stones to
              the bridge.
            </p>
          </section>
          <section
            className="latest-notices"
            aria-labelledby="latest-notices-title"
          >
            <h2 id="latest-notices-title">Latest notices</h2>
            <ul>
              {noticeList
                .filter(item => !item.binnedAt)
                .slice(0, 2)
                .map(item => (
                  <li key={item.id}>
                    <strong>{item.title}</strong>
                    <small>
                      {item.sentAt} · {item.sender}
                    </small>
                    <button
                      type="button"
                      className="notice-seen-button"
                      aria-pressed={Boolean(item.seenBy?.includes("You"))}
                      onClick={() => acknowledgeNotice(item.id)}
                    >
                      <CheckCheck size={16} />
                      {item.seenBy?.includes("You") ? "Seen" : "Mark seen"}
                    </button>
                  </li>
                ))}
            </ul>
            <p className="latest-notices-foot">
              {feedbackCount} feedback{" "}
              {feedbackCount === 1 ? "request" : "requests"} to answer
            </p>
            <button
              type="button"
              className="outline-button"
              onClick={() => setActiveView("notices")}
            >
              Open notices & feedback
            </button>
          </section>
        </aside>
      </div>
    </>
  );
}
