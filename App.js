import React, { Component } from 'react'
import { createStackNavigator } from 'react-navigation'

//AppSync and Apollo libraries
import AWSAppSyncClient from 'aws-appsync'
import { Rehydrated } from 'aws-appsync-react'
import { ApolloProvider } from 'react-apollo'

//Amplify
import Amplify, { Auth } from 'aws-amplify'
import { withAuthenticator } from 'aws-amplify-react-native'

// Screens
import Home from './screens/Home'
import Details from './screens/Details'
import EditProfile from './screens/EditProfile'
import TakePhoto from './screens/TakePhoto'

// Amplify init
import awsconfig from './aws-exports'
Amplify.configure(awsconfig)

const GRAPHQL_API_REGION = awsconfig.aws_appsync_region
const GRAPHQL_API_ENDPOINT_URL = awsconfig.aws_appsync_graphqlEndpoint
const S3_BUCKET_REGION = awsconfig.aws_user_files_s3_bucket_region
const S3_BUCKET_NAME = awsconfig.aws_user_files_s3_bucket
const AUTH_TYPE = awsconfig.aws_appsync_authenticationType

// AppSync client instantiation
const client = new AWSAppSyncClient({
  url: GRAPHQL_API_ENDPOINT_URL,
  region: GRAPHQL_API_REGION,
  auth: {
    type: AUTH_TYPE,
    // Get the currently logged in users credential.
    jwtToken: async () => (await Auth.currentSession()).getAccessToken().getJwtToken(),
  },
  // Amplify uses Amazon IAM to authorize calls to Amazon S3. This provides the relevant IAM credentials.
  complexObjectsCredentials: () => Auth.currentCredentials()
});

// Stack navigator
const Navigator = createStackNavigator(
  {
    Home: Home,
    Details: Details,
    EditProfile: EditProfile,
    TakePhoto: TakePhoto
  },
  {
    initialRouteName: 'Home',
  }
)

const App = () => <Navigator />
const AppWithAuth = withAuthenticator(App)

export default () => (
  <ApolloProvider client={client}>
    <Rehydrated>
      <AppWithAuth />
    </Rehydrated>
  </ApolloProvider>
)
