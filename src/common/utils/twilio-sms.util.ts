import { Twilio } from 'twilio';

export const sendTwilioSMS = req => {
  const {
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_MSG_SERVICE_ID,
  } = process.env;

  const twilioClient = new Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

  const messageContent = {
    body: `Hello! Your verification OTP is ${req.otp}`,
    messagingServiceSid: TWILIO_MSG_SERVICE_ID,
    to: req.phoneNumber,
  };

  return twilioClient.messages
    .create(messageContent)
    .then(message => console.log(message.sid))
    .catch(error => console.log(error));
};
