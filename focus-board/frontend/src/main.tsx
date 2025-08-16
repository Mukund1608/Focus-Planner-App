import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import SuperTokens from "supertokens-auth-react";
import { SuperTokensConfig } from "./config";
import "./App.css";
import App from "./App.tsx";

// Initialize SuperTokens
SuperTokens.init(SuperTokensConfig);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
