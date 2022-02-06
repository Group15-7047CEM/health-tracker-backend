import * as admin from 'firebase-admin';

import { UserDeviceTokenModel } from '../../user-management/models';

export async function sendPushNotificationToUser({
  userId,
  title,
  body,
  data = {},
}) {
  const userDeviceTokens = await UserDeviceTokenModel.findAll({
    where: { userId },
  }).map(tokenObj => tokenObj.deviceToken);

  if (userDeviceTokens.length === 0) {
    return;
  }

  const payload = {
    notification: {
      title: title,
      body: body,
      // badge: '63',
      // icon: null // TODO: Add icon for notification
    },
    data,
  };
  const options = {
    contentAvailable: true, // For iOS to get notification (ref: https://stackoverflow.com/questions/31450403/didreceiveremotenotification-not-working-in-the-background)
  };
  return await admin
    .messaging()
    .sendToDevice(userDeviceTokens, payload, options)
    .then(s => {
      console.log(JSON.stringify(s)); // TODO: Remove console logs after testing
    })
    .catch(e => {
      console.log(JSON.stringify(e));
    });
}
