// Von Claude generiert (KI-Einsatz, siehe Technischer Bericht)
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar, Button, Dialog, Divider, FAB, Icon, Portal, Text, useTheme } from 'react-native-paper';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Book, createBook, deleteBook, getBook } from '../../api/client';
import { useSnackbar } from '../../context/SnackbarContext';
import BookCover from '../../components/BookCover';
import StateView from '../../components/StateView';
import { COVER_COLORS } from '../../theme';

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const showSnack = useSnackbar();
  const [book, setBook] = useState<Book | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setError(null);
    getBook(id).then(setBook).catch((e) => setError(e.message));
  }, [id]);
  useFocusEffect(load); // nach «Bearbeiten» die neuen Daten zeigen

  async function remove() {
    if (!book) return;
    setDeleting(true);
    try {
      await deleteBook(book.id);
      setConfirm(false);
      router.back();
      // Löschen absichern: Rückgängig legt das Buch mit denselben Daten wieder an
      showSnack(`«${book.title}» wurde gelöscht`, { label: 'Rückgängig', onPress: () => createBook(book).catch(() => showSnack('Wiederherstellen fehlgeschlagen. Versuche es erneut.')) });
    } catch (e) {
      setDeleting(false);
      setConfirm(false);
      showSnack((e as Error).message);
    }
  }

  if (error) {
    return (
      <View style={{ flex: 1 }}>
        <Appbar.Header><Appbar.BackAction onPress={() => router.back()} /></Appbar.Header>
        <StateView icon="wifi-off" title="Buch konnte nicht geladen werden" text={error} action="Erneut versuchen" onPress={load} />
      </View>
    );
  }
  if (!book) return <ActivityIndicator style={{ flex: 1 }} accessibilityLabel="Buch wird geladen" />;

  const tint = (book.coverColor ?? COVER_COLORS[0]) + '1A'; // Coverfarbe mit 10 % Deckkraft
  const rating = book.rating != null ? Math.round(Number(book.rating)) : null;
  const infos = [['GENRE', book.genre], ['JAHR', book.year], ['SEITEN', book.pages]].filter(([, v]) => v != null && v !== '');

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 96 }}>
        <View style={{ backgroundColor: tint, paddingBottom: 24 }}>
          <Appbar.Header style={{ backgroundColor: 'transparent' }}>
            <Appbar.BackAction onPress={() => router.back()} />
            <Appbar.Content title="" />
            <Appbar.Action icon="delete-outline" iconColor={colors.error} accessibilityLabel="Buch löschen" onPress={() => setConfirm(true)} />
          </Appbar.Header>
          <View style={styles.book}>
            <BookCover book={book} width={150} />
            <Text variant="headlineSmall" style={styles.center}>{book.title}</Text>
            <Text variant="bodyLarge" style={[styles.center, { color: colors.onSurfaceVariant }]}>{book.author}</Text>
            {rating != null && (
              <View style={styles.stars} accessibilityLabel={`Bewertung ${book.rating} von 5`}>
                {[1, 2, 3, 4, 5].map((n) => <Icon key={n} source={n <= rating ? 'star' : 'star-outline'} size={16} color={n <= rating ? colors.primary : colors.outline} />)}
                <Text variant="labelLarge" style={{ marginLeft: 4 }}>{String(book.rating).replace('.', ',')}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.body}>
          {infos.length > 0 && (
            <View style={styles.infos}>
              {infos.map(([label, value], i) => (
                <View key={String(label)} style={{ flex: 1, flexDirection: 'row' }}>
                  {i > 0 && <Divider style={{ width: 1, height: 32, alignSelf: 'center' }} />}
                  <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                    <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>{label}</Text>
                    <Text variant="titleMedium">{value}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
          {!!book.description && (
            <View style={{ gap: 8 }}>
              <Text variant="titleMedium">Beschreibung</Text>
              <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>{book.description}</Text>
            </View>
          )}
        </View>
      </ScrollView>
      <FAB icon="pencil-outline" label="Bearbeiten" style={styles.fab} onPress={() => router.push({ pathname: '/book/form', params: { id: String(book.id) } })} />

      <Portal>
        <Dialog visible={confirm} onDismiss={() => !deleting && setConfirm(false)}>
          <Dialog.Title>Buch löschen?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">«{book.title}» wird aus dem Katalog entfernt. Du kannst es danach kurz rückgängig machen.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirm(false)} disabled={deleting}>Abbrechen</Button>
            <Button textColor={colors.error} onPress={remove} loading={deleting} disabled={deleting}>Löschen</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  book: { alignItems: 'center', gap: 4, paddingHorizontal: 16 },
  center: { textAlign: 'center', marginTop: 4 },
  stars: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingTop: 4 },
  body: { padding: 16, paddingTop: 20, gap: 24 },
  infos: { flexDirection: 'row' },
  fab: { position: 'absolute', right: 16, bottom: 24 },
});