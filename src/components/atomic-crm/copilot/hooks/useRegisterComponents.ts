import { useComponent } from "@copilotkit/react-core/v2";
import { z } from "zod";

// Primitives
import { Heading } from "../components/primitives/Heading";
import { StatCard } from "../components/primitives/StatCard";
import { BulletList } from "../components/primitives/BulletList";
import { KeyValue } from "../components/primitives/KeyValue";
import { Alert } from "../components/primitives/Alert";
import { ProgressBar } from "../components/primitives/ProgressBar";
import { Badge } from "../components/primitives/Badge";
import { MetricRow } from "../components/primitives/MetricRow";
import { SignalList } from "../components/primitives/SignalList";
import { RiskSection } from "../components/primitives/RiskSection";
import { ActionList } from "../components/primitives/ActionList";
import { ComparisonCard } from "../components/primitives/ComparisonCard";
import { RankedList } from "../components/primitives/RankedList";

// Composites
import { AccountSummary } from "../components/composites/AccountSummary";
import { MissingSignals } from "../components/composites/MissingSignals";
import { RiskIndicators } from "../components/composites/RiskIndicators";
import { NextActions } from "../components/composites/NextActions";
import { ContractRiskReport } from "../components/composites/ContractRiskReport";
import { ForecastAdjustment } from "../components/composites/ForecastAdjustment";
import { LeadPriorityList } from "../components/composites/LeadPriorityList";

