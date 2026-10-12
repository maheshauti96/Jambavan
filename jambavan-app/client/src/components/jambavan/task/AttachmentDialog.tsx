// the type switch exposes its pressed state.
import { useState } from "react";
import {
  BookOpenCheck,
  CheckCircle2,
  Paperclip,
  ExternalLink,
  Upload,
  ShieldCheck,
  X,
} from "lucide-react";
import { useJambavan } from "../state/JambavanProvider";
import { LegacyModal } from "../primitives/LegacyModal";

export function AttachmentDialog() {
  const {
    showAttachmentModal,
    setShowAttachmentModal,
    attachmentKind,
    setAttachmentKind,
    attachmentLink,
    setAttachmentLink,
    attachmentTask,
    addAttachments,
    addAttachmentLink,
  } = useJambavan();
  const [linkError, setLinkError] = useState("");
  const close = () => {
    setLinkError("");
    setShowAttachmentModal(false);
  };
  const submitLink = () => {
    if (addAttachmentLink()) {
      setLinkError("");
      return;
    }
    setLinkError("Enter a full link that starts with https:// or http://.");
    requestAnimationFrame(() =>
      document.getElementById("attachment-link")?.focus()
    );
  };
  return (
    <>
      {showAttachmentModal && (
        <LegacyModal onClose={close} className="task-modal attachment-modal">
          <div className="modal-head">
            <div>
              <span className="eyebrow">
                <Paperclip size={14} /> Task attachments
              </span>
              <h2>
                {attachmentKind === "evidence"
                  ? "Add completion evidence"
                  : "Add task guidance"}
              </h2>
              <p>{attachmentTask?.title || "Selected task"}</p>
            </div>
            <button
              className="icon-button"
              aria-label="Close dialog"
              onClick={close}
            >
              <X size={18} />
            </button>
          </div>
          <div className="attachment-type-switch">
            <button
              className={attachmentKind === "evidence" ? "active" : ""}
              aria-pressed={attachmentKind === "evidence"}
              onClick={() => setAttachmentKind("evidence")}
            >
              <CheckCircle2 size={14} /> Completion evidence
            </button>
            <button
              className={attachmentKind === "material" ? "active" : ""}
              aria-pressed={attachmentKind === "material"}
              onClick={() => setAttachmentKind("material")}
            >
              <BookOpenCheck size={14} /> Guidance
            </button>
          </div>
          <label className="upload-dropzone">
            <Upload size={22} />
            <strong>Upload files</strong>
            <span>Photo, PDF, Word, audio, or video</span>
            <input
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,audio/*,video/*"
              onChange={event => addAttachments(event.target.files)}
            />
          </label>
          <div className="attachment-or">
            <span>or add a link</span>
          </div>
          <div className="link-entry">
            <input
              id="attachment-link"
              type="url"
              inputMode="url"
              aria-label="Link to add"
              aria-invalid={linkError ? true : undefined}
              aria-describedby={linkError ? "attachment-link-error" : undefined}
              value={attachmentLink}
              onChange={event => {
                setAttachmentLink(event.target.value);
                setLinkError("");
              }}
              onKeyDown={event => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  submitLink();
                }
              }}
              placeholder="https://example.com/resource"
            />
            <button className="primary-button" onClick={submitLink}>
              <ExternalLink size={15} /> Add link
            </button>
          </div>
          {linkError && (
            <span
              className="field-error"
              id="attachment-link-error"
              role="alert"
            >
              {linkError}
            </span>
          )}
          <div className="attachment-note">
            <ShieldCheck size={14} />
            <span>
              <strong>Visible with the task</strong>
              <small>
                Evidence documents what was completed. Guidance gives the owner
                and assistants context before they begin.
              </small>
            </span>
          </div>
        </LegacyModal>
      )}
    </>
  );
}
