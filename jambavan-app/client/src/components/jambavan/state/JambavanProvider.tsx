import { createContext, useContext, type ReactNode } from "react";
import { useJambavanStore, type JambavanStore } from "./useJambavanStore";

// Exposes the store through context so views do not take 20 props (§13.2).
const JambavanContext = createContext<JambavanStore | null>(null);

export function JambavanProvider({ children }: { children: ReactNode }) {
  const store = useJambavanStore();
  return (
    <JambavanContext.Provider value={store}>
      {children}
    </JambavanContext.Provider>
  );
}

export function useJambavan(): JambavanStore {
  const store = useContext(JambavanContext);
  if (!store)
    throw new Error("useJambavan must be used inside <JambavanProvider>");
  return store;
}
