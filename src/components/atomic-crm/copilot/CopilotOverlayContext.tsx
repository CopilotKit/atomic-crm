import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface CopilotOverlayContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  registerPage: (handler: () => void) => () => void;
}

const CopilotOverlayContext = createContext<CopilotOverlayContextValue | null>(
  null,
);

export function CopilotOverlayProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pageHandlerRef = useRef<(() => void) | null>(null);

  const open = useCallback(() => {
    if (pageHandlerRef.current) {
      pageHandlerRef.current();
    } else {
      setIsOpen(true);
    }
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const registerPage = useCallback((handler: () => void) => {
    pageHandlerRef.current = handler;
    setIsOpen(false);
    return () => {
      if (pageHandlerRef.current === handler) {
        pageHandlerRef.current = null;
      }
    };
  }, []);

  return (
    <CopilotOverlayContext.Provider
      value={{ isOpen, open, close, registerPage }}
    >
      {children}
    </CopilotOverlayContext.Provider>
  );
}

export function useCopilotOverlay() {
  const ctx = useContext(CopilotOverlayContext);
  if (!ctx) {
    throw new Error(
      "useCopilotOverlay must be used inside CopilotOverlayProvider",
    );
  }
  return ctx;
}
