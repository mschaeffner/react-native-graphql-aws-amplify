import React from 'react'
import { View, Dimensions, Text } from 'react-native'
import Button from './Button'
import { Camera, Permissions, ImageManipulator } from 'expo'
import Base64 from 'base64-js'
import { Storage } from 'aws-amplify';

import awsconfig from '../aws-exports';
Storage.configure({
  bucket: awsconfig.aws_user_files_s3_bucket,
  region: awsconfig.aws_user_files_s3_bucket_region
})

export default class TakePhoto extends React.Component {

  static navigationOptions = {
    title: 'Take Photo'
  }

  state = {
    hasCameraPermission: null
  }

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA)
    this.setState({
      hasCameraPermission: status === 'granted'
    })
  }

  async takePhoto() {
    if (this.camera) {
      const photo = await this.camera.takePictureAsync()
      const photoSmall = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: {width:200, height: 200}}],
        { format: 'jpeg', base64: true }
      )
      const bytes = Base64.toByteArray(photoSmall.base64)
      this.props.navigation.getParam('takePictureCallback')(bytes)
      this.props.navigation.goBack()
    }
  }

  render() {

    const { hasCameraPermission } = this.state
    if (hasCameraPermission === null) {
      return <View />
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>
    } else {
      const windowWidth = Dimensions.get('window').width
      return (
        <View style={{flex: 1}}>

          <Camera
            style={{ height: windowWidth, width: windowWidth }}
            type={Camera.Constants.Type.front}
            ref={ref => this.camera = ref }
          />

          <View style={{paddingTop: 25}}>
            <Button
              text='Snap'
              onPress={() => this.takePhoto()}
            />
          </View>

        </View>
      )

    }
  }

}
