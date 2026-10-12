import {
  Plus,
  Users,
  X,
  Send,
  MessageCircleQuestion,
  BarChart3,
} from "lucide-react";
import type { FeedbackKind } from "../state/types";
import { useJambavan } from "../state/JambavanProvider";
import { LegacyModal } from "../primitives/LegacyModal";
import { useFormErrors } from "../primitives/formErrors";

export function FeedbackDialog() {
  const {
    showFeedbackModal,
    setShowFeedbackModal,
    feedbackDraft,
    setFeedbackDraft,
    eventPlans,
    notice,
    createFeedback,
  } = useJambavan();
  // F10 (C9): a request needs a title, a question, recipients, and (for a poll) two choices.
  const form = useFormErrors<"title" | "prompt" | "targets" | "options">(
    "feedback"
  );
  const close = () => {
    form.reset();
    setShowFeedbackModal(false);
  };
  const submit = () => {
    if (
      form.check({
        title: feedbackDraft.title.trim() ? "" : "Enter a request title.",
        prompt: feedbackDraft.prompt.trim()
          ? ""
          : "Enter the question people should answer.",
        targets: feedbackDraft.targets.length
          ? ""
          : "Choose at least one recipient group.",
        options:
          feedbackDraft.kind !== "Poll" ||
          feedbackDraft.options.filter(option => option.trim()).length >= 2
            ? ""
            : "A poll needs at least two choices.",
      })
    )
      createFeedback();
  };
  return (
    <>
      {showFeedbackModal && (
        <LegacyModal onClose={close} className="task-modal feedback-modal">
          <div className="modal-head">
            <div>
              <span className="eyebrow">
                <MessageCircleQuestion size={14} /> Feedback request
              </span>
              <h2>Ask for feedback</h2>
              <p>Choose a response format and select who should receive it.</p>
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
              Request title
              <input
                autoFocus
                value={feedbackDraft.title}
                {...form.props("title")}
                onChange={event => {
                  setFeedbackDraft({
                    ...feedbackDraft,
                    title: event.target.value,
                  });
                  form.clear("title");
                }}
                placeholder="e.g. Faculty room arrangement"
              />
              {form.message("title")}
            </label>
            <label>
              Event
              <select
                value={feedbackDraft.eventId}
                onChange={event =>
                  setFeedbackDraft({
                    ...feedbackDraft,
                    eventId: Number(event.target.value),
                  })
                }
              >
                {eventPlans
                  .filter(plan => !plan.isTemplate)
                  .map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.title}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              Response type
              <select
                value={feedbackDraft.kind}
                onChange={event =>
                  setFeedbackDraft({
                    ...feedbackDraft,
                    kind: event.target.value as FeedbackKind,
                  })
                }
              >
                <option>Poll</option>
                <option>Open question</option>
                <option>5-star rating</option>
              </select>
            </label>
          </div>
          <label>
            Question
            <input
              value={feedbackDraft.prompt}
              {...form.props("prompt")}
              onChange={event => {
                setFeedbackDraft({
                  ...feedbackDraft,
                  prompt: event.target.value,
                });
                form.clear("prompt");
              }}
              placeholder="What would you like people to answer?"
            />
            {form.message("prompt")}
          </label>
          {feedbackDraft.kind === "Poll" && (
            <div className="feedback-option-editor">
              <div className="assistant-picker-head">
                <span>
                  <BarChart3 size={14} /> Poll choices
                </span>
                <button
                  className="text-button"
                  onClick={() =>
                    setFeedbackDraft(current => ({
                      ...current,
                      options: [
                        ...current.options,
                        `Option ${current.options.length + 1}`,
                      ],
                    }))
                  }
                >
                  <Plus size={13} /> Add choice
                </button>
              </div>
              {feedbackDraft.options.map((option, index) => (
                <input
                  key={index}
                  aria-label={`Poll choice ${index + 1}`}
                  value={option}
                  onChange={event =>
                    setFeedbackDraft(current => ({
                      ...current,
                      options: current.options.map((item, itemIndex) =>
                        itemIndex === index ? event.target.value : item
                      ),
                    }))
                  }
                />
              ))}
              {form.message("options")}
            </div>
          )}
          <div className="feedback-recipient-picker">
            <div className="assistant-picker-head">
              <span>
                <Users size={15} /> Select recipients
              </span>
              <small>{feedbackDraft.targets.length} selected</small>
            </div>
            {form.message("targets")}
            <div className="notice-target-grid">
              {[
                "Directors",
                "Department heads",
                "Candidates",
                "Academic",
                "Admissions",
                "Operations",
                "Marketing",
              ].map(target => (
                <label key={target}>
                  <input
                    type="checkbox"
                    checked={feedbackDraft.targets.includes(target)}
                    onChange={event => {
                      form.clear("targets");
                      setFeedbackDraft(current => ({
                        ...current,
                        targets: event.target.checked
                          ? [...current.targets, target]
                          : current.targets.filter(name => name !== target),
                      }));
                    }}
                  />
                  <span>{target}</span>
                  <small>group</small>
                </label>
              ))}
            </div>
          </div>
          <div className="modal-actions">
            <button className="outline-button" onClick={close}>
              Cancel
            </button>
            <button className="primary-button" onClick={submit}>
              <Send size={15} /> Send request
            </button>
          </div>
        </LegacyModal>
      )}
    </>
  );
}
