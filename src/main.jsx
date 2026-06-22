import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";

/**
 * To swap the AI extraction provider, import and call setExtractionProvider()
 * here before the app mounts. Example:
 *
 *   import { setExtractionProvider } from "./services/extraction.service.js";
 *   import { openaiProvider } from "./services/ai/openaiProvider.stub.js";
 *   setExtractionProvider(openaiProvider);
 */

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
