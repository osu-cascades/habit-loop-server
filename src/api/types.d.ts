import { DynamoDB } from 'aws-sdk';

interface Base {
  created_at: string;
  item_id: string;
}

interface UserDetails extends Base {
  user_id: string;
  username: string;
  email: string;
  password: string;
  role: Array<string>;
  manager?: string;
  group?: object;
  streak_id: string;
}

interface GroupDetails extends Base {
  group_name: string;
  users: object;
  owner: boolean;
  streak_id: string;
  group_sort: string;
}

interface StreakDetails extends Base {
  score: number;
  streak: string;
  expiration: number;
  user_id: string;
  username: string;
}

interface HabitDetails extends Base {
  user_id: string;
  habit_name: string;
  type: string;
  notify: object;
  priority: string;
  completed_today: boolean;
  recurrence: string;
}

interface PushNotification {
  push_token: string;
  reminder: string;
  timestamp: string;
}

interface DBModel {
  tableName: string;
  docClient: DynamoDB.DocumentClient;
}
