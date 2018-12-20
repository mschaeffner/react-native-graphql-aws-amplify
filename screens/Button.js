import React from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff9900',
    margin: 10,
    padding: 16,
    height: 50,
    minWidth: 50
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  }
})

export default ({text, onPress}) =>
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Text style={styles.buttonTextBold}>
      {text}
    </Text>
  </TouchableOpacity>
