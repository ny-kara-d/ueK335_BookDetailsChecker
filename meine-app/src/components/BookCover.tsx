// Von Claude generiert (KI-Einsatz, siehe Technischer Bericht)
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Book } from '../api/client';
import { COVER_COLORS } from '../theme';

// Eigene Komponente (kein Paper-Element): farbiges Cover mit Titel, wie in Figma
export default function BookCover({ book, width = 60 }: { book: Pick<Book, 'title' | 'author' | 'coverColor' | 'id'>; width?: number }) {
  const color = book.coverColor ?? COVER_COLORS[Number(String(book.id).replace(/\D/g, '') || 0) % COVER_COLORS.length];
  const scale = width / 100;
  return (
    <View style={[styles.cover, { width, backgroundColor: color, padding: 10 * scale, paddingLeft: 13 * scale }]}>
      <View style={[styles.spine, { width: 5 * scale }]} />
      <View>
        <View style={[styles.line, { width: 18 * scale, marginBottom: 7 * scale }]} />
        <Text numberOfLines={3} style={{ color: '#fff', fontFamily: 'serif', fontWeight: 'bold', fontSize: 13 * scale, lineHeight: 16 * scale }}>
          {book.title}
        </Text>
      </View>
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
    overflow: 'hidden',
    justifyContent: 'space-between',
    elevation: 4,
  },
  spine: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.18)' },
  line: { height: 2, backgroundColor: 'rgba(255,255,255,0.7)' },
});