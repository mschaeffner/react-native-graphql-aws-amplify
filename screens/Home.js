import React from 'react'
import { ScrollView, TouchableOpacity, View, Text, StyleSheet } from 'react-native'
import Button from './Button'
import { Auth, Storage } from 'aws-amplify'
import { S3Image } from 'aws-amplify-react-native'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'

import awsconfig from '../aws-exports'
Storage.configure({
  bucket: awsconfig.aws_user_files_s3_bucket,
  region: awsconfig.aws_user_files_s3_bucket_region
})

export const LIST_USER_PROFILES = gql`query ListUserProfiles(
  $limit: Int
  $nextToken: String
) {
  listUserProfiles(limit: $limit, nextToken: $nextToken) {
    items {
      id
      name
      location
      avatar {
        bucket
        region
        key
      }
    }
    nextToken
  }
}
`

export default class Home extends React.Component {

  static navigationOptions = ({ navigation }) => {
      return {
        title: 'Home',
        headerRight: (
          <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
            <Text style={styles.headerLink}>
              Edit profile
            </Text>
          </TouchableOpacity>
        ),
      }
    }

  render() {
    return (
      <ScrollView>
        <Query query={LIST_USER_PROFILES}>
          {({ loading, error, data }) => {

            if (loading) {
              return <Text>Loading...</Text>
            }

            if (error) {
              return <Text>Error :(</Text>
            }

            return (
              <View>
                {data.listUserProfiles.items.map(item =>
                  <TouchableOpacity
                    key={item.id}
                    style={styles.listItem}
                    onPress={() => this.props.navigation.navigate('Details', {userId: item.id})}
                  >

                    <View style={styles.listItemAvatarContainer}>
                      {item.avatar && item.avatar.key && <S3Image
                        imgKey={item.avatar.key}
                        style={styles.listItemAvatar}
                      />}
                    </View>

                    <Text style={styles.listItemText}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )

          }}
        </Query>
      </ScrollView>
    )
  }

}

const styles = StyleSheet.create({
  listItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#CCC',
    padding: 20
  },
  listItemAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30
  },
  listItemAvatarContainer: {
    width: 80,
    height: 60,
  },
  listItemText: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1
  },
  headerLink: {
    color: '#007BFF',
    fontSize: 16,
    paddingRight: 10
  }
})