export function useRegisterComponents() {
  // ─── Atomic Primitives ──────────────────────────────────────────────

  useComponent({
    name: "Heading",
    description:
      "Display a section heading. Use level 1 for main titles, 2 for section titles, 3 for subsections.",
    parameters: z.object({
      text: z.string(),
      level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    }),
    render: Heading,
  });

  useComponent({
    name: "StatCard",
    description:
      "Display a single metric with label, value, optional trend arrow, and optional color.",
    parameters: z.object({
      label: z.string(),
      value: z.union([z.string(), z.number()]),
      description: z.string().optional(),
      trend: z.enum(["up", "down", "neutral"]).optional(),
      color: z.string().optional(),
    }),
    render: StatCard,
  });

  useComponent({
    name: "BulletList",
    description:
      "Display a list of text items with optional icon type (warning, check, info, dot).",
    parameters: z.object({
      items: z.array(z.string()),
      icon: z.enum(["warning", "check", "info", "dot"]).optional(),
    }),
    render: BulletList,
  });

  useComponent({
    name: "KeyValue",
    description: "Display key-value pairs in a two-column layout.",
    parameters: z.object({
      pairs: z.array(z.object({ key: z.string(), value: z.string() })),
    }),
    render: KeyValue,
  });

  useComponent({
    name: "Alert",
    description:
      "Display a colored callout for risks or signals. Use severity: high (red), medium (yellow), low (green), info (blue).",
    parameters: z.object({
      message: z.string(),
      severity: z.enum(["high", "medium", "low", "info"]),
    }),
    render: Alert,
  });

  useComponent({
    name: "ProgressBar",
    description: "Display a labeled progress bar (0-100).",
    parameters: z.object({
      label: z.string(),
      value: z.number(),
      color: z.string().optional(),
    }),
    render: ProgressBar,
  });

  useComponent({
    name: "Badge",
    description:
      "Display an inline colored label for status or categories. Use variant: success (green), warning (yellow), danger (red), neutral (gray).",
    parameters: z.object({
      text: z.string(),
      variant: z.enum(["success", "warning", "danger", "neutral"]),
    }),
    render: Badge,
  });

  // ─── Convenience Composites ─────────────────────────────────────────

  useComponent({
    name: "MetricRow",
    description:
      "Display a row of metric cards. Each metric has label, value, optional description and color (Tailwind text class like text-red-500).",
    parameters: z.object({
      metrics: z.array(
        z.object({
          label: z.string(),
          value: z.union([z.string(), z.number()]),
          description: z.string().optional(),
          color: z.string().optional(),
        }),
      ),
    }),
    render: MetricRow,
  });

  useComponent({
    name: "SignalList",
    description:
      "Display a titled list of signals with severity icons. Use for missing data, warnings, or observations.",
    parameters: z.object({
      title: z.string(),
      signals: z.array(z.object({ text: z.string(), severity: z.string() })),
    }),
    render: SignalList,
  });

  useComponent({
    name: "RiskSection",
    description:
      "Display a group of risk items with colored heading and dot indicators. severity: high (red), medium (yellow), low (green).",
    parameters: z.object({
      title: z.string(),
      items: z.array(z.string()),
      severity: z.enum(["high", "medium", "low"]),
    }),
    render: RiskSection,
  });

  useComponent({
    name: "ActionList",
    description:
      "Display prioritized action items with priority level and reasoning.",
    parameters: z.object({
      actions: z.array(
        z.object({
          action: z.string(),
          priority: z.string(),
          reason: z.string(),
        }),
      ),
    }),
    render: ActionList,
  });

  useComponent({
    name: "ComparisonCard",
    description:
      "Display a side-by-side before/after comparison. Each side has a label and key-value entries.",
    parameters: z.object({
      title: z.string(),
      before: z.object({
        label: z.string(),
        entries: z.array(z.object({ key: z.string(), value: z.string() })),
      }),
      after: z.object({
        label: z.string(),
        entries: z.array(z.object({ key: z.string(), value: z.string() })),
      }),
    }),
    render: ComparisonCard,
  });

  useComponent({
    name: "RankedList",
    description:
      "Display a numbered ranked list of items with optional score, subtitle, and badge.",
    parameters: z.object({
      items: z.array(
        z.object({
          name: z.string(),
          subtitle: z.string().optional(),
          score: z.number().optional(),
          badge: z.string().optional(),
        }),
      ),
    }),
    render: RankedList,
  });

  // ─── Domain Composites ──────────────────────────────────────────────

  useComponent({
    name: "AccountSummary",
    description:
      "Display an account summary with company name and contact counts by status (hot, warm, cold, in-contract). Use for account review workflows.",
    parameters: z.object({
      company: z.string(),
      contactCount: z.number(),
      hotCount: z.number(),
      warmCount: z.number(),
      coldCount: z.number(),
      inContractCount: z.number(),
    }),
    render: AccountSummary,
  });

  useComponent({
    name: "MissingSignals",
    description:
      "Display missing signals or data gaps for a contact or account. Use for account review workflows.",
    parameters: z.object({
      signals: z.array(z.string()),
    }),
    render: MissingSignals,
  });

  useComponent({
    name: "RiskIndicators",
    description:
      "Display risk indicators including champion confidence and competitor mentions. Use for account review workflows.",
    parameters: z.object({
      championConfidence: z.string(),
      competitorMentioned: z.string().nullable(),
      additionalRisks: z.array(z.string()).optional(),
    }),
    render: RiskIndicators,
  });

  useComponent({
    name: "NextActions",
    description:
      "Display recommended next actions for an account. Use for account review workflows.",
    parameters: z.object({
      actions: z.array(
        z.object({
          action: z.string(),
          priority: z.string(),
          reason: z.string(),
        }),
      ),
    }),
    render: NextActions,
  });

  useComponent({
    name: "ContractRiskReport",
    description:
      "Display a contract risk report categorized by high, medium, and low risk items. Use for contract analysis workflows.",
    parameters: z.object({
      companyName: z.string(),
      highRisks: z.array(z.string()),
      mediumRisks: z.array(z.string()),
      lowRisks: z.array(z.string()),
    }),
    render: ContractRiskReport,
  });

  useComponent({
    name: "ForecastAdjustment",
    description:
      "Display a forecast adjustment proposal comparing current and proposed renewal probability. Use for renewal forecast workflows.",
    parameters: z.object({
      contactName: z.string(),
      currentCategory: z.string(),
      proposedCategory: z.string(),
      currentProbability: z.number(),
      proposedProbability: z.number(),
      reason: z.string(),
    }),
    render: ForecastAdjustment,
  });

  useComponent({
    name: "LeadPriorityList",
    description:
      "Display a prioritized list of leads with scores and lifecycle stages. Use for lead triage workflows.",
    parameters: z.object({
      leads: z.array(
        z.object({
          name: z.string(),
          score: z.number(),
          lifecycleStage: z.string(),
          lastActivity: z.string(),
        }),
      ),
    }),
    render: LeadPriorityList,
  });
}
