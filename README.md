# M’lang Go

An independent community directory and personal errands checklist for M'lang, Cotabato. Built with React, TypeScript, Vite, Tailwind CSS, and Capacitor for a browser/PWA and a locally installed Android app.

Version 1.1 renames M’lang Pocket to **M’lang Go** and introduces a location-pin/checkmark logo across the app, splash screen, browser icon, and Android launcher. Android 13+ themed icons are included. The Android app ID, signing key, web app identity, and saved-data keys remain the same so this APK can update the existing installation. Device installation of version 1.1 requires reconnecting the phone.

The directory is a **provisional starter dataset**, not an official LGU service. Listings, locations, schedules, services, requirements, and tips need confirmation before travelling. A linked official contact source supports the stated contact fields only; it does not verify the entire listing. No field visits or direct calls are claimed.

## Use the app

- Search places and services; filter by category, barangay, or the draft schedule's open status. Calculations use Philippine time and are not live office availability. A view left open across a schedule boundary may need reopening or a filter change to refresh.
- Open a place to see draft details, contact/source notes, map links, and a suggested packing list. Calling controls appear only for contacts marked as supported by a public source.
- Save places, create personal errands, import suggested packing items, and check off documents. New installations start with an empty personal pocket.
- Review the bag summary and suggested area groups. Groups use fixed listing IDs; they do not calculate routes, distances, fares, or travel time.
- Save a correction locally, then copy it or export saved reports from **Transparency & Sources** and share them yourself. There is no report submission server or automatic maintainer notification.

The emergency panel links its sources and distinguishes published general contacts from emergency dispatch. It cannot guarantee that a number is answered or that a service is available.

## Develop and check

Use Node.js 24 and npm. From the project directory:

```powershell
npm ci
npm run dev
```

Open the local URL printed by Vite. The project provides these checks:

```powershell
npm run lint
npm run build
npm run preview
```

`build` type-checks the source, builds `dist/`, and generates the versioned offline precache manifest. `preview` serves that production bundle locally. There is no `npm test` script; browser checks and physical-device checks are separate validation steps.

## Build the Android APK on Windows

Required: JDK 21, an Android SDK with API 36/build tools and platform tools, and a data-capable USB cable for installation. The app supports Android API 24 or newer. The first build may download Gradle and Android dependencies.

The PowerShell scripts discover installed tools. If necessary, set these variables for the current terminal session:

```powershell
$env:MLANG_JAVA_HOME = 'C:\path\to\jdk-21'
$env:MLANG_ANDROID_SDK = 'C:\path\to\Android\Sdk'
# Optional dedicated Gradle cache:
$env:MLANG_GRADLE_HOME = 'C:\path\to\gradle-cache'
npm run android:build
```

The script rebuilds the web assets, runs Capacitor sync, and assembles a debug APK. It writes:

```text
output/android/Mlang-Go-1.1-debug.apk
output/android/Mlang-Go-1.1-debug.apk.sha256
```

This is a personal debug build, signed with the local Android debug key. It is not a store release. Keep that signing key if future updates must install over this build while retaining app data. Output files and machine-specific Android configuration are excluded from Git.

## Install on an Android phone through USB

1. Connect and unlock the phone with a cable that supports data.
2. Enable Developer options and **USB debugging**, then accept the phone's **Allow USB debugging** prompt for this computer. It may also need its USB mode changed to file transfer.
3. Build the APK above, then run:

```powershell
npm run android:install
```

The installer requires one connected, authorized Android device. With multiple devices, select the intended serial explicitly:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/install-android.ps1 -Serial YOUR_DEVICE_SERIAL
```

It uses `adb install -r` to update `com.mlangpocket.app` while preserving existing app data, then requests an app launch. It does not uninstall the app or clear storage to resolve errors. A signature conflict requires review before changing anything on the phone.

After installation, check the actual phone screen, Back button, keyboard/modal behavior, and offline reopening. A successful build or ADB launch request alone does not establish those checks. If the phone is disconnected or unauthorized, installation remains pending until the connection is available.

Alternatively, copy the APK to the phone, open it using its Files app, and allow installation from that source when prompted. This path still requires confirmation on the phone.

## Offline use, storage, and data limits

The Android APK bundles the directory and app assets for offline use. The web version registers a service worker for production builds only; it needs an initial online load and successful caching on HTTPS or localhost. The development server does not provide production offline behavior. No hosted deployment URL is asserted here.

Favorites, errands, corrections, visit confirmations, and bag checks use device/browser `localStorage`. There is no account, cloud sync, or general backup/restore feature. Reports can be copied/exported; clearing storage or uninstalling may erase personal data. Android and browser installations have separate storage. Invalid saved favorites, errands, reports, or bag checks fall back to defaults and attempt to retain the original value under a recovery key.

Phone calls require phone service. External maps and source pages need their own connection or supported offline service. Sharing uses browser/WebView capabilities with a clipboard fallback; check it on the target phone.

Directory data lives in `src/data/mlangDirectory.ts`. All current listings are provisional. Source notes dated October 16, 2026 record the online contact-source review described in those entries; they do not claim current office confirmation. No current listing requirement is marked confirmed. Unsourced phone numbers are withheld from calling controls.

When updating a listing, record which fields the evidence supports, link the source, and use the date of the actual review. Keep unknown details provisional. A public directory citation, personal visit marker, or saved correction does not establish that all listing details were verified.
