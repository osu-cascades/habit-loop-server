import _ from'lodash';
import uuidv4 from'uuid/v4';
import { IResolvers } from 'apollo-server-lambda';

const resolver: IResolvers = {
    Query: {
      async getHabits(instance, args, ctx) {
        if (!ctx.user) {
          throw new Error('Unauthorized user!');
        }

        let habits;
        let RedisClient;

        try {
          const results = await ctx.HabitModel.getUserHabits(ctx.user.user_id);
          habits = results.Items;
        } catch (err) {
          ctx.logger.error(err);
          throw err;
        }

        try {
          RedisClient = await ctx.Redis();
          const completedHabits = await RedisClient.streak.getCompletedHabits(ctx.user.user_id);

          habits = _.map(habits, (habit) => {
            if (completedHabits.includes(habit.item_id)) {
              return Object.assign(habit, { completed_today: true });
            } return habit;
          });
        } catch (err) {
          ctx.logger.error(`Problem getting habits from cache: ${err}`);
        } finally {
          RedisClient.disconnect();
        }

        return habits;
      },

      async getHabit(instance, args, ctx) {
        const habit_id = _.get(args, 'habit_id');
        const created_at = _.get(args, 'created_at');
    
        try {
          const results = await ctx.HabitModel.getHabit(habit_id, created_at);
          ctx.logger.info(results, 'getHabit');
          return results.Item;
        } catch (err) {
          ctx.logger.error(err);
          return err;
        }
      },

      async getAllHabits(instance, args, { logger, HabitModel }) {
        try {
          const results = await HabitModel.scan();
          return results.Items;
        } catch (err) {
          logger.error('Error getting all habits.');
          return err;
        }
      },

    },

    Mutation: {
      async createHabit(instance, args, ctx) {
        // The user will be authenticated at this point
        // so we can assign their user_id to the habit.
        const input = _.get(args, 'input');
    
        const generatedInput = {
          user_id: _.get(ctx, 'user.user_id'),
          item_id: `habit-${uuidv4()}`,
          created_at: `${Date.now()}`,
        };
        
        const habit = _.extend(input, generatedInput);
    
        try {
          const results = await ctx.HabitModel.create(habit);
          return results;
        } catch (err) {
          ctx.logger.error(err);
          return err;
        }
      },

      async deleteHabit(instance, args, ctx) {
        const {
          item_id,
        } = args;
    
        try {
          const results = await ctx.HabitModel.delete(ctx.user.user_id, item_id);

          return results;
        } catch (err) {
          ctx.logger.error(err);

          return err;
        }
      },

      async updateHabit(instance, args, ctx) {
        const input = _.get(args, 'input');

        // User trying to make changes for habits that they do not own.
        // if (input.user_id !== ctx.user.user_id) {
        //   throw new Error('ERROR_403_FORBIDDEN');
        // }

        try {
          const results = await ctx.HabitModel.update(input);
          return results;
        } catch (err) {
          ctx.logger.error(err);
          return err;
        }
      },

      async completeHabit(instance, { item_id, recurrence }, ctx) {
        const user_id = _.get(ctx, 'user.user_id');
        const username = _.get(ctx, 'user.username');
        let RedisClient;

        ctx.logger.info(`Completing habit for user: ${user_id}, habit: ${item_id}.`);
        
        try {
          RedisClient = await ctx.Redis();
          // find out if this is the first habit being completed today
          const completed = await RedisClient.streak.completedHabitToday(user_id);

          // make sure completeHabit makes an entry before adding to streak and events
          await RedisClient.streak.completeHabit(user_id, item_id, recurrence);
          if (completed === 0) { 
            ctx.StreakModel.upsert(user_id, username);
          } 
        } catch (err) {
          ctx.logger.error(`Error trying to complete habit ${item_id} for user ${user_id}.`);
          return err;
        } finally {
          RedisClient.disconnect();
        }
        return 1;
      },
    },
};

export default resolver;
