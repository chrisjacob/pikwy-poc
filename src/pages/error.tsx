import { useNavigate } from "react-router-dom";
import { Button, Rows, Text } from "@canva/app-ui-kit";
import { useAppContext } from "src/context";
import { Paths } from "src/routes";
import { AppMessages as Messages } from "src/app.messages";
import styles from "styles/components.css";

/**
 * Bare bones Error Page, please add relevant information and behavior that your app requires.
 */
export const ErrorPage = () => {
  const navigate = useNavigate();
  const { setPromptInput, setIsLoadingImages } = useAppContext();

  const onClick = () => {
    setPromptInput("");
    setIsLoadingImages(false);
    navigate(Paths.HOME);
  };

  return (
    <div className={styles.scrollContainer}>
      <Rows spacing="2u">
        <Text>{Messages.errorPageSomethingWentWrong()}</Text>
        <Button variant="primary" onClick={onClick} stretch={true}>
          {Messages.reload()}
        </Button>
      </Rows>
    </div>
  );
};
