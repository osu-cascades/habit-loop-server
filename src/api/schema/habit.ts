import { gql } from 'apollo-server-lambda';

export default gql`
  extend type Query {
    getHabit(habit_id: String!, created_at: String!): Habit
    getHabits: [Habit] @requireAuth(role: USER)
    getAllHabits(user_id: String!): [Habit] @requireAuth(role: ADMIN)
  }

  extend type Mutation {
    createHabit(input: HabitInput): Habit @requireAuth(role: USER)
    deleteHabit(item_id: String!): Habit
    addHabitForUser(user_id: String!, input: HabitInput): Habit @requireAuth(role: MANAGER)
    updateHabit(input: UpdateHabitInput!): Habit
    updatePriority(priority: Rank!, habit_id: String!, created_at: String!): Habit
    updateNotification(notify: Reminder, habit_id: String!, created_at: String!): Habit
    completeHabit(item_id: String!, recurrence: String!): Boolean
  }

  input HabitInput {
    habit_name: String!
    type: String
    recurrence: Recurrence
    trainedFor: Int
    links: String
  }

  input UpdateHabitInput {
    item_id: String!
    created_at: String!
    user_id: String
    habit_name: String
    type: String
    recurrence: Recurrence
    trainedFor: Int
    links: String
  }

  type Habit {
    item_id: String
    user_id: String
    habit_name: String
    type: String
    priority: Rank
    created_at: String
    notify: Reminder
    completed_today: Boolean
    recurrence: Recurrence
    trainedFor: Int
    links: String
  }

  enum Recurrence {
    DAILY
    WEEKLY
  }

  enum Rank {
    TOP
    MIDDLE
    LOW
  }
`;
