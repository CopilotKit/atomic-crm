import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { createElement } from "react";
import {
  CopilotOverlayProvider,
  useCopilotOverlay,
} from "./CopilotOverlayContext";

function wrapper({ children }: { children: React.ReactNode }) {
  return createElement(CopilotOverlayProvider, null, children);
}

describe("useCopilotOverlay", () => {
  it("starts closed", () => {
    const { result } = renderHook(() => useCopilotOverlay(), { wrapper });
    expect(result.current.isOpen).toBe(false);
  });

  it("open() sets isOpen to true when no page handler registered", () => {
    const { result } = renderHook(() => useCopilotOverlay(), { wrapper });
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
  });

  it("close() sets isOpen to false", () => {
    const { result } = renderHook(() => useCopilotOverlay(), { wrapper });
    act(() => result.current.open());
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });

  it("open() calls page handler instead of opening overlay when registered", () => {
    const handler = vi.fn();
    const { result } = renderHook(() => useCopilotOverlay(), { wrapper });
    act(() => {
      result.current.registerPage(handler);
    });
    act(() => result.current.open());
    expect(handler).toHaveBeenCalledOnce();
    expect(result.current.isOpen).toBe(false);
  });

  it("registerPage() closes overlay if it was open", () => {
    const { result } = renderHook(() => useCopilotOverlay(), { wrapper });
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
    act(() => {
      result.current.registerPage(() => {});
    });
    expect(result.current.isOpen).toBe(false);
  });

  it("unregister function removes handler, open() shows overlay again", () => {
    const handler = vi.fn();
    const { result } = renderHook(() => useCopilotOverlay(), { wrapper });
    let unregister: () => void;
    act(() => {
      unregister = result.current.registerPage(handler);
    });
    act(() => {
      unregister();
    });
    act(() => result.current.open());
    expect(handler).not.toHaveBeenCalled();
    expect(result.current.isOpen).toBe(true);
  });
});
