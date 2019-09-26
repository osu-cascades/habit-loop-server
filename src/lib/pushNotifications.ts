import { Expo } from 'expo-server-sdk';
import _ from 'lodash';
import Pino from 'pino';

import UserModel from '../model/User';

const logger = Pino();

const sendPushNotification = async () => {
  const expo = new Expo();
  const user = new UserModel();

  const users = await user.getAllUsers();
  const userPushTokens = _.compact(users.Items.map(u => u.push_token));

  const messages = [];
  _.forEach(userPushTokens, token => {
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

// Check users habit
export default {
  handler: (event, context, callback) => {
    sendPushNotification();
  },
};
