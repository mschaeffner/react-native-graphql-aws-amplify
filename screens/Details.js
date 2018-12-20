import React from 'react'
import { ScrollView, View, Text, StyleSheet } from 'react-native'
import Button from './Button'
import { Storage } from 'aws-amplify'
import { S3Image } from 'aws-amplify-react-native'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'

import awsconfig from '../aws-exports'
Storage.configure({
  bucket: awsconfig.aws_user_files_s3_bucket,
  region: awsconfig.aws_user_files_s3_bucket_region
})

export const GET_USER_PROFILE = gql`query GetUserProfile($id: ID!) {
  getUserProfile(id: $id) {
    id
    name
    location
    avatar {
      bucket
      region
      key
    }
  }
}
`

export default class Details extends React.Component {

  static navigationOptions = {
    title: 'Profile'
  }

  render() {
    const userId = this.props.navigation.getParam('userId')
    return (
      <Query query={GET_USER_PROFILE} variables={{id: userId}}>
        {({ loading, error, data, refetch }) => {

          if (loading) {
              return <Text>Loading...</Text>
          }

          if (error) {
            return <Text>Error :(</Text>
          }

          if (!data.getUserProfile) {
            refetch()
            return <Text>Loading...</Text>
          }

          return (
            <ScrollView>
              <View style={styles.container}>
                <S3Image
                  imgKey={(data.getUserProfile.avatar && data.getUserProfile.avatar.key)}
                  style={styles.image}
                />

                <Text style={styles.heading1}>
                  {data.getUserProfile.name}
                </Text>

                <Text style={styles.heading2}>
                  {data.getUserProfile.location}
                </Text>

              </View>
            </ScrollView>
          )

        }}
      </Query>
    )
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 100
  },
  heading1: {
    fontSize: 32,
    fontWeight: 'bold',
    paddingTop: 30,
  },
  heading2: {
    fontSize: 24,
    paddingTop: 20
  },
})
