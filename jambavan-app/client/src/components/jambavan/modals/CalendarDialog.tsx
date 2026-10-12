// Moved verbatim from pages/Home.tsx (checkpoint 5f248af) in increment 0 (§13). Do not change behaviour here.
import { CalendarDays, ShieldCheck, Users, X, CalendarRange, Save } from "lucide-react";
import type { CalendarEventType } from "../state/types";
import { calendarMonths, calendarVisibilityOptions, calendarTypeOptions } from "../state/seed";
import { useJambavan } from "../state/JambavanProvider";
import { LegacyModal } from "../primitives/LegacyModal";
import { useFormErrors } from "../primitives/formErrors";

export function CalendarDialog() {
  const { showCalendarModal, setShowCalendarModal, calendarDraft, setCalendarDraft, calendarManagerLabel, notice, createCalendarEvent } = useJambavan();
  // F10 (C9): a calendar event needs a title and a date.
  const form = useFormErrors<"title" | "date">("calendar");
  const close = () => { form.reset(); setShowCalendarModal(false); };
  const submit = () => { if (form.check({ title: calendarDraft.title.trim() ? "" : "Enter the event title.", date: calendarDraft.date.trim() ? "" : "Enter the date, for example 18 Dec 2026." })) createCalendarEvent(); };
  return (
    <>
      {showCalendarModal && <LegacyModal onClose={close} className="task-modal calendar-modal"><div className="modal-head"><div><span className="eyebrow"><CalendarRange size={14} /> Yearly Calendar · {calendarManagerLabel}</span><h2>Add calendar event</h2><p>Only the CEO, Directors, or an assigned calendar manager can create or edit these records.</p></div><button className="icon-button" aria-label="Close dialog" onClick={close}><X size={18} /></button></div><div className="form-grid"><label>Event title<input autoFocus value={calendarDraft.title} {...form.props("title")} onChange={event => { setCalendarDraft({ ...calendarDraft, title: event.target.value }); form.clear("title"); }} placeholder="e.g. Faculty training day" />{form.message("title")}</label><label>Event type<select value={calendarDraft.type} onChange={event => setCalendarDraft({ ...calendarDraft, type: event.target.value as CalendarEventType })}>{calendarTypeOptions.map(type => <option key={type}>{type}</option>)}</select></label><label>Date<input value={calendarDraft.date} {...form.props("date")} onChange={event => { setCalendarDraft({ ...calendarDraft, date: event.target.value }); form.clear("date"); }} placeholder="18 Dec 2026" />{form.message("date")}</label><label>Month<select value={calendarDraft.month} onChange={event => setCalendarDraft({ ...calendarDraft, month: Number(event.target.value) })}>{calendarMonths.map((month, index) => <option value={index} key={month}>{month}</option>)}</select></label></div><div className="calendar-visibility-picker"><div className="assistant-picker-head"><span><Users size={15} /> Who can see this event?</span><small>{calendarDraft.visibility.includes("Everyone") ? "Everyone" : `${calendarDraft.visibility.length} groups selected`}</small></div><div className="notice-target-grid">{["Everyone", ...calendarVisibilityOptions].map(target => <label key={target}><input type="checkbox" checked={calendarDraft.visibility.includes(target)} onChange={event => setCalendarDraft(current => ({ ...current, visibility: event.target.checked ? target === "Everyone" ? ["Everyone"] : [...current.visibility.filter(name => name !== "Everyone"), target] : current.visibility.filter(name => name !== target) }))} /><span>{target}</span><small>{target === "Everyone" ? "all users" : "group"}</small></label>)}</div></div><div className="manager-rule"><ShieldCheck size={15} /><span><strong>Protected record</strong><small>Other employees can view according to visibility, but cannot create or change the event.</small></span></div><div className="modal-actions"><button className="outline-button" onClick={close}>Cancel</button><button className="primary-button" onClick={submit}><CalendarDays size={15} /> Save event</button></div></LegacyModal>}
    </>
  );
}
