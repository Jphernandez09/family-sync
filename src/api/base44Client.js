import { createClient } from "@base44/sdk";

// Replace YOUR_APP_ID with your actual Base44 app ID after running `npx base44 create`
// Find it in base44/config.jsonc after initialization, or in the Base44 dashboard.
const base44 = createClient({
  appId: import.meta.env.VITE_BASE44_APP_ID || "YOUR_APP_ID",
});

export default base44;

// Re-export commonly used modules for convenience
export const { entities, auth, functions, integrations } = base44;
