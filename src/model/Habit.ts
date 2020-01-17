import _ from 'lodash';
import User from './User';
import { HabitDetails } from '@src/api/types';

// item contains name, type, habit_id, user_id, created_at
const createUpdate = (item: HabitDetails) => {
  const updateTypes = ['habit_name', 'type', 'recurrence', 'trainedFor', 'links'];

  const types = _.pick(item, updateTypes);

  const ExpressionAttributeNames: any = {};
  _.forEach(types, (val, key) => {
    ExpressionAttributeNames[`#${key}123`] = key;
  });

  const expression = _.map(types, (val, key) => `#${key}123 = :val${key}`);

  const ExpressionAttributeValues: any = {};
  _.forEach(types, (val, key) => {
    ExpressionAttributeValues[`:val${key}`] = val;
  });

  const UpdateExpression = `set ${expression}`;

  return [UpdateExpression, ExpressionAttributeValues, ExpressionAttributeNames];
};

class Habit extends User {
  /**
   * Get the list of habits for a specific user
   *
   * @param { String } userId User identification
   * @return Returns array of userHabits
   */
  getUserHabits(userId: string) {
    const params = {
      TableName: this.tableName,
      KeyConditionExpression: 'user_id = :u AND begins_with(item_id, :h)',
      ExpressionAttributeValues: {
        ':u': userId,
        ':h': 'habit',
      },
    };

    return this.docClient.query(params).promise();
  }

  /**
   * Get specific habit for a user
   *
   * @param { String } userId User identification
   * @param { String } habitId Id of the habit to get
   * @return Returns dynamo promise containing array of userHabits
   */
  getHabit(habitId: string, createdAt: string) {
    const params = {
      TableName: this.tableName,
      Key: {
        habit_id: habitId,
        created_at: createdAt,
      },
    };

    return this.docClient.get(params).promise();
  }

  /**
   * Get the list of habits for a specific user
   *
   * @param { String } userId User identification
   * @param { Object } newHabit Object containing details of the new habit
   * @return Returns array of userHabits
   */
  async createHabit(newHabit: HabitDetails) {
    const params = {
      TableName: this.tableName,
      Item: newHabit,
    };

    return this.docClient.put(params).promise();
  }

  async delete(user_id: string, item_id: string) {
    const params = {
      TableName: this.tableName,
      Key: {
        user_id,
        item_id,
      },
    };

    return this.docClient.delete(params).promise();
  }

  async update(habit: HabitDetails) {
    const [UpdateExpression, ExpressionAttributeValues, ExpressionAttributeNames] = createUpdate(habit);

    const params = {
      TableName: this.tableName,
      Key: {
        item_id: habit.item_id,
        user_id: habit.user_id,
      },
      UpdateExpression,
      ExpressionAttributeValues,
      ExpressionAttributeNames,
      Item: habit,
      ReturnValue: 'UPDATED_NEW',
    };

    return this.docClient.update(params).promise();
  }

  async scan() {
    const params = {
      TableName: this.tableName,
    };

    return this.docClient.scan(params).promise();
  }
}

export default Habit;
