// Von Claude generiert (KI-Einsatz, siehe Technischer Bericht)
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Book } from '../api/client';
import { COVER_COLORS } from '../theme';

/** Leitet deterministisch eine Palettenfarbe aus einer Buch-ID ab (für Bücher ohne eigene coverColor). */
function colorForId(id: Book['id']) {
  const digits = Number(String(id).replace(/\D/g, '') || 0);
  return COVER_COLORS[digits % COVER_COLORS.length];
}

/**
 * Zeigt ein Buch als farbiges Cover mit Titel und Autor:in (eigene Komponente, kein Paper-Element,
 * wie im Figma-Mockup entworfen).
 * @param book Buchdaten (nur die für das Cover nötigen Felder)
 * @param width Breite in dp; Höhe ergibt sich aus dem festen Seitenverhältnis 2:3
 */
export default function BookCover({ book, width = 60 }: { book: Pick<Book, 'title' | 'author' | 'coverColor' | 'id'>; width?: number }) {
  const color = book.coverColor ?? colorForId(book.id);
  const scale = width / 100;
  return (
    <View style={[styles.cover, { width, backgroundColor: color, padding: 10 * scale }]}>
      <Text numberOfLines={3} style={{ color: '#fff', fontFamily: 'serif', fontWeight: 'bold', fontSize: 13 * scale, lineHeight: 16 * scale }}>
        {book.title}
      </Text>
      <Text numberOfLines={2} style={{ color: '#fff', opacity: 0.85, fontFamily: 'serif', fontStyle: 'italic', fontSize: 8 * scale, lineHeight: 10 * scale }}>
        {book.author}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cover: {
    aspectRatio: 2 / 3,
    borderRadius: 4,
    justifyContent: 'space-between',
  },
});