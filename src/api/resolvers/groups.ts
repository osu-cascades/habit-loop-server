import uuidv4 from 'uuid/v4';
import { IResolvers } from 'apollo-server-lambda';

const resolvers: IResolvers = {
  Mutation: {
    async createGroup(instance, { group_name }, { user, GroupModel, logger }) {
      try {
        const group_id = `group-${uuidv4()}`;

        const userToAdd = {
          user_id: user.user_id,
          item_id: group_id,
          group_name,
          owner: true,
        };

        const groupToAdd = {
          user_id: group_id,
          item_id: 'group', // this will be used to query by this sort key to find all groups
          group_name,
          owner: user.user_id,
        };

        // Create group and then add member since they are the one creating it.
        await GroupModel.createGroup(userToAdd, groupToAdd);
        return group_name;
      } catch (err) {
        logger.error(`There was a problem creating a group: ${err}`);
        return err;
      }
    },

    async joinGroup(instance, { item_id, group_name }, { user, GroupModel, logger }) {
      try {
        const member = {
          user_id: user.user_id,
          item_id,
          group_name,
        };

        await GroupModel.addMemberToGroup(member);
        logger.info(`Added member: ${user.user_id} to group: ${group_name}`);
        return group_name;
      } catch (err) {
        logger.error('ADD_MEMBER_TO_GROUP_ERROR', err);
        return err;
      }
    },
  },
};

export default resolvers;
