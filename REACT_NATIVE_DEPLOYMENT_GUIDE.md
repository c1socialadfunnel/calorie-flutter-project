# React Native Expo App Deployment Guide for Calorie.Help

This guide will help you deploy your Calorie.Help React Native Expo app to Android and iOS using CodeMagic CI/CD.

## Prerequisites

1. **CodeMagic Account**: Sign up at [codemagic.io](https://codemagic.io)
2. **Expo Account**: Sign up at [expo.dev](https://expo.dev)
3. **Google Play Console Account** (for Android)
4. **Apple Developer Account** (for iOS)
5. **EAS CLI**: Install with `npm install -g @expo/cli`

## Project Setup

### 1. Expo Configuration
The app is configured as a React Native Expo app with:
- **Package Name**: `com.calorie.help`
- **App Name**: "Calorie.Help"
- **Camera permissions** for food photo capture
- **Image picker** for selecting photos
- **Native navigation** with bottom tabs

### 2. Install Dependencies
```bash
npm install
```

### 3. Test Locally
```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios
```

## CodeMagic Setup

### 1. Connect Repository
1. In CodeMagic, click "Add application"
2. Connect your Git repository
3. Select React Native as the project type

### 2. Environment Variables
Set these in CodeMagic → App Settings → Environment variables:

**For Expo Build:**
- `EXPO_TOKEN`: Your Expo access token (get from expo.dev)

**For Android:**
- `GOOGLE_PLAY_TRACK`: `internal` or `production`
- `PACKAGE_NAME`: `com.calorie.help`

**For iOS:**
- `BUNDLE_ID`: `com.calorie.help`
- `APP_STORE_CONNECT_ISSUER_ID`: Your issuer ID
- `APP_STORE_CONNECT_KEY_IDENTIFIER`: Your key ID
- `APP_STORE_CONNECT_PRIVATE_KEY`: Your private key

### 3. Build Workflows
The `codemagic.yaml` includes three workflows:

1. **react-native-android**: Native Android build
2. **react-native-ios**: Native iOS build  
3. **expo-build**: Expo managed build (recommended)

## Android Setup

### 1. Google Play Console
1. Create a new app in Google Play Console
2. Set package name as `com.calorie.help`
3. Upload initial APK manually for the first release

### 2. Signing Key (for native builds)
1. Generate a signing key:
```bash
keytool -genkey -v -keystore upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

2. Upload keystore to CodeMagic:
   - Go to CodeMagic → Teams → Personal Account → Integrations
   - Add Android code signing certificate

### 3. Service Account
1. In Google Cloud Console, create a service account
2. Download JSON key file
3. Upload to CodeMagic under Google Play integration

## iOS Setup

### 1. Apple Developer Account
1. Create App ID: `com.calorie.help`
2. Create provisioning profiles for development and distribution
3. Create certificates for development and distribution

### 2. App Store Connect
1. Create new app with bundle ID `com.calorie.help`
2. Set up app information, screenshots, etc.

### 3. CodeMagic iOS Setup
1. Connect Apple Developer account to CodeMagic
2. Upload certificates and provisioning profiles
3. Set up App Store Connect integration

## Expo EAS Build (Recommended)

### 1. Setup EAS
```bash
# Install EAS CLI
npm install -g @expo/cli

# Login to Expo
npx expo login

# Configure EAS
npx eas build:configure
```

### 2. Update EAS Configuration
Update `eas.json` with your specific settings:
- Apple Team ID
- App Store Connect App ID
- Service account key path

### 3. Build Commands
```bash
# Build for Android
npx eas build --platform android

# Build for iOS
npx eas build --platform ios

# Build for both platforms
npx eas build --platform all
```

## App Features

### Core Functionality
- **Authentication**: Supabase Auth integration
- **Food Logging**: Camera capture and image picker
- **AI Analysis**: Integration with backend Supabase functions
- **Health Coach**: Chat interface with AI
- **Progress Tracking**: Dashboard with nutrition data
- **Profile Management**: User settings and subscription

### Native Features
- **Camera Access**: For food photo capture
- **Image Picker**: For selecting existing photos
- **Push Notifications**: Ready for implementation
- **Deep Linking**: Configured for app store links
- **Offline Support**: Basic offline functionality

## Deployment Steps

### 1. Prepare for Release
1. Update version in `app.json`
2. Test on physical devices
3. Prepare app store assets (icons, screenshots, descriptions)

### 2. Build with CodeMagic
1. Push code to repository
2. Trigger build in CodeMagic
3. Monitor build logs
4. Download artifacts for testing

### 3. Store Submission
1. **Android**: APK automatically uploads to Google Play internal track
2. **iOS**: IPA automatically uploads to TestFlight
3. Test with internal testers
4. Submit for review when ready

## Troubleshooting

### Common Issues

**Build Failures:**
- Check Node.js version compatibility
- Verify all dependencies are installed
- Ensure Expo SDK version matches

**Android Issues:**
- Verify package name consistency
- Check signing configuration
- Ensure proper permissions in app.json

**iOS Issues:**
- Verify bundle identifier matches everywhere
- Check provisioning profiles are valid
- Ensure proper Info.plist permissions

**Expo Issues:**
- Update to latest Expo SDK
- Clear Expo cache: `npx expo start --clear`
- Check EAS build logs for specific errors

### Performance Optimization

1. **Bundle Size**: Use Expo's bundle analyzer
2. **Images**: Optimize image assets
3. **Dependencies**: Remove unused packages
4. **Code Splitting**: Implement lazy loading where possible

## Production Checklist

- [ ] Test on physical Android and iOS devices
- [ ] Verify all permissions work correctly
- [ ] Test camera and image picker functionality
- [ ] Verify API integration with backend
- [ ] Test authentication flow
- [ ] Check subscription integration
- [ ] Prepare app store listings
- [ ] Set up crash reporting (optional)
- [ ] Configure analytics (optional)

## Next Steps

After successful deployment:
1. Monitor app performance and crashes
2. Gather user feedback
3. Plan feature updates
4. Optimize based on usage analytics
5. Maintain regular updates for security and features

## Support Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [CodeMagic Documentation](https://docs.codemagic.io/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)

This React Native Expo app provides a native mobile experience while leveraging your existing Supabase backend infrastructure.
