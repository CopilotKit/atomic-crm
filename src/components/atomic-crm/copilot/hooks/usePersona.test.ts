import { describe, it, expect } from "vitest";
import { parsePersona } from "./usePersona";

describe("parsePersona", () => {
  it("returns null when no query params are set", () => {
    expect(parsePersona("")).toBeNull();
  });

  it("returns 'explorer' for ?persona=explorer", () => {
    expect(parsePersona("?persona=explorer")).toBe("explorer");
  });

  it("returns 'developer' for ?persona=developer", () => {
    expect(parsePersona("?persona=developer")).toBe("developer");
  });

  it("returns 'product' for ?persona=product", () => {
    expect(parsePersona("?persona=product")).toBe("product");
  });

  it("returns 'enterprise' for ?persona=enterprise", () => {
    expect(parsePersona("?persona=enterprise")).toBe("enterprise");
  });

  it("returns null for invalid persona value", () => {
    expect(parsePersona("?persona=invalid")).toBeNull();
  });

  it("returns null when personaMode=off even if persona is set", () => {
    expect(parsePersona("?persona=developer&personaMode=off")).toBeNull();
  });

  it("returns persona when personaMode=on", () => {
    expect(parsePersona("?persona=product&personaMode=on")).toBe("product");
  });
});
