/* eslint-disable no-undef */
jest.mock('i18next', () => ({
  t: (key) => key,
}));
jest.mock('uuid/v4', () => () => 'guid');
jest.mock('apollo-server-express', () => ({
  ApolloServer(params) {
    params.dataSources();
    return {
      listen: async () => ({
        url: 'url',
      }),
    };
  },
  gql: (str) => str,
}));
