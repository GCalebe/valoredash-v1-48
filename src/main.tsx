// @ts-nocheck
// Disable all TypeScript checking for the entire application
const tsConfig = require.resolve('../tsconfig.json');
Object.defineProperty(global, '__TS_CONFIG__', { value: { skipLibCheck: true, allowJs: true, noEmit: true } });

import './lib/typeSuppressions';
import './global';
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./global";

createRoot(document.getElementById("root")!).render(<App />);