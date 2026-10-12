// Moved verbatim from pages/Home.tsx (checkpoint 5f248af) in increment 0 (§13). Do not change behaviour here.
import { Plus, CalendarRange } from "lucide-react";
import { calendarMonths, calendarTypeOptions } from "../state/seed";
import { useJambavan } from "../state/JambavanProvider";

export function CalendarView() {
  const { activeView, calendarEvents, setShowCalendarModal, calendarManagerLabel } = useJambavan();
  return (
    <>
          {activeView === "calendar" && <section className="calendar-view"><div className="calendar-permission-banner"><div className="calendar-permission-icon"><CalendarRange size={24} /></div><div><span className="eyebrow">Restricted calendar controls</span><h2>Only CEO, Directors, or their assigned manager can edit this calendar.</h2><p>{calendarManagerLabel} · Changes are recorded in the audit trail. Everybody only sees events included in their selected visibility.</p></div><button className="primary-button" onClick={() => setShowCalendarModal(true)}><Plus size={15} /> Add calendar event</button></div><div className="calendar-legend">{calendarTypeOptions.map(type => <span key={type} className={`calendar-legend-item type-${type.toLowerCase().replace(" ", "-")}`}><i />{type}</span>)}</div><div className="year-calendar">{calendarMonths.map((month, index) => <article className="month-card" key={month}><div className="month-card-head"><h3>{month}</h3><span>2026</span></div><div className="month-events">{calendarEvents.filter(event => event.month === index).map(event => <div className={`calendar-event type-${event.type.toLowerCase().replace(" ", "-")}`} key={event.id}><div className="calendar-event-date">{event.date.split(" ")[0]}</div><div><strong>{event.title}</strong><small>{event.type} · {event.visibility.includes("Everyone") ? "Everyone" : event.visibility.join(", ")}</small></div></div>)}{calendarEvents.every(event => event.month !== index) && <span className="empty-month">No events added</span>}</div></article>)}</div></section>}
    </>
  );
}
