import { useEffect } from "react";
import { useJambavan } from "../state/JambavanProvider";
// The page skeleton from pages/Home.tsx (Home.tsx:1068–1225), with each region extracted into a component.
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { PageHeader } from "./PageHeader";
import { Toast } from "./Toast";
import { MyDayView } from "../views/MyDayView";
import { FeedView } from "../views/FeedView";
import { DepartmentView } from "../views/DepartmentView";
import { MomDirectoryView } from "../views/MomDirectoryView";
import { DashboardView } from "../views/DashboardView";
import { GuideView } from "../views/GuideView";
import { NoticesView } from "../views/NoticesView";
import { EventPlannerView } from "../views/EventPlannerView";
import { CalendarView } from "../views/CalendarView";
import { ProjectsView } from "../views/ProjectsView";
import { RoleMatrixView } from "../views/RoleMatrixView";
import { AuditLogView } from "../views/AuditLogView";
import { MyProfileView } from "../views/MyProfileView";
import { PeopleView } from "../views/PeopleView";
import { AccessDialog } from "../modals/AccessDialog";
import { ProfileDialog } from "../modals/ProfileDialog";
import { FeedbackDialog } from "../modals/FeedbackDialog";
import { EventDialog } from "../modals/EventDialog";
import { CalendarDialog } from "../modals/CalendarDialog";
import { NoticeDialog } from "../modals/NoticeDialog";
import { TaskDialog } from "../task/TaskDialog";
import { HandoverDialog } from "../task/HandoverDialog";
import { MomDialog } from "../modals/MomDialog";
import { AttachmentDialog } from "../task/AttachmentDialog";

export function AppShell() {
  const { activeView } = useJambavan();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [activeView]);
  return (
    <div className="jambavan-app">
      <Sidebar />

      <main className="main-content">
        <Topbar />

        <div className="content-wrap">
          <PageHeader />

          <MyDayView />
          <FeedView />
          <DepartmentView />
          <MomDirectoryView />
          <DashboardView />
          <GuideView />
          <EventPlannerView />
          <CalendarView />
          <NoticesView />
          <ProjectsView />
          <RoleMatrixView />
          <AuditLogView />
          <MyProfileView />
          <PeopleView />
        </div>
        <footer className="app-footer">
          <span>Jambavan Institute</span>
          <span>Tasks, meetings and responsibilities</span>
        </footer>
      </main>

      <Toast />

      <AccessDialog />
      <ProfileDialog />
      <FeedbackDialog />
      <EventDialog />
      <CalendarDialog />
      <NoticeDialog />
      <TaskDialog />
      <HandoverDialog />
      <MomDialog />
      <AttachmentDialog />
    </div>
  );
}
