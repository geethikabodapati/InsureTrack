import React from "react";
import ReactDOM from "react-dom/client";
import "./globals.css";
import App from "./App";
//This is the entry point. It creates the React root.
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
