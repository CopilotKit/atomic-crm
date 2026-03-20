import { createContext, useContext } from "react";

export type Persona = "explorer" | "developer" | "product" | "enterprise";

export const VALID_PERSONAS = new Set<Persona>([
  "explorer",
  "developer",
  "product",
  "enterprise",
]);

export const PERSONA_LABELS: Record<Persona, string> = {
  explorer: "Explorer",
  developer: "Developer",
  product: "Product Lead",
  enterprise: "Enterprise Buyer",
};

/** Parse persona from a query string. Exported for testing. */
export function parsePersona(search: string): Persona | null {
  const params = new URLSearchParams(search);

  const personaMode = params.get("personaMode");
  if (personaMode === "off") return null;

  const raw = params.get("persona") as Persona | null;
  if (raw && VALID_PERSONAS.has(raw)) return raw;

  return null;
}

export interface PersonaContextValue {
  persona: Persona | null;
  setPersona: (persona: Persona | null) => void;
}

export const PersonaContext = createContext<PersonaContextValue>({
  persona: null,
  setPersona: () => {},
});

export function usePersona(): PersonaContextValue {
  return useContext(PersonaContext);
}
