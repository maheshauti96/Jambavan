import { AppShell } from "@/components/jambavan/layout/AppShell";
import { JambavanProvider } from "@/components/jambavan/state/JambavanProvider";
import { MyDayProvider } from "@/components/jambavan/state/MyDayProvider";

// Composition root (§13.1). State lives in useJambavanStore (JambavanProvider); the private My Day planner has its
// own provider so no other view can read it (§11 IA-10).
export default function Home() {
  return (
    <JambavanProvider>
      <MyDayProvider>
        <AppShell />
      </MyDayProvider>
    </JambavanProvider>
  );
}
