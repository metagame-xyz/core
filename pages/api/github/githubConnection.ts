import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client'

class GithubConnection {
    token: string
    client

    constructor(token) {
        this.token = token
    }

    async connect() {
        const httpLink = new HttpLink({ uri: 'https://api.github.com/graphql' })

        const authLink = new ApolloLink((operation, forward) => {
            // Retrieve the authorization token from local storage.
            // Use the setContext method to set the HTTP headers.
            operation.setContext({
                headers: {
                    authorization: this.token ? `Bearer ${this.token}` : '',
                },
            })

            // Call the next link in the middleware chain.
            return forward(operation)
        })

        this.client = new ApolloClient({
            link: authLink.concat(httpLink), // Chain it with the HttpLink
            cache: new InMemoryCache(),
        })
    }
}

export default GithubConnection
