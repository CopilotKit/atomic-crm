# Interactive Guided Demo Mode

## Overview

An interactive guided demo that walks viewers through the four core CopilotKit workflows (account review, contract risk scan, renewal forecast adjustment, audit inspection) using driver.js for spotlight/popover narration and a lightweight state machine for flow control.

Activated via query parameters on the existing app — no separate route or build.

## Query Parameters

- `?demo=guided` — activates the interactive guided demo
- `?autoAgent=true` — combined with `?demo=guided`, auto-sends agent prompts at relevant steps instead of waiting for user action

Future: `?demo=autoplay` would reuse the same state machine with a timer-based auto-advance. Not built in this iteration.

## State Machine

A `useReducer`-based state machine owns the demo flow. Seven states matching the spec:

| State | Route | Behavior |
|-------|-------|----------|
| `S0_IDLE` | `/` | Dashboard. Welcome popover, centered. |
| `S1_OPEN_CONTACT` | `/contacts/:id/show` | Auto-navigate to Fannie Pfeffer. Highlight contact card. |
| `S2_AGENT_REVIEW` | same | If `autoAgent`: send review prompt. Otherwise: highlight "Review Account" button and wait. |
| `S3_CONTRACT_ANALYSIS` | same | If `autoAgent`: send contract prompt. Otherwise: highlight "Analyze Contract" button. |
| `S4_FORECAST_PROPOSAL` | same | If `autoAgent`: send forecast prompt. Otherwise: highlight "Forecast" button. |
| `S5_APPROVAL_PENDING` | same | Highlight HITL approval card. Wait for approve/reject. |
| `S6_AUDIT_LOG` | `/audit` | Auto-navigate to audit log. Highlight event list. |

### Transitions

- `S0 → S1`: user clicks "Next"
- `S1 → S2`: automatic after navigation completes and page renders
- `S2 → S3`: user clicks "Next" (enabled after agent finishes)
- `S3 → S4`: user clicks "Next" (enabled after agent finishes)
- `S4 → S5`: automatic when HITL card appears in DOM
- `S5 → S6`: user clicks "Next" (enabled after approve/reject)
- `S6 → done`: user clicks "Finish"

### canAdvance Flag

Each state exposes a `canAdvance` boolean. The "Next" button in driver.js popovers is disabled until `canAdvance` is true. Conditions:

- **S0**: always true
- **S1**: true when contact page has rendered (target `data-demo` element exists)
- **S2, S3, S4**: true when `agent.isRunning` transitions from `true` to `false`
- **S5**: true after user clicks approve or reject on the HITL card
- **S6**: always true

### Hook API

```ts
useDemoStateMachine(options: {
  autoAgent: boolean;
  triggerAgent: (prompt: string) => Promise<void>;
  navigate: (path: string) => void;
  agentIsRunning: boolean;
}): {
  state: DemoState;
  canAdvance: boolean;
  advance: () => void;
  reset: () => void;
}
```

## Driver.js Integration

### Step Definitions

Each state maps to a driver.js step:

| State | Element selector | Popover text |
|-------|-----------------|--------------|
| `S0_IDLE` | none (centered) | "Welcome to the Atomic CRM demo. We'll walk through an account review, contract analysis, renewal forecast, and audit trail." |
| `S1_OPEN_CONTACT` | `[data-demo="contact-card"]` | "This is Fannie Pfeffer at Schmitt and Sons — a contact in renewal stage." |
| `S2_AGENT_REVIEW` | `[data-demo="copilot-panel"]` | "The agent analyzes the account: contacts breakdown, missing signals, risk indicators, and next actions." |
| `S3_CONTRACT_ANALYSIS` | `[data-demo="copilot-panel"]` | "The MCP contract analyzer scans the Schmitt and Sons MSA for risk clauses." |
| `S4_FORECAST_PROPOSAL` | `[data-demo="copilot-panel"]` | "The agent proposes a renewal forecast adjustment based on risk signals." |
| `S5_APPROVAL_PENDING` | `[data-demo="hitl-card"]` | "Admin approval required. Review the proposed changes and approve or reject." |
| `S6_AUDIT_LOG` | `[data-demo="audit-list"]` | "Every agent action is logged. Full traceability for compliance." |

When `autoAgent` is false, S2/S3/S4 highlight the action button (`[data-demo="review-btn"]`, etc.) with text "Click the highlighted button to continue."

### Driver.js Configuration

- `allowClose: false`
- `overlayClickNext: false`
- Custom popover buttons: "Next" (calls `advance()`) and "Exit Demo" (calls `reset()`)
- "Next" button disabled when `!canAdvance`
- `onPopoverRender` callback updates button disabled state reactively

### Sync Strategy

The state machine is the source of truth. Flow:

