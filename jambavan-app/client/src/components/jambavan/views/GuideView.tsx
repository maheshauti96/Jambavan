import { ArrowRight, LockKeyhole } from "lucide-react";
import { FamilyBadge } from "../primitives/Badge";
import { Card } from "../primitives/Card";
import { useJambavan } from "../state/JambavanProvider";
import type { TaskCategory } from "../state/types";

const families = [
  {
    name: "Squirrel",
    title: "Small tasks",
    description:
      "Short follow-ups, checks and bookings. One person owns completion.",
  },
  {
    name: "Angad",
    title: "Individual deliverables",
    description:
      "Work with several steps. One owner tracks the result and any subtasks.",
  },
  {
    name: "Sugriv",
    title: "Team responsibilities",
    description:
      "Several contributors update their own parts. One owner confirms the result.",
  },
  {
    name: "HANUMAN",
    title: "Long-term work",
    description:
      "Work that spans weeks or months. Track milestones, subtasks and progress updates.",
  },
] satisfies { name: TaskCategory; title: string; description: string }[];

export function GuideView() {
  const { activeView, setActiveView, openCreateTask } = useJambavan();
  if (activeView !== "guide") return null;
  return (
    <div className="guide-view">
      <Card className="guide-section" aria-labelledby="guide-families-title">
        <div className="section-header guide-section-header">
          <div>
            <h2 id="guide-families-title">Choose a task family</h2>
            <p>
              Choose by the number of contributors and how long the work takes.
            </p>
          </div>
          <button
            type="button"
            className="primary-button"
            onClick={openCreateTask}
          >
            Create task
            <ArrowRight size={17} aria-hidden="true" />
          </button>
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
      </Card>
      <Card className="guide-section" aria-labelledby="guide-ownership-title">
        <div className="section-header">
          <h2 id="guide-ownership-title">Task ownership</h2>
        </div>
        <ul className="guide-rule-list">
          <li>
            <h3>One owner completes the task</h3>
            <p>
              Contributors can finish their parts. The owner confirms the final
              result.
            </p>
          </li>
          <li>
            <h3>Managers handle reassignment</h3>
            <p>
              A department head or another authorized manager can edit, reassign
              or hand over work.
            </p>
          </li>
          <li>
            <h3>Add details to the task</h3>
            <p>
              Open Task details to add subtasks, evidence, guidance or progress
              updates.
            </p>
          </li>
          <li>
            <h3>Report a blocker</h3>
            <p>
              Record what is holding up the task and what would help you
              continue. Clear the blocker when it is resolved.
            </p>
          </li>
        </ul>
      </Card>
      <Card className="guide-section" aria-labelledby="guide-meetings-title">
        <div className="section-header">
          <h2 id="guide-meetings-title">Meetings and events</h2>
        </div>
        <ul className="guide-rule-list">
          <li>
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
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </li>
          <li>
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
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </li>
        </ul>
      </Card>
      <Card
        className="guide-section guide-private"
        aria-labelledby="guide-private-title"
      >
        <span className="guide-private-icon" aria-hidden="true">
          <LockKeyhole size={22} />
        </span>
        <div>
          <h2 id="guide-private-title">My day is private</h2>
          <p>
            Your priorities, schedule and day review stay in your personal plan.
            Linked institute tasks keep their existing owner and team
            visibility.
          </p>
        </div>
        <button
          type="button"
          className="text-button"
          onClick={() => setActiveView("myDay")}
        >
          Open My day
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      </Card>
    </div>
  );
}
