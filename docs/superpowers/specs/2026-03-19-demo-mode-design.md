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
| `S0_IDLE` | `/` | Dashboard. Welcome popover, centered (no element target — uses `driver.drive()` API). |
| `S1_OPEN_CONTACT` | `/contacts/:id/show` | Auto-navigate to Fannie Pfeffer. Highlight contact card. User reads context, clicks "Next." |
| `S2_AGENT_REVIEW` | same | If `autoAgent`: send review prompt. Otherwise: highlight "Review Account" button and wait. |
| `S3_CONTRACT_ANALYSIS` | same | If `autoAgent`: send contract prompt. Otherwise: highlight "Analyze Contract" button. |
| `S4_FORECAST_PROPOSAL` | same | If `autoAgent`: send forecast prompt. Otherwise: highlight "Forecast" button. |
| `S5_APPROVAL_PENDING` | same | Highlight HITL approval card. Wait for approve/reject. |
| `S6_AUDIT_LOG` | `/audit` | Auto-navigate to audit log. Highlight event list. |

### Transitions

- `S0 → S1`: user clicks "Next"
- `S1 → S2`: user clicks "Next" (enabled once contact page has rendered)
- `S2 → S3`: user clicks "Next" (enabled after agent finishes)
- `S3 → S4`: user clicks "Next" (enabled after agent finishes)
- `S4 → S5`: automatic when HITL card appears in DOM (no "Next" button shown for S4)
- `S5 → S6`: user clicks "Next" (enabled after approve/reject)
- `S6 → done`: user clicks "Finish"

### canAdvance Flag

Each state exposes a `canAdvance` boolean. The "Next" button in driver.js popovers is disabled until `canAdvance` is true. Conditions:

- **S0**: always true
- **S1**: true when contact page has rendered (target `data-demo` element exists)
- **S2, S3**: true when `agentPhase === 'done'` (see Agent Phase Tracking below)
- **S4**: N/A — auto-transitions to S5 when `[data-demo="hitl-card"]` appears in DOM. No "Next" button.
- **S5**: true after user clicks approve or reject on the HITL card
- **S6**: always true

### Agent Phase Tracking

For states S2, S3, and S4 the reducer tracks an `agentPhase` sub-state:

- `idle` — agent has not started (entry state)
- `running` — `agentIsRunning` became true
- `done` — `agentIsRunning` transitioned from true to false

This prevents "Next" from being enabled before the agent has actually run. The phase resets to `idle` on each state entry. When `autoAgent=true`, the phase transitions `idle → running` immediately since the prompt is auto-sent. When `autoAgent=false`, the phase stays `idle` until the user clicks the action button (which starts the agent), then transitions `idle → running → done`.

Note: `agentPhase` is tracked for S4 as well for consistency, but it is not used in S4's transition logic. The S4→S5 transition is governed solely by the DOM observer detecting `[data-demo="hitl-card"]`.

### Hook API

```ts
useDemoStateMachine(options: {
  autoAgent: boolean;
  triggerAgent: (prompt: string) => Promise<void>;
  navigate: (path: string) => void;
  agentIsRunning: boolean;
}): {
  state: DemoState;
  agentPhase: 'idle' | 'running' | 'done';
  canAdvance: boolean;
  advance: () => void;
  reset: () => void;
}
```

## Driver.js Integration

### Step Definitions

Each state maps to a driver.js step. The table below shows both `autoAgent` and manual variants:

**When `autoAgent=true`:**

| State | Element selector | Popover text | Popover side |
|-------|-----------------|--------------|--------------|
| `S0_IDLE` | none (centered modal via `driver.drive()`) | "Welcome to the Atomic CRM demo. We'll walk through an account review, contract analysis, renewal forecast, and audit trail." | — |
| `S1_OPEN_CONTACT` | `[data-demo="contact-card"]` | "This is Fannie Pfeffer at Schmitt and Sons — a contact in renewal stage." | bottom |
| `S2_AGENT_REVIEW` | `[data-demo="copilot-panel"]` | "The agent analyzes the account: contacts breakdown, missing signals, risk indicators, and next actions." | left |
| `S3_CONTRACT_ANALYSIS` | `[data-demo="copilot-panel"]` | "The MCP contract analyzer scans the Schmitt and Sons MSA for risk clauses." | left |
| `S4_FORECAST_PROPOSAL` | `[data-demo="copilot-panel"]` | "The agent proposes a renewal forecast adjustment based on risk signals." | left |
| `S5_APPROVAL_PENDING` | `[data-demo="hitl-card"]` | "Admin approval required. Review the proposed changes and approve or reject." | left |
| `S6_AUDIT_LOG` | `[data-demo="audit-list"]` | "Every agent action is logged. Full traceability for compliance." | top |

**When `autoAgent=false` (S2/S3/S4 differ):**

| State | Element selector | Popover text |
|-------|-----------------|--------------|
| `S2_AGENT_REVIEW` | `[data-demo="review-btn"]` | "Click 'Review Account' to have the agent analyze this account." |
| `S3_CONTRACT_ANALYSIS` | `[data-demo="contract-btn"]` | "Click 'Analyze Contract' to scan the Schmitt and Sons MSA." |
| `S4_FORECAST_PROPOSAL` | `[data-demo="forecast-btn"]` | "Click 'Forecast' to propose a renewal adjustment." |

Once the agent finishes in non-autoAgent mode, the popover target switches to `[data-demo="copilot-panel"]` with the autoAgent text, and "Next" is enabled.

### Driver.js Configuration

