import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { waitForElement } from "./useDemoDriver";

describe("waitForElement", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves immediately if element exists", async () => {
    const el = document.createElement("div");
    el.setAttribute("data-demo", "test");
    document.body.appendChild(el);

    const result = await waitForElement('[data-demo="test"]', 1000);
    expect(result).toBe(el);

    document.body.removeChild(el);
  });

  it("resolves null after timeout if element never appears", async () => {
    const promise = waitForElement('[data-demo="missing"]', 200);
    vi.advanceTimersByTime(250);
    const result = await promise;
    expect(result).toBeNull();
  });
});
