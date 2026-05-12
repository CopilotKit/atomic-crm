import { CRM } from "@/components/atomic-crm/root/CRM";
import { CopilotProvider } from "@/components/atomic-crm/copilot/CopilotProvider";
import {
  authProvider,
  dataProvider,
} from "@/components/atomic-crm/providers/fakerest";
import { memoryStore } from "ra-core";

const App = () => (
  <CopilotProvider>
    <CRM
      dataProvider={dataProvider}
      authProvider={authProvider}
      store={memoryStore()}
    />
  </CopilotProvider>
);

export default App;
