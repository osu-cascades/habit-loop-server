export interface User {
    user_id: string;
    username: string;
    email: string;
    password: string;
    created_at: string;
    role: Array<string>;
    manager?: string;
    group?: object;
}

export interface Group {
    group_name: string;
    users: object;
    owner: boolean;
    streak_id: string;
    group_sort: string;
}

export interface Streak {
    score: number;
    streak: string;
    expiration: string;
}

export interface Habit {
    habit_name: string;
    type: string;
    notify: object;
    priority: string;
    completed_today: boolean;
    recurrence: string;
}
  
export interface Base {
    created_at: string;
    push_token: string;
    timestamp: string;
    reminder: string;
    item_id: string;
}

export interface DBModel {
    tableName: string | undefined;
    docClient: DynamoDB.DocumentClient;
  }