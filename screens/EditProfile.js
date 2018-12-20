import React from 'react'
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Button from './Button'
import { S3Image } from 'aws-amplify-react-native'
import gql from 'graphql-tag'
import { Query, Mutation } from 'react-apollo'
import { v4 as uuid } from 'uuid'
import { Auth, Storage } from 'aws-amplify'

import awsconfig from '../aws-exports';
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

const UPDATE_USER_PROFILE = gql`mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
  updateUserProfile(input: $input) {
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

export default class EditProfile extends React.Component {

  static navigationOptions = {
    title: 'Edit Profile'
  }

  constructor(props) {
    super(props)
    this.state = {
      userId: null,
      name: null,
      location: null,
      avatar: null
    }
    this.getUserId()
  }

  async getUserId() {
    const userInfo = await Auth.currentUserInfo();
    this.setState({userId: userInfo.attributes.sub})
  }

  render() {
    if(!this.state.userId) {
      <Text>Loading...</Text>
    }

    return (
      <Query query={GET_USER_PROFILE} variables={{id: this.state.userId}}>
        {({ loading, error, data }) => {

          if (loading) {
            return <Text>Loading...</Text>
          }

          if (error) {
            return <Text>Error :(</Text>
          }

          const avatarKey = (this.state.avatar && this.state.avatar.key)
            || (data.getUserProfile.avatar && data.getUserProfile.avatar.key)

          return (
            <Mutation mutation={UPDATE_USER_PROFILE} onCompleted={() => this.props.navigation.goBack()}>
              {(updateProfile, { loading, error }) => (
                <KeyboardAwareScrollView keyboardShouldPersistTaps='always'>

                  <TouchableOpacity
                    style={styles.avatar}
                    onPress={() => this.props.navigation.navigate('TakePhoto', {
                      takePictureCallback: async (picture) => {
                        const key = uuid()
                        const result = await Storage.put(key, picture, { contentType: 'image/jpg' })
                        const avatar = {
                          key,
                          bucket: awsconfig.aws_user_files_s3_bucket,
                          region: awsconfig.aws_user_files_s3_bucket_region
                        }
                        this.setState({avatar})
                      }
                    })}
                  >
                    {avatarKey
                      ? <S3Image imgKey={avatarKey} style={styles.image} />
                      : <Text style={styles.link}>Add avatar</Text>
                    }
                  </TouchableOpacity>

                  <TextInput
                    style={styles.input}
                    onChangeText={(name) => this.setState({name})}
                    defaultValue={data.getUserProfile.name}
                  />

                  <TextInput
                    style={styles.input}
                    onChangeText={(location) => this.setState({location})}
                    defaultValue={data.getUserProfile.location}
                  />

                  <Button
                    text={loading ? 'Saving ...' : 'Save'}
                    onPress={() => {
                      const input = {
                        id: this.state.userId,
                        name: this.state.name || data.getUserProfile.name,
                        location: this.state.location || data.getUserProfile.location,
                        avatar: this.state.avatar || (data.getUserProfile.avatar && ({key: data.getUserProfile.avatar.key, bucket: data.getUserProfile.avatar.bucket, region: data.getUserProfile.avatar.region }))
                      }
                      updateProfile({ variables: { input }})
                    }}
                  />

                  {error && <Text>Error :( Please try again</Text>}
                </KeyboardAwareScrollView>

              )}
            </Mutation>
          )

        }}
      </Query>
    )
  }
}

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    height: 250,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 100
  },
  input: {
    height: 50,
    fontSize: 18,
    borderColor: 'gray',
    borderWidth: 1,
    margin: 10,
    padding: 10
  },
  link: {
    color: '#007BFF',
    fontSize: 16
  }
})
