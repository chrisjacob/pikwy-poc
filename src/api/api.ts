import { auth } from "@canva/user";
import { POLLING_INTERVAL_IN_SECONDS } from "src/config";

/**
 * Represents the structure of an image.
 */
export interface ImageType {
  /** The label of the image. */
  label: string;
  /** Information about the full-size version of the image. */
  fullsize: { width: number; height: number; url: string };
  /** Information about the thumbnail version of the image. */
  thumbnail: { width: number; height: number; url: string };
}

/**
 * Represents the result of generating images.
 */
interface ImageGenerationResult {
  /** An array of generated images. */
  images: ImageType[];
  /** The remaining credits. */
  credits: number;
}

interface ImageGenerationJobStatusResponse {
  status: "completed" | "processing";
  images: ImageType[];
  credits: number;
}

interface QueueImageGenerationResponse {
  jobId: string;
}

/**
 * Represents the result of retrieving remaining credits.
 */
interface RemainingCreditsResult {
  /** The remaining credits. */
  credits: number;
}

/**
 * Represents the result of retrieving the logged in status of the user.
 */
export type LoggedInState =
  | "authenticated"
  | "not_authenticated"
  | "checking"
  | "error";

const endpoints = {
  queueImageGeneration: "/api/queue-image-generation",
  getImageGenerationJobStatus: "/api/job-status",
  cancelImageGenerationJob: "/api/job-status/cancel",
  getRemainingCredits: "/api/credits",
  purchaseCredits: "/api/purchase-credits",
  getLoggedInStatus: "/api/authentication/status",
};

/**
 * queues image generation based on the provided prompt and number of images.
 * @param {Object} options - The options for generating images.
 * @param {string} options.prompt - The prompt for generating images.
 * @param {string} options.width - The width for generating images.
 * @param {string} options.height - The height for generating images.
 * @param {number} options.numberOfImages - The number of images to generate.
 * @returns {Promise<QueueImageGenerationResponse>} A promise that resolves to the created job ID.
 */
export const queueImageGeneration = async ({
  prompt,
  width,
  height,
  numberOfImages,
}: {
  prompt: string;
  width: number;
  height: number;
  numberOfImages: number;
}): Promise<QueueImageGenerationResponse> => {
  const url = new URL(endpoints.queueImageGeneration, BACKEND_HOST);
  url.searchParams.append("count", numberOfImages.toString());
  url.searchParams.append("prompt", prompt);
  url.searchParams.append("width", width);
  url.searchParams.append("height", height);

  const result: QueueImageGenerationResponse = await sendRequest(url);

  return result;
};

/**
 * Retrieves the status of an image generation job.
 * @param {string} jobId - The ID of the job to retrieve status for.
 * @returns {Promise<ImageGenerationResult>} A promise that resolves to the image generation result.
 */
export const getImageGenerationJobStatus = async ({
  jobId,
}: {
  jobId: string;
}): Promise<ImageGenerationResult> => {
  const url = new URL(endpoints.getImageGenerationJobStatus, BACKEND_HOST);
  url.searchParams.append("jobId", jobId);

  // Define a maximum number of polling attempts
  const maxAttempts = 60;
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const response = (await sendRequest(
        url
      )) as ImageGenerationJobStatusResponse;

      if (response.status === "completed") {
        return { images: response.images, credits: response.credits };
      } else if (response.status === "processing") {
        // Job is still processing, wait and continue polling
        await new Promise((resolve) =>
          setTimeout(resolve, POLLING_INTERVAL_IN_SECONDS * 1000)
        );
        attempts++;
      } else if (response.status === "cancelled") {
        throw new Error("Job not found");
      }
    } catch (error) {
      // Handle errors here
      throw new Error(`Error while polling job status ${error}`);
    }
  }

  throw new Error("Maximum polling attempts reached");
};

/**
 * Cancels an image generation job based on the provided job ID.
 * @param {string} jobId - The ID of the job to cancel.
 * @returns {Promise<void>} - A promise that resolves if the job is successfully cancelled, otherwise rejects with an error.
 */
export const cancelImageGenerationJob = async (
  jobId: string
): Promise<void> => {
  const url = new URL(endpoints.cancelImageGenerationJob, BACKEND_HOST);
  url.searchParams.append("jobId", jobId);

  try {
    await sendRequest(url, {
      method: "POST",
    });
  } catch (error) {
    throw new Error("Failed to cancel job.");
  }
};

/**
 * Retrieves the remaining credits.
 * @returns {Promise<RemainingCreditsResult>} - A promise that resolves to the remaining credits.
 */
export const getRemainingCredits =
  async (): Promise<RemainingCreditsResult> => {
    const url = new URL(endpoints.getRemainingCredits, BACKEND_HOST);

    const result: RemainingCreditsResult = await sendRequest(url);

    return result;
  };

/**
 * Purchases credits for the user.
 * @returns {Promise<RemainingCreditsResult>} - A promise that resolves to the remaining credits after purchasing.
 */
export const purchaseCredits = async (): Promise<RemainingCreditsResult> => {
  const url = new URL(endpoints.purchaseCredits, BACKEND_HOST);

  const result: RemainingCreditsResult = await sendRequest(url, {
    method: "POST",
  });

  return result;
};

/**
 * Send a request to an endpoint that checks if the user is authenticated.
 * This is example code, intended to convey the basic idea. When implementing this in your app, you might want more advanced checks.
 *
 * Note: You must register the provided endpoint via the Developer Portal.
 */
export const checkAuthenticationStatus = async (): Promise<LoggedInState> => {
  try {
    const url = new URL(endpoints.getLoggedInStatus, BACKEND_HOST);
    const result: { isAuthenticated: string } = await sendRequest(url, {
      method: "POST",
    });

    if (result?.isAuthenticated) {
      return "authenticated";
    } else {
      return "not_authenticated";
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return "error";
  }
};

/**
 * Sends a request to the specified URL with authorization headers.
 * @param {URL} url - The URL to send the request to.
 * @param {RequestInit} [options] - Optional fetch options to be passed to the fetch function.
 * @returns {Promise<Object>} - A promise that resolves to the response body.
 */
const sendRequest = async <T>(url: URL, options?: RequestInit): Promise<T> => {
  const token = await auth.getCanvaUserToken();
  const res = await fetch(url, {
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${token}`,
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }

  // Check Content-Type header to determine how to parse response body
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    // Parse response body as JSON
    return (await res.json()) as T;
  } else {
    // Parse response body as text
    return (await res.text()) as unknown as T;
  }
};
