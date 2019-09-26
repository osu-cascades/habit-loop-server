import _ from 'lodash';
import User from './User';

// item contains name, type, habit_id, user_id, created_at
const createUpdate = item => {
  const updateTypes = ['habit_name', 'type', 'recurrence'];

  const types = _.pick(item, updateTypes);

  const ExpressionAttributeNames = {};
  _.forEach(types, (val, key) => {
    ExpressionAttributeNames[`#${key}123`] = key;
  });

  const expression = _.map(types, (val, key) => `#${key}123 = :val${key}`);

  const ExpressionAttributeValues = {};

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
   * @return { Array } Returns array of userHabits
   */
  getUserHabits(userId) {
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
   * @return { Array } Returns array of userHabits
   */
  getHabit(habitId, createdAt) {
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
   * @return { Array } Returns array of userHabits
   */
  async create(newHabit) {
    this.validator.check(newHabit);

    const params = {
      TableName: this.tableName,
      Item: newHabit,
    };

    return this.docClient.put(params).promise();
  }

  async delete(user_id, item_id) {
    const params = {
      TableName: this.tableName,
      Key: {
        user_id,
        item_id,
      },
    };

    return this.docClient.delete(params).promise();
  }

  async update(habit) {
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
