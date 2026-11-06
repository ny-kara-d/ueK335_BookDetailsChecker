// Von Claude generiert (KI-Einsatz, siehe Technischer Bericht)
import { useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar, Button, HelperText, Menu, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { AuthError, createBook, GENRES, getBook, updateBook } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from '../../context/SnackbarContext';
import ErrorBanner from '../../components/ErrorBanner';
import { isOptionalNumber } from '../../validation';

// 4,5 Einträge sichtbar: der halbe Eintrag zeigt, dass man scrollen kann
const GENRE_LIST_HEIGHT = 48 * 4.5;

const EMPTY = { title: '', author: '', genre: '', year: '', pages: '', description: '' };

/**
 * Formular zum Anlegen oder Bearbeiten eines Buchs. Ohne `id`-Parameter: neues Buch mit
 * leeren Feldern; mit `id`: lädt die bestehenden Daten und speichert über `updateBook`.
 */
export default function BookFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { colors, roundness } = useTheme();
  const { logout } = useAuth();
  const showSnack = useSnackbar();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [genreOpen, setGenreOpen] = useState(false);
  const [genreWidth, setGenreWidth] = useState(0);
  const set = (key: keyof typeof form) => (value: string) => setForm({ ...form, [key]: value });

  useEffect(() => {
    if (!id) return;
    getBook(id)
      .then((b) => setForm({
        title: b.title ?? '', author: b.author ?? '', genre: b.genre ?? '',
        year: b.year != null ? String(b.year) : '', pages: b.pages != null ? String(b.pages) : '',
        description: b.description ?? '',
      }))
      .catch((e) => (e instanceof AuthError ? logout() : setError(e.message)))
      .finally(() => setLoading(false));
  }, [id, logout]);

  const errors = {
    title: form.title.trim() ? null : 'Bitte gib einen Titel ein.',
    author: form.author.trim() ? null : 'Bitte gib eine Autorin oder einen Autor ein.',
    genre: GENRES.includes(form.genre) ? null : 'Bitte wähle ein Genre aus.',
    year: isOptionalNumber(form.year, 0, new Date().getFullYear()) ? null : 'Nur Zahlen, z. B. 1880.',
    pages: isOptionalNumber(form.pages, 1, 99999) ? null : 'Nur Zahlen, z. B. 286.',
  };
  const errorCount = Object.values(errors).filter(Boolean).length;
  const show = (key: keyof typeof errors) => showErrors && !!errors[key];

  /** Validiert und speichert das Formular; legt bei fehlender `id` ein neues Buch an. */
  async function save() {
    setShowErrors(true);
    if (errorCount) return;
    setSaving(true);
    setError(null);
    const book = {
      title: form.title.trim(),
      author: form.author.trim(),
      genre: form.genre,
      year: form.year ? Number(form.year) : undefined,
      pages: form.pages ? Number(form.pages) : undefined,
      description: form.description.trim(),
    };
    try {
      if (id) await updateBook(id, book);
      else await createBook(book);
      router.back();
      showSnack(id ? 'Änderungen gespeichert' : `«${book.title}» wurde hinzugefügt`);
    } catch (e) {
      if (e instanceof AuthError) return logout();
      setError(`Speichern fehlgeschlagen: ${(e as Error).message}`);
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <Appbar.Header>
        <Appbar.Action icon="close" accessibilityLabel="Schliessen ohne Speichern" onPress={() => router.back()} />
        <Appbar.Content title={id ? 'Buch bearbeiten' : 'Neues Buch'} />
      </Appbar.Header>
      {loading ? <ActivityIndicator style={{ flex: 1 }} /> : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {showErrors && errorCount > 0 && (
              <ErrorBanner text={`${errorCount} ${errorCount === 1 ? 'Feld ist' : 'Felder sind'} nicht korrekt. Bitte prüfe die markierten Felder.`} />
            )}
            {error && <ErrorBanner text={error} />}
            <TextInput mode="outlined" label="Titel *" value={form.title} onChangeText={set('title')} error={show('title')} disabled={saving} />
            <HelperText type="error" visible={show('title')}>{errors.title}</HelperText>
            <TextInput mode="outlined" label="Autor:in *" value={form.author} onChangeText={set('author')} error={show('author')} disabled={saving} />
            <HelperText type="error" visible={show('author')}>{errors.author}</HelperText>
            <Menu
              visible={genreOpen}
              onDismiss={() => setGenreOpen(false)}
              anchorPosition="bottom"
              elevation={3}
              contentStyle={[styles.genreMenu, { width: genreWidth, borderRadius: roundness * 3, backgroundColor: colors.surface }]}
              anchor={
                <Pressable
                  onPress={() => { Keyboard.dismiss(); setGenreOpen(true); }}
                  onLayout={(e) => setGenreWidth(e.nativeEvent.layout.width)}
                  disabled={saving}
                  accessibilityRole="button"
                  accessibilityLabel="Genre auswählen"
                >
                  <View pointerEvents="none">
                    <TextInput
                      mode="outlined"
                      label="Genre *"
                      value={form.genre}
                      editable={false}
                      right={<TextInput.Icon icon={genreOpen ? 'chevron-up' : 'chevron-down'} />}
                      outlineColor={genreOpen ? colors.primary : undefined}
                      error={show('genre')}
                      disabled={saving}
                    />
                  </View>
                </Pressable>
              }
            >
              {/* Feste Höhe mit Scrollen: so passt die Liste immer unter das Feld und Paper klappt sie nicht nach oben */}
              <ScrollView style={{ maxHeight: GENRE_LIST_HEIGHT }}>
                {GENRES.map((g) => {
                  const selected = form.genre === g;
                  return (
                    <Menu.Item
                      key={g}
                      title={g}
                      trailingIcon={selected ? 'check' : undefined}
                      titleStyle={selected && { color: colors.primary, fontWeight: '600' }}
                      style={[styles.genreItem, { maxWidth: genreWidth }, selected && { backgroundColor: colors.secondaryContainer }]}
                      contentStyle={{ flex: 1, maxWidth: genreWidth }}
                      onPress={() => { set('genre')(g); setGenreOpen(false); }}
                    />
                  );
                })}
              </ScrollView>
            </Menu>
            <HelperText type="error" visible={show('genre')}>{errors.genre}</HelperText>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <TextInput mode="outlined" label="Erscheinungsjahr" value={form.year} onChangeText={set('year')} keyboardType="number-pad" error={show('year')} disabled={saving} />
                <HelperText type="error" visible={show('year')}>{errors.year}</HelperText>
              </View>
              <View style={{ flex: 1 }}>
                <TextInput mode="outlined" label="Seiten" value={form.pages} onChangeText={set('pages')} keyboardType="number-pad" error={show('pages')} disabled={saving} />
                <HelperText type="error" visible={show('pages')}>{errors.pages}</HelperText>
              </View>
            </View>
            <TextInput mode="outlined" label="Beschreibung" value={form.description} onChangeText={set('description')} multiline numberOfLines={4} disabled={saving} />
            <HelperText type="info" visible>* Pflichtfeld</HelperText>
          </ScrollView>
          <View style={styles.bottom}>
            <Button mode="contained" onPress={save} loading={saving} disabled={saving} contentStyle={{ height: 48 }}>Speichern</Button>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingTop: 4 },
  row: { flexDirection: 'row', gap: 12 },
  genreMenu: { marginTop: 4, paddingVertical: 4, overflow: 'hidden' },
  genreItem: { marginHorizontal: 4, borderRadius: 8 },
  bottom: { padding: 16, paddingTop: 12 },
});