/**
 * Messages used throughout the application.
 * Grouped by their usage and purpose.
 */
export const AppMessages = {
  /** Indicates actions users can take or instructions provided to the user. */
  addToDesign: () => "Select or drag to add to design",
  cancel: () => "Cancel",
  clear: () => "Clear",
  generateAgain: () => "Generate again",
  generateImage: () => "Generate image",
  reload: () => "Reload",
  signUpOrLogin: () => "Sign up or log in to generate",
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
    "Generating images has failed, please try again.",
  errorPageSomethingWentWrong: () => "Something went wrong.",
  appErrorGetLoggedInStatusFailed: () =>
    "Retrieving logged in status has failed.",

  /** Messages related to prompts and user input validation. */
  promptInspireMe: () => "Inspire me",
  promptTryAnother: () => "Try another",
  promptLabel: () => "Describe what you want to create",
  promptPlaceholder: () => "Enter 5+ words to describe...",
  promptMissingErrorMessage: () => "Please describe what you want to create",
  promptNoCreditsRemaining: () => "No credits remaining.",
  promptObscenityErrorMessage: () =>
    "Something you typed may result in content that doesn’t meet our policies.",

  /** Messages related to loading and progress indicators. */
  loadingMessage: (value: string) =>
    `Generating “<strong>${value}</strong>”. This may take up to a minute.`,
  progressBarAriaLabel: () => "image generation",

  /** Messages related to credits, including their availability and purchasing options. */
  alertNotEnoughCreditsLoggedIn: () =>
    "You don’t have enough credits left to generate an image. Please purchase more.",
  alertNotEnoughCreditsLoggedOut: () =>
    "You don’t have enough credits left to generate an image. Please sign up or log in to purchase more.",
  purchaseMoreCreditsAt: () => "Purchase more credits at",
  remainingCredits: (remainingCredits: number) =>
    `Use <strong>1 of ${remainingCredits}</strong> credits.`,
  noRemainingCredits: () => `No credits remaining.`,
};
