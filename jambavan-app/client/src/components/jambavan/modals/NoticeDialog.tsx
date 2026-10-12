import {
  Upload,
  ShieldCheck,
  Users,
  X,
  Megaphone,
  Send,
  MessageCircleQuestion,
} from "lucide-react";
import type { NoticeAudience, Notice } from "../state/types";
import { noticeTargetOptions, departments } from "../state/seed";
import { useJambavan } from "../state/JambavanProvider";
import { LegacyModal } from "../primitives/LegacyModal";
import { useFormErrors } from "../primitives/formErrors";

export function NoticeDialog() {
  const {
    showNoticeModal,
    setShowNoticeModal,
    noticeDraft,
    setNoticeDraft,
    notice,
    createNotice,
    addNoticeMedia,
  } = useJambavan();
  // F10 (C9): a notice needs a title, a message or media, and targeted notices need at least one recipient.
  const form = useFormErrors<"title" | "recipients">("notice");
  const close = () => {
    form.reset();
    setShowNoticeModal(false);
  };
  const submit = () => {
    if (
      form.check({
        title:
          noticeDraft.title.trim() ||
          noticeDraft.body.trim() ||
          noticeDraft.media
            ? ""
            : "Add a title, a message, or media.",
        recipients:
          noticeDraft.audience === "Everyone" || noticeDraft.recipients.length
            ? ""
            : "Choose at least one recipient group.",
      })
    )
      createNotice();
  };
  return (
    <>
      {showNoticeModal && (
        <LegacyModal onClose={close} className="task-modal notice-modal">
          <div className="modal-head">
            <div>
              <span className="eyebrow">
                <Megaphone size={14} /> Notice board
              </span>
              <h2>Send a notice</h2>
              <p>
                Choose exactly who should receive the timetable, schedule,
                announcement, or media update.
              </p>
            </div>
            <button
              className="icon-button"
              aria-label="Close dialog"
              onClick={close}
            >
              <X size={18} />
            </button>
          </div>
          <div className="form-grid">
            <label>
              Notice title
              <input
                autoFocus
                value={noticeDraft.title}
                {...form.props("title")}
                onChange={event => {
                  setNoticeDraft({ ...noticeDraft, title: event.target.value });
                  form.clear("title");
                }}
                placeholder="e.g. Sunday mock-test schedule"
              />
              {form.message("title")}
            </label>
            <label>
              Delivery mode
              <select
                value={noticeDraft.audience}
                onChange={event =>
                  setNoticeDraft({
                    ...noticeDraft,
                    audience: event.target.value as NoticeAudience,
                    recipients:
                      event.target.value === "Everyone"
                        ? ["Entire institute"]
                        : ["Academic"],
                  })
                }
              >
                <option value="Targeted">Targeted groups</option>
                <option value="Everyone">Everyone</option>
              </select>
            </label>
          </div>
          {noticeDraft.audience === "Everyone" ? (
            <div className="notice-everyone">
              <Megaphone size={15} />
              <strong>Everyone in the institute</strong>
              <span>
                All Directors, Department Heads, candidates, and departments
                will receive this notice.
              </span>
            </div>
          ) : (
            <div className="notice-recipient-picker">
              <div className="assistant-picker-head">
                <span>
                  <Users size={15} /> Select any combination of recipients
                </span>
                <small>{noticeDraft.recipients.length} selected</small>
              </div>
              {form.message("recipients")}
              <div className="notice-target-grid">
                {noticeTargetOptions.map(target => (
                  <label key={target}>
                    <input
                      type="checkbox"
                      checked={noticeDraft.recipients.includes(target)}
                      onChange={event => {
                        form.clear("recipients");
                        setNoticeDraft(current => ({
                          ...current,
                          recipients: event.target.checked
                            ? [...current.recipients, target]
                            : current.recipients.filter(
                                name => name !== target
                              ),
                        }));
                      }}
                    />
                    <span>{target}</span>
                    {target === "Directors" ||
                    target === "Department heads" ||
                    target === "Candidates" ? (
                      <small>role group</small>
                    ) : (
                      <small>department</small>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}
          <label>
            Message / notice
            <textarea
              value={noticeDraft.body}
              onChange={event => {
                setNoticeDraft({ ...noticeDraft, body: event.target.value });
                form.clear("title");
              }}
              placeholder="Write the schedule, instruction, or announcement..."
            />
          </label>
          <label className="notice-upload">
            <Upload size={18} />
            <span>
              <strong>
                {noticeDraft.media
                  ? noticeDraft.media.name
                  : "Attach image, audio, or video"}
              </strong>
              <small>Optional · image/*, audio/*, video/*</small>
            </span>
            <input
              type="file"
              accept="image/*,audio/*,video/*"
              onChange={event => addNoticeMedia(event.target.files?.[0])}
            />
          </label>
          <label>
            Notice period
            <select
              value={noticeDraft.period}
              onChange={event =>
                setNoticeDraft({
                  ...noticeDraft,
                  period: event.target.value as Notice["period"],
                })
              }
            >
              <option>12 hours</option>
              <option>24 hours</option>
              <option>7 days</option>
              <option>1 month</option>
            </select>
            <small>
              After this period the notice moves to the bin and is retained for
              30 days.
            </small>
          </label>
          <label className="team-toggle notice-reply-toggle">
            <input
              type="checkbox"
              checked={noticeDraft.requiresReply}
              onChange={event =>
                setNoticeDraft({
                  ...noticeDraft,
                  requiresReply: event.target.checked,
                })
              }
            />
            <span>
              <MessageCircleQuestion size={16} />
              <strong>Ask recipients to reply</strong>
              <small>
                Replies are private to the sender, Department Heads, Directors,
                and CEO.
              </small>
            </span>
          </label>
          <div className="manager-rule">
            <ShieldCheck size={15} />
            <span>
              <strong>Audience visibility</strong>
              <small>
                Recipients see this in their feed. Department heads and above
                can review institute notices.
              </small>
            </span>
          </div>
          <div className="modal-actions">
            <button className="outline-button" onClick={close}>
              Cancel
            </button>
            <button className="primary-button" onClick={submit}>
              <Send size={15} /> Send notice
            </button>
          </div>
        </LegacyModal>
      )}
    </>
  );
}
