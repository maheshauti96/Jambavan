// Moved from pages/Home.tsx (checkpoint 5f248af) in increment 0 (§13).
// Phase 5 (F5, A6): the redundant "Edit plan" button, which created a duplicate event, is removed. "Reuse plan" and
// "Use template" keep today's copy behaviour.
import { CalendarDays, Download, FileText, Plus } from "lucide-react";
import { departments } from "../state/seed";
import { useJambavan } from "../state/JambavanProvider";

export function EventPlannerView() {
  const { activeView, tasks, eventPlans, exportEventAnalytics, exportEventPdf, openEventPlanner } = useJambavan();
  return (
    <>
          {activeView === "eventPlanner" && <section className="event-planner-view"><div className="event-planner-hero"><div className="event-planner-icon"><CalendarDays size={25} /></div><div><span className="eyebrow">Plan · assign · reuse</span><h2>Turn an event into an execution playbook.</h2><p>Choose departments, add task rows, assign owners, and save the whole plan as a reusable template.</p></div><button className="primary-button" onClick={() => openEventPlanner()}><Plus size={16} /> Plan an event</button></div><div className="section-header"><div><h2>Events and templates</h2><p>Every event keeps its departments, task owners, categories, and responsibility notes together.</p></div><div className="report-actions"><button className="outline-button" onClick={exportEventAnalytics}><Download size={14} /> Event CSV</button><button className="outline-button" onClick={exportEventPdf}><FileText size={14} /> Event PDF</button><span className="event-count">{eventPlans.length} plans · {eventPlans.filter(plan => plan.isTemplate).length} templates</span></div></div><div className="event-plan-grid">{eventPlans.map(plan => <article className={`event-plan-card ${plan.isTemplate ? "is-template" : ""}`} key={plan.id}><div className="event-plan-top"><span className="event-plan-badge">{plan.isTemplate ? "Template" : "Event plan"}</span><small>{plan.date}</small></div><h3>{plan.title}</h3><p>{plan.description}</p><div className="event-departments">{plan.departments.map(department => <span key={department}>{department}</span>)}</div><div className="event-role-summary"><strong>Roles and in-charges</strong>{(plan.roles || []).map(role => <span key={role.id}><b>{role.role}</b> · {role.inCharge} <em>{role.department}</em></span>)}</div><div className="event-task-summary"><strong>{plan.tasks.length} task{plan.tasks.length === 1 ? "" : "s"}</strong><span>{plan.tasks.slice(0, 3).map(task => task.title).join(" · ") || "No tasks added yet"}</span></div><div className="event-plan-actions"><button className="outline-button" onClick={() => openEventPlanner(plan)}>{plan.isTemplate ? "Use template" : "Reuse plan"}</button></div></article>)}</div></section>}
    </>
  );
}
