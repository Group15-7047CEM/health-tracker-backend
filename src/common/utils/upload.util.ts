// Using GCP for uploads
import { getUploadUrlsGCP, deleteImageGCP } from './upload-gcp.util';

export function getUploadUrls(imageObjs = []) {
  return getUploadUrlsGCP(imageObjs);
}

export function deleteImage(fileName, type) {
  return deleteImageGCP(fileName, type);
}
