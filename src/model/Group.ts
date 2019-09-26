import User from './User';
import { DBModel, GroupDetails } from 'api/types';
import { DynamoDB } from 'aws-sdk';

const removeLastComma = (str: string) => str.replace(/,(\s+)?$/, '');

// const createGroupQuery = (groups = ['TEST', 'TEST1', 'TEST2']) => {
//   const mapFilter = groups.reduce((acc, group, index) => `${acc}:group${index + 1}, `, '');

//   const ExpressionAttributeValues = groups.reduce((acc, group, index) => {
//     acc[`:group${index + 1}`] = group;
//     return acc;
//   }, {});

//   const FilterExpression = `#group IN (${removeLastComma(mapFilter)})`;

//   return [FilterExpression, ExpressionAttributeValues];
// };

class Group extends User implements DBModel {
  /**
   * Adds two rows: one for the user to specify the group
   *                two for the group itself and to specify the user being the owner
   * @param { Object }
   * @param user containing details on the user making the group
   * @param group containing details on the group itself
   * @return Promise containing dynamodb action
   */
  createGroup(user: User, group: Group) {
    const params = {
      RequestItems: {
        [this.tableName]: [
          {
            PutRequest: {
              Item: user,
            },
          },
          {
            PutRequest: {
              Item: group,
            },
          },
        ],
      },
    };

    return this.docClient.batchWrite(params).promise();
  }

  addMemberToGroup(user: User) {
    const params = {
      TableName: this.tableName,
      Item: user,
    };

    return this.docClient.put(params).promise();
  }

  getUserGroups(user_id: string) {
    const params = {
      TableName: this.tableName,
      KeyConditionExpression: 'user_id = :u AND begins_with(item_id, :g)',
      ExpressionAttributeValues: {
        ':u': user_id,
        ':g': 'group',
      },
    };

    return this.docClient.query(params).promise();
  }

  getUsersInGroup(group: GroupDetails) {
    const params = {
      TableName: this.tableName,
      IndexName: 'ItemIndex',
      KeyConditionExpression: 'item_id = :i',
      ExpressionAttributeValues: {
        ':i': group,
      },
    };

    return this.docClient.query(params).promise();
  }

  getAllGroups() {
    const params = {
      TableName: this.tableName,
      IndexName: 'ItemIndex',
      KeyConditionExpression: 'item_id = :g',
      ExpressionAttributeValues: {
        ':g': 'group',
      },
    };

    return this.docClient.query(params).promise();
  }
}

export default Group;
