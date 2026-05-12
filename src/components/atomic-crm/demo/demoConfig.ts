export const DEMO_CONTACT = {
  firstName: "Fannie",
  lastName: "Pfeffer",
  companyName: "Schmitt and Sons",
};

export const DEMO_PROMPTS = {
  S2_AGENT_REVIEW: `Review the account for ${DEMO_CONTACT.firstName} ${DEMO_CONTACT.lastName} at ${DEMO_CONTACT.companyName}. Show account summary, missing signals, risk indicators, and next actions.`,
  S3_CONTRACT_ANALYSIS: `Analyze the contract for ${DEMO_CONTACT.companyName}. Show the contract risk report.`,
  S4_FORECAST_PROPOSAL: `Review the renewal forecast for ${DEMO_CONTACT.firstName} ${DEMO_CONTACT.lastName} and propose an adjustment if warranted.`,
};

export type DemoMode = "guided" | "autoplay" | "kiosk";

export const DOM_POLL_TIMEOUT_MS = 5000;
export const DOM_POLL_INTERVAL_MS = 100;
export const MAX_AGENT_RETRIES = 2;

/** Per-state dwell time (ms) — how long to pause after canAdvance before auto-advancing */
export const DWELL_TIMES: Record<string, number> = {
  S0_IDLE: 3000,
  S1_OPEN_CONTACT: 3000,
  S2_AGENT_REVIEW: 5000,
  S3_CONTRACT_ANALYSIS: 5000,
  S4_FORECAST_PROPOSAL: 2000,
  S5_APPROVAL_PENDING: 4000,
  S6_AUDIT_LOG: 4000,
};

/** Delay before auto-clicking approve in S5 (ms) */
export const AUTO_APPROVE_DELAY_MS = 2000;
