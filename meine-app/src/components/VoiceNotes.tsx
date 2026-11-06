// Von Claude generiert (KI-Einsatz, siehe Technischer Bericht)
// Begeisterungsmerkmal nach Kano-Modell: mehrere benennbare Sprachnotizen pro Buch,
// nicht Teil der MUSS/SOLL-Anforderungen. Nutzt das Mikrofon als Sensor
// (Kurs-Handlungsziel "Sensor einbinden").
import { useEffect, useMemo, useState } from 'react';
import { Animated, Linking, StyleSheet, View } from 'react-native';
import { Button, Dialog, IconButton, List, Portal, Text, TextInput, useTheme } from 'react-native-paper';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { AuthError, Book, VoiceNote, updateBook } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';

// Realistischer dB-Bereich für Mikrofonpegel: leise (-60) bis sehr laut (0)
const MIN_DB = -60;
const MAX_DB = 0;

/**
 * Normiert einen dB-Pegel auf 0..1 für die Pulsier-Animation.
 * @param db Mikrofonpegel aus `recorderState.metering`, `undefined` solange nichts gemessen wurde
 * @returns 0 (still/kein Wert) bis 1 (MAX_DB erreicht)
 */
function normalize(db: number | undefined) {
  if (db == null) return 0;
  const clamped = Math.max(MIN_DB, Math.min(MAX_DB, db));
  return (clamped - MIN_DB) / (MAX_DB - MIN_DB);
}

/** Erzeugt eine client-seitige ID für eine neue Sprachnotiz (Zeitstempel + Zufallsanteil). */
function makeId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

type Props = {
  bookId: Book['id'];
  voiceNotes: VoiceNote[];
  onChange: (notes: VoiceNote[]) => void;
};

type NameDialog = { mode: 'new' | 'rename'; targetId?: string; uri?: string; value: string } | null;

/**
 * Sprachnotizen zu einem Buch: mehrere benannte Aufnahmen anlegen, abspielen,
 * umbenennen und löschen. Der Pegel-Punkt pulsiert live mit der Lautstärke
 * (Metering), damit die Mikrofon-Nutzung beim Aufnehmen sichtbar ist.
 * @param bookId Buch, dem die Notizen zugeordnet sind
 * @param voiceNotes bisherige Aufnahmen
 * @param onChange wird nach jeder Änderung (neu/umbenannt/gelöscht) mit der neuen Liste aufgerufen
 */
