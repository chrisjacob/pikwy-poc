import Parser from "html-react-parser";
import { Link, Rows, Text, TextPlaceholder } from "@canva/app-ui-kit";
import { requestOpenExternalUrl } from "@canva/platform";
import { useAppContext } from "src/context";
import { AppMessages as Messages } from "src/app.messages";

// @TODO: Replace this URL with your custom upselling link.
const PURCHASE_URL = "https://example.com";

export const RemainingCredits = (): JSX.Element | undefined => {
  const { remainingCredits, loadingApp } = useAppContext();

  const RemainingCreditsText = () => {
    if (loadingApp) {
      return <TextPlaceholder size="small" />;
    }

    const text =
      remainingCredits > 0
        ? Parser(Messages.remainingCredits(remainingCredits))
        : Messages.noRemainingCredits();

    return (
      <Text alignment="center" size="small">
        {text}
      </Text>
    );
  };

  const openExternalUrl = async (url: string) => {
    await requestOpenExternalUrl({
      url,
    });
  };

  return (
    <Rows spacing="0">
      <RemainingCreditsText />
      <Text alignment="center" size="small">
        {Messages.purchaseMoreCreditsAt()}{" "}
        <Link
          href={PURCHASE_URL}
          requestOpenExternalUrl={() => openExternalUrl(PURCHASE_URL)}
          title="Purchase credits"
        >
          example.com
        </Link>
      </Text>
    </Rows>
  );
};
