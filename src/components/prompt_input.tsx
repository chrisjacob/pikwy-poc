import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Box,
  Button,
  FormField,
  LightBulbIcon,
  MultilineInput,
} from "@canva/app-ui-kit";
import { useAppContext } from "src/context";
import { Paths } from "src/routes";
import { AppMessages as Messages } from "src/app.messages";

// @TODO: Adjust according to your specific requirements.
const MAX_INPUT_LENGTH = 8000;
const MIN_INPUT_ROWS = 5;

/**
 * Array of example prompts that could be used to generate interesting pictures with an AI.
 * Consider fetching these prompts from a server or API call for dynamic and varied content.
 */
const examplePrompts: string[] = [
  "https://www.wikipedia.org/",
  "https://www.tradingview.com/symbols/NASDAQ-AAPL/",
  "https://time.is/",
];

/**
 * Generates a new example prompt different from the current prompt.
 * @param {string} currentPrompt - The current prompt.
 * @returns {string} A new example prompt different from the current prompt.
 */
const generateExamplePrompt = (currentPrompt: string): string => {
  let newPrompt = currentPrompt;

  // Prevents generating the same prompt twice in a row.
  let attempts = 0;
  // Maximum attempts to generate a new prompt. Used as a safeguard against infinite loops.
  const MAX_ATTEMPTS = 3;

  while (currentPrompt === newPrompt && attempts < MAX_ATTEMPTS) {
    newPrompt =
      examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
    attempts++;
  }

  return newPrompt;
};

export const PromptInput = () => {
  const { pathname } = useLocation();
  const isHomeRoute = pathname === Paths.HOME;
  const { promptInput, setPromptInput, promptInputError } = useAppContext();
  const [showInspireMeButton, setShowInspireMeButton] = useState(true);
  const [inspireMeButtonLabel, setInspireMeButtonLabel] = useState(
    Messages.promptInspireMe()
  );

  const onInspireClick = () => {
    setPromptInput(generateExamplePrompt(promptInput));
    setInspireMeButtonLabel(Messages.promptTryAnother());
  };

  const onPromptInputChange = (value: string) => {
    setShowInspireMeButton(false);
    setPromptInput(value);
  };

  const InspireMeButton = () => {
    return (
      <Button variant="secondary" icon={LightBulbIcon} onClick={onInspireClick}>
        {inspireMeButtonLabel}
      </Button>
    );
  };

  const onClearClick = () => {
    setPromptInput("");
    setShowInspireMeButton(true);
    setInspireMeButtonLabel(Messages.promptInspireMe());
  };

  const ClearButton = () => (
    <Button variant="tertiary" onClick={onClearClick}>
      {Messages.clear()}
    </Button>
  );

  return (
    <FormField
      label={Messages.promptLabel()}
      error={promptInputError}
      value={promptInput}
      control={(props) => (
        <MultilineInput
          {...props}
          placeholder={Messages.promptPlaceholder()}
          onChange={onPromptInputChange}
          maxLength={MAX_INPUT_LENGTH}
          minRows={MIN_INPUT_ROWS}
          footer={
            <Box
              padding="1u"
              display="flex"
              justifyContent={
                isHomeRoute && showInspireMeButton ? "spaceBetween" : "end"
              }
            >
              {isHomeRoute && showInspireMeButton && <InspireMeButton />}
              {promptInput && <ClearButton />}
            </Box>
          }
          required={true}
        />
      )}
    />
  );
};
