// Moved from pages/Home.tsx (checkpoint 5f248af) in increment 0 (§13).
// Phase 5: the notice board and feedback moved to the Notices & feedback view (IA-3), leaving a "Latest notices"
// card; the dead focus-banner arrow is removed (IA-6); the tiles are computed from tasks (IA-7, C2); filters are
// named; an empty filtered list says so; a project filter chip (IA-6 "View tasks") can be cleared.
import { AlertCircle, ArrowUpRight, CheckCircle2, ChevronDown, Clock3, Filter, ListChecks, LockKeyhole, Plus, Target, ListTodo, Megaphone, ImageIcon, Mic, Video, Send, MessageCircleQuestion, BarChart3, Star, CheckCheck, Archive, X } from "lucide-react";
import type { Status, TaskCategory, Notice, Task } from "../state/types";
import { taskCategories, departments } from "../state/seed";
import { myOpenTasks, dueTodayCount, teamFollowUps, needsAttention } from "../state/selectors";
import { findBlockingDependency } from "../state/dependencies";
import { Avatar } from "../art/Avatar";
import { TaskCard } from "../task/TaskCard";
import { useJambavan } from "../state/JambavanProvider";

export function FeedView() {
  const { activeView, setActiveView, projectFilter, setProjectFilter, tasks, departmentFilter, setDepartmentFilter, categoryFilter, setCategoryFilter, statusFilter, setStatusFilter, archiveFilter, setArchiveFilter, setShowNoticeModal, noticeList, showNoticeBin, setShowNoticeBin, feedbackRequests, setShowFeedbackModal, eventPlans, notice, setNotice, visibleTasks, downstreamByTask, completeTask, openHandoverModal, toggleAssistant, toggleSubtask, openAttachmentModal, reopenTask, editTask, archiveTask, addTaskUpdate, addTaskSubtask, reportTaskBlocker, acknowledgeTask, acknowledgeNotice, submitNoticeReply, respondFeedback } = useJambavan();
  return (
    <>
          {activeView === "feed" && <>
            <section className="focus-banner">
              <div className="focus-icon"><Target size={22} /></div>
              <div><strong>Keep the October Launch moving.</strong><p>2 open actions came from yesterday’s meetings. You’re 68% through today’s focus.</p></div>
              <div className="focus-progress"><span>68%</span><div className="progress-track"><span style={{ width: "68%" }} /></div></div>
            </section>

            <section className="hanuman-overview"><div className="hanuman-overview-mark">ॐ</div><div className="hanuman-overview-copy"><span className="eyebrow">HANUMAN tasks · long journeys</span><h2>Big responsibilities stay visible.</h2><p>Year-long workstreams remain in the feed with their own progress journal and growing subtask map.</p></div><div className="hanuman-mini-list">{tasks.filter(task => task.longRunning).map(task => <div key={task.id}><Avatar text={task.initials} name={task.assignee} tone="saffron" /><span><strong>{task.title}</strong><small>{task.progress}% · {task.updates?.length || 0} updates · Owner {task.assignee}</small></span></div>)}</div></section>

            <section className="latest-notices" aria-labelledby="latest-notices-title"><div className="latest-notices-head"><div><span className="eyebrow"><Megaphone size={14} /> Notice board</span><h2 id="latest-notices-title">Latest notices</h2></div><button className="outline-button" onClick={() => setActiveView("notices")}>Open notices & feedback</button></div><ul>{noticeList.filter(item => !item.binnedAt).slice(0, 2).map(item => <li key={item.id}><span><strong>{item.title}</strong><small>{item.sentAt} · {item.sender}</small></span><button className="notice-seen-button" aria-pressed={Boolean(item.seenBy?.includes("You"))} onClick={() => acknowledgeNotice(item.id)}><CheckCheck size={12} /> {item.seenBy?.includes("You") ? "Seen" : "Seen by me"}</button></li>)}</ul><div className="latest-notices-foot"><span>{feedbackRequests.filter(request => !request.responses.You).length} feedback request{feedbackRequests.filter(request => !request.responses.You).length === 1 ? "" : "s"} waiting for your answer</span></div></section>


            <section className="metric-grid">
              <div className="metric-card"><span className="metric-icon blue"><ListChecks size={18} /></span><div><span>My open work</span><strong>{myOpenTasks(tasks).length}</strong></div><small>{dueTodayCount(myOpenTasks(tasks))} due today</small></div>
              <div className="metric-card"><span className="metric-icon saffron"><Clock3 size={18} /></span><div><span>Team follow-ups</span><strong>{teamFollowUps(tasks).length}</strong></div><small>{teamFollowUps(tasks).filter(task => task.kind === "MOM action").length} from MOM</small></div>
              <div className="metric-card"><span className="metric-icon mint"><CheckCircle2 size={18} /></span><div><span>Completed tasks</span><strong>{tasks.filter(task => !task.archived && task.status === "done").length}</strong></div><small>Confirmed by their Task Owners</small></div>
              <div className="metric-card"><span className="metric-icon coral"><AlertCircle size={18} /></span><div><span>Needs attention</span><strong>{needsAttention(tasks).count}</strong></div><small className="negative">{needsAttention(tasks).overdue} overdue · {needsAttention(tasks).blocked} blocked</small></div>
            </section>

            <div className="category-strip"><div className="category-strip-head"><div><span className="eyebrow"><ListTodo size={13} /> Task families</span><h2>See work in its natural category.</h2></div><span>{categoryFilter === "All categories" ? "All four categories" : `${categoryFilter} tasks`}</span></div><div className="category-tabs"><button className={categoryFilter === "All categories" ? "active" : ""} onClick={() => setCategoryFilter("All categories")}>All <small>{tasks.length}</small></button>{taskCategories.map(category => <button key={category} className={categoryFilter === category ? `active category-${category.toLowerCase()}` : `category-${category.toLowerCase()}`} onClick={() => setCategoryFilter(category)}><span>{category}</span><small>{tasks.filter(task => task.category === category).length}</small></button>)}</div></div>
            <div className="section-header"><div><h2>Work in motion</h2><p>Tasks across you, your team, and your department.</p></div><div className="filter-row"><div className="select-wrap"><Filter size={14} /><select aria-label="Filter by department" value={departmentFilter} onChange={event => setDepartmentFilter(event.target.value)}><option>All departments</option>{departments.map(dept => <option key={dept.name}>{dept.name}</option>)}</select></div><div className="select-wrap"><select aria-label="Filter by task family" value={categoryFilter} onChange={event => setCategoryFilter(event.target.value as "All categories" | TaskCategory)}><option>All categories</option>{taskCategories.map(category => <option key={category}>{category}</option>)}</select><ChevronDown size={14} /></div><div className="select-wrap"><select aria-label="Filter by status" value={statusFilter} onChange={event => setStatusFilter(event.target.value as "All work" | Status)}><option>All work</option><option value="todo">Not started</option><option value="progress">In progress</option><option value="blocked">Blocked</option><option value="done">Completed</option></select><ChevronDown size={14} /></div><div className="select-wrap"><select aria-label="Show active or archived tasks" value={archiveFilter} onChange={event => setArchiveFilter(event.target.value as "Active tasks" | "Archived tasks")}><option>Active tasks</option><option>Archived tasks</option></select><Archive size={13} /></div></div></div>
            {projectFilter && <div className="project-filter-chip">Project: {projectFilter}<button aria-label={`Clear project filter ${projectFilter}`} onClick={() => setProjectFilter(null)}><X size={14} /></button></div>}
            {visibleTasks.length === 0 && <p className="task-list-empty" role="status">No tasks match these filters. Change a filter above to see more work.</p>}
            <div className="task-list">{visibleTasks.map(task => <TaskCard key={task.id} task={task} onComplete={completeTask} onAssistantToggle={toggleAssistant} onReopen={reopenTask} onEdit={editTask} onAttach={openAttachmentModal} onSubtaskToggle={toggleSubtask} onAddUpdate={addTaskUpdate} onAddSubtask={addTaskSubtask} onAcknowledge={acknowledgeTask} onArchive={archiveTask} onReportBlocker={reportTaskBlocker} onHandover={openHandoverModal} blockingDependency={findBlockingDependency(task, tasks)} downstreamTasks={downstreamByTask.get(task.id) || []} />)}</div>
          </>}
    </>
  );
}
