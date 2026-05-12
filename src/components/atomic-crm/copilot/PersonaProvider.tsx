import { useState, type ReactNode } from "react";
import { PersonaContext, parsePersona, type Persona } from "./hooks/usePersona";

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [persona, setPersona] = useState<Persona | null>(() =>
    parsePersona(window.location.search),
  );

  return (
    <PersonaContext.Provider value={{ persona, setPersona }}>
      {children}
    </PersonaContext.Provider>
  );
}
