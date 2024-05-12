import { createContext, useEffect, useState } from "react";
import type { ImageType, LoggedInState } from "src/api";
import { checkAuthenticationStatus, getRemainingCredits } from "src/api";
import { AppMessages as Messages } from "src/app.messages";

export interface AppContextType {
  loggedInState: LoggedInState;
  setLoggedInState: (value: LoggedInState) => void;
  appError: string;
  setAppError: (value: string) => void;
  creditsError: string;
  setCreditsError: (value: string) => void;
  loadingApp: boolean;
  setLoadingApp: (value: boolean) => void;
  isLoadingImages: boolean;
  setIsLoadingImages: (value: boolean) => void;
  jobId: string;
  setJobId: (value: string) => void;
  remainingCredits: number;
  setRemainingCredits: (value: number) => void;
  promptInput: string;
  setPromptInput: (value: string) => void;
  promptInputError: string;
  setPromptInputError: (value: string) => void;
  generatedImages: ImageType[];
  setGeneratedImages: (value: ImageType[]) => void;
}

export const AppContext = createContext<AppContextType>({
  loggedInState: "not_authenticated",
  setLoggedInState: () => {},
  appError: "",
  setAppError: () => {},
  creditsError: "",
  setCreditsError: () => {},
  loadingApp: true,
  setLoadingApp: () => {},
  isLoadingImages: false,
  setIsLoadingImages: () => {},
  jobId: "",
  setJobId: () => {},
  remainingCredits: 0,
  setRemainingCredits: () => {},
  promptInput: "",
  setPromptInput: () => {},
  promptInputError: "",
  setPromptInputError: () => {},
  generatedImages: [] as ImageType[],
  setGeneratedImages: () => {},
});

/**
 * Provides application-wide state and methods using React Context.
 * @param {object} props - The props object.
 * @param {React.ReactNode} props.children - The children components wrapped by the provider.
 * @returns {JSX.Element} The provider component.
 * @description This provider component wraps the entire application to provide application-wide state and methods using React Context.
 * It manages state related to app errors, loading status, remaining credits, user input for prompts, image styles, and generated images.
 * It exposes these state values and setter methods to its child components via the AppContext.
 * For more information on React Context, refer to the official React documentation: {@link https://react.dev/learn/passing-data-deeply-with-context}.
 */
export const ContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element => {
  const [loggedInState, setLoggedInState] =
    useState<LoggedInState>("not_authenticated");
  const [appError, setAppError] = useState<string>("");
  const [loadingApp, setLoadingApp] = useState<boolean>(true); // set to true to prevent ui flash on load
  const [isLoadingImages, setIsLoadingImages] = useState<boolean>(false);
  const [jobId, setJobId] = useState<string>("");
  const [remainingCredits, setRemainingCredits] = useState<number>(0);
  const [promptInput, setPromptInput] = useState<string>("");
  const [promptInputError, setPromptInputError] = useState<string>("");
  const [generatedImages, setGeneratedImages] = useState<ImageType[]>([]);
  const [creditsError, setCreditsError] = useState<string>("");

  // Fetches initial data on component mount
  useEffect(() => {
    const fetchDataOnMount = async () => {
      try {
        setLoadingApp(true);

        // Fetch remaining credits
        try {
          const { credits } = await getRemainingCredits();
          setRemainingCredits(credits);
        } catch (error) {
          setAppError(Messages.appErrorGetRemainingCreditsFailed());
          // eslint-disable-next-line no-console
          console.error("Error fetching remaining credits:", error);
        }

        // Fetch login status
        try {
          checkAuthenticationStatus();
        } catch (error) {
          setAppError(Messages.appErrorGetLoggedInStatusFailed());
          // eslint-disable-next-line no-console
          console.error("Error fetching login status:", error);
        }
      } catch (error) {
        setAppError(Messages.appErrorGeneral());
        // eslint-disable-next-line no-console
        console.error("Error fetching data:", error);
      } finally {
        setLoadingApp(false);
      }
    };

    fetchDataOnMount();
  }, []);

  // Manages errors related to remaining credits
  useEffect(() => {
    if (loadingApp || remainingCredits > 0) {
      setCreditsError("");
      return;
    }

    const errorMessage =
      loggedInState === "authenticated"
        ? Messages.alertNotEnoughCreditsLoggedIn()
        : Messages.alertNotEnoughCreditsLoggedOut();

    setCreditsError(errorMessage);
  }, [loadingApp, remainingCredits, loggedInState]);

  const setPromptInputHandler = (value: string) => {
    if (promptInputError === Messages.promptMissingErrorMessage()) {
      setPromptInputError("");
    }
    if (value === "") {
      setPromptInputError("");
    }

    setPromptInput(value);
  };

  const value: AppContextType = {
    loggedInState,
    setLoggedInState,
    appError,
    setAppError,
    creditsError,
    setCreditsError,
    loadingApp,
    setLoadingApp,
    isLoadingImages,
    setIsLoadingImages,
    jobId,
    setJobId,
    remainingCredits,
    setRemainingCredits,
    promptInput,
    setPromptInput: setPromptInputHandler,
    promptInputError,
    setPromptInputError,
    generatedImages,
    setGeneratedImages,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
