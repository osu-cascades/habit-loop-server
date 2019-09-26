import _ from 'lodash';
import { IResolvers } from 'apollo-server-lambda';

const resolvers: IResolvers = {
    Query: {
        async getTopStreaks(instance, args, { StreakModel, logger }) {
            try {
              const {
                Items: streaks,
              } = await StreakModel.getTopStreaks();
              return streaks;
            } catch (err) {
              logger.error(`Error getting top streaks: ${err}.`);
              throw err;
            }
          },
      
        async getGroupLeaderboard(instance, { item_id: group_id }, { StreakModel, GroupModel, logger }) {
            try {
                const {
                Items: users,
                } = await GroupModel.getUsersInGroup(group_id);
        
                const streaks = await Promise.all(_.map(users, user => StreakModel.getUserStreak(user.user_id)));
                
                return streaks.reduce((prev, streak) => [...prev, ...streak.Items], []);
            } catch (err) {
                logger.error(err);
                return err;
            }
        },
    
        async getUserStreak(instance, args, { user, logger, StreakModel }) {
            try {
                const {
                Items: streakData,
                } = await StreakModel.getUserStreak(user.user_id);
                return _.get(streakData, '[0]', 0);
            } catch (err) {
                logger.error(`Problem getting user streak: ${err}`);
                return err;
            }
        },
    }
}

export default resolvers;