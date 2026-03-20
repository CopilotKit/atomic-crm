import { useEffect, useRef, useCallback, useMemo } from "react";
import { driver as createDriver, type Driver } from "driver.js";
import "driver.js/dist/driver.css";
import type { DemoStateOrDone, AgentPhase } from "./useDemoStateMachine";
import { getDemoSteps, type DemoStepDef } from "./demoSteps";
import {
  DOM_POLL_TIMEOUT_MS,
  DOM_POLL_INTERVAL_MS,
  MAX_AGENT_RETRIES,
  type DemoMode,
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
  mode: DemoMode | null;
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
  mode,
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
  const skipDriver = mode === "kiosk";
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

  // Create driver instance once (skip in kiosk mode)
  useEffect(() => {
    if (skipDriver) return;
    driverRef.current = createDriver({
      allowClose: false,
      overlayClickBehavior: "close",
      allowKeyboardControl: false,
      stagePadding: 8,
      stageRadius: 8,
      overlayOpacity: 0.5,
    });
    return () => {
      driverRef.current?.destroy();
      driverRef.current = null;
    };
  }, [skipDriver]);

  const steps = useMemo(() => getDemoSteps(autoAgent), [autoAgent]);
  const autoAgentSteps = useMemo(() => getDemoSteps(true), []);

  const highlightState = useCallback(
    async (demoState: DemoStateOrDone, stepOverride?: DemoStepDef) => {
      const d = driverRef.current;
      if (!d || demoState === "DONE") {
        driverRef.current?.destroy();
        return;
      }

      const stepDef = stepOverride ?? steps[demoState as keyof typeof steps];
      if (!stepDef) return;

      const refs = { advanceRef, resetRef, canAdvanceRef, errorCountRef };

      if (stepDef.element === null) {
        // S0: centered modal — highlight() without element shows centered popover
        d.highlight({
          popover: {
            title: stepDef.title,
            description: stepDef.description,
            onPopoverRender: (popover) => {
              renderPopoverButtons(popover.wrapper, stepDef, refs);
            },
          },
        });
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
            renderPopoverButtons(popover.wrapper, stepDef, refs);
          },
        },
      });
    },
    [steps, setElementReady],
  );

  // React to state changes (skip in kiosk mode — but still set elementReady)
  useEffect(() => {
    if (skipDriver) {
      // In kiosk mode, immediately mark element as ready so autoAdvance works
      setElementReady(true);
      return;
    }
    highlightState(state);
  }, [state, highlightState, skipDriver, setElementReady]);

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
    if (skipDriver || autoAgent) return;
    if (agentPhase !== "done") return;
    const agentStates = ["S2_AGENT_REVIEW", "S3_CONTRACT_ANALYSIS"];
    if (!agentStates.includes(state as string)) return;

    const autoStep = autoAgentSteps[state as keyof typeof autoAgentSteps];
    if (autoStep) {
      highlightState(state, autoStep);
    }
  }, [
    state,
    agentPhase,
    autoAgent,
    skipDriver,
    autoAgentSteps,
    highlightState,
  ]);

  // Update button disabled states and retry/skip
  useEffect(() => {
    if (skipDriver) return;
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

interface PopoverButtonRefs {
  advanceRef: { current: () => void };
  resetRef: { current: () => void };
  canAdvanceRef: { current: boolean };
  errorCountRef: { current: number };
}

function renderPopoverButtons(
  wrapper: Element,
  stepDef: DemoStepDef,
  refs: PopoverButtonRefs,
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
    refs.resetRef.current();
  });
  btnContainer.appendChild(exitBtn);

  if (!stepDef.autoTransition) {
    const isEnabled = refs.canAdvanceRef.current;
    const nextBtn = document.createElement("button");
    nextBtn.textContent = stepDef.advanceLabel ?? "Next";
    nextBtn.setAttribute("data-demo-btn", "next");
    nextBtn.disabled = !isEnabled;
    nextBtn.style.cssText = `padding:6px 12px;border-radius:6px;font-size:13px;cursor:pointer;border:none;background:#2563eb;color:#fff;opacity:${isEnabled ? "1" : "0.5"};`;
    nextBtn.addEventListener("click", () => {
      refs.advanceRef.current();
    });
    btnContainer.appendChild(nextBtn);
  }

  wrapper.appendChild(btnContainer);
}
