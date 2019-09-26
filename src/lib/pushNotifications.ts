import { Expo } from 'expo-server-sdk';
import _ from 'lodash';
import Pino from 'pino';

import UserModel from '../model/User';
import { Callback, Context } from 'aws-lambda';

const logger = Pino();

const sendPushNotification = async () => {
  const expo = new Expo();
  const user = new UserModel();

  const users = await user.getAll();
  let userPushTokens = [];

  if (users.Items) {
    userPushTokens = _.compact(users.Items.map(u => u.push_token));
  }

  const messages: any = [];
  _.forEach(userPushTokens, (token: any) => {
    if (!Expo.isExpoPushToken(token)) {
      logger.info(`Push token ${token} is not a valid Expo push token`);
    } else {
      logger.info(`Creating notification for ${token}`);
      messages.push({
        to: token,
        sound: 'default',
        body: 'HEY DO YOUR TRAINING',
      });
    }
  });

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  _.forEach(chunks, async chunk => {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (err) {
      logger.error(err);
    }
  });
  logger.info(`Succesfully sent notifcations to ${userPushTokens}`);
};

export default {
  handler: (event: any, context: Context, callback: Callback) => {
    sendPushNotification();
  },
};
