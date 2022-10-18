// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ApolloClient, InMemoryCache } from '@apollo/client'

const client = new ApolloClient({
    uri: 'https://hub.snapshot.org/graphql/',
    cache: new InMemoryCache(),
})

export default client
