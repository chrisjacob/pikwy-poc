import { createRoot } from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { AppUiProvider } from "@canva/app-ui-kit";
import { routes } from "./routes";
import { ErrorPage } from "./pages";
import { ContextProvider } from "./context";
import "@canva/app-ui-kit/styles.css";

const el = document.getElementById("root");
if (!el) {
  throw new Error("Root element not found");
}
const root = createRoot(el);
function render() {
  root.render(
    <AppUiProvider>
      <ErrorBoundary fallback={<ErrorPage />}>
        <ContextProvider>
          <RouterProvider router={createHashRouter(routes)} />
        </ContextProvider>
      </ErrorBoundary>
    </AppUiProvider>
  );
}

render();

if (module.hot) {
  module.hot.accept("./app", render);
}
