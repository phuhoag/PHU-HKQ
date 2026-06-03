import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import router from "./routers/routes.jsx";
import "./index.css";

const GOOGLE_CLIENT_ID =
  "15019269333-8ffecsqpggjlb2661r64qgn62e941034.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <RouterProvider router={router} />
    </GoogleOAuthProvider>
  </React.StrictMode>,
);

