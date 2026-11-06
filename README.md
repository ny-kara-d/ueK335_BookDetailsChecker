# BookCrux Library

A mobile app for managing a book catalogue — built for üK Modul 335 ("Mobile-Applikation realisieren"). The Expo project lives in [`meine-app/`](meine-app/); all commands below run from there.

Users register/log in, then browse, search and filter books by title and genre, and create, edit or delete book entries. Profile data (name, age) collected at registration is shown on the Profile screen; sessions are backed by a token-protected REST API. On a book's detail screen, users can also record, name, rename and delete multiple voice notes about that book (a Kano-model "delighter" feature, not part of the MUSS/SOLL requirements).

## Tech stack

- [Expo](https://expo.dev) SDK 58 + [Expo Router](https://docs.expo.dev/router/introduction/) (file-based navigation, routes under `src/app/`)
- [React Native Paper](https://callstack.github.io/react-native-paper/) (Material Design 3 components)
- TypeScript
- [expo-secure-store](https://docs.expo.dev/versions/latest/sdk/securestore/) for the auth token and cached profile
- [expo-audio](https://docs.expo.dev/versions/latest/sdk/audio/) for the microphone-based voice note recording/playback
- Backend: [`rest-jsondb`](https://hub.docker.com/r/noseryoung/rest-jsondb) (json-server + json-server-auth) running in Docker

## Design

The UI was designed in Figma before implementation: [Figma mockups](https://www.figma.com/design/oNGwcYkNVSDxN1PPXn7CRF/Lesezeit-%E2%80%93-B%C3%BCcher-App--%C3%BCK-335-?node-id=67-1637&t=tr06PtHGg9ujv90L-1) — covers login/register, home/books/detail/form/profile, feedback & loading/error states, different screen sizes, and component states.

## Prerequisites

- [Node.js](https://nodejs.org) LTS (24 or 22 — avoid odd versions like 23/25)
- [Yarn](https://yarnpkg.com) (classic)
- [Docker](https://www.docker.com/) (to run the backend)
- Android Studio with a configured Virtual Device, **or** the [Expo Go](https://expo.dev/go) app on a physical phone on the same Wi-Fi as your laptop
- **Code editor: [VS Code](https://code.visualstudio.com/)**, not Android Studio's own editor — Android Studio is used here only to run the emulator. Opening this project in Android Studio's editor has caused its file indexer to silently miss new/changed files (confirmed on this project); VS Code's TypeScript/React Native support doesn't have that problem.

## 1. Start the backend

```bash
docker run -d -p 3030:3000 --name restdb noseryoung/rest-jsondb
```

This exposes the book/user REST API on `http://<your-laptop-ip>:3030`. Leave the container running while developing — restarting it may reset locally registered test users, since this image has no persistent volume mounted.

## 2. Install dependencies

```bash
cd meine-app
yarn install
```

## 3. Run the app

```bash
npx expo start
```

Then either:

- press **`a`** to launch it in a running Android Studio emulator, or
- scan the printed QR code with the **Expo Go** app on your phone (same Wi-Fi network as your laptop required).

No manual IP configuration is needed: [`src/api/client.ts`](meine-app/src/api/client.ts) derives the backend's base URL automatically from `Constants.expoConfig.hostUri` (the same host Expo's dev server reports), so it works out of the box on both the emulator and a physical device, as long as the backend container is reachable on port `3030` from that device.

The first time you record a voice note on a book's detail screen, the app will prompt for microphone access. Each recording is named right after stopping; names can be changed later via the pencil icon. If microphone access is denied, the OS won't show that prompt again — the app detects this and shows an "Einstellungen öffnen" button that links directly to the device's app settings instead of a dead end. Each voice note's audio file is a local path on the device it was recorded on, so playback isn't available on other devices.

### Troubleshooting

- **`npx expo start` fails to find the Android emulator**: make sure an AVD is running in Android Studio first (Device Manager → ▶), and that `ANDROID_HOME` is set.
- **App can't reach the backend**: confirm `docker ps` shows `restdb` running, and that your phone/emulator is on the same network as the laptop (use `npx expo start --tunnel` if a firewall/guest Wi-Fi blocks the direct connection).
- **Metro/dependency errors after pulling changes**: delete `node_modules` and `yarn.lock`, then re-run `yarn install`.
- **Voice note recording produces silence on the Android emulator**: by default the AVD has no real microphone input. In the emulator window, open Extended Controls (the ⋮ menu) → **Microphone** → enable "Virtual microphone uses host audio input". A physical device via Expo Go avoids this entirely.
- **Android Studio's editor shows stale/missing files** (e.g. a new file doesn't appear, Goto File can't find it): this is an indexing issue with Android Studio's project view for a non-Gradle folder, not a problem with the files themselves. Edit in VS Code instead (see Prerequisites); keep Android Studio open only for the emulator.

## Project structure

```
meine-app/
  src/
    app/              # screens — Expo Router: one file = one route
      (tabs)/         # Books, Profile tabs (shown after login)
      book/           # book detail + create/edit form
      login.tsx
      register.tsx
    api/client.ts     # REST calls, auth token handling, typed errors
    context/          # AuthContext (session), SnackbarContext (toasts)
    components/       # reusable UI: BookRow, BookCover, ErrorBanner, StateView, VoiceNotes
    hooks/useBooks.ts # book list loading/reload logic
    validation.ts     # form validation helpers
    theme.ts          # React Native Paper theme + cover color palette
```

## Scripts

Run from `meine-app/`:

| Command | Purpose |
|---|---|
| `yarn start` | start the Expo dev server |
| `yarn android` / `yarn ios` / `yarn web` | start and target a specific platform |
| `yarn lint` | run ESLint |

## AI usage

Portions of this codebase were generated or extended with Claude (Anthropic); affected files carry a `// Von Claude generiert` / `// Erweitert von Claude` comment. Details and scope are declared in the project's Technischer Bericht.
