// tasks", which filters Task feed by project (IA-6); the dead "New project" button is removed (IA-6, C3).
import { RamSetuProgress } from "../progress/RamSetuProgress";
import { EmptyState } from "../primitives/EmptyState";
import { ArrowUpRight } from "lucide-react";
import { projects } from "../state/seed";
import { projectProgress } from "../state/selectors";
import { useJambavan } from "../state/JambavanProvider";

export function ProjectsView() {
  const {
    activeView,
    tasks,
    setActiveView,
    setProjectFilter,
    setDepartmentFilter,
    setStatusFilter,
    setCategoryFilter,
    setArchiveFilter,
  } = useJambavan();
  const viewTasks = (name: string) => {
    setDepartmentFilter("All departments");
    setStatusFilter("All work");
    setCategoryFilter("All categories");
    setArchiveFilter("Active tasks");
    setProjectFilter(name);
    setActiveView("feed");
  };
  return (
    <>
      {activeView === "projects" && (
        <>
          <div className="section-header">
            <div>
              <h2>Project progress</h2>
              <p>Progress comes from the tasks linked to each project.</p>
            </div>
          </div>
          {projects.length === 0 && (
            <EmptyState symbol="setu" title="No projects yet">
              Add a project to group related tasks.
            </EmptyState>
          )}
          <div className="project-grid">
            {projects.map(project => {
              const progress = projectProgress(project.name, tasks, project);
              return (
                <article className="project-card" key={project.name}>
                  <div className="project-card-head">
                    <span className={`project-dot ${project.color}`} />
                    <span>{project.label}</span>
                  </div>
                  <h3>{project.name}</h3>
                  <RamSetuProgress
                    value={progress.pct}
                    label={project.name}
                    size="md"
                  />
                  <div className="project-footer">
                    <span>
                      {progress.source === "tasks"
                        ? `${progress.open} open task${progress.open === 1 ? "" : "s"} · ${progress.done} done`
                        : "Estimate · no linked tasks"}
                    </span>
                    <span>{project.due}</span>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => viewTasks(project.name)}
                  >
                    View tasks <ArrowUpRight size={15} aria-hidden="true" />
                  </button>
                </article>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
