import { Text } from "@canva/app-ui-kit";
import { useAppContext } from "src/context";

export const LoggedInStatus = (): JSX.Element => {
  const { loggedInState } = useAppContext();

  const createAuthenticationMessage = () => {
    switch (loggedInState) {
      case "checking":
        return "Checking authentication status...";
      case "authenticated":
        //@TODO: Make a call to your own backend to get the user's information.
        return "You are logged in as Jane Doe (janedoe@canva.com)";
      case "not_authenticated":
        return "";
      default:
        return "Unknown authentication status";
    }
  };

  return (
    <Text alignment="center" size="small">
      {createAuthenticationMessage()}
    </Text>
  );
};
