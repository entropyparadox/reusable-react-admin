import {
  ApolloClient,
  ApolloLink,
  createHttpLink,
  InMemoryCache,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/link-error';
import fetch from 'cross-fetch';

const errorLink = onError(({ graphQLErrors }) => {
  if (graphQLErrors?.some((error) => error.message === 'Unauthorized')) {
    localStorage.clear();
    window.location.reload();
  }
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const httpLink = createHttpLink({
  uri: 'http://localhost:8001/graphql',
  fetch,
});

export const client = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});
