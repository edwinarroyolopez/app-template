# template-app — `src/`

Active navigation uses `starter-public`, `starter-protected`, `system-design`, and `auth` only. Heavy **example / legacy** code is under `src/quarantine/legacy-domain/` (workspace-directory sample, operational context store, local caches). Remaining folders under `modules/` outside those starters are sample domains; delete or replace when you instantiate a product (see `ai/instructions/starter-semantics.md` and `ai/instructions/project-context.template.md`).

---

npx react-native start --reset-cache

npx react-native log-android

adb reverse tcp:8081 tcp:8081

yarn android


npx react-native run-android


# logs
npx react-native log-android | sed -n '1,120p'


/home/zeroed/my-release-key.keystore



# release version
keytool -genkey -v -keystore ~/my-release-key.keystore -alias panalbee_key -keyalg RSA -keysize 2048 -validity 10000


# keytool -genkey -v -keystore ~/my-release-key.keystore -alias panalbee_key -keyalg RSA -keysize 2048 -validity 10000


# to firebase
keytool -list -v -keystore ~/my-release-key.keystore -alias panalbee_key


# copiar keys al proyecto
# desde la raíz del repo (opcional)
cp ~/my-release-key.keystore android/app/my-release-key.keystore

# añade estas líneas a android/gradle.properties (edítalas con tus contraseñas)
cat >> android/gradle.properties <<EOF
MYAPP_UPLOAD_STORE_FILE=my-release-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=panalbee_key
MYAPP_UPLOAD_STORE_PASSWORD=tu_store_password
MYAPP_UPLOAD_KEY_PASSWORD=tu_key_password
EOF



# regenerar buil

    rm -rf android/.cxx
    rm -rf android/app/.cxx
    rm -rf android/build
    rm -rf android/app/build
    rm -rf ~/.gradle/caches
    rm -rf android/app/.cxx
    rm -rf ~/.gradle/caches/9.0.0
    rm -rf ~/.gradle/kotlin
    rm -rf ~/.gradle/daemon
    rm -rf ~/.gradle/caches/modules-2/files-2.1
    # (opcional) si quieres forzar todo:
    rm -rf node_modulesc
    yarn install   # o npm install
    npm install --legacy-peer-deps
    

# Generar apk

cd android
./gradlew clean
./gradlew assembleRelease


# Generar bundle
cd android
./gradlew clean
./gradlew bundleRelease


# debug
adb logcat | grep -i negocio




# Remove the android build folders
rm -rf android/app/build
rm -rf android/build

# Remove the specific native build cache for nitro-modules
rm -rf node_modules/react-native-nitro-modules/android/.cxx
rm -rf node_modules/react-native-nitro-modules/android/build



# versionamiento
PanalbeeMobile/android/app/build.gradle





# para publicar

# https://console.cloud.google.com/
# IAM & Admin → Service Accounts
# Create Service Account
# play-integrity / Play Console verifier service account (replace paths when you ship)
# Keys → Add Key → Create new key

# export GOOGLE_APPLICATION_CREDENTIALS=/path/to/your-service-account.json




zeroed@zero-ed-coder:~/Coder/PanalbeeMobile/android/app/build/outputs/apk/release$ adb -s 4f80d2bb uninstall com.panalbeemobile
Success
zeroed@zero-ed-coder:~/Coder/PanalbeeMobile/android/app/build/outputs/apk/release$ adb -s 4f80d2bb install -r app-release.apk




# install apk -> carpeta donde queda la apk
cd PanalbeeMobile/android/app/build/outputs/apk/release



# lista dispositivos
adb devices

# reemplaza la anterios
adb install -r app-release.apk

adb -s 4f80d2bb uninstall com.panalbeemobile

adb -s 4f80d2bb install -r app-release.apk





# Registrar token
curl -s -X POST "https://backend-ecommerce-production-ce65.up.railway.app/api/firebase-notifications/register-token" \
  -H "Content-Type: application/json" \
  -d '{"userId":"ed-android-1","token":"dPh9BDr-QoaV4SuXyvOaKS:APA91bGUmsKvQ2Z-DfHC9kcgYmlXFM1mjXa2gY5E0sW492VjNwrPNVuIZS84vJSsco56QOg3ygZ43rXCyK4PoTXO9CA6BrFmT2XRgciSy2hiSHLZv44Y7Gw"}' | jq



###

curl -s -X POST "https://backend-ecommerce-production-ce65.up.railway.app/api/firebase-notifications/register-token" \
  -H "Content-Type: application/json" \
  -d '{"userId":"ed-android-1","token":"dPh9BDr-QoaV4SuXyvOaKS:APA91bGUmsKvQ2Z-DfHC9kcgYmlXFM1mjXa2gY5E0sW492VjNwrPNVuIZS84vJSsco56QOg3ygZ43rXCyK4PoTXO9CA6BrFmT2XRgciSy2hiSHLZv44Y7Gw"}' | jq




curl -s -X POST "https://backend-ecommerce-production-ce65.up.railway.app/api/firebase-notifications/send" \
  -H "Content-Type: application/json" \
  -d '{
    "token":"dPh9BDr-QoaV4SuXyvOaKS:APA91bGUmsKvQ2Z-DfHC9kcgYmlXFM1mjXa2gY5E0sW492VjNwrPNVuIZS84vJSsco56QOg3ygZ43rXCyK4PoTXO9CA6BrFmT2XRgciSy2hiSHLZv44Y7Gw",
    "title":"Prueba directa",
    "message":"Llega esto al emulador?"
  }' | jq



This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
