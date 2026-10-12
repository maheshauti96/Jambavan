// Moved from pages/Home.tsx (checkpoint 5f248af) in increment 0 (§13).
// Phase 5: the search button opens the ⌘K palette (IA-6, C3), with an icon button on phones where the wide one is
// hidden; the menu button exposes aria-expanded; the notifications panel is a labelled, non-modal dialog with
// aria-expanded on the bell, closed by Escape (focus returns to the bell) or a click outside (A8).
import { useEffect, useRef } from "react";
import { Bell, Clock3, Menu, Search } from "lucide-react";
import { Avatar } from "../art/Avatar";
import { useJambavan } from "../state/JambavanProvider";
import { CommandSearch } from "./CommandSearch";

export function Topbar() {
  const { activeView, setActiveView, showNotifications, setShowNotifications, appNotifications, setAppNotifications, setReadReminderIds, showMobileNav, setShowMobileNav, deadlineReminders, unreadReminders, viewTitle, setShowSearch } = useJambavan();
  const wrapRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const unread = unreadReminders.length + appNotifications.filter(item => !item.read).length;
  useEffect(() => {
    if (!showNotifications) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { setShowNotifications(false); bellRef.current?.focus(); } };
    const onPointer = (event: PointerEvent) => { if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setShowNotifications(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onPointer); };
  }, [showNotifications, setShowNotifications]);
  return (
    <>
        <header className="topbar">
          <button className="mobile-menu icon-button" onClick={() => setShowMobileNav(true)} aria-label="Open menu" aria-expanded={showMobileNav}><Menu size={20} /></button>
          <div className="crumbs"><span>Workspace</span><span aria-hidden="true">/</span><strong>{activeView === "feed" ? "My feed" : viewTitle}</strong></div>
          <div className="top-actions"><button className="search-button" onClick={() => setShowSearch(true)} aria-keyshortcuts="Meta+K Control+K"><Search size={17} aria-hidden="true" /><span>Search tasks, people...</span><kbd aria-hidden="true">⌘ K</kbd></button><button className="icon-button search-icon-button" aria-label="Search" onClick={() => setShowSearch(true)}><Search size={18} /></button><div className="notification-wrap" ref={wrapRef}><button ref={bellRef} className="icon-button notification-button" aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"} aria-expanded={showNotifications} aria-controls="notification-panel" onClick={() => setShowNotifications(current => !current)}><Bell size={18} />{unread > 0 && <i />}</button>{showNotifications && <div className="notification-panel" id="notification-panel" role="dialog" aria-label="Live notifications"><div className="notification-head"><div><strong>Live notifications</strong><span>Assignments, private replies, deadline reminders, and system updates.</span></div><button className="text-button" onClick={() => { setAppNotifications(current => current.map(item => ({ ...item, read: true }))); setReadReminderIds(deadlineReminders.map(reminder => reminder.id)); }}>Mark all read</button></div><div className="notification-preference-note"><Bell size={12} /> In-app alerts are active. Daily email digest can be enabled when an email connector is connected.</div>{appNotifications.map(item => <button key={item.id} className={`live-notification ${item.kind}`} onClick={() => setAppNotifications(current => current.map(entry => entry.id === item.id ? { ...entry, read: true } : entry))}><span className="reminder-icon"><Bell size={14} /></span><span className="reminder-copy"><strong>{item.title}</strong><small>{item.detail}</small></span><em>{item.at}</em></button>)}{deadlineReminders.map(reminder => <button key={`deadline-${reminder.id}`} className={`reminder-item ${reminder.urgency}`} onClick={() => { setReadReminderIds(current => current.includes(reminder.id) ? current : [...current, reminder.id]); setShowNotifications(false); setActiveView("feed"); }}><span className="reminder-icon"><Clock3 size={14} /></span><span className="reminder-copy"><strong>{reminder.task.title}</strong><small><Avatar text={reminder.task.initials} name={reminder.task.assignee} tone={reminder.task.department.toLowerCase()} /> {reminder.task.assignee} + {reminder.task.assistants.length} assistant{reminder.task.assistants.length === 1 ? "" : "s"}</small></span><em>{reminder.task.due}</em></button>)}{appNotifications.length === 0 && deadlineReminders.length === 0 && <p className="empty-notice">No new notifications.</p>}</div>}</div><Avatar text="AM" name="Arjun Mehta" tone="saffron" /></div>
        </header>
        <CommandSearch />
    </>
  );
}
