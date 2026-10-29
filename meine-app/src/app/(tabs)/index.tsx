// Von Claude generiert (KI-Einsatz, siehe Technischer Bericht)
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Avatar, Button, Card, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useBooks } from '../../hooks/useBooks';
import BookCover from '../../components/BookCover';
import BookRow from '../../components/BookRow';
import StateView from '../../components/StateView';

export default function HomeScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { books, loading, error, retry } = useBooks();

  const initials = ((user?.firstname?.[0] ?? '') + (user?.lastname?.[0] ?? '')).toUpperCase() || user?.email[0].toUpperCase() || '?';
  const rated = books.filter((b) => b.rating != null);
  const avg = rated.length ? (rated.reduce((sum, b) => sum + Number(b.rating), 0) / rated.length).toFixed(1).replace('.', ',') : '–';
  const genres = new Set(books.map((b) => b.genre).filter(Boolean)).size;
  const newest = [...books].reverse().slice(0, 8);
  const top = [...rated].sort((a, b) => Number(b.rating) - Number(a.rating)).slice(0, 3);
  const today = new Date().toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text variant="labelMedium" style={{ color: colors.onSurfaceVariant }}>{today}</Text>
            <Text variant="headlineLarge">Home</Text>
          </View>
          <Pressable onPress={() => router.navigate('/profile')} accessibilityLabel="Profil öffnen" hitSlop={4}>
            <Avatar.Text label={initials} size={40} />
          </Pressable>
        </View>

        <Card mode="contained" style={{ backgroundColor: colors.primary, overflow: 'hidden' }}>
          <Card.Content style={{ paddingVertical: 22, paddingRight: 150, gap: 6 }}>
            <Text variant="headlineSmall" style={{ color: colors.onPrimary }}>Finde dein nächstes Buch.</Text>
            <Text variant="bodyMedium" style={{ color: colors.onPrimary }}>
              {loading ? 'Katalog wird geladen …' : `${books.length} Bücher mit allen Details im Katalog von BookCrux Library.`}
            </Text>
            <Button mode="contained" buttonColor={colors.onPrimary} textColor={colors.primary} onPress={() => router.navigate('/books')} style={{ alignSelf: 'flex-start', marginTop: 10 }}>
              Bücher entdecken
            </Button>
          </Card.Content>
          <View style={styles.heroCovers} pointerEvents="none">
            {newest.slice(0, 3).map((b, i) => (
              <View key={b.id} style={{ position: 'absolute', left: i * 34, top: [36, 24, 44][i], transform: [{ rotate: `${[-14, 0, 12][i]}deg` }] }}>
                <BookCover book={b} width={62} />
              </View>
            ))}
          </View>
        </Card>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 32 }} accessibilityLabel="Bücher werden geladen" />
        ) : error ? (
          <StateView icon="wifi-off" title="Keine Verbindung" text={error} action="Erneut versuchen" onPress={retry} />
        ) : (
          <>
            <View style={styles.stats}>
              {[[books.length, 'Bücher'], [genres, 'Genres'], [avg, '⌀ Bewertung']].map(([n, label]) => (
                <View key={label} style={[styles.stat, { backgroundColor: colors.surfaceVariant }]}>
                  <Text variant="headlineSmall">{n}</Text>
                  <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>{label}</Text>
                </View>
              ))}
            </View>

            {newest.length > 0 && (
              <View style={{ gap: 8 }}>
                <View style={styles.sectionHead}>
                  <Text variant="titleLarge">Neu im Katalog</Text>
                  <Button mode="text" onPress={() => router.navigate('/books')}>Alle anzeigen</Button>
                </View>
                <FlatList
                  horizontal
                  data={newest}
                  keyExtractor={(b) => String(b.id)}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 14 }}
                  renderItem={({ item }) => (
                    <Pressable onPress={() => router.push(`/book/${item.id}`)} style={{ width: 110, gap: 2 }}>
                      <BookCover book={item} width={110} />
                      <Text variant="titleSmall" numberOfLines={1} style={{ marginTop: 6 }}>{item.title}</Text>
                      <Text variant="bodySmall" numberOfLines={1} style={{ color: colors.onSurfaceVariant }}>{item.author}</Text>
                    </Pressable>
                  )}
                />
              </View>
            )}

            {top.length > 0 && (
              <View>
                <Text variant="titleLarge">Top bewertet</Text>
                {top.map((b, i) => (
                  <View key={b.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Text variant="titleLarge" style={{ color: colors.primary, width: 18 }}>{i + 1}</Text>
                    <View style={{ flex: 1 }}><BookRow book={b} /></View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingTop: 8, gap: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  heroCovers: { position: 'absolute', right: 70, top: 0, bottom: 0, width: 80 },
  stats: { flexDirection: 'row', gap: 12 },
  stat: { flex: 1, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, gap: 2 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});