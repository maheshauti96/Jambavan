// recipient list excludes the current owner and "You" (F17a/b, D1), and missing fields are explained inline instead
// of a silently disabled button (F10, C9).
import { useState } from "react";
import { X, Send } from "lucide-react";
import { statusLabel } from "../state/format";
import {
  handoverRecipients,
  validateHandover,
  type HandoverErrors,
} from "../state/handover";
import { useJambavan } from "../state/JambavanProvider";
import { LegacyModal } from "../primitives/LegacyModal";

export function HandoverDialog() {
  const {
    showHandoverModal,
    setShowHandoverModal,
    handoverDraft,
    setHandoverDraft,
    handoverTask,
    createHandover,
  } = useJambavan();
  const [errors, setErrors] = useState<HandoverErrors>({});
  const close = () => {
    setErrors({});
    setShowHandoverModal(false);
  };
  const submit = () => {
    if (!handoverTask) return;
    const found = validateHandover(handoverTask, handoverDraft);
    setErrors(found);
    if (Object.keys(found).length) {
      requestAnimationFrame(() =>
        document
          .querySelector<HTMLElement>('.handover-modal [aria-invalid="true"]')
          ?.focus()
      );
      return;
    }
    createHandover();
  };
  const fieldError = (key: keyof HandoverErrors) =>
    errors[key] ? (
      <span className="field-error" id={`handover-${key}-error`} role="alert">
        {errors[key]}
      </span>
    ) : null;
  const invalid = (key: keyof HandoverErrors) =>
    errors[key]
      ? { "aria-invalid": true, "aria-describedby": `handover-${key}-error` }
      : {};
  return (
    <>
      {showHandoverModal && handoverTask && (
        <LegacyModal onClose={close} className="task-modal handover-modal">
          <div className="modal-head">
            <div>
              <span className="eyebrow">
                <Send size={14} /> Task handover
              </span>
              <h2>Hand over task</h2>
              <p>Record the status and next action for the new owner.</p>
            </div>
            <button
              className="icon-button"
              aria-label="Close dialog"
              onClick={close}
            >
              <X size={18} />
            </button>
          </div>
          <div className="handover-preview">
            <span>Task</span>
            <strong>{handoverTask.title}</strong>
            <small>
              {handoverTask.project || handoverTask.team} ·{" "}
              {handoverTask.department}
            </small>
          </div>
          <div className="form-grid">
            <label>
              Hand over to
              <select
                value={handoverDraft.to}
                {...invalid("to")}
                onChange={event => {
                  setHandoverDraft({
                    ...handoverDraft,
                    to: event.target.value,
                  });
                  setErrors(current => ({ ...current, to: undefined }));
                }}
              >
                <option value="">Select employee</option>
                {handoverRecipients(handoverTask).map(person => (
                  <option key={person}>{person}</option>
                ))}
              </select>
              {fieldError("to")}
            </label>
            <label>
              Current status
              <input
                value={`${statusLabel(handoverTask.status)} · ${handoverTask.progress}% complete`}
                readOnly
              />
            </label>
          </div>
          <div className="form-grid">
            <label>
              Last action
              <textarea
                value={handoverDraft.lastAction}
                {...invalid("lastAction")}
                onChange={event => {
                  setHandoverDraft({
                    ...handoverDraft,
                    lastAction: event.target.value,
                  });
                  setErrors(current => ({ ...current, lastAction: undefined }));
                }}
                placeholder="e.g. Called principal on 5 Oct"
              />
              {fieldError("lastAction")}
            </label>
            <label>
              Waiting for
              <textarea
                value={handoverDraft.waitingFor}
                onChange={event =>
                  setHandoverDraft({
                    ...handoverDraft,
                    waitingFor: event.target.value,
                  })
                }
                placeholder="e.g. School confirmation"
              />
            </label>
            <label>
              Next action
              <textarea
                value={handoverDraft.nextAction}
                {...invalid("nextAction")}
                onChange={event => {
                  setHandoverDraft({
                    ...handoverDraft,
                    nextAction: event.target.value,
                  });
                  setErrors(current => ({ ...current, nextAction: undefined }));
                }}
                placeholder="e.g. Call again on 8 Oct"
              />
              {fieldError("nextAction")}
            </label>
            <label>
              Important notes
              <textarea
                value={handoverDraft.notes}
                onChange={event =>
                  setHandoverDraft({
                    ...handoverDraft,
                    notes: event.target.value,
                  })
                }
                placeholder="Anything the next employee should know..."
              />
            </label>
          </div>
          <div className="modal-actions">
            <button className="outline-button" onClick={close}>
              Cancel
            </button>
            <button className="primary-button" onClick={submit}>
              <Send size={15} /> Hand over task
            </button>
          </div>
        </LegacyModal>
      )}
    </>
  );
}
