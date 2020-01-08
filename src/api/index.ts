import Pino from 'pino';
import _ from 'lodash';
import jwt from 'jsonwebtoken';
import { Context } from 'aws-lambda';

import resolvers from './resolvers';
import typeDefs from './schema';
import schemaDirectives from './directives';
import UserModel from '../model/User';
import HabitModel from '../model/Habit';
import StreakModel from '../model/Streak';
import RedisModel from '../model/Redis';
import GroupModel from '../model/Group';

/**
 * Parses auth token from header using supersecret JWT secret
 * (Will replace jwt secret eventually)
 * @param headers
 */
const getAuth = (headers: any) => {
  const token = _.get(headers, 'Authorization', null);
  if (_.isEmpty(token)) {
    return null;
  }

  try {
    const id = token.replace('Bearer ', '');
    const user = jwt.verify(id, 'supersecret');

    return user;
  } catch (err) {
    throw new Error('You are not authorized for this resource.');
  }
};

export default {
  resolvers,
  typeDefs,
  schemaDirectives,
  context: async ({ event, context }: { event: any; context: Context }) => {
    return {
      logger: Pino(),
      context,
      user: getAuth(event.headers),
      UserModel: new UserModel(),
      StreakModel: new StreakModel(),
      HabitModel: new HabitModel(),
      GroupModel: new GroupModel(),
      Redis: RedisModel,
    };
  },
  formatResponse: (response: any) => {
    Pino().info(response);
    return response;
  },
  formatError: (error: any) => {
    Pino().info(error);
    return error;
  },
};
