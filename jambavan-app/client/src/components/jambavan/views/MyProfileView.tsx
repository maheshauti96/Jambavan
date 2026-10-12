import { ShieldCheck, UserRound } from "lucide-react";
import { initials } from "../state/format";
import { Avatar } from "../art/Avatar";
import { useJambavan } from "../state/JambavanProvider";

export function MyProfileView() {
  const {
    activeView,
    profiles,
    profileDraft: draft,
    openMyProfile,
  } = useJambavan();
  // Phase 5: the view shows the saved profile, not the edit draft, so a cancelled edit never appears here.
  const profileDraft =
    profiles.find(profile => profile.name === "Arjun Mehta") ?? draft;
  return (
    <>
      {activeView === "myProfile" && (
        <section className="self-profile-page">
          <div className="self-profile-hero">
            <div>
              <span className="eyebrow">
                <UserRound size={14} /> Self-service profile
              </span>
              <h2>Profile details</h2>
              <p>
                Update the details your colleagues use to coordinate with you.
                Changes are recorded with your name and time.
              </p>
            </div>
            <button className="primary-button" onClick={openMyProfile}>
              <UserRound size={15} /> Edit my profile
            </button>
          </div>
          <div className="self-profile-grid">
            <article className="self-profile-card identity">
              <Avatar
                text={initials(profileDraft.name)}
                name={profileDraft.name}
                photoOverride={profileDraft.photo}
                tone="indigo"
              />
              <h3>{profileDraft.name}</h3>
              <p>
                {profileDraft.position} · {profileDraft.department}
              </p>
              <span className="profile-status status-active">
                {profileDraft.access}
              </span>
              <small>
                Profile photograph is compulsory and visible across JAMBAVAN.
              </small>
            </article>
            <article className="self-profile-card">
              <span className="eyebrow">Today</span>
              <h3>Attendance today</h3>
              <strong className="profile-big-status">
                {profileDraft.attendanceStatus || "Present"}
              </strong>
              <p>
                {profileDraft.statusNote || "No leave or health note added."}
              </p>
              <button className="outline-button" onClick={openMyProfile}>
                Update attendance and availability
              </button>
            </article>
            <article className="self-profile-card">
              <span className="eyebrow">Work schedule</span>
              <h3>Working pattern</h3>
              <div className="self-profile-facts">
                <span>
                  <b>In time</b>
                  {profileDraft.inTime}
                </span>
                <span>
                  <b>Out time</b>
                  {profileDraft.outTime}
                </span>
                <span>
                  <b>Weekly off</b>
                  {profileDraft.weeklyOff}
                </span>
                <span>
                  <b>Joined</b>
                  {profileDraft.joiningYear}
                </span>
              </div>
            </article>
          </div>
          <div className="self-profile-note">
            <ShieldCheck size={16} />
            <span>
              <strong>Visible to the team</strong>
              <small>
                Your name, photograph, position, contact number, working hours,
                weekly off, attendance status, and leave note are visible in the
                employee directory.
              </small>
            </span>
          </div>
        </section>
      )}
    </>
  );
}
