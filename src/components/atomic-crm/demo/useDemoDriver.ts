import { useEffect, useRef, useCallback } from "react";
import { driver as createDriver, type Driver } from "driver.js";
import "driver.js/dist/driver.css";
import type { DemoStateOrDone, AgentPhase } from "./useDemoStateMachine";
import { getDemoSteps, type DemoStepDef } from "./demoSteps";
import {
  DOM_POLL_TIMEOUT_MS,
  DOM_POLL_INTERVAL_MS,
  MAX_AGENT_RETRIES,
} from "./demoConfig";

/**
 * Poll for a DOM element matching the selector.
 * Resolves with the element or null after timeout.
 */
export function waitForElement(
  selector: string,
  timeoutMs: number = DOM_POLL_TIMEOUT_MS,
): Promise<Element | null> {
  return new Promise((resolve) => {
    const existing = document.querySelector(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    const start = Date.now();
    const interval = setInterval(() => {
      const el = document.querySelector(selector);
      if (el) {
        clearInterval(interval);
        resolve(el);
      } else if (Date.now() - start >= timeoutMs) {
        clearInterval(interval);
        resolve(null);
      }
    }, DOM_POLL_INTERVAL_MS);
  });
}

interface UseDemoDriverOptions {
  state: DemoStateOrDone;
  agentPhase: AgentPhase;
  canAdvance: boolean;
  errorCount: number;
  autoAgent: boolean;
  advance: () => void;
  reset: () => void;
  skipState: () => void;
  reportError: () => void;
  setElementReady: (ready: boolean) => void;
}

export function useDemoDriver({
  state,
  agentPhase,
  canAdvance,
  errorCount,
  autoAgent,
  advance,
  reset,
  skipState,
  reportError,
  setElementReady,
}: UseDemoDriverOptions) {
  const driverRef = useRef<Driver | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const advanceRef = useRef(advance);
  advanceRef.current = advance;
  const resetRef = useRef(reset);
  resetRef.current = reset;
  const skipRef = useRef(skipState);
  skipRef.current = skipState;
  const retryRef = useRef(reportError);
  retryRef.current = reportError;

  const canAdvanceRef = useRef(canAdvance);
  canAdvanceRef.current = canAdvance;
  const errorCountRef = useRef(errorCount);
  errorCountRef.current = errorCount;

  // Create driver instance once
  useEffect(() => {
    driverRef.current = createDriver({
      allowClose: false,
      overlayClickBehavior: "close",
      allowKeyboardControl: false,
      stagePadding: 8,
      stageRadius: 8,
    });
    return () => {
      driverRef.current?.destroy();
      driverRef.current = null;
    };
  }, []);

  const steps = getDemoSteps(autoAgent);
  const autoAgentSteps = getDemoSteps(true);

  const highlightState = useCallback(
    async (demoState: DemoStateOrDone, stepOverride?: DemoStepDef) => {
      const d = driverRef.current;
      if (!d || demoState === "DONE") {
        driverRef.current?.destroy();
        return;
      }

      const stepDef = stepOverride ?? steps[demoState as keyof typeof steps];
      if (!stepDef) return;

      if (stepDef.element === null) {
        // S0: centered modal via drive() with a single step (no element target)
        d.setSteps([
          {
            popover: {
              title: stepDef.title,
              description: stepDef.description,
              onPopoverRender: (popover) => {
                renderPopoverButtons(popover.wrapper, stepDef, errorCountRef);
              },
            },
          },
        ]);
        d.drive();
        setElementReady(true);
        return;
      }

      const el = await waitForElement(stepDef.element);
      if (!el) {
        skipRef.current();
        return;
      }

      setElementReady(true);

      d.highlight({
        element: stepDef.element,
        popover: {
          title: stepDef.title,
          description: stepDef.description,
          side: stepDef.side,
          onPopoverRender: (popover) => {
            renderPopoverButtons(popover.wrapper, stepDef, errorCountRef);
          },
        },
      });
    },
    [steps, setElementReady],
  );

  // React to state changes
  useEffect(() => {
    highlightState(state);
  }, [state, highlightState]);

  // S4 auto-transition: poll for HITL card
  useEffect(() => {
    if (state !== "S4_FORECAST_PROPOSAL") return;
    let cancelled = false;

    waitForElement('[data-demo="hitl-card"]').then((el) => {
      if (!cancelled && el) {
        advanceRef.current();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [state]);

  // Re-target popover when agent finishes in non-autoAgent mode (S2/S3)
  useEffect(() => {
    if (autoAgent) return;
    if (agentPhase !== "done") return;
    const agentStates = ["S2_AGENT_REVIEW", "S3_CONTRACT_ANALYSIS"];
    if (!agentStates.includes(state as string)) return;

    const autoStep = autoAgentSteps[state as keyof typeof autoAgentSteps];
    if (autoStep) {
      highlightState(state, autoStep);
    }
  }, [state, agentPhase, autoAgent, autoAgentSteps, highlightState]);

  // Update button disabled states and retry/skip
  useEffect(() => {
    const wrapper = document.querySelector(".driver-popover");
    if (!wrapper) return;

    const nextBtn = wrapper.querySelector<HTMLButtonElement>(
      "[data-demo-btn='next']",
    );
    if (nextBtn) {
      nextBtn.disabled = !canAdvance;
      nextBtn.style.opacity = canAdvance ? "1" : "0.5";
    }

    const retryBtn = wrapper.querySelector<HTMLButtonElement>(
      "[data-demo-btn='retry']",
    );
    const skipBtn = wrapper.querySelector<HTMLButtonElement>(
      "[data-demo-btn='skip']",
    );
    if (errorCount > 0 && errorCount < MAX_AGENT_RETRIES) {
      if (!retryBtn) {
        const btn = createActionButton("Retry", "retry", () =>
          retryRef.current(),
        );
        const btnContainer = wrapper.querySelector("[data-demo-btns]");
        if (btnContainer) btnContainer.prepend(btn);
      }
      if (skipBtn) skipBtn.remove();
    } else if (errorCount >= MAX_AGENT_RETRIES) {
      if (retryBtn) retryBtn.remove();
      if (!skipBtn) {
        const btn = createActionButton("Skip", "skip", () => skipRef.current());
        const btnContainer = wrapper.querySelector("[data-demo-btns]");
        if (btnContainer) btnContainer.prepend(btn);
      }
    } else {
      retryBtn?.remove();
      skipBtn?.remove();
    }
  }, [canAdvance, errorCount]);

  return { driverRef };
}

function createActionButton(
  label: string,
  id: string,
  onClick: () => void,
): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.textContent = label;
  btn.setAttribute("data-demo-btn", id);
  btn.style.cssText =
    "padding:6px 12px;border-radius:6px;font-size:13px;cursor:pointer;border:1px solid #d1d5db;background:#fff;color:#374151;";
  btn.addEventListener("click", onClick);
  return btn;
}

function renderPopoverButtons(
  wrapper: Element,
  stepDef: DemoStepDef,
  _errorCountRef: { current: number },
) {
  const footer = wrapper.querySelector(".driver-popover-footer");
  if (footer) footer.remove();

  const btnContainer = document.createElement("div");
  btnContainer.setAttribute("data-demo-btns", "");
  btnContainer.style.cssText =
    "display:flex;gap:8px;justify-content:flex-end;margin-top:12px;padding-top:12px;border-top:1px solid #e5e7eb;";

  const exitBtn = document.createElement("button");
  exitBtn.textContent = "Exit Demo";
  exitBtn.style.cssText =
    "padding:6px 12px;border-radius:6px;font-size:13px;cursor:pointer;border:1px solid #d1d5db;background:#fff;color:#374151;";
  exitBtn.addEventListener("click", () => {
    const resetFn = (window as any).__demoReset;
    if (resetFn) resetFn();
  });
  btnContainer.appendChild(exitBtn);

  if (!stepDef.autoTransition) {
    const nextBtn = document.createElement("button");
    nextBtn.textContent = stepDef.advanceLabel ?? "Next";
    nextBtn.setAttribute("data-demo-btn", "next");
    nextBtn.style.cssText =
      "padding:6px 12px;border-radius:6px;font-size:13px;cursor:pointer;border:none;background:#2563eb;color:#fff;opacity:0.5;";
    nextBtn.disabled = true;
    nextBtn.addEventListener("click", () => {
      const advanceFn = (window as any).__demoAdvance;
      if (advanceFn) advanceFn();
    });
    btnContainer.appendChild(nextBtn);
  }

  wrapper.appendChild(btnContainer);
}
