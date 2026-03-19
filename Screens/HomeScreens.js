import { View, Text, StyleSheet, Image } from 'react-native'
import React from 'react'

export default function HomeScreens() {
    return (
        <View style={styles.container}>
            <View style={styles.nav}>
                <Text style={styles.text}>Hi</Text>
                <Text style={styles.text1}>Hi</Text>
            </View>
            <View style={styles.nav1}>
                <Text style={styles.text2}>Hello</Text>
                <Text style={styles.text3}>Hello</Text>
            </View>
            <View style={styles.nav}>
                <Image source={require('../assets/favicon.png')} style={{width: 100, height: 100}}/>
            </View>
            <View style={styles.nav2}>
                <Text style={styles.text5}>Hi</Text>
                <View style={styles.nav3}>
                    <Text style={styles.text6}>Hello</Text>
                    <Text style={styles.text7}>Hello</Text>
                </View>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1, marginTop: 30
    },
    nav: {
        flexDirection:'row', gap: 10, marginVertical: 10, justifyContent:'center'
    },
    nav1: {
        flexDirection:'row', gap: 10
    },
    nav2: {
        flex: 0.3, gap: 10, flexDirection:'row'
    },
    nav3:{
        gap: 10, flex: 1, flexDirection:'column'
    },
    text: {
        padding:30, backgroundColor: '#FF5757', flex: 0.3, textAlign: 'center'
    },
    text1: {
        padding:30, backgroundColor: '#0DC0DF', flex: 0.7, textAlign: 'center'
    },
    text2: {
        padding:30, backgroundColor: '#FFDF5B', flex: 0.7, textAlign: 'center'
    },
    text3: {
        padding:30, backgroundColor: '#FF66C6', flex: 0.3, textAlign: 'center'
    },
    text4: {
        padding:30, backgroundColor: '#0197B2', flex: 1, textAlign: 'center'
    },
    text5: {
        padding:30, backgroundColor: '#FF924E', flex: 0.3, textAlign: 'center', paddingTop: 80
    },
    text6: {
        padding:30, backgroundColor: '#FFBE59', flex: 0.7, textAlign: 'center'
    },
    text7: {
        padding:30, backgroundColor: '#4DD460', flex: 0.7, textAlign: 'center'
    }

});