1. `advance()` transitions the state machine
2. State machine triggers navigation if the new state is on a different route
3. `useDemoDriver` polls for the target `data-demo` element via `requestAnimationFrame` + `document.querySelector` (capped at 5 seconds)
4. Once found, calls `driver.highlight()` on that element

## Auto-Agent Triggering

When `autoAgent=true`, on entry to states S2, S3, S4 the state machine calls `triggerAgent()` with the corresponding prompt:

- **S2**: "Review the account for Fannie Pfeffer at Schmitt and Sons. Show account summary, missing signals, risk indicators, and next actions."
- **S3**: "Analyze the contract for Schmitt and Sons. Show the contract risk report."
- **S4**: "Review the renewal forecast for Fannie Pfeffer and propose an adjustment if warranted."

These are the same prompts the existing action buttons use in `ContactShowContent`.

The `triggerAgent` function (already in ContactShow.tsx) switches the aside tab to "copilot" and calls `agent.addMessage()` + `copilotkit.runAgent()`.

When `autoAgent=false`, the driver.js popover tells the user to click the highlighted button. The state machine detects `agent.isRunning` becoming true (user clicked) then waits for false (agent done) before enabling "Next."

## Contact Resolution

On demo init, Fannie Pfeffer's contact ID is resolved via `dataProvider.getList('contacts', { filter: { first_name: 'Fannie', last_name: 'Pfeffer' }, pagination: { page: 1, perPage: 1 } })`. This works with both Supabase and FakeRest providers.

If not found, the demo shows an error popover: "Demo contact not found. Import the demo dataset first." and exits.

## File Structure

### New Files

```
src/components/atomic-crm/demo/
├── DemoContext.tsx          — React context: { isDemoMode, autoAgent, state, canAdvance, advance, reset }
├── useDemoMode.ts           — Reads query params, returns { isDemoMode, autoAgent }
├── useDemoStateMachine.ts   — useReducer state machine (S0–S6)
├── useDemoDriver.ts         — Creates driver.js instance, syncs with state machine
├── DemoProvider.tsx          — Wraps children, orchestrates hooks, provides context
├── demoSteps.ts             — Step definitions: selectors, popover text, agent prompts
└── demoConfig.ts            — Hardcoded values: contact name, company name
```

### Modified Files

| File | Change |
|------|--------|
| `src/components/atomic-crm/root/CRM.tsx` | Wrap `DesktopAdmin` with `<DemoProvider>` |
| `src/components/atomic-crm/contacts/ContactShow.tsx` | Add `data-demo` attributes to contact card, copilot panel, action buttons |
| `src/components/atomic-crm/copilot/tools/useUpdateRenewalForecast.tsx` | Add `data-demo="hitl-card"` to approval card |
| `src/components/atomic-crm/audit/AuditLogPage.tsx` | Add `data-demo="audit-list"` to event list |
| `package.json` | Add `driver.js` dependency |

## Data Attributes

All driver.js selectors use `data-demo="..."` attributes rather than CSS class selectors. This decouples demo logic from styling.

Attributes to add:

- `data-demo="contact-card"` — contact header in ContactShowContent
- `data-demo="copilot-panel"` — the copilot aside TabsContent
- `data-demo="review-btn"` — Review Account button
- `data-demo="contract-btn"` — Analyze Contract button
- `data-demo="forecast-btn"` — Forecast button
- `data-demo="hitl-card"` — HITL approval card root element
- `data-demo="audit-list"` — audit event list container

## Edge Cases

### Agent Errors

If the agent fails (network error, timeout), the state machine stays in the current state with `canAdvance: false`. The driver.js popover shows a "Retry" button that re-sends the same prompt. After 2 failures, it shows "Skip" to advance without the agent response.

### Navigation Timing

After `navigate()`, the target element won't exist immediately. `useDemoDriver` polls via `requestAnimationFrame` + `document.querySelector('[data-demo="..."]')` capped at 5 seconds. If the element never appears, treat as error and show "Skip."

### HITL Card Timing

The HITL approval card is rendered asynchronously by the agent's tool call. State `S5_APPROVAL_PENDING` uses the same polling mechanism to wait for `[data-demo="hitl-card"]` before highlighting.

### Demo Cleanup

"Exit Demo" or "Finish" calls `reset()` which:
1. Removes `?demo` and `?autoAgent` from URL via `setSearchParams`
2. Destroys the driver.js instance
3. Navigates to `/`

### Missing Demo Data

If the Fannie Pfeffer contact is not found in the data provider, show an error popover and exit. No partial demo.

## Out of Scope

- Self-running autoplay mode (future: `?demo=autoplay`)
- Persona-aware narration (future: `?persona=...`)
- Presentation mode (large typography, aspect ratios)
- Deterministic agent output (depends on LLMock fixtures for now)
- Mobile support (demo is desktop-only)
