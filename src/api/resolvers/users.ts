import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';
import uuidv4 from 'uuid/v4';
import _ from 'lodash';
import { IResolvers } from 'apollo-server-lambda';

const JWT_SECRET = 'supersecret';

const resolvers: IResolvers = {
  Query: {
    // fetch the profile of currently authenticated user
    async me(instance, args, { user, UserModel }) {
      // make sure user is logged in
      if (!user) {
        throw new Error('You are not authenticated!');
      }

      // user is authenticated

      const result = await UserModel.getByEmail(user.email);
      return _.get(result, 'Items[0]');
    },

    async getUserGroups(instance, args, { user, GroupModel, logger }) {
      try {
        const { Items: groupData } = await GroupModel.getUserGroups(user.user_id);
        const groups = groupData.filter(group => group.item_id !== 'group');

        return groups;
      } catch (err) {
        logger.error(`Problem getting user groups: ${err}`);
        return err;
      }
    },

    async getAllGroups(instance, args, { GroupModel, logger }) {
      try {
        const { Items: groupData } = await GroupModel.getAllGroups();

        return groupData;
      } catch (err) {
        logger.error(`Problem getting all groups: ${err}`);
        return err;
      }
    },
  },

  Mutation: {
    // Handle user signup
    async signup(instance, args, { logger, UserModel }) {
      try {
        const { username, password, email } = args.input;

        const user = {
          user_id: uuidv4(),
          username,
          email,
          item_id: `profile-${uuidv4()}`,
          created_at: `${Date.now()}`,
          role: ['USER'],
          password: await bcrypt.hash(password, 10),
        };

        await UserModel.create(user);
        logger.info('New user has been created!');

        // return json web token
        return jsonwebtoken.sign(
          {
            email: user.email,
            username: user.username,
            user_id: user.user_id,
            role: user.role,
          },
          JWT_SECRET,
          { expiresIn: '1d' }
        );
      } catch (err) {
        logger.error(err);
        throw err;
      }
    },

    // Handles user login
    async login(instance, { email, password }, ctx) {
      const { UserModel, logger } = ctx;
      let user;

      try {
        const results = await UserModel.getByEmail(email);
        user = _.get(results, 'Items[0]');
      } catch (error) {
        logger.error('USER_LOGIN_ERROR', error);
      }

      if (!user) {
        throw new Error('No user with that email');
      }

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        throw new Error('Incorrect password');
      }

      // payload containing user info
      return jsonwebtoken.sign(
        {
          email: user.email,
          username: user.username,
          user_id: user.user_id,
          role: user.role,
          created_at: user.created_at,
        },
        JWT_SECRET,
        { expiresIn: '1d' }
      );
    },

    async registerPushNotification(instance, { token }, { user, UserModel, logger }) {
      try {
        const results = await UserModel.updatePushNotification(user, token);
        logger.info('added new token');
        return results;
      } catch (err) {
        logger.error('REGISTER_PUSH_NOTIFICATION_ERROR', err);
        return err;
      }
    },
  },
};

export default resolvers;
