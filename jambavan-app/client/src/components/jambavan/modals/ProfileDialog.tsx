import { X, UserRound, Save } from "lucide-react";
import type { EmployeeProfile } from "../state/types";
import { initials } from "../state/format";
import { Avatar } from "../art/Avatar";
import { useJambavan } from "../state/JambavanProvider";
import { LegacyModal } from "../primitives/LegacyModal";

export function ProfileDialog() {
  const {
    showProfileModal,
    setShowProfileModal,
    profileDraft,
    setProfileDraft,
    saveMyProfile,
  } = useJambavan();
  return (
    <>
      {showProfileModal && (
        <LegacyModal
          onClose={() => setShowProfileModal(false)}
          className="task-modal profile-modal"
        >
          <div className="modal-head">
            <div>
              <span className="eyebrow">
                <UserRound size={14} /> My employee profile
              </span>
              <h2>Manage my profile</h2>
              <p>
                Keep your contact, work schedule, availability, and daily
                attendance current for the whole team.
              </p>
            </div>
            <button
              className="icon-button"
              aria-label="Close dialog"
              onClick={() => setShowProfileModal(false)}
            >
              <X size={18} />
            </button>
          </div>
          <div className="profile-edit-identity">
            <Avatar
              text={initials(profileDraft.name)}
              name={profileDraft.name}
              tone="indigo"
            />
            <div>
              <strong>{profileDraft.name}</strong>
              <span>
                {profileDraft.position} · {profileDraft.department}
              </span>
              <small>
                Profile photograph is compulsory and already on file.
              </small>
            </div>
          </div>
          <div className="form-grid">
            <label>
              Contact number
              <input
                value={profileDraft.number}
                onChange={event =>
                  setProfileDraft({
                    ...profileDraft,
                    number: event.target.value,
                  })
                }
              />
            </label>
            <label>
              Year of joining
              <input
                value={profileDraft.joiningYear}
                onChange={event =>
                  setProfileDraft({
                    ...profileDraft,
                    joiningYear: event.target.value,
                  })
                }
              />
            </label>
            <label>
              In time
              <input
                value={profileDraft.inTime}
                onChange={event =>
                  setProfileDraft({
                    ...profileDraft,
                    inTime: event.target.value,
                  })
                }
              />
            </label>
            <label>
              Out time
              <input
                value={profileDraft.outTime}
                onChange={event =>
                  setProfileDraft({
                    ...profileDraft,
                    outTime: event.target.value,
                  })
                }
              />
            </label>
            <label>
              Weekly off
              <select
                value={profileDraft.weeklyOff}
                onChange={event =>
                  setProfileDraft({
                    ...profileDraft,
                    weeklyOff: event.target.value,
                  })
                }
              >
                <option>Sunday</option>
                <option>Monday</option>
                <option>Tuesday</option>
                <option>Wednesday</option>
                <option>Thursday</option>
                <option>Friday</option>
                <option>Saturday</option>
              </select>
            </label>
            <label>
              Availability
              <select
                value={profileDraft.status}
                onChange={event =>
                  setProfileDraft({
                    ...profileDraft,
                    status: event.target.value as EmployeeProfile["status"],
                  })
                }
              >
                <option>Available</option>
                <option>On leave</option>
                <option>Sick</option>
              </select>
            </label>
            <label>
              Attendance today
              <select
                value={profileDraft.attendanceStatus || "Present"}
                onChange={event =>
                  setProfileDraft({
                    ...profileDraft,
                    attendanceStatus: event.target
                      .value as EmployeeProfile["attendanceStatus"],
                  })
                }
              >
                <option>Present</option>
                <option>Late</option>
                <option>Absent</option>
                <option>On leave</option>
              </select>
            </label>
            <label className="wide-field">
              Availability note
              <input
                value={profileDraft.statusNote || ""}
                onChange={event =>
                  setProfileDraft({
                    ...profileDraft,
                    statusNote: event.target.value,
                  })
                }
                placeholder="e.g. Back on 08 Oct"
              />
            </label>
          </div>
          <div className="modal-actions">
            <button
              className="outline-button"
              onClick={() => setShowProfileModal(false)}
            >
              Cancel
            </button>
            <button className="primary-button" onClick={saveMyProfile}>
              <Save size={15} /> Save profile
            </button>
          </div>
        </LegacyModal>
      )}
    </>
  );
}
