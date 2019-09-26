import * as Pino from 'pino';
import _ from 'lodash';
import jwt  from 'jsonwebtoken';

import resolvers  from './resolvers';
import typeDefs  from './schema';
import schemaDirectives  from './directives';
import UserModel  from '../model/User';
import HabitModel  from '../model/Habit';
import StreakModel  from '../model/Streak';
import RedisModel  from '../model/Redis';
import GroupModel  from '../model/Group';

const getAuth = headers => {
  const token = _.get(headers, 'Authorization', null);
  if (_.isEmpty(token)) {
    return null;
  }

  try {
    const id = token.replace('Bearer ', '');
    const user = jwt.verify(id, 'supersecret');
    return user;
  } catch (err) {
    throw new Error( 'You are not authorized for this resource.');
  }
};

export default {
  resolvers,
  typeDefs,
  schemaDirectives,
  context: async ({ event, context }) => {
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
  formatResponse: (response) => {
    Pino().info(response);
    return response;
  },
  formatError: (error) => {
    Pino().info(error);
    return error;
  },
};
