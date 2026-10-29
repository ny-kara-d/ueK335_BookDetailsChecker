# BookCrux Library

A mobile app for managing a book catalogue — built for üK Modul 335 ("Mobile-Applikation realisieren").

Users register/log in, then browse, search and filter books by title and genre, and create, edit or delete book entries. Profile data (name, age) collected at registration is shown on the Profile screen; sessions are backed by a token-protected REST API.

## Tech stack

- [Expo](https://expo.dev) SDK 58 + [Expo Router](https://docs.expo.dev/router/introduction/) (file-based navigation, routes under `src/app/`)
- [React Native Paper](https://callstack.github.io/react-native-paper/) (Material Design 3 components)
- TypeScript
- [expo-secure-store](https://docs.expo.dev/versions/latest/sdk/securestore/) for the auth token and cached profile
- Backend: [`rest-jsondb`](https://hub.docker.com/r/noseryoung/rest-jsondb) (json-server + json-server-auth) running in Docker

## Prerequisites

- [Node.js](https://nodejs.org) LTS (24 or 22 — avoid odd versions like 23/25)
- [Yarn](https://yarnpkg.com) (classic)
- [Docker](https://www.docker.com/) (to run the backend)
- Android Studio with a configured Virtual Device, **or** the [Expo Go](https://expo.dev/go) app on a physical phone on the same Wi-Fi as your laptop

## 1. Start the backend

```bash
docker run -d -p 3030:3000 --name restdb noseryoung/rest-jsondb
```

This exposes the book/user REST API on `http://<your-laptop-ip>:3030`. Leave the container running while developing — restarting it may reset locally registered test users, since this image has no persistent volume mounted.

## 2. Install dependencies

```bash
yarn install
```

## 3. Run the app

```bash
npx expo start
```

Then either:

- press **`a`** to launch it in a running Android Studio emulator, or
- scan the printed QR code with the **Expo Go** app on your phone (same Wi-Fi network as your laptop required).

No manual IP configuration is needed: [`src/api/client.ts`](src/api/client.ts) derives the backend's base URL automatically from `Constants.expoConfig.hostUri` (the same host Expo's dev server reports), so it works out of the box on both the emulator and a physical device, as long as the backend container is reachable on port `3030` from that device.

### Troubleshooting

- **`npx expo start` fails to find the Android emulator**: make sure an AVD is running in Android Studio first (Device Manager → ▶), and that `ANDROID_HOME` is set.
- **App can't reach the backend**: confirm `docker ps` shows `restdb` running, and that your phone/emulator is on the same network as the laptop (use `npx expo start --tunnel` if a firewall/guest Wi-Fi blocks the direct connection).
- **Metro/dependency errors after pulling changes**: delete `node_modules` and `yarn.lock`, then re-run `yarn install`.

## Project structure

```
src/
  app/              # screens — Expo Router: one file = one route
    (tabs)/         # Books, Profile tabs (shown after login)
    book/           # book detail + create/edit form
    login.tsx
    register.tsx
  api/client.ts     # REST calls, auth token handling, typed errors
  context/          # AuthContext (session), SnackbarContext (toasts)
  components/       # reusable UI: BookRow, BookCover, ErrorBanner, StateView
  hooks/useBooks.ts # book list loading/reload logic
  validation.ts     # form validation helpers
  theme.ts           # React Native Paper theme + cover color palette
```

## Scripts

| Command | Purpose |
|---|---|
| `yarn start` | start the Expo dev server |
| `yarn android` / `yarn ios` / `yarn web` | start and target a specific platform |
| `yarn lint` | run ESLint |

## AI usage

Portions of this codebase were generated or extended with Claude (Anthropic); affected files carry a `// Von Claude generiert` / `// Erweitert von Claude` comment. Details and scope are declared in the project's Technischer Bericht.
