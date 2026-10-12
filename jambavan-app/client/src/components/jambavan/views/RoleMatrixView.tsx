// F9 (B11): the permission rows now use a keyed Fragment, which removes the React key warning.
import { Fragment } from "react";
import { LockKeyhole, Download, ShieldCheck } from "lucide-react";
import { accessPermissionList, accessRoleList } from "../state/seed";
import { useJambavan } from "../state/JambavanProvider";

export function RoleMatrixView() {
  const {
    activeView,
    tasks,
    leadershipRole,
    accessMatrix,
    canManageEmployeeAccess,
    toggleAccessPermission,
  } = useJambavan();
  return (
    <>
      {activeView === "roleMatrix" && canManageEmployeeAccess && (
        <section className="access-matrix-view">
          <section className="access-matrix-hero">
            <div className="access-matrix-mark">
              <ShieldCheck size={25} />
            </div>
            <div>
              <span className="eyebrow">Permission settings</span>
              <h2>Role permissions</h2>
              <p>
                Only Directors and the CEO can change this matrix. Changes are
                recorded in the audit trail and apply across the institute
                workspace.
              </p>
            </div>
            <span className="matrix-role-pill">
              Editing as {leadershipRole}
            </span>
          </section>
          <div className="access-matrix-card">
            <div className="section-header">
              <div>
                <h2>Permission matrix</h2>
                <p>
                  Toggle permissions for each role. Department and personal
                  visibility rules still apply.
                </p>
              </div>
              <span className="audit-lock">
                <LockKeyhole size={13} /> Leadership only
              </span>
            </div>
            <div className="access-matrix-scroll">
              <div className="access-matrix-grid">
                <div className="matrix-corner">Permission</div>
                {accessRoleList.map(role => (
                  <div className="matrix-role" key={role}>
                    {role}
                  </div>
                ))}
                {accessPermissionList.map(permission => (
                  <Fragment key={permission}>
                    <div
                      className="matrix-permission"
                      key={`${permission}-label`}
                    >
                      <strong>{permission}</strong>
                      <small>
                        {permission === "View private tasks"
                          ? "Personal and confidential work"
                          : permission === "Export reports"
                            ? "Download institute summaries"
                            : "Workspace capability"}
                      </small>
                    </div>
                    {accessRoleList.map(role => (
                      <label
                        className={`matrix-toggle ${accessMatrix[role][permission] ? "enabled" : ""}`}
                        key={`${role}-${permission}`}
                      >
                        <input
                          type="checkbox"
                          aria-label={`${role}: ${permission}`}
                          checked={accessMatrix[role][permission]}
                          onChange={() =>
                            toggleAccessPermission(role, permission)
                          }
                        />
                        <span>
                          {accessMatrix[role][permission]
                            ? "Allowed"
                            : "Restricted"}
                        </span>
                      </label>
                    ))}
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
          <div className="access-matrix-footer">
            <ShieldCheck size={16} />
            <span>
              <strong>Guardrail</strong>
              <small>
                CEO and Directors retain full visibility. This matrix controls
                role defaults; a specific assignment or higher hierarchy can
                still grant additional visibility where your policy allows.
              </small>
            </span>
          </div>
        </section>
      )}
    </>
  );
}
