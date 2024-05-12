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

export const WidthInput = () => {
  const { pathname } = useLocation();
  const isHomeRoute = pathname === Paths.HOME;
  const { widthInput, setWidthInput, widthInputError } = useAppContext();

  const onWidthInputChange = (value: string) => {
    setWidthInput(value);
  };

  return (
    <FormField
      label={Messages.widthLabel()}
      error={widthInputError}
      value={widthInput}
      control={(props) => (
        <TextInput
          {...props}
          placeholder={Messages.widthPlaceholder()}
          onChange={onWidthInputChange}
          maxLength={MAX_INPUT_LENGTH}
          required={false}
        />
      )}
    />
  );
};
