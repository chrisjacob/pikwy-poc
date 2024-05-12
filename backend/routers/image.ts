/**
 * DISCLAIMER:
 * This file contains a demonstration of how to implement a simple API with Express.js for educational purposes only.
 * It is NOT SUITABLE for use in a production environment. It lacks many essential features such as error handling,
 * input validation, authentication, and security measures. Additionally, the in-memory job queue is for illustrative
 * purposes only and is not efficient or scalable. For production use, consider using robust libraries and frameworks,
 * implementing proper error handling, security measures, and using appropriate database and job queue solutions.
 * Use this code as a learning resource, but do not deploy it in a real backend without significant modifications
 * to ensure reliability, security, and scalability.
 */
import * as express from "express";
import { Response } from 'node-fetch';

interface ImageResponse {
  fullsize: { width: number; height: number; url: string };
  thumbnail: { width: number; height: number; url: string };
}

// Array of placeholder image URLs.
// In a real-world scenario, these URLs would point to dynamically generated images.
const imageUrls: ImageResponse[] = [
  {
    fullsize: {
      width: 1280,
      height: 853,
      url: "https://cdn.pixabay.com/photo/2023/02/03/05/11/youtube-background-7764170_1280.jpg",
    },
    thumbnail: {
      width: 640,
      height: 427,
      url: "https://cdn.pixabay.com/photo/2023/02/03/05/11/youtube-background-7764170_640.jpg",
    },
  }
];

