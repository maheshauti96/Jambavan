// confirmed soft removal; "Show removed" lists removed profiles with "Restore profile"; the signed-in user's own row
// has no lifecycle actions. Profile headings are focus targets for ⌘K.
import {
  ArrowUpRight,
  Clock3,
  Download,
  FileText,
  ShieldCheck,
  Users,
  Phone,
  UserRound,
  UserPlus,
  Ban,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { departments } from "../state/seed";
import { isCurrentUser } from "../state/identity";
import { ConfirmDialog } from "../primitives/ConfirmDialog";
import { personAnchor } from "../layout/CommandSearch";
import { initials } from "../state/format";
import { Avatar } from "../art/Avatar";
import { useJambavan } from "../state/JambavanProvider";

export function PeopleView() {
  const {
    activeView,
    activity,
    profiles,
    setShowAccessModal,
    canManageEmployeeAccess,
    exportAttendanceSummary,
    exportAttendancePdf,
    openMyProfile,
    toggleEmployeeSuspension,
    removeEmployee,
    restoreEmployee,
    showRemoved,
    setShowRemoved,
  } = useJambavan();
  const [removing, setRemoving] = useState<string | null>(null);
  const removedCount = profiles.filter(
    profile => profile.access === "Removed"
  ).length;
  const listed = profiles.filter(
    profile => showRemoved || profile.access !== "Removed"
  );
  return (
    <>
      {activeView === "people" && (
        <>
          <section className="people-banner">
            <div className="people-illustration">
              <Users size={27} />
            </div>
            <div>
              <span className="eyebrow">
                CEO → Directors → Department Heads → Members
              </span>
              <h2>Department teams</h2>
              <p>
                CEO and Directors can see all departments, personal notes, and
                private tasks. Employees who belong to multiple departments keep
                separate department feeds. New profiles require a photo before
                activation.
              </p>
            </div>
            <button
              className="outline-button"
              disabled={!canManageEmployeeAccess}
              onClick={() => setShowAccessModal(true)}
            >
              <UserPlus size={15} /> Manage access <ArrowUpRight size={15} />
            </button>
          </section>
          <section className="profile-directory">
            <div className="section-header">
              <div>
                <span className="eyebrow">
                  <UserRound size={14} /> Employee profiles
                </span>
                <h2>Employee profiles</h2>
                <p>
                  Contact details, working hours and availability for each
                  employee.
                </p>
              </div>
              <div className="report-actions">
                <button
                  className="outline-button"
                  onClick={exportAttendanceSummary}
                >
                  <Download size={14} /> Attendance CSV
                </button>
                <button
                  className="outline-button"
                  onClick={exportAttendancePdf}
                >
                  <FileText size={14} /> Attendance PDF
                </button>
                <button className="primary-button" onClick={openMyProfile}>
                  <UserRound size={15} /> Manage my profile
                </button>
                {canManageEmployeeAccess && (
                  <label className="team-toggle show-removed-toggle">
                    <input
                      type="checkbox"
                      checked={showRemoved}
                      onChange={event => setShowRemoved(event.target.checked)}
                    />
                    <span>
                      <strong>Show removed</strong>
                      <small>
                        {removedCount} removed profile
                        {removedCount === 1 ? "" : "s"}
                      </small>
                    </span>
                  </label>
                )}
              </div>
            </div>
            <div className="profile-grid">
              {listed.map(profile => (
                <article className="profile-card" key={profile.name}>
                  <div className="profile-card-head">
                    <Avatar
                      text={initials(profile.name)}
                      name={profile.name}
                      photoOverride={profile.photo}
                      tone={profile.department.toLowerCase()}
                    />
                    <div>
                      <h3 id={personAnchor(profile.name)} tabIndex={-1}>
                        {profile.name}
                      </h3>
                      <span>
                        {profile.position} · {profile.department}
                      </span>
                    </div>
                    <span
                      className={`profile-status status-${profile.access.toLowerCase()} ${profile.access !== "Active" ? "status-suspended" : `status-${profile.status.toLowerCase().replace(" ", "-")}`}`}
                    >
                      {profile.access === "Suspended"
                        ? "Deactivated"
                        : profile.access === "Removed"
                          ? "Removed"
                          : profile.status}
                    </span>
                  </div>
                  <div className="profile-details">
                    <span>
                      <Phone size={12} /> {profile.number}
                    </span>
                    <span>Joined {profile.joiningYear}</span>
                    <span>
                      {profile.inTime} – {profile.outTime}
                    </span>
                    <span>Weekly off: {profile.weeklyOff}</span>
                    <span>
                      Attendance: {profile.attendanceStatus || "Present"}
                    </span>
                  </div>
                  {profile.statusNote && (
                    <div className="profile-note">{profile.statusNote}</div>
                  )}
                  {profile.access === "Suspended" && (
                    <div className="profile-note suspended-note">
                      <Ban size={11} /> Deactivated: future institute changes
                      are paused.
                    </div>
                  )}
                  {profile.access === "Removed" && (
                    <div className="profile-note suspended-note">
                      <Ban size={11} /> Removed: institute access revoked; the
                      record is kept.
                    </div>
                  )}
                  <div className="profile-admin-actions">
                    {canManageEmployeeAccess &&
                      !isCurrentUser(profile.name) &&
                      (profile.access === "Removed" ? (
                        <button
                          className="text-button"
                          onClick={() => restoreEmployee(profile.name)}
                        >
                          <UserRound size={12} /> Restore profile
                        </button>
                      ) : (
                        <>
                          <button
                            className="text-button"
                            onClick={() =>
                              toggleEmployeeSuspension(profile.name)
                            }
                          >
                            {profile.access === "Suspended" ? (
                              <>
                                <UserRound size={12} /> Reactivate
                              </>
                            ) : (
                              <>
                                <Ban size={12} /> Deactivate
                              </>
                            )}
                          </button>
                          <button
                            className="text-button danger-text"
                            onClick={() => setRemoving(profile.name)}
                          >
                            <Trash2 size={12} /> Remove profile
                          </button>
                        </>
                      ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
          <div className="people-grid">
            {departments.map(dept => (
              <article className="people-card" key={dept.name}>
                <div className="people-card-top">
                  <span className={`dept-bullet ${dept.color}`} />
                  <span>{dept.people} people</span>
                </div>
                <h3>{dept.name}</h3>
                <div className="people-lead">
                  <Avatar
                    text={initials(dept.lead)}
                    name={dept.lead}
                    tone={dept.color}
                  />
                  <div>
                    <strong>{dept.lead}</strong>
                    <span>Department head / manager</span>
                  </div>
                </div>
                <div className="people-card-foot">
                  <span>{dept.open} open tasks</span>
                  <span>{dept.done}% done</span>
                </div>
              </article>
            ))}
          </div>
          <section className="audit-panel">
            <div className="section-header">
              <div>
                <h2>Audit trail</h2>
                <p>
                  Every task, post, MOM, attachment, deletion, and update keeps
                  the actor and timestamp.
                </p>
              </div>
              <span className="audit-lock">
                <ShieldCheck size={14} /> Leadership record
              </span>
            </div>
            <div className="audit-list">
              {activity.slice(0, 8).map(entry => (
                <div className="audit-row" key={entry.id}>
                  <div className="audit-icon">
                    <Clock3 size={14} />
                  </div>
                  <div>
                    <strong>{entry.action}</strong>
                    <span>
                      {entry.subject}
                      {entry.detail ? ` · ${entry.detail}` : ""}
                    </span>
                  </div>
                  <div className="audit-actor">
                    <Avatar
                      text={initials(entry.actor)}
                      name={entry.actor}
                      tone="saffron"
                    />
                    <span>
                      <strong>{entry.actor}</strong>
                      <small>{entry.at}</small>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
      <ConfirmDialog
        open={removing !== null}
        onOpenChange={open => {
          if (!open) setRemoving(null);
        }}
        title={`Remove ${removing ?? ""}'s profile?`}
        actions={[
          {
            label: "Remove profile",
            variant: "danger",
            onSelect: () => {
              if (removing) removeEmployee(removing);
              setRemoving(null);
            },
          },
        ]}
      >
        <p className="m-0">
          They lose institute access and are hidden from People. The record is
          kept, and you can restore it from Show removed.
        </p>
      </ConfirmDialog>
    </>
  );
}
