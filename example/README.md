# VnMapPlugin Example App

<p align="center">
  <img src="../assets/vnmapplugin_logo.png" width="120"/>
</p>

A demo app showcasing [VnMapPlugin Maps SDK for React Native](../README.md).

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | v22+ (run `nvm use` in repo root) |
| Java (JDK) | 17 |
| Android Studio | Hedgehog or later |
| Android SDK | API 33+ |
| React Native CLI | bundled via `yarn` |

---

## Setup

### 1. Install dependencies

From the **repo root** (not `example/`):

```sh
yarn install
```

### 2. Set your access token

Create a file named `accesstoken` inside `example/` with your VnMapPlugin access token:

```sh
echo "YOUR_ACCESS_TOKEN" > example/accesstoken
```

Then re-run install so the postinstall script picks it up:

```sh
cd example && yarn install
```

---

## Run on Android

### Step 1 — Start Metro bundler

```sh
cd example
yarn start
```

### Step 2 — Run on device or emulator

Open a second terminal:

```sh
cd example
yarn android
```

> Make sure an Android emulator is running or a physical device is connected via USB with USB debugging enabled.
> Verify with: `adb devices`

### Troubleshooting

**Gradle permission denied:**
```sh
cd example/android && chmod +x gradlew
```

**Stale build cache:**
```sh
cd example
yarn purge:android
yarn android
```

**Metro stale after SDK JS changes:**
```sh
cd example
yarn start --reset-cache
```

---

## Run on iOS

### Step 1 — Install pods

```sh
cd example
yarn pod:install
```

### Step 2 — Run

```sh
cd example
yarn ios
```

---

## Project structure

```
example/
├── accesstoken              # Your access token (gitignored)
├── src/
│   ├── App.js               # App entry, navigation setup
│   ├── examples/            # Map examples grouped by feature
│   │   ├── Animations/
│   │   ├── Annotations/
│   │   ├── Camera/
│   │   ├── FillRasterLayer/
│   │   ├── LineLayer/
│   │   ├── Map/
│   │   ├── SymbolCircleLayer/
│   │   ├── UserLocation/
│   │   └── V10/ V11/
│   └── scenes/              # Navigation screens
└── android/                 # Android native project
```
