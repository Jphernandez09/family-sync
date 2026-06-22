/**
 * openaiProvider.stub.js — OpenAI migration stub
 *
 * This stub shows how to wire up a direct OpenAI API call as a drop-in
 * replacement for the Base44 provider. Fill in the implementation when
 * you're ready to move off Base44's hosted functions.
 *
 * SECURITY NOTE: Never put OPENAI_API_KEY in a VITE_ env variable —
 * it becomes public in the JS bundle. Route calls through your own
 * API server or Edge Function instead.
 *
 * Usage (once implemented):
 *   import { openaiProvider } from './openaiProvider.stub.js';
 *   setExtractionProvider(openaiProvider);  // in main.jsx before ReactDOM.render
 */

// import OpenAI from 'openai'; // npm install openai

export const openaiProvider = {
  name: "openai",

  async extract(rawText, familyContext = {}) {
    // TODO: Replace with your API server URL / Edge Function URL
    const endpoint = import.meta.env.VITE_EXTRACTION_API_URL;

    if (!endpoint) {
      throw new Error(
        "Set VITE_EXTRACTION_API_URL to your extraction server endpoint. " +
          "Do not call OpenAI directly from the browser with a secret key."
      );
    }

    const resp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawText, familyContext }),
    });

    if (!resp.ok) {
      throw new Error(`Extraction server error: ${resp.status}`);
    }

    return resp.json(); // Must match ExtractionResult shape
  },
};

/**
 * claudeProvider — Anthropic Claude API stub
 * Same pattern as above — route through your own server.
 */
export const claudeProvider = {
  name: "claude",

  async extract(rawText, familyContext = {}) {
    const endpoint = import.meta.env.VITE_EXTRACTION_API_URL;
    if (!endpoint) throw new Error("Set VITE_EXTRACTION_API_URL");

    const resp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawText, familyContext, provider: "claude" }),
    });

    if (!resp.ok) throw new Error(`Extraction server error: ${resp.status}`);
    return resp.json();
  },
};
