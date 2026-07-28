import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { reportWebVitals } from "./services/analytics/webVitals";

const root = document.getElementById("root");
if (!root) throw new Error("Elemento #root não encontrado.");

if (root.hasChildNodes()) {
  hydrateRoot(root, <App />);
} else {
  createRoot(root).render(<App />);
}

reportWebVitals();
