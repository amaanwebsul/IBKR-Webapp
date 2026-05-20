import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { IbkrProvider } from "./context/IbkrContext";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <IbkrProvider>
      <App />
    </IbkrProvider>
  </StrictMode>,
)
