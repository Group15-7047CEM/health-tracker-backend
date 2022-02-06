import * as nodemailer from 'nodemailer';
import * as sendgridTransport from 'nodemailer-sendgrid-transport';

export const sendEmailWithSendgrid = req => {
  const { SENDGRID_API_KEY, NOREPLY_EMAIL } = process.env;

  // Configure Nodemailer SendGrid Transporter
  const transporter = nodemailer.createTransport(
    sendgridTransport({
      auth: {
        // eslint-disable-next-line @typescript-eslint/camelcase
        api_key: SENDGRID_API_KEY,
      },
    }),
  );

  return new Promise((success, fail) => {
    transporter.sendMail(
      {
        to: req.email,
        from: NOREPLY_EMAIL,
        subject: req.subject,
        text: req.data,
        // html: emailtemplate(name, body)
      },
      (err, resp) => {
        if (err) {
          console.log(err, 'sendgrid error');
          fail(err);
        } else {
          success(resp);
        }
      },
    );
  });
};
