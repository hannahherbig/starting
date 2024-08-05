import { ApolloClient, InMemoryCache } from '@apollo/client'
import { ENDPOINT, HEADERS } from '../config'

const client = new ApolloClient({
  uri: ENDPOINT,
  cache: new InMemoryCache({
    typePolicies: {
      SetConnection: {
        fields: {
          nodes: {
            keyArgs: false,

            merge(existing = [], incoming) {
              return [...existing, ...incoming]
            },
          },
        },
      },
    },
  }),
  headers: HEADERS,
})

export default client
