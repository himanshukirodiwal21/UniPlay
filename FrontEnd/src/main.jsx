import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // <-- import this
import "./assets/style.css";
import App from "./App.jsx";

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <BrowserRouter> {/* <-- wrap App in BrowserRouter */}
      <App />
    </BrowserRouter>
  </StrictMode>
);
