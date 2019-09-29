import merge from 'lodash/merge';
import habits from './habits';
import users from './users';
import groups from './groups';
import streaks from './streaks';

const resolvers = {
  Query: {},

  Mutation: {},
};

export default merge(resolvers, users, habits, groups, streaks);
