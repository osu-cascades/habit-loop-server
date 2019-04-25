const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const uuid = require('uuid/v4');
const _ = require('lodash');

const JWT_SECRET = 'supersecret';

const resolvers = {
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
  },
  
  Mutation: {
    // Handle user signup
    async signup(instance, args, { logger, UserModel, StreakModel }) {
      try {
        const {
          username,
          password,
          email,
        } = args.input;

        const user = {
          user_id: uuid(),
          username,
          email,
          created_at: `${Date.now()}`,
          role: ['USER'],
          password: await bcrypt.hash(password, 10),
        };

        await UserModel.create(user);
        await StreakModel.create(user.user_id, user.username);
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
          { expiresIn: '1d' },
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
        { expiresIn: '1d' },
      );
    },

    async registerPushNotification(instance, { token }, { user, UserModel, logger }) {
      try {
        const results = await UserModel.updatePushNotification(user, token);
        logger.info('added new token');
        return results;
      } catch (err) {
        logger.error('REGISTER_PUSH_NOTIFICATION_ERROR', err);
        return '';
      }
    },
  },
};

module.exports = resolvers;
