const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const uuid = require('uuid/v4');

const UserModel = require('../../model/User');

const JWT_SECRET = 'supersecret';

const resolvers = {
  Query: {
    // fetch the profile of currently authenticated user
    async me(_, args, { user }) {
      // make sure user is logged in
      if (!user) {
        throw new Error('You are not authenticated!');
      }

      // user is authenticated
      const model = new UserModel();
      const result = await model.getByEmail(user.email);
      return result.Items[0];
    },
  },
  Mutation: {
    // Handle user signup
    async signup(_, args, { logger }) {
      try {
        const {
          username,
          password,
          email,
        } = args.input;

        const model = new UserModel();

        const user = {
          user_id: uuid(),
          username,
          email,
          created_at: `${Date.now()}`,
          role: ['USER'],
          password: await bcrypt.hash(password, 10),
        };

        await model.create(user);

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
    async login(_, { email, password }) {
      const model = new UserModel();
      const results = await model.getByEmail(email);
      const user = results.Items[0];

      if (!user) {
        throw new Error('No user with that email');
      }

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        throw new Error('Incorrect password');
      }
      console.log('user', user);
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

    async registerPushNotification(_, { token }, { user }) {
      const model = new UserModel();

      try {
        const results = await model.updatePushNotification(user, token);
        console.log('added new token');
        return results;
      } catch (err) {
        console.log(err);
        return '';
      }
    },
  },
};

module.exports = resolvers;
