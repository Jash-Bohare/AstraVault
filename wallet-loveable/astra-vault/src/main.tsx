import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { Buffer } from "buffer";
import "./index.css";

// Polyfill Buffer for libraries like bip39
if (typeof window !== "undefined") {
    window.Buffer = window.Buffer || Buffer;
}

createRoot(document.getElementById("root")!).render(<App />);
