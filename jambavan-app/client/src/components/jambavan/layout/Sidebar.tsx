// (IA-3, C4); the active item has aria-current="page"; My profile no longer opens the edit dialog (IA-4); the Task feed
// badge counts unread deadline reminders (IA-7, C2); the dead workspace chevron and "Workspace settings" are removed
// (IA-6, C3). Below 760 px the sidebar is a modal drawer with a close button, a backdrop, Escape and a focus trap (A8).
import { useRef } from "react";
import {
  Clock3,
  ShieldCheck,
  Users,
  UserRound,
  X,
  BookOpenCheck,
} from "lucide-react";
import { Bow } from "../icons/RamayanaIcons";
import { Avatar } from "../art/Avatar";
import { navItems } from "../layout/navItems";
import { useJambavan } from "../state/JambavanProvider";
import { useModalLayer } from "../primitives/LegacyModal";
import { useRegisterOpenDialog } from "../primitives/dialogRegistry";
import type { ViewKey } from "../state/types";

export function Sidebar() {
  const {
    activeView,
    setActiveView,
    canManageEmployeeAccess,
    showMobileNav,
    setShowMobileNav,
    unreadReminders,
  } = useJambavan();
  const ref = useRef<HTMLElement>(null);
  // The drawer only exists as a modal below 760 px; on wider screens showMobileNav is never set.
  useModalLayer(ref, showMobileNav, () => setShowMobileNav(false), "first");
  useRegisterOpenDialog(showMobileNav);
  const go = (key: ViewKey) => {
    setActiveView(key);
    setShowMobileNav(false);
  };
  const item = (
    key: ViewKey,
    label: string,
    Icon: typeof Users,
    badge?: number
  ) => (
    <button
      key={key}
      className={activeView === key ? "active" : ""}
      aria-current={activeView === key ? "page" : undefined}
      onClick={() => go(key)}
    >
      <Icon size={18} aria-hidden="true" />
      <span>{label}</span>
      {badge ? (
        <em>
          {badge}
          <span className="sr-only"> unread reminders</span>
        </em>
      ) : null}
    </button>
  );
  const group = (keys: ViewKey[]) =>
    navItems
      .filter(entry => keys.includes(entry.key))
      .map(entry =>
        item(
          entry.key,
          entry.label,
          entry.icon,
          entry.key === "feed" ? unreadReminders.length : undefined
        )
      );
  const guide = navItems.find(entry => entry.key === "guide");
  return (
    <>
      {showMobileNav && (
        <div
          className="mobile-nav-backdrop"
          onClick={() => setShowMobileNav(false)}
        />
      )}
      <aside
        ref={ref}
        className={`sidebar ${showMobileNav ? "mobile-open" : ""}`}
        {...(showMobileNav
          ? { role: "dialog", "aria-modal": true, "aria-label": "Main menu" }
          : { "aria-label": "Main menu" })}
      >
        <button
          className="icon-button sidebar-close"
          aria-label="Close menu"
          onClick={() => setShowMobileNav(false)}
        >
          <X size={18} />
        </button>
        <div className="brand-lockup">
          <div className="brand-mark">
            <Bow size={24} />
          </div>
          <div>
            <strong>JAMBAVAN</strong>
            <small>Institute workspace</small>
          </div>
        </div>
        <div className="workspace-switcher">
          <span className="workspace-dot" /> <span>JAMBAVAN Institute</span>
        </div>
        <div className="sidebar-navigation">
          <div className="nav-label" id="nav-workspace">
            Workspace
          </div>
          <nav className="main-nav" aria-labelledby="nav-workspace">
            {group(["feed", "myDay", "department", "dashboard"])}
          </nav>
          <div className="nav-label manage-label" id="nav-execution">
            Execution
          </div>
          <nav className="main-nav" aria-labelledby="nav-execution">
            {group(["momDirectory", "eventPlanner", "projects"])}
          </nav>
          <div className="nav-label manage-label" id="nav-communication">
            Communication
          </div>
          <nav className="main-nav" aria-labelledby="nav-communication">
            {group(["calendar", "notices"])}
          </nav>
          <div className="nav-label manage-label" id="nav-people">
            People & control
          </div>
          <nav className="main-nav" aria-labelledby="nav-people">
            {item("people", "People", Users)}
            {item("myProfile", "My profile", UserRound)}
            {canManageEmployeeAccess &&
              item("roleMatrix", "Roles & permissions", ShieldCheck)}
            {canManageEmployeeAccess &&
              item("auditLog", "Activity log", Clock3)}
          </nav>
        </div>
        <div className="sidebar-spacer" />
        <div className="head-card">
          <Avatar text="AM" name="Arjun Mehta" tone="saffron" />
          <div>
            <strong>Arjun Mehta</strong>
            <span>Department head · Academic</span>
          </div>
        </div>
        {guide && (
          <button
            className={`settings-link ${activeView === "guide" ? "active" : ""}`}
            aria-current={activeView === "guide" ? "page" : undefined}
            onClick={() => go("guide")}
          >
            <BookOpenCheck size={17} aria-hidden="true" /> {guide.label}
          </button>
        )}
        <p className="sidebar-sacred" aria-hidden="true">
          ॥ श्री राम ॥
        </p>
      </aside>
    </>
  );
}
