// Moved verbatim from pages/Home.tsx (checkpoint 5f248af) in increment 0 (§13). Do not change behaviour here.
import { CalendarDays, ClipboardCheck, Filter, LockKeyhole, NotebookPen, Plus } from "lucide-react";
import { departments } from "../state/seed";
import { initials } from "../state/format";
import { Avatar } from "../art/Avatar";
import { useJambavan } from "../state/JambavanProvider";

export function MomDirectoryView() {
  const { activeView, tasks, momList, momDepartmentFilter, setMomDepartmentFilter, setShowMomModal, assignMomTask } = useJambavan();
  return (
    <>
          {activeView === "momDirectory" && <>
            <section className="mom-directory-banner"><div className="mom-directory-icon"><NotebookPen size={25} /></div><div><span className="eyebrow">Permanent meeting record</span><h2>Write it once. Review it anytime.</h2><p>MOM content is locked after saving. Meeting heads, department heads, Directors, and the CEO can continue assigning follow-up tasks without changing the written record.</p></div><button className="primary-button" onClick={() => setShowMomModal(true)}><Plus size={17} /> Write new MOM</button></section>
            <div className="section-header"><div><h2>Department-wise MOMs</h2><p>Review attendance, roles, decisions, and tasks from previous meetings.</p></div><div className="select-wrap"><Filter size={14} /><select value={momDepartmentFilter} onChange={event => setMomDepartmentFilter(event.target.value)}><option>All departments</option>{departments.map(dept => <option key={dept.name}>{dept.name}</option>)}</select></div></div>
            <div className="mom-directory-list">{momList.filter(mom => momDepartmentFilter === "All departments" || mom.department === momDepartmentFilter).map(mom => <article className="mom-record" key={mom.id}><div className="mom-record-head"><div><span className={`dept-bullet ${mom.department.toLowerCase()}`} /><span className="mom-record-department">{mom.department}</span><h3>{mom.title}</h3><small><CalendarDays size={12} /> {mom.date}{mom.nextMeeting ? ` · Next meeting ${mom.nextMeeting}` : " · Next meeting not scheduled"}</small></div><span className="locked-pill"><LockKeyhole size={12} /> Locked</span></div><div className="mom-record-grid"><div className="mom-record-copy"><span className="record-label">MOM / written record</span><p>{mom.content}</p><div className="mom-role-row"><span><Avatar text={initials(mom.meetingHead)} name={mom.meetingHead} tone="saffron" /><small>Meeting head<strong>{mom.meetingHead}</strong></small></span><span><Avatar text={initials(mom.secretary)} name={mom.secretary} tone="mint" /><small>Meeting secretary<strong>{mom.secretary}</strong></small></span></div></div><div className="mom-record-attendance"><span className="record-label">Attendance · {mom.attendance.length} present</span><div className="attendance-avatars">{mom.attendance.map(name => <span key={name} title={name}><Avatar text={initials(name)} name={name} tone="indigo" /></span>)}</div><p>{mom.attendance.join(", ")}</p>{mom.absent?.length ? <p className="absent-line">Absent · {mom.absent.join(", ")}</p> : null}</div></div><div className="mom-record-footer"><div><span className="record-label">MOM action item</span><strong>{mom.actionItem || "No task assigned"}</strong><small>Current assignee · {mom.taskAssignee}</small></div><button className="outline-button" onClick={() => assignMomTask(mom)}><ClipboardCheck size={15} /> Assign / add task</button></div></article>)}</div>
          </>}
    </>
  );
}
