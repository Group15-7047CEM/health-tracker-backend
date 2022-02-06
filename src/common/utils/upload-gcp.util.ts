// Imports the Google Cloud client library
// const {Storage} = require('@google-cloud/storage');

import { Storage } from '@google-cloud/storage';
import * as mime from 'mime-types';
import { STORAGE_PATHS, SIGNED_URL_EXPIRY, S3_PATHS } from '../config';

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

// Creates a client
// const storage = new Storage(getAWSConfig());
// Creates a client from a Google service account key.
// const storage = new Storage(JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY));

// const storage = new Storage({
//   GOOGLE_CLOUD_PROJECT,
//   keyFilename: "haica-gcp-servicekey.json"
// });

/**
 * TODO(developer): Uncomment these variables before running the sample.
 */
// const bucketName = 'bucket-name';

// async function createBucket() {
//   // Creates the new bucket
//   await storage.createBucket(bucketName);
//   console.log(`Bucket ${bucketName} created.`);
// }

// createBucket().catch(console.error);

// export async function getUploadUrls(imageObjs = []) {

// }

function getGCPClient() {
  const storage = new Storage({
    // credentials: getGCPConfig(),
    projectId: getGCPConfig().GCP_PROJECT_ID,
    keyFilename: getGCPConfig().GCP_SERVICE_KEY_PATH,
  });
  return storage;
}

/**
 * Get bucket names
 */
export async function getBucketNames() {
  const storage = getGCPClient();
  const buckets = await storage.getBuckets();
  return buckets;
}

/**
 * Generate signed URL from GCS
 * @param imageObjs Array of image objects
 */
export async function getSignedUrlFromGCS({ key, mimeType, expiresAt }) {
  const storage = getGCPClient();
  // These options will allow temporary read access to the file
  // const options = {
  //   action: 'write',
  //   version: 'v2', // defaults to 'v2' if missing.
  //   expires: Date.now() + 1000 * 60 * 60, // one hour
  // };
  // const filename = 'test-file-2.png';
  // Get a v2 signed URL for the file
  // key = 'lesson-2.jpg'

  // const res = await storage.bucket('singer-mvp-dev').setCorsConfiguration([
  //   {
  //     method: ['PUT', 'GET'],
  //     origin: ['https://dev-web.mahalo.health', 'http://localhost:3000'],
  //     responseHeader: [ 'Content-Type' ],
  //   },
  // ]);

  // console.log(res[])
  const [url] = await storage
    .bucket(process.env.GCP_STORAGE_BUCKET)
    .file(key)
    .getSignedUrl({
      action: 'write',
      expires: expiresAt,
      version: 'v4',
      contentType: mimeType,
    });

  console.log(`The signed url for ${key} is ${url}.`);
  return url;
}

/**
 *
 * @param imageObjs Array of image objects
 */
export async function getUploadUrlsGCP(imageObjs = []) {
  return new Promise(async (resolve, reject) => {
    const expectedTypes = Object.keys(STORAGE_PATHS);
    let validation = false;
    validation = imageObjs.every(img => {
      return img.fileName && img.type && expectedTypes.includes(img.type);
    });
    if (!validation) {
      reject(
        new Error(
          `Validation Error : Invalid type , or no file_name passed. Valid types : ${expectedTypes}`,
        ),
      );
    }

    let responseUrls = [];
    const promises = imageObjs.map(async imageObj => {
      let myKey;

      //TODO: Refactor later
      switch (imageObj.type) {
        case 'profile_image':
          myKey = STORAGE_PATHS.profile_image;
          break;
        case 'questionnaire_image':
          myKey = STORAGE_PATHS.questionnaire_image;
          break;
        case 'education_lesson_image':
          myKey = STORAGE_PATHS.education_lesson_image;
          break;
        case 'daily_tip_image':
          myKey = STORAGE_PATHS.daily_tip_image;
          break;
        case 'consent_sign_image':
          myKey = STORAGE_PATHS.consent_sign_image;
          break;
        case 'event_image':
          myKey = STORAGE_PATHS.event_image;
          break;
        case 'event_session_speaker_image':
          myKey = STORAGE_PATHS.event_session_speaker_image;
          break;
        case 'event_session_image':
          myKey = STORAGE_PATHS.event_session_image;
          break;
        case 'project_consent_pdf':
          myKey = STORAGE_PATHS.project_consent_pdf;
          break;
        case 'health_tracker':
          myKey = STORAGE_PATHS.health_tracker;
          break;
        case 'chat':
          myKey = STORAGE_PATHS.chat;
          break;
        default:
          myKey = STORAGE_PATHS.unsorted_file;
          break;
      }
      myKey = `${myKey}${Date.now()}-${imageObj.fileName}`; // Adding time in sec to file_name
      // myKey = myKey.split('/').pop();
      // Finding content type from filename
      const mimeType = mime.lookup(imageObj.fileName);

      const expiresAt = Date.now() + SIGNED_URL_EXPIRY;
      const url = await getSignedUrlFromGCS({
        key: myKey,
        mimeType,
        expiresAt,
      });
      const resObj = {
        fileName: imageObj.fileName,
        type: imageObj.type,
        presignedUploadUrl: url,
        postUploadImageUrl: `${getGCPConfig().GCP_STORAGE_BASE_URL}/${
          getGCPConfig().GCP_STORAGE_BUCKET
        }/${myKey}`,
        expiresAt: expiresAt,
        mimeType,
      };
      return resObj;
    });
    responseUrls = await Promise.all(promises);
    // responseUrls.push(resObj);
    resolve(responseUrls);
  });
}

/**
 * TEST
 * @param param0
 */
export async function getUploadUrls2(imageObjs = []) {
  const storage = getGCPClient();
  // These options will allow temporary read access to the file
  // const options = {
  //   action: 'write',
  //   version: 'v2', // defaults to 'v2' if missing.
  //   expires: Date.now() + 1000 * 60 * 60, // one hour
  // };
  // const filename = 'test-file-2.png';
  // Get a v2 signed URL for the file
  const key = 'lesson-2.jpg';
  const [url] = await storage
    .bucket(process.env.GCP_STORAGE_BUCKET)
    .file(key)
    .getSignedUrl({
      action: 'write',
      expires: Date.now() + 1000 * 60 * 60,
      version: 'v2',
      contentType: 'image/png',
    });

  console.log(`The signed url for ${key} is ${url}.`);
  return url;
}

/**
 * TODO: Delete image from GCS
 */
export function deleteImageGCP(fileName, type) {
  return;
}

export function createFolder(path) {
  return new Promise((resolve, reject) => {
    const storage = getGCPClient();

    return storage
      .bucket(process.env.GCP_STORAGE_BUCKET)
      .upload(path, {
        destination: S3_PATHS.document + path,
      })
      .then(() => {
        resolve('Folder was created successfully');
      })
      .catch(err => {
        console.error('ERROR:', err);
        reject(new Error(`s3 Error : Folder was not created`));
      });
  });
}

export function renameDocument(oldPath, newPath) {
  return new Promise((resolve, reject) => {
    const storage = getGCPClient();
    return storage
      .bucket(process.env.GCP_STORAGE_BUCKET)
      .file(oldPath)
      .move(newPath)
      .then(() => {
        resolve('Document was renamed successfully');
      })
      .catch(err => {
        console.error('ERROR:', err);
        reject(new Error(`GCP Error : document not deleted`));
      });
  });
}
