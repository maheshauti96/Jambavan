// Moved from pages/Home.tsx (checkpoint 5f248af) in increment 0 (§13).
// Phase 5: Projects is restored to Execution (IA-1, A5) and Notices & feedback gets its own view (IA-3, C4);
// My day uses Sunrise so it no longer shares Event planner's icon (IA-10, D23).
import { BookOpenCheck, CalendarDays, ClipboardCheck, FolderKanban, LayoutDashboard, Megaphone, NotebookPen, Sunrise, Users, CalendarRange } from "lucide-react";
import type { ViewKey } from "../state/types";

export const navItems: { key: ViewKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "feed", label: "Task feed", icon: LayoutDashboard },
  { key: "myDay", label: "My day", icon: Sunrise },
  { key: "department", label: "Department", icon: Users },
  { key: "momDirectory", label: "MOM directory", icon: NotebookPen },
  { key: "dashboard", label: "Dashboard", icon: ClipboardCheck },
  { key: "calendar", label: "Calendar", icon: CalendarRange },
  { key: "notices", label: "Notices & feedback", icon: Megaphone },
  { key: "eventPlanner", label: "Event planner", icon: CalendarDays },
  { key: "projects", label: "Projects", icon: FolderKanban },
  { key: "guide", label: "Jambavan guide", icon: BookOpenCheck },
];
