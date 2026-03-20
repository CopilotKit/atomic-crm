import { Check, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  usePersona,
  PERSONA_LABELS,
  VALID_PERSONAS,
  type Persona,
} from "./hooks/usePersona";

export function PersonaSelector() {
  const { persona, setPersona } = usePersona();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
          <MessageSquare
            className={cn("h-[1.2rem] w-[1.2rem]", persona && "text-primary")}
          />
          <span className="sr-only">Select narrator persona</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {([...VALID_PERSONAS] as Persona[]).map((p) => (
          <DropdownMenuItem key={p} onClick={() => setPersona(p)}>
            {PERSONA_LABELS[p]}
            <Check className={cn("ml-auto", persona !== p && "hidden")} />
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setPersona(null)}>
          Narration Off
          <Check className={cn("ml-auto", persona !== null && "hidden")} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
