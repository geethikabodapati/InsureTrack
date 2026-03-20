import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { NotificationProvider } from "./modules/adjuster/pages/NotificationContext";
//It wraps the entire app in the NotificationProvider
export default function App() {
  return (
    <NotificationProvider>
      <RouterProvider router={router} />
    </NotificationProvider>
  );
}