export default function VoiceNotes({ bookId, voiceNotes, onChange }: Props) {
  const { colors } = useTheme();
  const { logout } = useAuth();
  const showSnack = useSnackbar();
  const [error, setError] = useState<string | null>(null);
  // Separat von "error", weil der Fehlertext hier einen Handlungshinweis braucht (Fehlertoleranz
  // nach ISO 9241-110): die Berechtigung lässt sich nicht erneut per Tippen anfragen, sobald sie
  // einmal verweigert wurde – nur noch über die Geräte-Einstellungen.
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dialog, setDialog] = useState<NameDialog>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  // Name ist bewusst "lastPlayed", nicht "playing": wird beim Stoppen/Fertigspielen nicht
  // zurückgesetzt, nur die Anzeige (unten) prüft zusätzlich playerStatus.playing.
  const [lastPlayedId, setLastPlayedId] = useState<string | null>(null);

  const recorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true });
  const recorderState = useAudioRecorderState(recorder, 100); // Pegel alle 100ms
  const player = useAudioPlayer(); // eine Player-Instanz, Quelle wird per replace() gewechselt
  const playerStatus = useAudioPlayerStatus(player);

  // useMemo statt useRef: kein Ref-Objekt, daher kein .current-Lesen beim Rendern –
  // der React Compiler (app.json: reactCompiler) beanstandet das sonst.
  const scale = useMemo(() => new Animated.Value(1), []);

  useEffect(() => {
    setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
  }, []);

  useEffect(() => {
    const level = normalize(recorderState.metering);
    Animated.spring(scale, { toValue: 1 + level * 0.6, useNativeDriver: true, speed: 20, bounciness: 4 }).start();
  }, [recorderState.metering, scale]);

  /** Persistiert die neue Notizenliste am Buch (Backend ist die einzige Ablage, kein lokaler Cache). */
  async function save(notes: VoiceNote[]) {
    setSaving(true);
    try {
      await updateBook(bookId, { voiceNotes: notes });
      onChange(notes);
    } catch (e) {
      if (e instanceof AuthError) return logout();
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  /** Fragt bei Bedarf die Mikrofon-Berechtigung an und startet danach die Aufnahme. */
  async function startRecording() {
    setError(null);
    setPermissionDenied(false);
    try {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        setError('Ohne Mikrofon-Zugriff kann keine Sprachnotiz aufgenommen werden.');
        setPermissionDenied(true);
        return;
      }
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  /** Beendet die Aufnahme und öffnet den Benennen-Dialog; gespeichert wird erst nach Bestätigung. */
  async function stopRecording() {
    try {
      await recorder.stop();
    } catch (e) {
      setError((e as Error).message);
      return;
    }
    const uri = recorder.uri;
    if (!uri) return;
    setDialog({ mode: 'new', uri, value: `Notiz ${voiceNotes.length + 1}` });
  }

  /** Übernimmt den im Dialog eingegebenen Namen: legt je nach Modus eine neue Notiz an oder benennt um. */
  function confirmDialog() {
    if (!dialog) return;
    const name = dialog.value.trim() || 'Notiz';
    if (dialog.mode === 'new' && dialog.uri) {
      save([...voiceNotes, { id: makeId(), name, uri: dialog.uri, createdAt: new Date().toISOString() }]);
    } else if (dialog.mode === 'rename' && dialog.targetId) {
      save(voiceNotes.map((n) => (n.id === dialog.targetId ? { ...n, name } : n)));
    }
    setDialog(null);
  }

  function requestRemove(id: string) {
    setConfirmDeleteId(id);
  }

  /** Löscht die bestätigte Notiz und bietet sofort ein Rückgängig über die Snackbar an. */
  async function confirmRemove() {
    const note = voiceNotes.find((n) => n.id === confirmDeleteId);
    setConfirmDeleteId(null);
    if (!note) return;
    if (lastPlayedId === note.id) player.pause();
    const next = voiceNotes.filter((n) => n.id !== note.id);
    await save(next);
    showSnack(`«${note.name}» wurde gelöscht`, { label: 'Rückgängig', onPress: () => save([...next, note]) });
  }

  function togglePlay(note: VoiceNote) {
    if (lastPlayedId === note.id && playerStatus.playing) {
      player.pause();
      return;
    }
    player.replace(note.uri);
    player.play();
    setLastPlayedId(note.id);
  }

  return (
    <View style={{ gap: 8 }}>
      <View style={styles.header}>
        <Text variant="titleMedium">Sprachnotizen</Text>
        {!recorderState.isRecording ? (
          <Button mode="outlined" onPress={startRecording} loading={saving} disabled={saving} compact>
            + Aufnahme
          </Button>
        ) : (
          <Button mode="contained" buttonColor={colors.error} onPress={stopRecording} compact>Stop</Button>
        )}
      </View>

      {error && (
        <View style={{ gap: 2, alignItems: 'flex-start' }}>
          <Text style={{ color: colors.error }}>{error}</Text>
          {permissionDenied && (
            <Button mode="text" compact onPress={() => Linking.openSettings()} style={{ marginLeft: -12 }}>
              Einstellungen öffnen
            </Button>
          )}
        </View>
      )}

      {recorderState.isRecording && (
        <Animated.View style={[styles.dot, { backgroundColor: colors.error, transform: [{ scale }] }]} />
      )}

      {voiceNotes.length === 0 && !recorderState.isRecording && (
        <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>Noch keine Sprachnotiz vorhanden.</Text>
      )}

      {voiceNotes.map((note) => (
        <List.Item
          key={note.id}
          title={note.name}
          onPress={() => togglePlay(note)}
          left={(props) => (
            <List.Icon {...props} icon={lastPlayedId === note.id && playerStatus.playing ? 'pause-circle' : 'play-circle'} />
          )}
          right={() => (
            <View style={{ flexDirection: 'row' }}>
              <IconButton
                icon="pencil-outline"
                size={20}
                accessibilityLabel={`«${note.name}» umbenennen`}
                onPress={() => setDialog({ mode: 'rename', targetId: note.id, value: note.name })}
              />
              <IconButton
                icon="trash-can-outline"
                size={20}
                iconColor={colors.error}
                accessibilityLabel={`«${note.name}» löschen`}
                onPress={() => requestRemove(note.id)}
              />
            </View>
          )}
        />
      ))}

      <Portal>
        <Dialog visible={!!dialog} onDismiss={() => setDialog(null)}>
          <Dialog.Title>{dialog?.mode === 'new' ? 'Sprachnotiz benennen' : 'Umbenennen'}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              mode="outlined"
              value={dialog?.value ?? ''}
              onChangeText={(value) => setDialog((d) => (d ? { ...d, value } : d))}
              autoFocus
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialog(null)}>Abbrechen</Button>
            <Button onPress={confirmDialog}>Speichern</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={!!confirmDeleteId} onDismiss={() => !saving && setConfirmDeleteId(null)}>
          <Dialog.Title>Sprachnotiz löschen?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">Du kannst das danach kurz rückgängig machen.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmDeleteId(null)} disabled={saving}>Abbrechen</Button>
            <Button textColor={colors.error} onPress={confirmRemove} loading={saving} disabled={saving}>Löschen</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dot: { width: 14, height: 14, borderRadius: 7, alignSelf: 'flex-start' },
});
