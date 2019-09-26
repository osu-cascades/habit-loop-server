import { DynamoDB } from 'aws-sdk';

interface UserDetails {
  user_id: string;
  username: string;
  email: string;
  password: string;
  created_at: string;
  role: Array<string>;
  manager?: string;
  group?: object;
  streak_id: string;
}

interface Group {
  group_name: string;
  users: object;
  owner: boolean;
  streak_id: string;
  group_sort: string;
}

interface Streak {
  item_id: string;
  score: number;
  streak: string;
  expiration: string;
}

interface Habit {
  habit_name: string;
  type: string;
  notify: object;
  priority: string;
  completed_today: boolean;
  recurrence: string;
}

interface Base {
  created_at: string;
  push_token: string;
  timestamp: string;
  reminder: string;
  item_id: string;
}

interface DBModel {
  tableName: string;
  docClient: DynamoDB.DocumentClient;
}
