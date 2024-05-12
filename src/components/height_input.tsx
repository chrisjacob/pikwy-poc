import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Text,
  FormField,
  TextInput,
} from "@canva/app-ui-kit";
import { useAppContext } from "src/context";
import { Paths } from "src/routes";
import { AppMessages as Messages } from "src/app.messages";

// @TODO: Adjust according to your specific requirements.
const MAX_INPUT_LENGTH = 5;

export const HeightInput = () => {
  const { pathname } = useLocation();
  const isHomeRoute = pathname === Paths.HOME;
  const { heightInput, setHeightInput, heightInputError } = useAppContext();

  const onHeightInputChange = (value: string) => {
    setHeightInput(value);
  };

  return (
    <FormField
      label={Messages.heightLabel()}
      error={heightInputError}
      value={heightInput}
      control={(props) => (
        <TextInput
          {...props}
          placeholder={Messages.heightPlaceholder()}
          onChange={onHeightInputChange}
          maxLength={MAX_INPUT_LENGTH}
          required={false}
        />
      )}
    />
  );
};
