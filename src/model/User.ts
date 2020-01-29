import { DynamoDB } from 'aws-sdk';
import { UserDetails, DBModel, StreakDetails } from '@src/api/types';
import AWS from 'aws-sdk';

class UserModel implements DBModel {
  tableName: string;
  docClient: DynamoDB.DocumentClient;

  constructor() {
    this.tableName = process.env.USER_TABLE || '';

    // Set AWS configs for tests if we have a local db
    // Might be able to remove this with servless local dynamodb plugin
    if (process.env.NODE_ENV === 'test') {
      AWS.config.update({
        region: 'us-east-1',
        // @ts-ignore
        endpoint: 'http://localhost:8000',
      });
    }

    this.docClient = new DynamoDB.DocumentClient();
  }

  /**
   * Get specific User for a user
   *
   * @param { string } user_id User identification as the primary key in the dynamo table
   * @param { String } created_at one of the keys of the dynamo table
   */
  getById(user_id: string, created_at: string) {
    const params = {
      TableName: this.tableName,
      Key: {
        user_id,
        created_at,
      },
    };

    return this.docClient.get(params).promise();
  }

  getByIdOnly(user_id: string) {
    const params = {
      TableName: this.tableName,
      KeyConditionExpression: '#user_id = :user_id',
      ExpressionAttributeNames: {
        '#user_id': 'user_id',
      },
      ExpressionAttributeValues: {
        ':user_id': user_id,
      },
    };

    return this.docClient.query(params).promise();
  }

  /**
   * Get specific User for a user
   *
   * @param { String } user_id User identification as the primary key in the dynamo table
   * @param { String } created_at one of the keys of the dynamo table
   * @return dynamo response containing user
   */
  getByEmail(email: string) {
    const params = {
      TableName: this.tableName,
      IndexName: 'EmailIndex',
      KeyConditionExpression: '#email = :email',
      ExpressionAttributeNames: {
        '#email': 'email',
      },
      ExpressionAttributeValues: {
        ':email': email,
      },
    };

    return this.docClient.query(params).promise();
  }

  /**
   * Get the list of Users for a specific user
   *
   * @param { Object } user Object containing details of the new User
   * @return return response from dyanmo of user creation
   */
  create(user: UserDetails | StreakDetails) {
    const params = {
      TableName: this.tableName,
      Item: user,
    };

    return this.docClient.put(params).promise();
  }

  /**
   * Update push notification details
   *
   * @param { Object }
   * @param push_token string representing expo token
   * @param reminder when to send user a reminder
   * @return Promise containing dynamodb action
   */
  updatePushNotification(
    { user_id, created_at }: { user_id: string; created_at: string },
    push_token: string,
    reminder = 'MORNING'
  ) {
    const params = {
      TableName: this.tableName,
      IndexName: 'PushNotificationIndex',
      Key: {
        user_id,
        created_at,
      },
      UpdateExpression: 'set push_token=:p, reminder=:r',
      ExpressionAttributeValues: {
        ':p': push_token,
        ':r': reminder,
      },
      ReturnValues: 'UPDATED_NEW',
    };

    return this.docClient.update(params).promise();
  }

  async getAll() {
    const params = {
      TableName: this.tableName,
    };

    return this.docClient.scan(params).promise();
  }

  setPushNotification({ user_id, created_at }: { user_id: string; created_at: string }, set: any) {
    const params = {
      TableName: this.tableName,
      Key: {
        user_id,
        created_at,
      },
      UpdateExpression: 'set push_notification_enabled=:p',
      ExpressionAttributevalues: {
        ':p': set,
      },
      ReturnValues: 'UPDATED_NEW',
    };

    return this.docClient.update(params).promise();
  }
}

export default UserModel;
