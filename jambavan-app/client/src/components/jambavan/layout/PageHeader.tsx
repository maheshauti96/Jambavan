// Moved from pages/Home.tsx (checkpoint 5f248af) in increment 0 (§13).
// Phase 5: the eyebrow date reads the seed clock (F21, D18), and "Create task" always opens a fresh draft (F2, A2).
import { Plus, Sparkles } from "lucide-react";
import { TODAY_LONG } from "../state/clock";
import { useJambavan } from "../state/JambavanProvider";

export function PageHeader() {
  const { openCreateTask, viewTitle, viewSubtitle } = useJambavan();
  return (
    <>
          <div className="ramayana-ribbon"><div><span>JAMBAVAN · Ramayana-inspired execution</span><strong>Small steps. Brave journeys. Work that reaches its destination.</strong></div><span className="ribbon-symbol">॥ श्री राम ॥</span></div>
          <div className="page-heading">
            <div><div className="eyebrow"><Sparkles size={14} /> {TODAY_LONG}</div><h1>{viewTitle}</h1><p>{viewSubtitle}</p></div>
            <button className="primary-button" onClick={openCreateTask}><Plus size={18} /> Create task</button>
          </div>
    </>
  );
}