- `allowClose: false`
- `overlayClickNext: false`
- `allowKeyboardControl: false` — prevents accidental advances via Enter/arrow keys
- Custom popover buttons: "Next" (calls `advance()`) and "Exit Demo" (calls `reset()`)
- "Next" button disabled when `!canAdvance`
- S4 popover has no "Next" button (auto-transitions to S5)
- `onPopoverRender` callback updates button disabled state reactively and manages Retry/Skip buttons on error (see Edge Cases)

### Driver.js API Usage

- **S0 (no element target):** Use `driver.drive()` with a single step that has no `element` property, producing a centered modal popover.
- **S1–S6 (element targets):** Use `driver.highlight({ element, popover })` to spotlight individual elements.

### Sync Strategy

The state machine is the source of truth. Flow:

1. `advance()` transitions the state machine
2. State machine triggers navigation if the new state is on a different route
3. `useDemoDriver` polls for the target `data-demo` element via `requestAnimationFrame` + `document.querySelector` (capped at 5 seconds)
4. Once found, calls `driver.highlight()` on that element (or `driver.drive()` for S0)

## Auto-Agent Triggering

When `autoAgent=true`, on entry to states S2, S3, S4 the state machine calls `triggerAgent()` with the corresponding prompt:

- **S2**: "Review the account for Fannie Pfeffer at Schmitt and Sons. Show account summary, missing signals, risk indicators, and next actions."
- **S3**: "Analyze the contract for Schmitt and Sons. Show the contract risk report."
- **S4**: "Review the renewal forecast for Fannie Pfeffer and propose an adjustment if warranted."

These are the same prompts the existing action buttons use in `ContactShowContent`.

### triggerAgent Ownership

`DemoProvider` calls `useAgent()` and `useCopilotKit()` directly (both are available since `CopilotProvider` wraps the entire app in `App.tsx`). It builds its own `triggerAgent` function using `agent.addMessage()` + `copilotkit.runAgent()`. It passes `agent.isRunning` from the `useAgent()` hook as the `agentIsRunning` input to the state machine.

The aside tab ("info" vs "copilot") currently lives as local state in `ContactShowContent`. For the demo to switch to the copilot tab, this state must be lifted: `DemoContext` exposes a `requestCopilotTab` flag, and `ContactShowContent` subscribes to it via `useContext` to set its local tab state. This is a minimal lift — the tab state itself stays local, but the demo can request it to switch.

When `autoAgent=false`, the driver.js popover tells the user to click the highlighted button. The state machine detects `agentPhase` transitioning from `idle → running → done` before enabling "Next."

### Agent Context Dependency

`triggerAgent` must only be called AFTER the contact page has mounted and `useCopilotSetup()` has run (which sets the agent context with the current contact record). The state machine enforces this: agent prompts are only sent in S2/S3/S4, which are only reachable after S1 completes (contact page rendered and `data-demo` element present). By the time S2 fires, `useCopilotSetup` has already run.

## Initialization Sequence

On mount, `DemoProvider`:

1. Reads `?demo=guided` and `?autoAgent=true` from URL search params
2. If `isDemoMode` is false, renders children with a no-op context (zero overhead)
3. If `isDemoMode` is true:
   a. Resolves Fannie Pfeffer's contact ID via `dataProvider.getList` (see Contact Resolution below)
   b. If not on `/`, navigates to `/` first
   c. Transitions to `S0_IDLE` and shows the welcome popover
4. The driver.js instance is created lazily on first state entry

If the user manually navigates to a URL with `?demo=guided` while mid-app, the demo resets to S0 and navigates to `/`.

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
| `src/components/atomic-crm/layout/Layout.tsx` | Wrap layout children with `<DemoProvider>`. This places it INSIDE the Router (created by `<Admin>`) so `useNavigate()` is available, and INSIDE `CopilotProvider` so `useAgent()`/`useCopilotKit()` are available. |
| `src/components/atomic-crm/contacts/ContactShow.tsx` | Add `data-demo` attributes to contact card, copilot panel, action buttons. Subscribe to `DemoContext.requestCopilotTab` to auto-switch aside tab. |
| `src/components/atomic-crm/copilot/tools/useUpdateRenewalForecast.tsx` | Add `data-demo="hitl-card"` to approval card |
| `src/components/atomic-crm/audit/AuditLogPage.tsx` | Add `data-demo="audit-list"` to event list |
| `package.json` | Add `driver.js` dependency (`^1.3.1` — v1.x API; v2 has a different API) |

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

### Conditional Buttons (Contract, Forecast)

The "Analyze Contract" button requires `companyName` to be truthy. The "Forecast" button requires `enriched?.renewal_amount != null` (depends on enrichment API server running). The hardcoded demo contact (Fannie Pfeffer at Schmitt and Sons) must have a `company_id` set and renewal data in the enrichment store.

If `[data-demo="contract-btn"]` or `[data-demo="forecast-btn"]` is not found within the 5-second polling window, the state machine skips that step with a brief "Skipped — button not available" note in the popover and advances to the next state.

### Missing Demo Data

If the Fannie Pfeffer contact is not found in the data provider, show an error popover and exit. No partial demo.

### Retry/Skip Buttons on Error

When an agent error occurs, `onPopoverRender` injects a "Retry" button into the driver.js popover DOM. The reducer tracks `errorCount` per state. After 2 failures, "Retry" is replaced with "Skip." Both buttons are rendered by manipulating the popover footer via `onPopoverRender`.

## Out of Scope

- Self-running autoplay mode (future: `?demo=autoplay`)
- Persona-aware narration (future: `?persona=...`)
- Presentation mode (large typography, aspect ratios)
- Deterministic agent output (depends on LLMock fixtures for now)
- Mobile support (demo is desktop-only)
