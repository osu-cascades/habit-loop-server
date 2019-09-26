import moment from 'moment';
import Pino from 'pino';
import uuidv4 from 'uuid/v4';
import _ from 'lodash';
import UserModel from './User';
import { DynamoDB } from 'aws-sdk';
import { UserDetails } from 'api/types';

// https://www.dynamodbguide.com/leaderboard-write-sharding/
class StreakModel extends UserModel {
  getUserStreak(user_id: string) {
    const params: DynamoDB.DocumentClient.QueryInput = {
      TableName: this.tableName,
      KeyConditionExpression: 'user_id = :u AND begins_with(item_id, :s)',
      ExpressionAttributeValues: {
        ':u': user_id,
        ':s': 'streak',
      },
    };

    return this.docClient.query(params).promise();
  }

  async getUsers(users: UserDetails[]) {
    const keys = _.map(users, user => ({
      user_id: user.user_id,
      item_id: user.streak_id,
    }));

    const params = {
      RequestItems: {
        [`${this.tableName}`]: {
          Keys: keys,
        },
      },
    };

    const { Responses: table } = await this.docClient.batchGet(params).promise();

    if (table) {
      const streaks = table[`${this.tableName}`];

      return _(streaks)
        .map(streak => ({
          score: streak.score,
          username: streak.username,
        }))
        .orderBy(streak => streak.score, ['desc'])
        .value();
    } else {
      return [];
    }
  }

  /**
   * Update streak. If we call this function we assume the user
   * is completing a habit for the first time today and can set
   * the expiration to the end of the next day.
   *
   * @param { String } user_id User identification as the primary key in the streak table
   * @return Updated Values
   */
  async upsert(user_id: string, username: string) {
    // if creation succeeds we return else the row needs to be updated.
    let userStreakExists;

    try {
      const createParams = {
        user_id,
        username,
        score: 1,
        item_id: `streak-${uuidv4()}`,
        streak: 'STREAK',
        expiration: moment()
          .add(1, 'day')
          .endOf('day')
          .unix(),
        created_at: moment().toString(),
      };

      userStreakExists = await this.getUserStreak(user_id);

      if (_.isEmpty(userStreakExists)) {
        const results = await this.create(createParams);
        return results;
      }
    } catch (err) {
      Pino().error(`Unable to update user streak for user ${user_id} with err ${err}`);
      throw err;
    }

    Pino().info('Row already exists, will update streak now.');

    if (userStreakExists && userStreakExists.Items) {
      const params = {
        TableName: this.tableName,
        Key: {
          user_id,
          item_id: userStreakExists.Items[0].item_id || null,
        },
        UpdateExpression: 'SET score = score + :incr, expiration = :expiration, streak = :streak',
        ExpressionAttributeValues: {
          ':incr': 1,
          ':expiration': moment()
            .add(1, 'day')
            .endOf('day')
            .unix(),
          ':streak': 'STREAK',
        },
        ReturnValues: 'UPDATED_NEW',
      };

      return this.docClient.update(params).promise();
    }
  }

  getTopStreaks(Limit = 10) {
    const params = {
      TableName: this.tableName,
      IndexName: 'StreakIndex',
      KeyConditionExpression: 'streak = :streak',
      ExpressionAttributeValues: {
        ':streak': 'STREAK',
      },
      ScanIndexForward: false,
      Limit,
    };

    return this.docClient.query(params).promise();
  }
}

export default StreakModel;
