import * as AWS from 'aws-sdk';

export function sendEmailWithSES(req) {
  const {
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_S3_BUCKET_REGION,
  } = process.env;

  const AWS_SES = new AWS.SES({
    region: AWS_S3_BUCKET_REGION,
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  });

  const params = {
    Source: process.env.NOREPLY_EMAIL,
    // "Template": "forgot_password",
    Destination: {
      ToAddresses: [`${req.email}`],
    },
    Message: {
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: req.data,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: req.subject,
      },
    },
    // "TemplateData": JSON.stringify(req.content)
  };
  AWS_SES.sendEmail(params, function(err, data) {
    if (err) {
      // res.status(404).send({ "error": { status: 404, message: "Mail not sent" } });
      throw err;
    } else {
      return data;
    }
  });
}
