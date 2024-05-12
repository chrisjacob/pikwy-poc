import { useNavigate, useLocation } from "react-router-dom";
import { Rows, Button } from "@canva/app-ui-kit";
import { queueImageGeneration, purchaseCredits } from "src/api";
import { LoggedInStatus, RemainingCredits } from "src/components";
import { NUMBER_OF_IMAGES_TO_GENERATE } from "src/config";
import { useAppContext } from "src/context";
import { Paths } from "src/routes";
import { useAuth } from "src/services";
import { getObsceneWords } from "src/utils";
import { AppMessages as Messages } from "src/app.messages";

export const Footer = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { requestAuthentication } = useAuth();
  const isRootRoute = pathname === Paths.HOME;
  const {
    loggedInState,
    setAppError,
    promptInput,
    setPromptInput,
    setPromptInputError,
    loadingApp,
    isLoadingImages,
    setJobId,
    setIsLoadingImages,
    remainingCredits,
    setRemainingCredits,
  } = useAppContext();

  const hasRemainingCredits = remainingCredits > 0;

  const isCreditRemaining = () => {
    if (!hasRemainingCredits) {
      setPromptInputError(Messages.promptNoCreditsRemaining());
      return false;
    }
    return true;
  };

  const isPromptInputFilled = () => {
    if (!promptInput) {
      setPromptInputError(Messages.promptMissingErrorMessage());
      return false;
    }
    return true;
  };

  const isPromptInputClean = () => {
    const obsceneWords = getObsceneWords(promptInput);
    if (obsceneWords.length > 0) {
      setPromptInputError(Messages.promptObscenityErrorMessage());
      return false;
    }
    return true;
  };

  const onGenerateClick = async () => {
    if (
      !isCreditRemaining() ||
      !isPromptInputFilled() ||
      !isPromptInputClean()
    ) {
      return;
    }

    setIsLoadingImages(true);
    try {
      const { jobId } = await queueImageGeneration({
        prompt: promptInput,
        numberOfImages: NUMBER_OF_IMAGES_TO_GENERATE,
      });

      setJobId(jobId);
    } catch {
      setAppError(Messages.appErrorGeneratingImagesFailed());
    }
    navigate(Paths.RESULTS);
  };

  const onSignUpOrLogInClick = async () => {
    await requestAuthentication();
  };

  const onPurchaseMoreCredits = async () => {
    const { credits } = await purchaseCredits();

    setRemainingCredits(credits);
  };

  const reset = () => {
    setPromptInput("");
    navigate(Paths.HOME);
  };

  const footerButtons = [
    {
      variant: "primary" as const,
      onClick: onGenerateClick,
      value: isRootRoute ? Messages.generateImage() : Messages.generateAgain(),
      visible: hasRemainingCredits,
    },
    {
      variant: "primary" as const,
      onClick: onSignUpOrLogInClick,
      value: Messages.signUpOrLogin(),
      visible: loggedInState === "not_authenticated" && !hasRemainingCredits,
    },
    {
      variant: "primary" as const,
      onClick: onPurchaseMoreCredits,
      value: Messages.purchaseMoreCredits(),
      visible: loggedInState === "authenticated" && !hasRemainingCredits,
    },
    {
      variant: "secondary" as const,
      onClick: reset,
      value: Messages.startOver(),
      visible: !isRootRoute,
    },
  ];

  if (isLoadingImages) {
    return null;
  }

  return (
    <Rows spacing="1u">
      {footerButtons.map(
        ({ visible, variant, onClick, value }) =>
          visible && (
            <Button
              key={value}
              variant={variant}
              onClick={onClick}
              loading={loadingApp}
              stretch={true}
            >
              {value}
            </Button>
          )
      )}
      <RemainingCredits />
      <LoggedInStatus />
    </Rows>
  );
};
