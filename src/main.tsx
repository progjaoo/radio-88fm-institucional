import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Analytics } from "./services/analytics/analytics";

Analytics.init();
createRoot(document.getElementById("root")!).render(<App />);
