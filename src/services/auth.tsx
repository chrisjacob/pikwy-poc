import { auth } from "@canva/user";
import { useAppContext } from "src/context";

export const useAuth = () => {
  const { setLoggedInState } = useAppContext();

  const requestAuthentication = async () => {
    try {
      const response = await auth.requestAuthentication();
      switch (response.status) {
        case "COMPLETED":
          setLoggedInState("authenticated");
          break;
        case "ABORTED":
          setLoggedInState("not_authenticated");
          break;
        case "DENIED":
          setLoggedInState("not_authenticated");
          break;
        default:
          setLoggedInState("not_authenticated");
          break;
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  };

  return { requestAuthentication };
};
