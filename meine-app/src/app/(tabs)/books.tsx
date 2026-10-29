// Von Claude generiert (KI-Einsatz, siehe Technischer Bericht)
import { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Chip, FAB, Searchbar, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useBooks } from '../../hooks/useBooks';
import BookRow from '../../components/BookRow';
import StateView from '../../components/StateView';

export default function BooksScreen() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const { books, loading, error, retry } = useBooks();
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState<string | null>(null);

  const columns = width >= 700 ? 2 : 1; // Querformat/Tablet: 2 Spalten
  const genres = [...new Set(books.map((b) => b.genre).filter(Boolean))].sort();
  const filtered = books
    .filter((b) => b.title.toLowerCase().includes(query.trim().toLowerCase()))
    .filter((b) => !genre || b.genre === genre)
    .sort((a, b) => a.title.localeCompare(b.title));
  const resetFilter = () => { setQuery(''); setGenre(null); };

  let body;
  if (loading) {
    body = (
      <View accessibilityLabel="Bücher werden geladen">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={styles.skeletonRow}>
            <View style={[styles.skeleton, { width: 60, height: 90, borderRadius: 4, backgroundColor: colors.surfaceVariant }]} />
            <View style={{ flex: 1, gap: 8 }}>
              <View style={[styles.skeleton, { height: 16, backgroundColor: colors.surfaceVariant }]} />
              <View style={[styles.skeleton, { height: 12, width: 140, backgroundColor: colors.surfaceVariant }]} />
              <View style={[styles.skeleton, { height: 12, width: 90, backgroundColor: colors.surfaceVariant }]} />
            </View>
          </View>
        ))}
      </View>
    );
  } else if (error) {
    body = <StateView icon="wifi-off" title="Keine Verbindung" text={error} action="Erneut versuchen" onPress={retry} />;
  } else if (books.length === 0) {
    body = <StateView icon="book-open-variant" highlight title="Noch keine Bücher" text="Im Katalog sind noch keine Bücher. Füge das erste Buch hinzu – es erscheint dann hier." action="Buch hinzufügen" onPress={() => router.push('/book/form')} />;
  } else if (filtered.length === 0) {
    body = <StateView icon="magnify" title="Keine Bücher gefunden" text={`Für «${query || genre}» gibt es keinen Treffer. Prüfe die Schreibweise oder setze den Filter zurück.`} action="Filter zurücksetzen" mode="outlined" onPress={resetFilter} />;
  } else {
    body = (
      <FlatList
        key={columns}
        data={filtered}
        numColumns={columns}
        keyExtractor={(b) => String(b.id)}
        columnWrapperStyle={columns > 1 ? { gap: 24 } : undefined}
        renderItem={({ item }) => <View style={{ flex: 1 }}><BookRow book={item} /></View>}
        contentContainerStyle={{ paddingBottom: 96 }}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <View style={styles.head}>
        <Text variant="headlineLarge">Bücher</Text>
        <Searchbar placeholder="Titel suchen" value={query} onChangeText={setQuery} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <Chip mode="outlined" selected={!genre} showSelectedCheck onPress={() => setGenre(null)}>Alle</Chip>
          {genres.map((g) => (
            <Chip key={g} mode="outlined" selected={genre === g} showSelectedCheck onPress={() => setGenre(genre === g ? null : g)}>{g}</Chip>
          ))}
        </ScrollView>
        {!loading && !error && books.length > 0 && (
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>{filtered.length} Bücher · sortiert nach Titel</Text>
        )}
      </View>
      <View style={{ flex: 1, paddingHorizontal: 16 }}>{body}</View>
      {!error && books.length > 0 && (
        <FAB icon="plus" label="Neues Buch" style={styles.fab} onPress={() => router.push('/book/form')} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4, gap: 12 },
  skeletonRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 12 },
  skeleton: { borderRadius: 8 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});