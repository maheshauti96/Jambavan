// Moved verbatim from pages/Home.tsx (checkpoint 5f248af) in increment 0 (§13). Do not change behaviour here.
import { AlertCircle, CheckCircle2, Circle, Clock3 } from "lucide-react";
import type { Status } from "../state/types";

export function StatusIcon({ status }: { status: Status }) {
  if (status === "done") return <CheckCircle2 size={15} />;
  if (status === "progress") return <Clock3 size={15} />;
  if (status === "blocked") return <AlertCircle size={15} />;
  return <Circle size={15} />;
}
