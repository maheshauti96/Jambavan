import { ArrowRight, LockKeyhole } from "lucide-react";
import { FamilyBadge } from "../primitives/Badge";
import { useJambavan } from "../state/JambavanProvider";
import type { TaskCategory } from "../state/types";

const families = [
  {
    name: "Squirrel",
    title: "Small tasks",
    description:
      "One owner and a clear finish line. Use this for short follow-ups, checks and bookings.",
  },
  {
    name: "Angad",
    title: "Individual deliverables",
    description:
      "One owner with optional subtasks. Use this for work that takes several steps.",
  },
  {
    name: "Sugriv",
    title: "Team responsibilities",
    description:
      "One owner and several contributors. Each contributor updates their own part.",
  },
  {
    name: "HANUMAN",
    title: "Long-term work",
    description:
      "Keep milestones, subtasks and progress updates together for work that runs over weeks or months.",
  },
] satisfies { name: TaskCategory; title: string; description: string }[];

export function GuideView() {
  const { activeView, setActiveView, openCreateTask } = useJambavan();
  if (activeView !== "guide") return null;
  return (
    <div className="guide-view">
      <section className="guide-section">
        <div className="section-header">
          <div>
            <h2>Choose a task family</h2>
            <p>
              The family describes how the work is assigned. The action labels
              stay the same.
            </p>
          </div>
        </div>
        <div className="guide-task-grid">
          {families.map(family => (
            <article className="guide-task-card" key={family.name}>
              <FamilyBadge category={family.name} />
              <h3>{family.title}</h3>
              <p>{family.description}</p>
            </article>
          ))}
        </div>
        <button
          type="button"
          className="primary-button"
          onClick={openCreateTask}
        >
          Create task
          <ArrowRight size={17} />
        </button>
      </section>
      <section className="guide-section">
        <div className="section-header">
          <h2>Task ownership</h2>
        </div>
        <div className="guide-rule-grid">
          <div>
            <h3>One owner completes the task</h3>
            <p>
              Contributors can finish their parts. The owner confirms the final
              result.
            </p>
          </div>
          <div>
            <h3>Managers handle reassignment</h3>
            <p>
              A department head or another authorized manager can edit, reassign
              or hand over work.
            </p>
          </div>
          <div>
            <h3>Keep the supporting detail</h3>
            <p>
              Open Task details to add subtasks, evidence, guidance or progress
              updates.
            </p>
          </div>
          <div>
            <h3>Report a blocker</h3>
            <p>
              Record what is holding up the task and what would help you
              continue. Clear the blocker when it is resolved.
            </p>
          </div>
        </div>
      </section>
      <section className="guide-section">
        <div className="section-header">
          <h2>Meetings and events</h2>
        </div>
        <div className="guide-rule-grid">
          <div>
            <h3>Meeting records</h3>
            <p>
              Record attendance, decisions and follow-up tasks in the MOM
              directory. Written meeting records lock when saved.
            </p>
            <button
              type="button"
              className="text-button"
              onClick={() => setActiveView("momDirectory")}
            >
              Open MOM directory
              <ArrowRight size={16} />
            </button>
          </div>
          <div>
            <h3>Event plans</h3>
            <p>
              Assign departments, roles and tasks before the event. Save
              recurring plans as templates.
            </p>
            <button
              type="button"
              className="text-button"
              onClick={() => setActiveView("eventPlanner")}
            >
              Open event planner
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
      <section className="guide-section">
        <div className="section-header">
          <h2>
            <LockKeyhole size={20} />
            My day is private
          </h2>
        </div>
        <p>
          Your priorities, schedule and end-of-day review stay in your personal
          plan. Linked institute tasks still follow their usual ownership rules.
        </p>
        <button
          type="button"
          className="text-button"
          onClick={() => setActiveView("myDay")}
        >
          Open My day
          <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
}
