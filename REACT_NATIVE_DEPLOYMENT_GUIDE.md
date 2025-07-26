# React Native Expo Deployment Guide for Calorie.Help

This guide will help you deploy your Calorie.Help React Native Expo app to Android and iOS using Expo Application Services (EAS).

## Prerequisites

1. **Expo Account**: Sign up at [expo.dev](https://expo.dev)
2. **EAS CLI**: Install globally with `npm install -g eas-cli`
3. **Node.js**: Version 16 or higher
4. **Google Play Console Account** (for Android)
5. **Apple Developer Account** (for iOS)

## Project Setup

### 1. Initialize EAS

```bash
# Login to Expo
eas login

# Initialize EAS in your project
eas build:configure
```

This creates an `eas.json` file with build configurations.

### 2. Configure app.json

```json
{
  "expo": {
    "name": "Calorie.Help",
    "slug": "calorie-help",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.calorie.help",
      "buildNumber": "1",
      "infoPlist": {
        "NSCameraUsageDescription": "This app needs camera access to take photos of your food for AI analysis and calorie counting.",
        "NSPhotoLibraryUsageDescription": "This app needs photo library access to select food images for AI analysis and calorie counting.",
        "NSMicrophoneUsageDescription": "This app may need microphone access for camera functionality."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.calorie.help",
      "versionCode": 1,
      "permissions": [
        "android.permission.CAMERA",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "metro"
    },
    "plugins": [
      "expo-camera",
      "expo-image-picker",
      "expo-linking",
      [
        "expo-build-properties",
        {
          "android": {
            "compileSdkVersion": 34,
            "targetSdkVersion": 34,
            "buildToolsVersion": "34.0.0"
          },
          "ios": {
            "deploymentTarget": "13.0"
          }
        }
      ]
    ],
    "scheme": "caloriehelp",
    "extra": {
      "eas": {
        "projectId": "your-eas-project-id"
      }
    }
  }
}
```

### 3. Configure eas.json

```json
{
  "cli": {
    "version": ">= 5.9.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      },
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "your-apple-team-id"
      }
    }
  }
}
```

## Environment Variables

### 1. Create Environment Configuration

Create `app.config.js` to handle environment variables:

```javascript
export default {
  expo: {
    name: "Calorie.Help",
    slug: "calorie-help",
    // ... other config
    extra: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      eas: {
        projectId: "your-eas-project-id"
      }
    }
  }
}
```

### 2. Set Environment Variables in EAS

```bash
# Set environment variables for EAS builds
eas secret:create --scope project --name SUPABASE_URL --value "https://your-project.supabase.co"
eas secret:create --scope project --name SUPABASE_ANON_KEY --value "your-anon-key"
```

### 3. Access Environment Variables in Code

```javascript
import Constants from 'expo-constants'

const supabaseUrl = Constants.expoConfig.extra.supabaseUrl
const supabaseAnonKey = Constants.expoConfig.extra.supabaseAnonKey
```

## Android Setup

### 1. Google Play Console

1. Create a new app in the Google Play Console
2. Set the package name to `com.calorie.help`
3. Complete the store listing with screenshots and descriptions

### 2. Service Account for Automated Uploads

1. Go to Google Cloud Console
2. Create a service account with "Google Play Android Developer" permissions
3. Download the JSON key file as `google-service-account.json`
4. Place it in your project root (add to `.gitignore`)

### 3. Build Android App

```bash
# Build APK for testing
eas build --platform android --profile preview

# Build AAB for production
eas build --platform android --profile production
```

### 4. Submit to Google Play

```bash
# Submit to Google Play internal track
eas submit --platform android --profile production
```

## iOS Setup

### 1. Apple Developer Account

1. Create an App ID with bundle identifier `com.calorie.help`
2. Create development and distribution certificates
3. Create provisioning profiles for development and App Store distribution

### 2. App Store Connect

1. Create a new app in App Store Connect
2. Set the bundle ID to `com.calorie.help`
3. Fill in all required app information and screenshots

### 3. Configure iOS Credentials

```bash
# Configure iOS credentials
eas credentials:configure --platform ios
```

Follow the prompts to set up:
- Distribution certificate
- Provisioning profile
- Push notification key (if needed)

### 4. Build iOS App

```bash
# Build for iOS
eas build --platform ios --profile production
```

### 5. Submit to App Store

```bash
# Submit to App Store Connect
eas submit --platform ios --profile production
```

## Assets and Icons

### 1. App Icon

Create app icons in the following sizes:
- `icon.png`: 1024x1024 (used for iOS and as base)
- `adaptive-icon.png`: 1024x1024 (Android adaptive icon foreground)

### 2. Splash Screen

Create splash screen:
- `splash.png`: 1284x2778 (iPhone 12 Pro Max size, will be scaled)

### 3. Store Assets

Prepare store listing assets:
- Screenshots for different device sizes
- Feature graphic (Android)
- App preview videos (optional)

## Automated Deployment with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to App Stores

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Build Android
        run: eas build --platform android --profile production --non-interactive
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

      - name: Build iOS
        run: eas build --platform ios --profile production --non-interactive
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

      - name: Submit to stores
        run: |
          eas submit --platform android --profile production --non-interactive
          eas submit --platform ios --profile production --non-interactive
```

## Testing and Quality Assurance

### 1. Internal Testing

```bash
# Build for internal testing
eas build --platform all --profile preview

# Share build with testers
eas build:list
```

### 2. TestFlight (iOS) and Internal Testing (Android)

- iOS builds automatically go to TestFlight after submission
- Android builds go to Internal Testing track
- Invite testers and gather feedback

### 3. Staged Rollout

For production releases:
- Start with a small percentage of users
- Monitor crash reports and user feedback
- Gradually increase rollout percentage

## Monitoring and Analytics

### 1. Crash Reporting

Add Sentry for crash reporting:

```bash
npm install @sentry/react-native
```

```javascript
import * as Sentry from '@sentry/react-native'

Sentry.init({
  dsn: 'your-sentry-dsn',
})
```

### 2. Analytics

Add analytics tracking:

```bash
expo install expo-analytics-amplitude
```

### 3. Performance Monitoring

Monitor app performance:
- App load times
- API response times
- User engagement metrics

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check Expo SDK compatibility
   - Verify all dependencies are compatible
   - Check build logs for specific errors

2. **iOS Signing Issues**:
   - Ensure certificates are valid and not expired
   - Check provisioning profile includes all devices
   - Verify bundle ID matches exactly

3. **Android Build Issues**:
   - Check Gradle version compatibility
   - Verify Android SDK versions
   - Ensure all permissions are declared

4. **Environment Variables**:
   - Verify secrets are set correctly in EAS
   - Check variable names match exactly
   - Ensure values are properly encoded

### Getting Help

- Expo Documentation: [docs.expo.dev](https://docs.expo.dev)
- Expo Discord: [chat.expo.dev](https://chat.expo.dev)
- GitHub Issues: Check Expo CLI and EAS CLI repositories

## Post-Launch

### 1. Monitor Performance

- Track app store ratings and reviews
- Monitor crash reports and fix critical issues
- Analyze user engagement and retention

### 2. Updates

```bash
# Over-the-air updates with Expo Updates
eas update --branch production --message "Bug fixes and improvements"
```

### 3. Maintenance

- Regular dependency updates
- Security patches
- Feature enhancements based on user feedback

This deployment guide provides a comprehensive approach to getting your Calorie.Help React Native Expo app into the app stores and maintaining it post-launch.
