import { Plus } from "lucide-react";
import { TODAY_LONG } from "../state/clock";
import { useJambavan } from "../state/JambavanProvider";
import { viewMeta } from "./viewMeta";

export function PageHeader() {
  const { activeView, openCreateTask } = useJambavan();
  const meta = viewMeta[activeView];
  const canCreateTask =
    activeView === "feed" ||
    activeView === "department" ||
    activeView === "projects";
  return (
    <section className="page-heading" data-scene={meta.artwork}>
      <div className="page-heading-copy">
        <p className="eyebrow">{TODAY_LONG}</p>
        <h1>{meta.title}</h1>
        <p className="page-description">{meta.description}</p>
      </div>
      <img
        className="page-artwork"
        src={`/art/${meta.artwork}.webp`}
        alt=""
        aria-hidden="true"
        width="320"
        height="128"
      />
      {canCreateTask && (
        <button
          type="button"
          className="primary-button page-action"
          onClick={openCreateTask}
        >
          <Plus size={18} aria-hidden="true" /> Create task
        </button>
      )}
    </section>
  );
}