export const createImageRouter = () => {
  const enum Routes {
    CREDITS = "/api/credits",
    PURCHASE_CREDITS = "/api/purchase-credits",
    QUEUE_IMAGE_GENERATION = "/api/queue-image-generation",
    JOB_STATUS = "/api/job-status",
    CANCEL_JOB = "/api/job-status/cancel",
  }

  const router = express.Router();
  const jobQueue: {
    jobId: string;
    prompt: string;
    timeoutId: NodeJS.Timeout;
  }[] = [];
  const completedJobs: Record<string, ImageResponse[]> = {};
  const cancelledJobs: { jobId: string }[] = [];

  // Initial credit allocation for users, which decreases with each use.
  // Users receive 10 credits initially and can purchase additional credits in bundles.
  let credits = 10;
  const CREDITS_IN_BUNDLE = 10;

  /**
   * GET endpoint to retrieve user credits.
   * Requires authentication. Returns the current number of credits available to the user.
   */
  router.get(Routes.CREDITS, async (req, res) => {
    res.status(200).send({
      credits,
    });
  });

  /**
   * POST endpoint to purchase credits.
   * Requires authentication. Increments the user's credits by the number of credits in a bundle.
   * This endpoint should be backed by proper input validation to prevent misuse.
   */
  router.post(Routes.PURCHASE_CREDITS, async (req, res) => {
    credits += CREDITS_IN_BUNDLE;
    res.status(200).send({
      credits,
    });
  });

  /**
   * GET endpoint to generate images based on a prompt.
   * Requires authentication. Generates images based on the provided prompt and adds a job to the processing queue.
   * If there are not enough credits, it returns a 403 error.
   * If the prompt parameter is missing, it returns a 400 error.
   * Once the job is added to the queue, it returns a jobId that can be used to check the job status.
   * Note: The job processing time is simulated to be 5 seconds.
   */
  router.get(Routes.QUEUE_IMAGE_GENERATION, async (req, res) => {
    if (credits <= 0) {
      return res
        .status(403)
        .send("Not enough credits required to capture screenshot.");
    }

    const prompt = req.query.prompt as string;
    if (!prompt) {
      return res.status(400).send("Missing prompt parameter.");
    }

    var width = req.query.width as string;
    if (!width) {
      width = "1280";
      // return res.status(400).send("Missing width parameter.");
    }

    var height = req.query.height as string;
    if (!height) {
      height = "1024";
      // return res.status(400).send("Missing height parameter.");
    }

    const jobId = generateJobId();

    const timeoutId = setTimeout(async () => {
      const index = jobQueue.findIndex((job) => job.jobId === jobId);
      if (index !== -1) {
        // @NOTE had to move the jobQueue removal until after the fetch() has returned, otherwise queue checking ends too early
        //jobQueue.splice(index, 1);

        // @NOTE moved the completedJobs into fetch() response
        // completedJobs[jobId] = imageUrls.map((image) => {
        //   return { ...image, label: prompt };
        // });

        // Get screenshot from Pikwy API
        // @TODO replacce with a 10 credit endpoint - currently using the pikwy.com homepage token ("token=125") which may change if it's getting exploited by bad actors
        // @TODO "response_type=jweb" is another special param used by pikwy.com homepage to get a JSON response with hosted image files i.e. it's not the normal "raw" or "json" response type, "jweb" is only used for this demo
        // @TODO use the real API endpoint https://api.pikwy.com/?token=YOUR_API_TOKEN&response_type=json once someone signs up and starts the 7 day trial (or after purchasing credits)
        const pikwy_demo_endpoint = "https://api.pikwy.com/?token=125&response_type=jweb&proxy=ys"
        var pikwy_query = pikwy_demo_endpoint + "&url=" + encodeURIComponent(prompt);
        pikwy_query = pikwy_query + "&width=" + encodeURIComponent(width);
        pikwy_query = pikwy_query + "&height=" + encodeURIComponent(height);

        const pikwy_response = await fetch(pikwy_query, {
          method: "GET",
        })
        .then(function (response) {
          return response.text();
        }).then(function (data: any) {
          var data_obj = JSON.parse(data);
          const result_width: number = Number(width);
          const result_height: number = Number(height);
          const image_url: string = data_obj.iurl;
          var pikwy_result_array: {
            fullsize: {
              width: number;
              height: number;
              url: string;
            };
            thumbnail: {
              width: number;
              height: number;
              url: string;
            };
            label: string;
          }[] = [{
            fullsize: {
              width: result_width,
              height: result_height,
              url: image_url,
            },
            thumbnail: {
              width: result_width/4,
              height: result_height/4,
              url: image_url, // @TODO create a real thumbnail image that is smaller in file size
            },
            label: prompt
          }];

          return pikwy_result_array
        })

        // If you select json, the API will return an image encoded in base64 and additional information: response code, response headers.
        // By default, the API returns the raw image or raw file.
        // In case of unsuccessful response, error text.

        // // Example Response for an error
        // // Response Headers:
        // // Content-Type = application/json; charset=utf-8
        // //
        // // Body:
        // {
        //   "code":9001,
        //   "mesg":"URL required or incorrect (needs to be URL encoded before)"
        // }

        // // Example Response for response_type=raw
        // // Response Headers:
        // //  Content-Disposition = inline; filename=663f083901e6e634b5583a0b.jpg
        // //  Content-Type = image/jpeg
        // //
        // // Body:
        // <RAW IMAGE>

        // // Example Response for response_type=jweb
        // // Response Headers:
        // // Content-Type = application/json; charset=utf-8
        // //
        // // Body:
        // {
        //     "date": "11.05.2024 05:43", // datetime - UTC timestamp of this image capture
        //     "curl": "https://pikwy.com/web/663f055de5d16d1ec069193b", // capture url - a hosted webpage for the screenshot image
        //     "durl": "https://api.pikwy.com/663f055de5d16d1ec069193b", // download url - force a file download of the image
        //     "iurl": "https://api.pikwy.com/web/663f055de5d16d1ec069193b.jpg", // image url - view file in browser or put into an <img src="">
        //     "ourl": "https://www.wikipedia.org/" // original url - the website where the screenshot was captured
        // }

        // // Example Response for response_type=json
        // // Response Headers:
        // // Content-Type = application/json; charset=utf-8
        // //
        // // Body:
        // {
        //   "date":"1715406484",
        //   "body":"<base64 encoded image>",
        //   "hdrs":{
        //     "date":"Fri, 10 May 2024 09:58:01 GMT",
        //     "cache-control":"s-maxage=86400, must-revalidate, max-age=3600",
        //     "server":"ATS/9.1.4",
        //     "etag":"W/\"130ef-617c8294bde80\"",
        //     "last-modified":"Mon, 06 May 2024 12:25:14 GMT",
        //     "content-type":"text/html",
        //     "content-encoding":"gzip",
        //     "vary":"Accept-Encoding",
        //     "age":"71394",
        //     "x-cache":"cp3073 miss, cp3073 hit/1666669",
        //     "x-cache-status":"hit-front",
        //     "server-timing":"cache;desc=\"hit-front\", host;desc=\"cp3073\"",
        //     "strict-transport-security":"max-age=106384710; includeSubDomains; preload",
        //     "report-to":"{ \"group\": \"wm_nel\", \"max_age\": 604800, \"endpoints\": [{ \"url\": \"https://intake-logging.wikimedia.org/v1/events?stream=w3c.reportingapi.network_error&schema_uri=/w3c/reportingapi/network_error/1.0.0\" }] }",
        //     "nel":"{ \"report_to\": \"wm_nel\", \"max_age\": 604800, \"failure_fraction\": 0.05, \"success_fraction\": 0.0}",
        //     "set-cookie":"WMF-Last-Access=11-May-2024;Path=/;HttpOnly;secure;Expires=Wed, 12 Jun 2024 00:00:00 GMT",
        //     "x-client-ip":"2a01:4f9:c010:4a3d::1",
        //     "accept-ranges":"bytes",
        //     "content-length":"18717"
        //   }
        // }

        completedJobs[jobId] = pikwy_response;

        jobQueue.splice(index, 1);

        // Reduce credits by 1 when images are successfully generated
        credits -= 1;
      }
    }, 100); // Simulating 0.1 seconds processing time

    // Add the job to the jobQueue along with the timeoutId
    jobQueue.push({ jobId, prompt, timeoutId });

    res.status(200).send({
      jobId,
    });
  });

  /**
   * GET endpoint to check the status of a job.
   * Retrieves the status of a job identified by its jobId parameter.
   * If the job is completed, it returns the images generated by the job.
   * If the job is still in the processing queue, it returns "processing".
   * If the job has been cancelled, it returns "cancelled".
   * If the job is not found, it returns a 404 error.
   */
  router.get(Routes.JOB_STATUS, async (req, res) => {
    const jobId = req.query.jobId as string;

    if (!jobId) {
      return res.status(400).send("Missing jobId parameter.");
    }

    if (completedJobs[jobId]) {
      return res.status(200).send({
        status: "completed",
        images: completedJobs[jobId],
        credits,
      });
    }

    if (jobQueue.some((job) => job.jobId === jobId)) {
      return res.status(200).send({
        status: "processing",
      });
    }

    if (cancelledJobs.some((job) => job.jobId === jobId)) {
      return res.status(200).send({
        status: "cancelled",
      });
    }

    return res.status(404).send("Job not found.");
  });

  /**
   * POST endpoint to cancel a job.
   * Cancels a job identified by its jobId parameter.
   * If the job is found and successfully cancelled, it removes the job from the processing queue and adds it to the cancelled jobs array.
   * If the job is not found, it returns a 404 error.
   */
  router.post(Routes.CANCEL_JOB, async (req, res) => {
    const jobId = req.query.jobId as string;

    if (!jobId) {
      return res.status(400).send("Missing jobId parameter.");
    }

    const index = jobQueue.findIndex((job) => job.jobId === jobId);
    if (index !== -1) {
      cancelledJobs.push({ jobId });
      // If the job is found, remove it from the jobQueue
      const { timeoutId } = jobQueue[index];
      jobQueue.splice(index, 1);
      // Also clear the timeout associated with this job if it exists
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      return res.status(200).send("Job successfully cancelled.");
    }

    return res.status(404).send("Job not found.");
  });

  /**
   * Generates a unique job ID.
   */
  function generateJobId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  return router;
};
