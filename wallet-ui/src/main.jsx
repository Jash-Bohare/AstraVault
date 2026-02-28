import { Buffer } from "buffer";
window.Buffer = Buffer;
import { WalletProvider } from "./store/WalletContext";

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <WalletProvider>
    <App />
  </WalletProvider>
);