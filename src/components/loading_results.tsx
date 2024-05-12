import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Parser from "html-react-parser";
import {
  Rows,
  Grid,
  Placeholder,
  ProgressBar,
  Text,
  Button,
  Box,
} from "@canva/app-ui-kit";
import { Paths } from "src/routes";
import { useAppContext } from "src/context";
import { AppMessages as Messages } from "src/app.messages";
import { cancelImageGenerationJob, getImageGenerationJobStatus } from "src/api";

const INTERVAL_DURATION_IN_MS = 100;
const TOTAL_PROGRESS_PERCENTAGE = 100;
const LOADING_THRESHOLD_IN_SECONDS = 1;

/**
 * Manages loading progress by updating progress at regular intervals.
 * @param {number} durationInSeconds - Total duration of the loading process in seconds.
 * @param {boolean} loading - Indicates if loading is in progress.
 * @param {function} setProgress - Function to set progress.
 * @returns {function} Function to clear the interval.
 */
const manageLoadingProgress = (
  durationInSeconds: number,
  loading: boolean,
  setProgress: (value: number) => void
) => {
  let intervalId = 0;
  let progress = 0;
  const totalSteps = (durationInSeconds * 1000) / INTERVAL_DURATION_IN_MS;

  if (loading) {
    intervalId = window.setInterval(() => {
      progress += TOTAL_PROGRESS_PERCENTAGE / totalSteps;
      // If progress reaches 100%, clear the interval
      if (progress >= TOTAL_PROGRESS_PERCENTAGE) {
        clearInterval(intervalId);
      } else {
        setProgress(progress);
      }
    }, INTERVAL_DURATION_IN_MS);
  }

  // Return function to clear the interval
  return () => clearInterval(intervalId);
};

/**
 * Renders a component to display loading results.
 * @param {Object} props - Props for the component.
 * @param {number} props.durationInSeconds - Total duration of the loading process in seconds.
 */
export const LoadingResults = ({
  durationInSeconds,
}: {
  durationInSeconds: number;
}) => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const {
    isLoadingImages,
    setIsLoadingImages,
    jobId,
    setJobId,
    promptInput,
    setGeneratedImages,
    setRemainingCredits,
  } = useAppContext();

  useEffect(() => {
    const clearLoadingProgress = manageLoadingProgress(
      durationInSeconds,
      isLoadingImages,
      setProgress
    );

    const pollJobStatus = async () => {
      if (jobId) {
        try {
          const { images, credits } = await getImageGenerationJobStatus({
            jobId,
          });
          setGeneratedImages(images);
          setRemainingCredits(credits);
          // Clear the jobId after fetching images
          setJobId("");
          setIsLoadingImages(false);
        } catch (error) {
          if (error === "Job not found") {
            // job may have been cancelled.
            setJobId("");
            setIsLoadingImages(false);
            navigate(Paths.HOME);
          }
        }
      }
    };

    pollJobStatus();

    return () => {
      // Cleanup function to clear the interval when the component unmounts.
      // This prevents the interval from continuing when a user cancels.
      clearLoadingProgress();
    };
  }, [
    durationInSeconds,
    isLoadingImages,
    setIsLoadingImages,
    setProgress,
    jobId,
  ]);

  const onCancelClick = async () => {
    await cancelImageGenerationJob(jobId);
    setIsLoadingImages(false);
    navigate(Paths.HOME);
  };

  // Check if loading duration is below the threshold
  if (durationInSeconds <= LOADING_THRESHOLD_IN_SECONDS) {
    // Return nothing if loading duration is too short to prevent flashing/loading screen from appearing momentarily
    return null;
  }

  return (
    <Rows spacing="2u">
      <Box paddingTop="4u">
        {/** Wrapping this grid in a box with paddingTop so that the placeholders render at the same point as the generated images. */}
        <Grid columns={1} spacing="2u">
          {Array.from({ length: 1 }, (_, index) => (
            <Placeholder shape="square" key={index} />
          ))}
        </Grid>
      </Box>
      <Text size="large" alignment="center">
        {Parser(Messages.loadingMessage(promptInput.length > 63 ? promptInput.substring(0, 60) + "..." : promptInput))}
      </Text>
      <ProgressBar
        value={Math.min(progress, 100)}
        ariaLabel={Messages.progressBarAriaLabel()}
      />
      <Button variant="secondary" onClick={onCancelClick} stretch={true}>
        {Messages.cancel()}
      </Button>
    </Rows>
  );
};
