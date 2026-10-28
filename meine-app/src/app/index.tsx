import { StyleSheet, Text, View } from 'react-native';
export default function Index() {
    return (
        <View style={styles.container}>
            <Text style={styles.titel}>Hallo Welt!</Text>
        </View>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    titel: { fontSize: 24, fontWeight: 'bold' },
});
