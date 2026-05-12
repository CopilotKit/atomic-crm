import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCopilotOverlay } from "./CopilotOverlayContext";

export function CopilotButton() {
  const { isOpen, open } = useCopilotOverlay();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="hidden sm:inline-flex"
      onClick={open}
    >
      <Sparkles
        className={cn("h-[1.2rem] w-[1.2rem]", isOpen && "text-primary")}
      />
      <span className="sr-only">Open Copilot</span>
    </Button>
  );
}
