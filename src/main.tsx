import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }

  const root = createRoot(rootElement);
  root.render(<App />);
} catch (error) {
  document.getElementById("root")!.innerHTML = `
    <div style="
      min-height: 100vh; 
      background-color: #1e293b; 
      color: white; 
      padding: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      text-align: center;
    ">
      <h1 style="color: #ef4444; margin-bottom: 1rem;">Application Error</h1>
      <p style="margin-bottom: 1rem;">Failed to load the application</p>
      <pre style="background-color: #374151; padding: 1rem; border-radius: 0.5rem; text-align: left; max-width: 600px; overflow-x: auto;">
        ${error instanceof Error ? error.message : String(error)}
      </pre>
      <button onclick="window.location.reload()" style="
        background-color: #3b82f6; 
        color: white; 
        padding: 0.5rem 1rem; 
        border: none; 
        border-radius: 0.25rem; 
        cursor: pointer;
        margin-top: 1rem;
      ">
        Reload Page
      </button>
    </div>
  `;
}
