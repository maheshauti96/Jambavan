// Moved from pages/Home.tsx (checkpoint 5f248af) in increment 0 (§13).
// Phase 5: progress and open counts come from the linked tasks (F12, §10.1, C12); "Open project" becomes "View
// tasks", which filters My feed by project (IA-6); the dead "New project" button is removed (IA-6, C3).
import { ArrowUpRight } from "lucide-react";
import { projects } from "../state/seed";
import { projectProgress } from "../state/selectors";
import { useJambavan } from "../state/JambavanProvider";

export function ProjectsView() {
  const { activeView, tasks, setActiveView, setProjectFilter, setDepartmentFilter, setStatusFilter, setCategoryFilter, setArchiveFilter } = useJambavan();
  const viewTasks = (name: string) => { setDepartmentFilter("All departments"); setStatusFilter("All work"); setCategoryFilter("All categories"); setArchiveFilter("Active tasks"); setProjectFilter(name); setActiveView("feed"); };
  return (
    <>
          {activeView === "projects" && <><div className="section-header"><div><h2>What must not get lost</h2><p>Projects and major responsibilities stay above the daily noise.</p></div></div><div className="project-grid">{projects.map(project => { const progress = projectProgress(project.name, tasks, project); return <article className="project-card" key={project.name}><div className="project-card-head"><span className={`project-dot ${project.color}`} /><span>{project.label}</span></div><h3>{project.name}</h3><div className="project-progress"><div className="progress-track" role="progressbar" aria-label={`${project.name} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.pct}><span style={{ width: `${progress.pct}%` }} /></div><strong>{progress.pct}%</strong></div><div className="project-footer"><span>{progress.source === "tasks" ? `${progress.open} open task${progress.open === 1 ? "" : "s"} · ${progress.done} done` : "Estimate · no linked tasks"}</span><span>{project.due}</span></div><button className="text-button" onClick={() => viewTasks(project.name)}>View tasks <ArrowUpRight size={15} aria-hidden="true" /></button></article>; })}</div></>}
    </>
  );
}
