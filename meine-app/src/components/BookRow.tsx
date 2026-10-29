// Von Claude generiert (KI-Einsatz, siehe Technischer Bericht)
import { View } from 'react-native';
import { Divider, List, Text, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { Book } from '../api/client';
import BookCover from './BookCover';

export default function BookRow({ book }: { book: Book }) {
  const { colors } = useTheme();
  const info = [book.genre, book.year].filter(Boolean).join(' · ');
  return (
    <>
      <List.Item
        title={book.title}
        titleNumberOfLines={2}
        titleStyle={{ fontWeight: '500' }}
        description={() => (
          <View>
            <Text variant="bodyMedium" numberOfLines={1} style={{ color: colors.onSurfaceVariant }}>{book.author}</Text>
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, marginTop: 4 }}>
              {info}{book.rating != null ? `   ★ ${String(book.rating).replace('.', ',')}` : ''}
            </Text>
          </View>
        )}
        left={() => <BookCover book={book} />}
        right={(props) => <List.Icon {...props} icon="chevron-right" />}
        onPress={() => router.push(`/book/${book.id}`)}
        style={{ paddingVertical: 12 }}
      />
      <Divider />
    </>
  );
}