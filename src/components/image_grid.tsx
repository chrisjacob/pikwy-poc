import { Grid, ImageCard, Rows, Text } from "@canva/app-ui-kit";
import type { QueuedImage } from "@canva/asset";
import { upload } from "@canva/asset";
import { addNativeElement, ui } from "@canva/design";
import type { ImageType } from "src/api";
import { useAppContext } from "src/context";
import { AppMessages as Messages } from "src/app.messages";
import styles from "styles/utils.css";

const THUMBNAIL_HEIGHT = 300;

const uploadImage = async (image: ImageType): Promise<QueuedImage> => {
  // Upload the image using @canva/asset.
  const queuedImage = await upload({
    type: "IMAGE",
    mimeType: "image/jpeg",
    thumbnailUrl: image.thumbnail.url,
    url: image.fullsize.url,
    width: image.fullsize.width,
    height: image.fullsize.height,
  });

  return queuedImage;
};

export const ImageGrid = () => {
  const { generatedImages } = useAppContext();

  const onDragStart = async (
    event: React.DragEvent<HTMLElement>,
    image: ImageType
  ) => {
    const parentNode = event.currentTarget.parentElement;
    try {
      parentNode?.classList.add(styles.hidden);

      await ui.startDrag(event, {
        type: "IMAGE",
        resolveImageRef: () => uploadImage(image),
        previewUrl: image.thumbnail.url,
        previewSize: {
          width: image.thumbnail.width,
          height: image.thumbnail.height,
        },
        fullSize: {
          width: image.fullsize.width,
          height: image.fullsize.height,
        },
      });
    } finally {
      parentNode?.classList.remove(styles.hidden);
    }
  };

  const onImageClick = async (image: ImageType) => {
    const queuedImage = await uploadImage(image);

    await addNativeElement({
      type: "IMAGE",
      ref: queuedImage.ref,
    });
  };

  return (
    <Rows spacing="1u">
      <Text size="medium" variant="bold">
        {Messages.addToDesign()}
      </Text>
      <Grid columns={1} spacing="2u">
        {generatedImages.map((image, index) => (
          <ImageCard
            key={index}
            thumbnailUrl={image.thumbnail.url}
            onClick={() => onImageClick(image)}
            ariaLabel={image.label}
            thumbnailHeight={THUMBNAIL_HEIGHT}
            borderRadius="standard"
            onDragStart={(event: React.DragEvent<HTMLElement>) =>
              onDragStart(event, image)
            }
          />
        ))}
      </Grid>
    </Rows>
  );
};
