export type DemoState =
  | "S0_IDLE"
  | "S1_OPEN_CONTACT"
  | "S2_AGENT_REVIEW"
  | "S3_CONTRACT_ANALYSIS"
  | "S4_FORECAST_PROPOSAL"
  | "S5_APPROVAL_PENDING"
  | "S6_AUDIT_LOG";

export interface DemoStepDef {
  /** CSS selector for driver.js element target. null = centered modal. */
  element: string | null;
  /** Popover description text */
  description: string;
  /** Popover title */
  title: string;
  /** Popover side preference */
  side?: "top" | "bottom" | "left" | "right";
  /** Route to navigate to (if different from current) */
  route?: string;
  /** Whether this state auto-transitions (no "Next" button) */
  autoTransition?: boolean;
  /** Label for the advance button. Default: "Next". */
  advanceLabel?: string;
}

/**
 * Returns step definitions keyed by state.
 * When autoAgent=false, S2/S3/S4 highlight the action button instead of the copilot panel.
 */
export function getDemoSteps(
  autoAgent: boolean,
): Record<DemoState, DemoStepDef> {
  return {
    S0_IDLE: {
      element: null,
      title: "Welcome",
      description:
        "Welcome to the Atomic CRM demo. We'll walk through an account review, contract analysis, renewal forecast, and audit trail.",
    },
    S1_OPEN_CONTACT: {
      element: '[data-demo="contact-card"]',
      title: "Contact Detail",
      description:
        "This is Fannie Pfeffer at Schmitt and Sons — a contact in renewal stage.",
      side: "bottom",
      route: "__CONTACT_ROUTE__",
    },
    S2_AGENT_REVIEW: autoAgent
      ? {
          element: '[data-demo="copilot-panel"]',
          title: "Account Review",
          description:
            "The agent analyzes the account: contacts breakdown, missing signals, risk indicators, and next actions.",
          side: "left",
        }
      : {
          element: '[data-demo="review-btn"]',
          title: "Account Review",
          description:
            "Click 'Review Account' to have the agent analyze this account.",
          side: "left",
        },
    S3_CONTRACT_ANALYSIS: autoAgent
      ? {
          element: '[data-demo="copilot-panel"]',
          title: "Contract Risk Scan",
          description:
            "The MCP contract analyzer scans the Schmitt and Sons MSA for risk clauses.",
          side: "left",
        }
      : {
          element: '[data-demo="contract-btn"]',
          title: "Contract Risk Scan",
          description:
            "Click 'Analyze Contract' to scan the Schmitt and Sons MSA.",
          side: "left",
        },
    S4_FORECAST_PROPOSAL: {
      element: autoAgent
        ? '[data-demo="copilot-panel"]'
        : '[data-demo="forecast-btn"]',
      title: "Renewal Forecast",
      description: autoAgent
        ? "The agent proposes a renewal forecast adjustment based on risk signals."
        : "Click 'Forecast' to propose a renewal adjustment.",
      side: "left",
      autoTransition: true,
    },
    S5_APPROVAL_PENDING: {
      element: '[data-demo="hitl-card"]',
      title: "Human Approval",
      description:
        "Admin approval required. Review the proposed changes and approve or reject.",
      side: "left",
    },
    S6_AUDIT_LOG: {
      element: '[data-demo="audit-list"]',
      title: "Audit Trail",
      description:
        "Every agent action is logged. Full traceability for compliance.",
      side: "top",
      route: "/audit",
      advanceLabel: "Finish",
    },
  };
}
