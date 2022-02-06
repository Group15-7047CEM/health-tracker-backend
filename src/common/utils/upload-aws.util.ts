import * as AWS from 'aws-sdk';
import * as mime from 'mime-types';
import { S3_PATHS, S3Expiry } from '../config';

function getAWSConfig() {
  return {
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_S3_BUCKET_REGION: process.env.AWS_S3_BUCKET_REGION,
    AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
    AWS_S3_BASE_URL: process.env.AWS_S3_BASE_URL,
  };
}

const s3: any = new AWS.S3({
  signatureVersion: 'v4',
  region: getAWSConfig().AWS_S3_BUCKET_REGION,
  accessKeyId: getAWSConfig().AWS_ACCESS_KEY_ID,
  secretAccessKey: getAWSConfig().AWS_SECRET_ACCESS_KEY,
});

export function getUploadUrlsAWS(imageObjs = []) {
  return new Promise((resolve, reject) => {
    const expectedTypes = Object.keys(S3_PATHS);
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

    const responseUrls = [];
    imageObjs.forEach(imageObj => {
      let myKey;

      //TODO: Refactor later
      switch (imageObj.type) {
        case 'profile_image':
          myKey = S3_PATHS.profile_image;
          break;
        case 'questionnaire_image':
          myKey = S3_PATHS.questionnaire_image;
          break;
        case 'education_lesson_image':
          myKey = S3_PATHS.education_lesson_image;
          break;
        case 'daily_tip_image':
          myKey = S3_PATHS.daily_tip_image;
          break;
        case 'consent_sign_image':
          myKey = S3_PATHS.consent_sign_image;
          break;
        case 'event_image':
          myKey = S3_PATHS.event_image;
          break;
        case 'event_session_speaker_image':
          myKey = S3_PATHS.event_session_speaker_image;
          break;
        case 'event_session_image':
          myKey = S3_PATHS.event_session_image;
          break;
        default:
          myKey = S3_PATHS.unsorted_file;
          break;
      }
      myKey = myKey + imageObj.fileName; // Adding time in sec to file_name

      const signedUrlConfig = {
        Bucket: getAWSConfig().AWS_S3_BUCKET_NAME,
        Key: myKey,
        Expires: S3Expiry.signedUrlExpireSeconds,
      };

      // Finding content type from filename
      const mimeType = mime.lookup(imageObj.fileName);

      signedUrlConfig['ContentType'] = mimeType;

      const url = s3.getSignedUrl('putObject', signedUrlConfig);
      const expiresAt = new Date(
        new Date().getTime() + Number(S3Expiry.signedUrlExpireSeconds) * 1000,
      );
      const resObj = {
        fileName: imageObj.fileName,
        type: imageObj.type,
        presignedUploadUrl: url,
        postUploadImageUrl: `${getAWSConfig().AWS_S3_BASE_URL}/${
          getAWSConfig().AWS_S3_BUCKET_NAME
        }/${myKey}`,
        expiresAt: expiresAt,
      };
      responseUrls.push(resObj);
    });
    resolve(responseUrls);
  });
}

export function deleteImageAWS(fileName, type) {
  return new Promise((resolve, reject) => {
    fileName = fileName.split('/')[fileName.split('/').length - 1];

    let myKey;
    switch (type) {
      case 'profile_image':
        myKey = S3_PATHS.profile_image;
        break;
      case 'questionnaire_image':
        myKey = S3_PATHS.questionnaire_image;
        break;
      case 'education_lesson_image':
        myKey = S3_PATHS.education_lesson_image;
        break;
      case 'daily_tip_image':
        myKey = S3_PATHS.daily_tip_image;
        break;
      case 'consent_sign_image':
        myKey = S3_PATHS.consent_sign_image;
        break;
      case 'event_image':
        myKey = S3_PATHS.event_image;
        break;
      case 'event_session_speaker_image':
        myKey = S3_PATHS.event_session_speaker_image;
        break;
      case 'event_session_image':
        myKey = S3_PATHS.event_session_image;
        break;
      default:
        break;
    }
    const params = {
      Bucket: getAWSConfig().AWS_S3_BUCKET_NAME,
      Key: myKey + fileName,
    };

    s3.deleteObject(params, function(err, data) {
      if (err) {
        console.log(err, err.stack);
        reject(new Error(`s3 Error : Image was not deleted`));
      }

      resolve('Image was deleted successfully');
    });
  });
}
