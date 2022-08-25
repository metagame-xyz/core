import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client'
import { Address } from '@wagmi/core/dist/declarations/src/types'
import axios from 'axios'

import mongoose from 'utils/clients/mongoose'
import { METABOT_BASE_API_URL } from 'utils/constants'

class GithubConnection {
    address: Address
    username: string
    token: string
    client

    constructor(address) {
        this.address = address
    }

    async connect() {
        await mongoose.connect()

        const { data: user } = await axios(`${METABOT_BASE_API_URL}/api/db/getUserByEthAddress/${this.address}`)
        if (!user) return
        this.username = user.githubUsername
        this.token = user.githubAccessToken

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
