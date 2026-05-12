import { describe, it, expect, vi, afterEach } from "vitest";
import { getDwellTime, autoApproveViaDOM } from "./useAutoAdvance";

describe("getDwellTime", () => {
  it("returns configured dwell for known states", () => {
    expect(getDwellTime("S0_IDLE")).toBe(3000);
    expect(getDwellTime("S2_AGENT_REVIEW")).toBe(5000);
    expect(getDwellTime("S6_AUDIT_LOG")).toBe(4000);
  });

  it("returns 3000 for unknown states", () => {
    expect(getDwellTime("UNKNOWN_STATE")).toBe(3000);
  });
});

describe("autoApproveViaDOM", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("clicks the approve button inside hitl-card", () => {
    const btn = document.createElement("button");
    const clickSpy = vi.fn();
    btn.addEventListener("click", clickSpy);

    const card = document.createElement("div");
    card.setAttribute("data-demo", "hitl-card");
    card.appendChild(btn);
    document.body.appendChild(card);

    autoApproveViaDOM();
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("does nothing when hitl-card is not in the DOM", () => {
    autoApproveViaDOM();
  });
});
