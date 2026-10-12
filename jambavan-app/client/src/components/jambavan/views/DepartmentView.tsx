import { ChevronDown } from "lucide-react";
import { departments } from "../state/seed";
import { findBlockingDependency } from "../state/dependencies";
import { TaskCard } from "../task/TaskCard";
import { useJambavan } from "../state/JambavanProvider";

export function DepartmentView() {
  const {
    activeView,
    tasks,
    departmentFilter,
    setDepartmentFilter,
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
  } = useJambavan();
  return (
    <>
      {activeView === "department" && (
        <>
          <section className="department-hero">
            <div>
              <span className="eyebrow">Academic · 18 people</span>
              <h2>Academic department</h2>
              <p>
                Shared tasks appear here. Private tasks stay private, while
                department heads retain full visibility.
              </p>
            </div>
            <div className="department-score">
              <strong>76%</strong>
              <span>completion this week</span>
              <div className="progress-track">
                <span style={{ width: "76%" }} />
              </div>
            </div>
          </section>
          <div className="section-header">
            <div>
              <h2>Department work</h2>
              <p>Open tasks and completion details from Academic.</p>
            </div>
            <div className="filter-row">
              <div className="select-wrap">
                <select
                  value={departmentFilter}
                  onChange={event => setDepartmentFilter(event.target.value)}
                >
                  <option>Academic</option>
                  <option>All departments</option>
                  {departments
                    .filter(d => d.name !== "Academic")
                    .map(dept => (
                      <option key={dept.name}>{dept.name}</option>
                    ))}
                </select>
                <ChevronDown size={14} />
              </div>
            </div>
          </div>
          <div className="task-list">
            {tasks
              .filter(
                task =>
                  !task.archived &&
                  task.department ===
                    (departmentFilter === "All departments"
                      ? "Academic"
                      : departmentFilter)
              )
              .map(task => (
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
        </>
      )}
    </>
  );
}
