import { CalendarDays, Download, FileText, Plus } from "lucide-react";
import { departments } from "../state/seed";
import { useJambavan } from "../state/JambavanProvider";

export function EventPlannerView() {
  const {
    activeView,
    tasks,
    eventPlans,
    exportEventAnalytics,
    exportEventPdf,
    openEventPlanner,
  } = useJambavan();
  const eventCount = eventPlans.filter(plan => !plan.isTemplate).length;
  const templateCount = eventPlans.length - eventCount;
  return (
    <>
      {activeView === "eventPlanner" && (
        <section className="event-planner-view">
          <div className="event-planner-hero">
            <div className="event-planner-icon">
              <CalendarDays size={25} />
            </div>
            <div>
              <span className="eyebrow">Events</span>
              <h2>Plan an event</h2>
              <p>
                Choose departments, add task rows, assign owners, and save the
                whole plan as a reusable template.
              </p>
            </div>
            <button
              className="primary-button"
              onClick={() => openEventPlanner()}
            >
              <Plus size={16} /> Plan an event
            </button>
          </div>
          <div className="section-header">
            <div>
              <h2>Events and templates</h2>
              <p>
                Every event keeps its departments, task owners, categories, and
                responsibility notes together.
              </p>
            </div>
            <div className="report-actions">
              <button className="outline-button" onClick={exportEventAnalytics}>
                <Download size={14} /> Event CSV
              </button>
              <button className="outline-button" onClick={exportEventPdf}>
                <FileText size={14} /> Event PDF
              </button>
              <span className="event-count">
                {eventCount} event{eventCount === 1 ? "" : "s"} ·{" "}
                {templateCount} template{templateCount === 1 ? "" : "s"}
              </span>
            </div>
          </div>
          <div className="event-plan-grid">
            {eventPlans.map(plan => (
              <article
                className={`event-plan-card ${plan.isTemplate ? "is-template" : ""}`}
                key={plan.id}
              >
                <div className="event-plan-top">
                  <span className="event-plan-badge">
                    {plan.isTemplate ? "Template" : "Event plan"}
                  </span>
                  <small>{plan.date}</small>
                </div>
                <h3>{plan.title}</h3>
                <p>{plan.description}</p>
                <div className="event-departments">
                  {plan.departments.map(department => (
                    <span key={department}>{department}</span>
                  ))}
                </div>
                <div className="event-role-summary">
                  <strong>Roles and in-charges</strong>
                  {(plan.roles || []).map(role => (
                    <span key={role.id}>
                      <b>{role.role}</b> · {role.inCharge}{" "}
                      <em>{role.department}</em>
                    </span>
                  ))}
                </div>
                <div className="event-task-summary">
                  <strong>
                    {plan.tasks.length} task{plan.tasks.length === 1 ? "" : "s"}
                  </strong>
                  <span>
                    {plan.tasks
                      .slice(0, 3)
                      .map(task => task.title)
                      .join(" · ") || "No tasks added yet"}
                  </span>
                </div>
                <div className="event-plan-actions">
                  {!plan.isTemplate && (
                    <button
                      className="text-button"
                      onClick={() => openEventPlanner({ kind: "edit", plan })}
                    >
                      Edit plan
                    </button>
                  )}
                  <button
                    className="outline-button"
                    onClick={() => openEventPlanner({ kind: "copy", plan })}
                  >
                    {plan.isTemplate ? "Use template" : "Reuse plan"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
