import { App } from "src/app";
import { GeneratePage, ResultsPage } from "src/pages";

export enum Paths {
  HOME = "/",
  RESULTS = "/results",
}

export const routes = [
  {
    path: Paths.HOME,
    element: <App />,
    children: [
      {
        index: true,
        element: <GeneratePage />,
      },
      {
        path: Paths.RESULTS,
        element: <ResultsPage />,
      },
      // @TODO: Add additional pages and routes as needed.
    ],
  },
];
