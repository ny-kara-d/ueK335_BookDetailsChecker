// Von Claude generiert (KI-Einsatz, siehe Technischer Bericht)
// Begeisterungsmerkmal nach Kano-Modell: nicht Teil der MUSS/SOLL-Anforderungen,
// nutzt aber das Mikrofon als Sensor (Kurs-Handlungsziel "Sensor einbinden").
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { Book, updateBook } from '../api/client';

// Realistischer dB-Bereich für Mikrofonpegel: leise (-60) bis sehr laut (0)
const MIN_DB = -60;
const MAX_DB = 0;

function normalize(db: number | undefined) {
  if (db == null) return 0;
  const clamped = Math.max(MIN_DB, Math.min(MAX_DB, db));
  return (clamped - MIN_DB) / (MAX_DB - MIN_DB);
}

type Props = {
  bookId: Book['id'];
  voiceNoteUri?: string;
  onSaved: (uri: string) => void;
};

/**
 * Sprachnotiz zu einem Buch: aufnehmen, anhören, neu aufnehmen.
 * Der Pegel-Punkt pulsiert live mit der Lautstärke (Metering), damit die
 * Mikrofon-Nutzung beim Aufnehmen sichtbar ist, nicht nur die Datei danach.
 * @param bookId Buch, dem die Notiz zugeordnet wird
 * @param voiceNoteUri bisherige Aufnahme, falls vorhanden
 * @param onSaved wird nach erfolgreichem Speichern mit der neuen URI aufgerufen
 */
export default function VoiceNote({ bookId, voiceNoteUri, onSaved }: Props) {
  const { colors } = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const recorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true });
  const recorderState = useAudioRecorderState(recorder, 100); // Pegel alle 100ms
  const player = useAudioPlayer(voiceNoteUri);

  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
  }, []);

  useEffect(() => {
    const level = normalize(recorderState.metering);
    Animated.spring(scale, { toValue: 1 + level * 0.6, useNativeDriver: true, speed: 20, bounciness: 4 }).start();
  }, [recorderState.metering, scale]);

  async function start() {
    setError(null);
    const status = await AudioModule.requestRecordingPermissionsAsync();
    if (!status.granted) {
      setError('Ohne Mikrofon-Zugriff kann keine Sprachnotiz aufgenommen werden.');
      return;
    }
    await recorder.prepareToRecordAsync();
    recorder.record();
  }

  async function stop() {
    await recorder.stop();
    const uri = recorder.uri;
    if (!uri) return;
    setSaving(true);
    try {
      await updateBook(bookId, { voiceNoteUri: uri });
      onSaved(uri);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={{ gap: 8 }}>
      <Text variant="titleMedium">Sprachnotiz</Text>
      {error && <Text style={{ color: colors.error }}>{error}</Text>}
      <View style={styles.row}>
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: recorderState.isRecording ? colors.error : colors.primary, transform: [{ scale }] },
          ]}
        />
        {!recorderState.isRecording ? (
          <Button mode="outlined" onPress={start} loading={saving} disabled={saving}>
            {voiceNoteUri ? 'Neu aufnehmen' : 'Aufnehmen'}
          </Button>
        ) : (
          <Button mode="contained" buttonColor={colors.error} onPress={stop}>Stop</Button>
        )}
        {voiceNoteUri && !recorderState.isRecording && (
          <Button mode="text" onPress={() => player.play()}>Abspielen</Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 14, height: 14, borderRadius: 7 },
});
