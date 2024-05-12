import { Outlet } from "react-router-dom";
import { Rows } from "@canva/app-ui-kit";
import { Footer } from "./components";
import styles from "styles/components.css";

export const App = () => (
  <div className={styles.scrollContainer}>
    <Rows spacing="3u">
      <Outlet />
      <Footer />
    </Rows>
  </div>
);
