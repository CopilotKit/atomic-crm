import { describe, it, expect } from "vitest";
import {
  demoReducer,
  initialState,
  computeCanAdvance,
} from "./useDemoStateMachine";
import type { DemoMachineState } from "./useDemoStateMachine";

describe("demoReducer", () => {
  it("starts in S0_IDLE", () => {
    expect(initialState.state).toBe("S0_IDLE");
    expect(initialState.agentPhase).toBe("idle");
    expect(initialState.errorCount).toBe(0);
  });

  it("advances S0 → S1", () => {
    const next = demoReducer(initialState, { type: "ADVANCE" });
    expect(next.state).toBe("S1_OPEN_CONTACT");
    expect(next.agentPhase).toBe("idle");
    expect(next.errorCount).toBe(0);
  });

  it("advances S1 → S2", () => {
    const s1: DemoMachineState = { ...initialState, state: "S1_OPEN_CONTACT" };
    const next = demoReducer(s1, { type: "ADVANCE" });
    expect(next.state).toBe("S2_AGENT_REVIEW");
    expect(next.agentPhase).toBe("idle");
  });

  it("advances through all states in order", () => {
    let s: DemoMachineState = initialState;
    const expected = [
      "S1_OPEN_CONTACT",
      "S2_AGENT_REVIEW",
      "S3_CONTRACT_ANALYSIS",
      "S4_FORECAST_PROPOSAL",
      "S5_APPROVAL_PENDING",
      "S6_AUDIT_LOG",
      "DONE",
    ];
    for (const expectedState of expected) {
      s = demoReducer(s, { type: "ADVANCE" });
      expect(s.state).toBe(expectedState);
    }
  });

  it("DONE does not advance further", () => {
    const done: DemoMachineState = { ...initialState, state: "DONE" };
    const next = demoReducer(done, { type: "ADVANCE" });
    expect(next.state).toBe("DONE");
  });

  it("resets to initial state", () => {
    const s2: DemoMachineState = {
      ...initialState,
      state: "S2_AGENT_REVIEW",
      agentPhase: "running",
      errorCount: 1,
    };
    const next = demoReducer(s2, { type: "RESET" });
    expect(next).toEqual(initialState);
  });

  it("tracks agent phase: idle → running", () => {
    const s2: DemoMachineState = {
      ...initialState,
      state: "S2_AGENT_REVIEW",
      agentPhase: "idle",
    };
    const next = demoReducer(s2, { type: "AGENT_STARTED" });
    expect(next.agentPhase).toBe("running");
  });

  it("tracks agent phase: running → done", () => {
    const s2: DemoMachineState = {
      ...initialState,
      state: "S2_AGENT_REVIEW",
      agentPhase: "running",
    };
    const next = demoReducer(s2, { type: "AGENT_FINISHED" });
    expect(next.agentPhase).toBe("done");
  });

  it("increments error count", () => {
    const s2: DemoMachineState = {
      ...initialState,
      state: "S2_AGENT_REVIEW",
    };
    const next = demoReducer(s2, { type: "AGENT_ERROR" });
    expect(next.errorCount).toBe(1);
    expect(next.agentPhase).toBe("idle");
  });

  it("SKIP_STATE advances and resets error/phase", () => {
    const s3: DemoMachineState = {
      ...initialState,
      state: "S3_CONTRACT_ANALYSIS",
      errorCount: 2,
      agentPhase: "idle",
    };
    const next = demoReducer(s3, { type: "SKIP_STATE" });
    expect(next.state).toBe("S4_FORECAST_PROPOSAL");
    expect(next.errorCount).toBe(0);
    expect(next.agentPhase).toBe("idle");
  });

  it("RESTART from DONE returns to S0_IDLE", () => {
    const done: DemoMachineState = { ...initialState, state: "DONE" };
    const next = demoReducer(done, { type: "RESTART" });
    expect(next).toEqual(initialState);
  });

  it("RESTART from any state returns to S0_IDLE", () => {
    const s3: DemoMachineState = {
      ...initialState,
      state: "S3_CONTRACT_ANALYSIS",
      agentPhase: "done",
      errorCount: 1,
    };
    const next = demoReducer(s3, { type: "RESTART" });
    expect(next).toEqual(initialState);
  });
});

describe("computeCanAdvance", () => {
  it("S0 is always advanceable", () => {
    expect(computeCanAdvance({ ...initialState, state: "S0_IDLE" })).toBe(true);
  });

  it("S1 is advanceable when elementReady is true", () => {
    expect(
      computeCanAdvance({ ...initialState, state: "S1_OPEN_CONTACT" }, true),
    ).toBe(true);
    expect(
      computeCanAdvance({ ...initialState, state: "S1_OPEN_CONTACT" }, false),
    ).toBe(false);
  });

  it("S2 is advanceable only when agentPhase is done", () => {
    expect(
      computeCanAdvance({
        ...initialState,
        state: "S2_AGENT_REVIEW",
        agentPhase: "idle",
      }),
    ).toBe(false);
    expect(
      computeCanAdvance({
        ...initialState,
        state: "S2_AGENT_REVIEW",
        agentPhase: "running",
      }),
    ).toBe(false);
    expect(
      computeCanAdvance({
        ...initialState,
        state: "S2_AGENT_REVIEW",
        agentPhase: "done",
      }),
    ).toBe(true);
  });

  it("S4 is never manually advanceable (auto-transitions)", () => {
    expect(
      computeCanAdvance({
        ...initialState,
        state: "S4_FORECAST_PROPOSAL",
        agentPhase: "done",
      }),
    ).toBe(false);
  });

  it("S5 is advanceable only when agentPhase is done", () => {
    expect(
      computeCanAdvance({
        ...initialState,
        state: "S5_APPROVAL_PENDING",
        agentPhase: "idle",
      }),
    ).toBe(false);
    expect(
      computeCanAdvance({
        ...initialState,
        state: "S5_APPROVAL_PENDING",
        agentPhase: "done",
      }),
    ).toBe(true);
  });

  it("S6 is always advanceable", () => {
    expect(computeCanAdvance({ ...initialState, state: "S6_AUDIT_LOG" })).toBe(
      true,
    );
  });
});
