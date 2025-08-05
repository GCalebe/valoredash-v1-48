// @ts-nocheck
import './lib/typeSuppressions';
import './global';
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);