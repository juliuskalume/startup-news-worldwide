# Startup News Worldwide

Next.js (App Router) + TypeScript + TailwindCSS app for aggregated startup and tech news.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Routes

- `/` Home Feed
- `/article/[id]` Article Reader View
- `/search` Search
- `/saved` Saved articles (localStorage)
- `/region` Region selector
- `/profile` Profile + theme toggle

## API

- `GET /api/news?country=US&category=Top`
- `GET /api/article?id=<id>&country=US&category=Top`
- `GET /api/search?q=startup&country=US`

## Notes

- Theme preference supports `light`, `dark`, `system` and persists in localStorage.
- Saved articles are stored in localStorage key `newshub_saved`.
- RSS feed failures are skipped so the API keeps responding.

## Android app (Capacitor)

This project now includes a native Android wrapper in `android/`.

Important architecture note:
- This app uses Next.js server APIs (`/api/news`, `/api/article`, `/api/search`).
- Android must load a running web backend URL via `CAP_SERVER_URL`.

### 1) Set backend URL for Android shell

PowerShell example (emulator + local dev server):

```powershell
$env:CAP_SERVER_URL="http://10.0.2.2:3000"
```

Physical device example (same Wi-Fi):

```powershell
$env:CAP_SERVER_URL="http://192.168.1.50:3000"
```

Production example:

```powershell
$env:CAP_SERVER_URL="https://news.sentirax.com"
```

### 2) Sync and open Android project

```bash
npm run cap:sync
npm run cap:open
```

Then in Android Studio:
- select an emulator/device
- Run app

### 3) Build APK (from Android Studio terminal)

```powershell
cd android
.\gradlew.bat assembleDebug
```

APK output:
- `android/app/build/outputs/apk/debug/app-debug.apk`
