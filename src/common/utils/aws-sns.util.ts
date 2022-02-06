import * as AWS from 'aws-sdk';

export function sendSMSWithSNS(phoneNumber, message) {
  const {
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_S3_BUCKET_REGION,
  } = process.env;

  // Set region
  AWS.config.update({
    region: AWS_S3_BUCKET_REGION,
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  });

  const AWS_SNS = new AWS.SNS({ apiVersion: '2010-03-31' });

  // Create publish parameters
  const params = {
    Message: message /* required */,
    PhoneNumber: phoneNumber,
    MessageAttributes: {
      'AWS.SNS.SMS.SMSType': {
        DataType: 'String',
        StringValue: 'Transactional',
      },
    },
  };
  // Create promise and SNS service object
  const publishTextPromise = AWS_SNS.publish(params).promise();

  // Handle promise's fulfilled/rejected states
  return publishTextPromise
    .then(data => {
      return data;
    })
    .catch(error => {
      throw error;
    });
}

/*
// Check if phone number is opted out from receiving sms
export function isOptedOut( phoneNumber) {
  // Create promise and SNS service object
  const phoneNumberPromise = AWS_SNS
    .checkIfPhoneNumberIsOptedOut({ phoneNumber: phoneNumber })
    .promise();

  // Handle promise's fulfilled/rejected states
  return phoneNumberPromise
    .then(function(data) {
      console.log("Phone Opt Out is " + data.isOptedOut);
    })
    .catch(function(err) {
      console.error(err, err.stack);
    });
};
*/
