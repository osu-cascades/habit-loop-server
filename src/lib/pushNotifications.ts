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

  const completeHabitMessage = "\n\nDon't forget to complete a habit today!";
  const notificationMessages = [
    '"A journey of 1000 miles starts with a single step."' + completeHabitMessage,
    '"We are what we repeatedly do. Excellence, then, is not an act, but a habit."' + completeHabitMessage,
    '"Motivation is what gets you started. Habit is what keeps you going."' + completeHabitMessage,
  ];
  var randomMessage = notificationMessages[Math.floor(Math.random() * notificationMessages.length)];

  _.forEach(userPushTokens, (token: any) => {
    if (!Expo.isExpoPushToken(token)) {
      logger.info(`Push token ${token} is not a valid Expo push token`);
    } else {
      logger.info(`Creating notification for ${token}`);
      messages.push({
        to: token,
        sound: 'default',
        body: randomMessage,
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

export const handler = (event: any, context: Context, callback: Callback) => {
  sendPushNotification();
};

export default handler;
