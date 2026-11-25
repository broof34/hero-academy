import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { StartupBoundary, StartupReady } from "./StartupBoundary";
import "./style.css";
import "./v4.css";
import "./v41.css";
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StartupBoundary>
      <StartupReady>
        <App />
      </StartupReady>
    </StartupBoundary>
  </React.StrictMode>,
);
