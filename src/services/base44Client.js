/**
 * Base44 SDK Client — singleton entry point for all backend communication.
 *
 * This is the ONLY file in the project that imports from @base44/sdk.
 * All services import from here, not from the SDK directly.
 *
 * To migrate away from Base44:
 *   1. Replace this file with a compatible shim (e.g. Supabase client).
 *   2. Update each service file to use the new client's API.
 *   3. No React components need to change.
 */
import { createClient } from "@base44/sdk";

const appId = import.meta.env.VITE_BASE44_APP_ID;

/**
 * DEMO_MODE is true when the app is running without a real Base44 app ID.
 * In demo mode, all service calls fall back to mock data — no network calls
 * are made to Base44 at all.
 *
 * Set VITE_BASE44_APP_ID in .env.local to disable demo mode.
 */
export const DEMO_MODE = !appId || appId === "YOUR_APP_ID";

// No-op stub used in demo mode so services can safely destructure
// auth/entities/functions/integrations without crashing.
const noopStub = new Proxy({}, {
  get: () => noopStub,
  apply: () => Promise.resolve(null),
});

let base44;
let auth, entities, functions, integrations;

if (DEMO_MODE) {
  console.warn(
    "[Family Sync] Running in DEMO MODE — no Base44 connection. " +
      "Create .env.local with VITE_BASE44_APP_ID=<your_id> to connect."
  );
  base44 = noopStub;
  auth = noopStub;
  entities = noopStub;
  functions = noopStub;
  integrations = noopStub;
} else {
  base44 = createClient({ appId });
  ({ auth, entities, functions, integrations } = base44);
}

export default base44;
export { auth, entities, functions, integrations };
