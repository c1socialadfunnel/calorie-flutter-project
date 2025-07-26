# Mobile App Deployment Guide for Calorie.Help (Flutter)

This guide will help you deploy your Calorie.Help Flutter app to Android and iOS using CodeMagic CI/CD.

## Prerequisites

1. **CodeMagic Account**: Sign up at [codemagic.io](https://codemagic.io)
2. **Flutter SDK**: Installed on your local machine.
3. **Google Play Console Account** (for Android)
4. **Apple Developer Account** (for iOS)
5. **App Store Connect Access** (for iOS)

## Project Setup

### 1. Repository Setup
- Push your Flutter project to a Git provider (GitHub, GitLab, Bitbucket).
- Ensure your `pubspec.yaml` is up-to-date and all dependencies are listed.
- Run `flutter pub get` to ensure all dependencies are fetched.

### 2. App Icons
- Place your master app icon at `assets/icon/app_icon.png`.
- Use the `flutter_launcher_icons` package to generate platform-specific icons.
- Add configuration to `pubspec.yaml`:
  ```yaml
  flutter_launcher_icons:
    android: "launcher_icon"
    ios: true
    image_path: "assets/icon/app_icon.png"
  ```
- Run the command: `flutter pub run flutter_launcher_icons:main`

## Android Setup

### 1. Google Play Console
1. Create a new app in the Google Play Console.
2. Set the package name to `com.calorie.help`.
3. Complete the store listing and upload an initial APK/AAB manually for the first release.

### 2. Signing Key
1. Generate an upload keystore for signing your app:
   ```bash
   keytool -genkey -v -keystore ~/upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
   ```
2. Create a `key.properties` file in the `android/` directory (and add it to `.gitignore`):
   ```properties
   storePassword=<your_store_password>
   keyPassword=<your_key_password>
   keyAlias=upload
   storeFile=upload-keystore.jks
   ```
3. Upload the `upload-keystore.jks` file and the `key.properties` content to CodeMagic as secure environment variables.

### 3. Service Account
1. In the Google Cloud Console, create a service account with "Google Play Android Developer" permissions.
2. Download the JSON key file.
3. Upload this JSON file to CodeMagic under the Google Play integration.

## iOS Setup

### 1. Apple Developer Account
1. Create an App ID with the bundle identifier `com.calorie.help`.
2. Create development and distribution certificates.
3. Create development and App Store provisioning profiles linked to your App ID.

### 2. App Store Connect
1. In App Store Connect, create a new app with the bundle ID `com.calorie.help`.
2. Fill in all required app information, screenshots, and privacy details.

### 3. CodeMagic iOS Setup
1. Connect your Apple Developer account to CodeMagic in Teams > Integrations.
2. Upload your distribution certificate and provisioning profile to CodeMagic's code signing section.
3. Set up App Store Connect integration using an API key for automated uploads to TestFlight.

## CodeMagic Configuration (`codemagic.yaml`)

A `codemagic.yaml` file should be created in the root of your repository to define the build workflows.

### 1. Connect Repository
1. In CodeMagic, click "Add application" and connect your Git repository.
2. Select Flutter as the project type.

### 2. Environment Variables
Set these in CodeMagic → App Settings → Environment variables:
- `GOOGLE_PLAY_CREDENTIALS`: Contents of your Google Play service account JSON.
- `KEYSTORE_PATH`: `keystores/upload-keystore.jks`
- `KEY_PROPERTIES_PATH`: `keystores/key.properties`
- `APP_STORE_CONNECT_ISSUER_ID`: Your App Store Connect issuer ID.
- `APP_STORE_CONNECT_KEY_IDENTIFIER`: Your App Store Connect key ID.
- `APP_STORE_CONNECT_PRIVATE_KEY`: Your App Store Connect private key.

### 3. Build Configuration Example
```yaml
workflows:
  flutter-android:
    name: Flutter Android Build
    instance_type: mac_mini_m1
    scripts:
      - flutter packages pub get
      - flutter build appbundle --release
    artifacts:
      - build/app/outputs/bundle/release/*.aab
    publishing:
      google_play:
        credentials: $GCLOUD_SERVICE_ACCOUNT_CREDENTIALS
        track: internal

  flutter-ios:
    name: Flutter iOS Build
    instance_type: mac_mini_m1
    integrations:
      app_store_connect: your_integration_name
    scripts:
      - flutter packages pub get
      - flutter build ipa --release
    artifacts:
      - build/ios/ipa/*.ipa
    publishing:
      app_store_connect:
        auth: integration
```

## Deployment Steps

1. **Initial Setup**: Configure `codemagic.yaml` and add all necessary credentials to CodeMagic.
2. **Test Locally**: Ensure you can build successfully on your local machine: `flutter build appbundle` and `flutter build ipa`.
3. **First Build**: Trigger a build in CodeMagic for both Android and iOS workflows. Monitor the logs for any issues.
4. **Testing**: Download the AAB/IPA from CodeMagic artifacts and test on physical devices.
5. **Store Submission**:
   - **Android**: The AAB will be automatically uploaded to the Google Play internal track. Promote it to production when ready.
   - **iOS**: The IPA will be automatically uploaded to TestFlight. Distribute to testers and submit for review when ready.

## Troubleshooting

- **Build Failures**: Check Flutter and Dart version compatibility. Ensure all dependencies in `pubspec.yaml` are valid.
- **Android Signing Issues**: Verify that the keystore, alias, and passwords in CodeMagic match the ones used to generate the keystore.
- **iOS Signing Issues**: Ensure the bundle ID is correct and that the provisioning profile and certificate are valid and not expired.
- **Network Errors**: If your app communicates with a backend, ensure the URL is accessible from CodeMagic's build machines.

