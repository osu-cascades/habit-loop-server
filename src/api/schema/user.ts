import { gql } from 'apollo-server-lambda';

export default gql`
  extend type Query {
    me: User
    getUserStreak: Streak!
    getTopStreaks: [Streak!]
    getGroupLeaderboard(item_id: String!): [Streak]
    getUserGroups: [Group]
    getAllGroups: [Group]
    getUserRole(user_id: String): [String]
  }

  extend type Mutation {
    signup(input: SignupInput!): String
    login(email: String!, password: String!): String
    cbtLogin(email: String!, password: String!): String
    registerPushNotification(token: String!, reminder: Reminder): String @requireAuth(role: USER)
    createGroup(group_name: String!): String
    joinGroup(item_id: String!, group_name: String!): String
  }

  input SignupInput {
    username: String!
    password: String!
    email: String!
    manager: String
  }

  type User {
    user_id: String
    username: String
    email: String
    created_at: String
    role: [String]
    manager: String
  }

  type Streak {
    username: String
    user_id: String
    score: Int
  }

  type Group {
    group_name: String!
    item_id: String!
    user_id: String!
  }
`;
