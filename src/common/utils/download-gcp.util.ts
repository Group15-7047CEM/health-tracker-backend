/**
 * TODO(developer): Uncomment the following lines before running the sample.
 * Note: when creating a signed URL, unless running in a GCP environment,
 * a service account must be used for authorization.
 */
// The ID of your GCS bucket
const bucketName = process.env.GCP_STORAGE_BUCKET;

// The ID of your GCS file
// const fileName = 'your-file-name';

// Imports the Google Cloud client library
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Storage } = require('@google-cloud/storage');

function getGCPConfig() {
  let GCP_SERVICE_ACCOUNT_KEY = process.env.GCP_SERVICE_ACCOUNT_KEY;
  if (GCP_SERVICE_ACCOUNT_KEY) {
    GCP_SERVICE_ACCOUNT_KEY = JSON.parse(GCP_SERVICE_ACCOUNT_KEY);
  } else {
    throw new Error('Missing GCP_SERVICE_ACCOUNT_KEY from ENV');
  }
  return {
    GCP_SERVICE_ACCOUNT_KEY,
    GCP_STORAGE_BUCKET: process.env.GCP_STORAGE_BUCKET,
    GCP_STORAGE_BASE_URL: process.env.GCP_STORAGE_BASE_URL,
    GCP_PROJECT_ID: process.env.GCP_PROJECT_ID,
    GCP_SERVICE_KEY_PATH: process.env.GCP_SERVICE_KEY_PATH,
  };
}

function getGCPClient() {
  const storage = new Storage({
    // credentials: getGCPConfig(),
    projectId: getGCPConfig().GCP_PROJECT_ID,
    keyFilename: getGCPConfig().GCP_SERVICE_KEY_PATH,
  });
  return storage;
}

// // Creates a client
// const storage = new Storage();

export async function generateV4ReadSignedUrl(key) {
  if (key && key.includes('https://storage.googleapis.com/')) {
    key = key.split(
      `https://storage.googleapis.com/${getGCPConfig().GCP_STORAGE_BUCKET}/`,
    )[1];
  } else {
    return key;
  }
  // SAMPLE key = "profile_images/stethoscope-icon-2316460_960_720.png"
  const options = {
    version: 'v4',
    action: 'read',
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
  };

  // Get a v4 signed URL for reading the file
  const storage = getGCPClient();

  const [url] = await storage
    .bucket(getGCPConfig().GCP_STORAGE_BUCKET)
    .file(key) // fileName
    .getSignedUrl(options);

  // console.log('Generated GET signed URL:');
  // console.log(url);
  // console.log('You can use this URL with any user agent, for example:');
  // console.log(`curl '${url}'`);
  return url;
}

// generateV4ReadSignedUrl().catch(console.error);

// export function generateV4ReadSignedUrl;
