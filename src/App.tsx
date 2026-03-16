import { CRM } from "@/components/atomic-crm/root/CRM";
import { CopilotProvider } from "@/components/atomic-crm/copilot/CopilotProvider";

const App = () => (
  <CopilotProvider>
    <CRM />
  </CopilotProvider>
);

export default App;
