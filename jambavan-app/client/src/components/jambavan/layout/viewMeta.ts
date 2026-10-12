import type { ViewKey } from "../state/types";

type ArtworkId =
  | "ayodhya-dawn"
  | "forest-ashram"
  | "kishkindha-council"
  | "ram-setu-shore"
  | "ayodhya-courtyard"
  | "ayodhya-messages"
  | "ayodhya-gateway";
type ViewMeta = {
  title: string;
  description: string;
  artwork: ArtworkId;
  createTask?: true;
};
export const viewMeta = {
  feed: {
    title: "Task feed",
    description: "Your work and the tasks shared with your department.",
    artwork: "ayodhya-dawn",
    createTask: true,
  },
  myDay: {
    title: "My day",
    description:
      "Set your priorities and plan your time. This plan is private to you.",
    artwork: "forest-ashram",
  },
  department: {
    title: "Department",
    description: "Owners, deadlines and progress across your department.",
    artwork: "kishkindha-council",
    createTask: true,
  },
  meetings: {
    title: "Meetings",
    description: "Record decisions and assign follow-up tasks.",
    artwork: "kishkindha-council",
  },
  momDirectory: {
    title: "MOM directory",
    description: "Meeting records, attendance and assigned follow-up tasks.",
    artwork: "kishkindha-council",
  },
  dashboard: {
    title: "Dashboard",
    description: "Progress, overdue work and tasks waiting for help.",
    artwork: "ram-setu-shore",
  },
  calendar: {
    title: "Calendar",
    description: "Institute dates, holidays and academic events.",
    artwork: "ayodhya-courtyard",
  },
  eventPlanner: {
    title: "Event planner",
    description: "Plan the event, assign responsibilities and track delivery.",
    artwork: "ayodhya-courtyard",
  },
  guide: {
    title: "Jambavan guide",
    description: "How task ownership, meetings and approvals work here.",
    artwork: "forest-ashram",
  },
  projects: {
    title: "Projects",
    description: "Each completed task adds a stone to your project's Setu.",
    artwork: "ram-setu-shore",
    createTask: true,
  },
  notices: {
    title: "Notices & feedback",
    description:
      "Read institute updates, reply to notices and answer feedback requests.",
    artwork: "ayodhya-messages",
  },
  people: {
    title: "People",
    description: "Team profiles, availability and reporting relationships.",
    artwork: "kishkindha-council",
  },
  myProfile: {
    title: "My profile",
    description: "Your contact details, work schedule and availability.",
    artwork: "forest-ashram",
  },
  roleMatrix: {
    title: "Roles & permissions",
    description: "Review what each role can see and change.",
    artwork: "ayodhya-gateway",
  },
  auditLog: {
    title: "Activity log",
    description: "Who changed what, when it happened and why.",
    artwork: "ayodhya-gateway",
  },
} satisfies Record<ViewKey, ViewMeta>;
