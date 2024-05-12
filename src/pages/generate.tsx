import { Rows } from "@canva/app-ui-kit";
import { AppError, PromptInput, WidthInput, HeightInput } from "src/components";

export const GeneratePage = () => (
  <Rows spacing="1u">
    <AppError />
    <PromptInput />
    <WidthInput />
    <HeightInput />
  </Rows>
);
