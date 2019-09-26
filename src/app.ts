import { ApolloServer } from 'apollo-server-lambda';
import api from './api';

const server = new ApolloServer(api);

const handler = {
  graphql: server.createHandler({
    cors: {
      origin: '*',
      credentials: true,
    },
  }),
};

export const graphql = handler.graphql;
