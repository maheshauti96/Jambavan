import { Component, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";

type Props = { children: ReactNode };
type State = { kind: "ready" } | { kind: "failed"; error: Error };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { kind: "ready" };
  static getDerivedStateFromError(error: unknown): State {
    return {
      kind: "failed",
      error:
        error instanceof Error
          ? error
          : new Error("The workspace couldn't be loaded."),
    };
  }
  render() {
    if (this.state.kind === "ready") return this.props.children;
    return (
      <main className="standalone-page">
        <section>
          <span className="standalone-brand">JAMBAVAN</span>
          <h1>We couldn't load the workspace</h1>
          <p>Reload the page to try again.</p>
          <button
            type="button"
            className="primary-button"
            onClick={() => window.location.reload()}
          >
            <RotateCcw size={18} />
            Reload page
          </button>
          <details className="error-details">
            <summary>Technical details</summary>
            <pre>{this.state.error.stack || this.state.error.message}</pre>
          </details>
        </section>
      </main>
    );
  }
}
