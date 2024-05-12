/**
 * Messages used throughout the application.
 * Grouped by their usage and purpose.
 */
export const AppMessages = {
  /** Indicates actions users can take or instructions provided to the user. */
  addToDesign: () => "Select or drag to add to design",
  cancel: () => "Cancel",
  clear: () => "Clear",
  generateAgain: () => "Capture again",
  generateImage: () => "Capture screenshot",
  reload: () => "Reload",
  signUpOrLogin: () => "Sign up or log in to capture",
  purchaseMoreCredits: () => "Purchase more credits",
  startOver: () => "Start over",
  loggedIn: () => "You are logged in.",
  loggedOut: () => "You are not logged in.",

  /** Messages related to handling errors that occur during operations. */
  appErrorGeneral: () =>
    "An unexpected error occurred. Please try again later.",
  appErrorGetRemainingCreditsFailed: () =>
    "Retrieving remaining credits has failed.",
  appErrorGeneratingImagesFailed: () =>
    "Capturing screenshot has failed, please try again.",
  errorPageSomethingWentWrong: () => "Something went wrong.",
  appErrorGetLoggedInStatusFailed: () =>
    "Retrieving logged in status has failed.",

  /** Messages related to prompts and user input validation. */
  promptInspireMe: () => "Inspire me",
  promptTryAnother: () => "Try another",
  promptLabel: () => "Provide the website to capture",
  promptPlaceholder: () => "Enter a URL to screenshot...",
  promptMissingErrorMessage: () => "Please provide the URL to capture",
  promptNoCreditsRemaining: () => "No credits remaining.",
  promptObscenityErrorMessage: () =>
    "The URL you provided may result in content that doesn’t meet our policies.",
  widthLabel: () => "Width",
  widthPlaceholder: () => "1280",
  widthMissingErrorMessage: () => "Please provide a Width",
  heightLabel: () => "Height",
  heightPlaceholder: () => "1024",
  heightMissingErrorMessage: () => "Please provide a Height",

  /** Messages related to loading and progress indicators. */
  loadingMessage: (value: string) =>
    `Capturing “<strong>${value}</strong>”. This may take up to a minute.`,
  progressBarAriaLabel: () => "screenshot generation",

  /** Messages related to credits, including their availability and purchasing options. */
  alertNotEnoughCreditsLoggedIn: () =>
    "You don’t have enough credits left to capture a screenshot. Please purchase more.",
  alertNotEnoughCreditsLoggedOut: () =>
    "You don’t have enough credits left to capture a screenshot. Please sign up or log in to purchase more.",
  purchaseMoreCreditsAt: () => "Purchase more credits at",
  remainingCredits: (remainingCredits: number) =>
    `Use <strong>1 of ${remainingCredits}</strong> credits.`,
  noRemainingCredits: () => `No credits remaining.`,
};
