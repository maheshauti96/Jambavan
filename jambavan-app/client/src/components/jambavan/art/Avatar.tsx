import { PersonAvatar } from "./PersonAvatar";
import { displayName } from "../state/identity";

export function Avatar({
  text,
  tone = "Leadership",
  name,
  photoOverride,
}: {
  text: string;
  tone?: string;
  name?: string;
  photoOverride?: string;
}) {
  const person = name ? displayName(name).replace(" (you)", "") : text;
  const department =
    tone === "academic" || tone === "saffron"
      ? "Academic"
      : tone === "admissions" || tone === "green"
        ? "Admissions"
        : tone === "operations"
          ? "Operations"
          : tone === "marketing"
            ? "Marketing"
            : "Leadership";
  return (
    <PersonAvatar
      name={person}
      department={department}
      photo={photoOverride}
      size="sm"
      className="avatar"
    />
  );
}
