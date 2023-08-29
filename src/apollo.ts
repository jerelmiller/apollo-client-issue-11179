import {
  ApolloClient,
  InMemoryCache,
  from,
  createHttpLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: 'https://spotify-showcase-production-d157.up.railway.app/',
});

const authLink = setContext(({ context }) => {
  return {
    headers: {
      ...context?.headers,
      authorization: '',
    },
  };
});

export const client = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
});
