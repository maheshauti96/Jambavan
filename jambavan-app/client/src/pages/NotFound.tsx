import { useLocation } from "wouter";
import { JourneyPath } from "@/components/jambavan/icons/RamayanaIcons";

export default function NotFound() {
  const [, setLocation] = useLocation();
  return (
    <main className="standalone-page">
      <section>
        <span className="standalone-brand">JAMBAVAN</span>
        <h1>Page not found</h1>
        <JourneyPath size={48} />
        <p>This link doesn't lead to a page in the workspace.</p>
        <button
          type="button"
          className="primary-button"
          onClick={() => setLocation("/")}
        >
          Back to the workspace
        </button>
      </section>
    </main>
  );
}
