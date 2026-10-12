// Legacy avatar markup (moved from pages/Home.tsx in increment 0), kept for the views that are not yet ported.
// Increment 1 (F11): the `peoplePhotos` map pointed at hosted platform images that 404 locally, so it is removed.
// Avatars now render initials unless a real photo is supplied (the Add employee blob URL), and a photo that fails to
// load falls back to initials, so no avatar can show a broken image. Ported views use PersonAvatar instead.
import { useState } from "react";

export function Avatar({ text, tone = "indigo", name, photoOverride }: { text: string; tone?: string; name?: string; photoOverride?: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const photo = photoOverride && photoOverride !== failedSrc ? photoOverride : undefined;
  return <span className={`avatar avatar-${tone} ${photo ? "has-photo" : ""}`}>{photo ? <img src={photo} alt={`${name} profile`} onError={() => setFailedSrc(photo)} /> : text}</span>;
}
