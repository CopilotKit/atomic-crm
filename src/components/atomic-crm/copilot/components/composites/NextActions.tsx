import { ActionList } from "../primitives/ActionList";

interface NextActionsProps {
  actions: { action: string; priority: string; reason: string }[];
}

export function NextActions(props: NextActionsProps) {
  const actions = Array.isArray(props.actions) ? props.actions : [];
  return <ActionList actions={actions} />;
}
