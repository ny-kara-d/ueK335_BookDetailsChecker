// Von Claude generiert (KI-Einsatz, siehe Technischer Bericht)
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar, Button, HelperText, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { createBook, getBook, updateBook } from '../../api/client';
import { useSnackbar } from '../../context/SnackbarContext';
import BookCover from '../../components/BookCover';
import ErrorBanner from '../../components/ErrorBanner';
import { COVER_COLORS } from '../../theme';
import { isOptionalNumber } from '../../validation';

const EMPTY = { title: '', author: '', genre: '', year: '', pages: '', description: '', coverColor: COVER_COLORS[0] };

export default function BookFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { colors } = useTheme();
  const showSnack = useSnackbar();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (key: keyof typeof form) => (value: string) => setForm({ ...form, [key]: value });

  useEffect(() => {
    if (!id) return;
    getBook(id)
      .then((b) => setForm({
        title: b.title ?? '', author: b.author ?? '', genre: b.genre ?? '',
        year: b.year != null ? String(b.year) : '', pages: b.pages != null ? String(b.pages) : '',
        description: b.description ?? '', coverColor: b.coverColor ?? COVER_COLORS[0],
      }))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const errors = {
    title: form.title.trim() ? null : 'Bitte gib einen Titel ein.',
    author: form.author.trim() ? null : 'Bitte gib eine Autorin oder einen Autor ein.',
    genre: form.genre.trim() ? null : 'Bitte gib ein Genre ein, z. B. Roman.',
    year: isOptionalNumber(form.year, 0, new Date().getFullYear()) ? null : 'Nur Zahlen, z. B. 1880.',
    pages: isOptionalNumber(form.pages, 1, 99999) ? null : 'Nur Zahlen, z. B. 286.',
  };
  const errorCount = Object.values(errors).filter(Boolean).length;
  const show = (key: keyof typeof errors) => showErrors && !!errors[key];

  async function save() {
    setShowErrors(true);
    if (errorCount) return;
    setSaving(true);
    setError(null);
    const book = {
      title: form.title.trim(),
      author: form.author.trim(),
      genre: form.genre.trim(),
      year: form.year ? Number(form.year) : undefined,
      pages: form.pages ? Number(form.pages) : undefined,
      description: form.description.trim(),
      coverColor: form.coverColor,
    };
    try {
      if (id) await updateBook(id, book);
      else await createBook(book);
      router.back();
      showSnack(id ? 'Änderungen gespeichert' : `«${book.title}» wurde hinzugefügt`);
    } catch (e) {
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
            <View style={styles.coverRow}>
              <BookCover book={{ id: 0, title: form.title || 'Titel', author: form.author, coverColor: form.coverColor }} width={64} />
              <View style={{ flex: 1, gap: 8 }}>
                <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>Coverfarbe</Text>
                <View style={styles.colors}>
                  {COVER_COLORS.map((c) => (
                    <Pressable
                      key={c}
                      onPress={() => set('coverColor')(c)}
                      accessibilityLabel={`Coverfarbe ${c}`}
                      accessibilityState={{ selected: form.coverColor === c }}
                      hitSlop={6}
                      style={[styles.color, { backgroundColor: c }, form.coverColor === c && { borderWidth: 3, borderColor: colors.onSurface }]}
                    />
                  ))}
                </View>
              </View>
            </View>
            <TextInput mode="outlined" label="Titel *" value={form.title} onChangeText={set('title')} error={show('title')} disabled={saving} />
            <HelperText type="error" visible={show('title')}>{errors.title}</HelperText>
            <TextInput mode="outlined" label="Autor:in *" value={form.author} onChangeText={set('author')} error={show('author')} disabled={saving} />
            <HelperText type="error" visible={show('author')}>{errors.author}</HelperText>
            <TextInput mode="outlined" label="Genre *" value={form.genre} onChangeText={set('genre')} error={show('genre')} disabled={saving} />
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
  coverRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 8 },
  colors: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  color: { width: 32, height: 32, borderRadius: 16 },
  row: { flexDirection: 'row', gap: 12 },
  bottom: { padding: 16, paddingTop: 12 },
});