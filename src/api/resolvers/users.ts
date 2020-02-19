import jsonwebtoken from 'jsonwebtoken';
import uuidv4 from 'uuid/v4';
import _ from 'lodash';
import { IResolvers } from 'apollo-server-lambda';
import axios from 'axios';

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
        const groups = groupData.filter((group: any) => group.item_id !== 'group');

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
          // password: await bcrypt.hash(password, 10),
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

      // const valid = await bcrypt.compare(password, user.password);

      // if (!valid) {
      //   throw new Error('Incorrect password');
      // }

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

    async cbtLogin(instance, { email, password }, ctx) {
      const response = await axios.post('https://api.cbtnuggets.com/auth-gateway/v1/login', {
        username: email,
        password: password,
      });

      const user = {
        username: email,
        email: email,
        role: ['USER'],
        created_at: `${Date.now()}`,
        user_id: response.data.user_id,
        item_id: `profile-${response.data.user_id}`,
      };

      try {
        const results = await ctx.UserModel.getByEmail(email);
        if (!results) {
          await ctx.UserModel.create(user);
          return jsonwebtoken.sign(
            {
              username: user.username,
              email: user.email,
              role: user.role,
              created_at: user.created_at,
              user_id: user.user_id,
              item_id: user.item_id,
              token: response.data.access_token,
            },
            JWT_SECRET,
            { expiresIn: '1d' }
          );
        } else {
          return jsonwebtoken.sign(
            {
              username: results.username,
              email: results.email,
              role: results.role,
              created_at: results.created_at,
              user_id: results.user_id,
              item_id: results.item_id,
              token: response.data.access_token,
            },
            JWT_SECRET,
            { expiresIn: '1d' }
          );
        }
      } catch (error) {
        console.log(error);
      }

      // return jsonwebtoken.sign(
      //   {
      //     // username: user.username,
      //     // email: user.email,
      //     // role: user.role,
      //     // created_at: user.created_at,
      //     // user_id: user.user_id,
      //     // item_id: user.item_id,
      //     token: response.data.access_token,
      //   },
      //   JWT_SECRET,
      //   { expiresIn: '1d' }
      // );
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
