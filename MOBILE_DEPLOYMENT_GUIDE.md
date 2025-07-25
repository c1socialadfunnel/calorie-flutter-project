# Mobile App Deployment Guide for Calorie.Help

This guide will help you deploy your Calorie.Help app to Android and iOS using CodeMagic CI/CD.

## Prerequisites

1. **CodeMagic Account**: Sign up at [codemagic.io](https://codemagic.io)
2. **Google Play Console Account** (for Android)
3. **Apple Developer Account** (for iOS)
4. **App Store Connect Access** (for iOS)

## Project Setup

### 1. Repository Setup
- Push your Flutter project to GitHub, GitLab, or Bitbucket
- Ensure your `pubspec.yaml` and mobile files are properly configured

### 2. App Icons
- Create app icons in different sizes
- Place them in `assets/icon/app_icon.png`
- Run: `flutter pub get && flutter pub run flutter_launcher_icons:main`

## Android Setup

### 1. Google Play Console
1. Create a new app in Google Play Console
2. Set package name as `com.calorie.help`
3. Upload initial APK manually for the first release

### 2. Signing Key
1. Generate a signing key:
```bash
keytool -genkey -v -keystore ~/upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

2. Create `android/key.properties`:
```
storePassword=your_store_password
keyPassword=your_key_password
keyAlias=upload
storeFile=upload-keystore.jks
```

3. Upload keystore to CodeMagic:
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

## CodeMagic Configuration

### 1. Connect Repository
1. In CodeMagic, click "Add application"
2. Connect your Git repository
3. Select Flutter as the project type

### 2. Environment Variables
Set these in CodeMagic → App Settings → Environment variables:

**Android:**
- `GOOGLE_PLAY_TRACK`: `internal` or `production`
- `PACKAGE_NAME`: `com.calorie.help`

**iOS:**
- `BUNDLE_ID`: `com.calorie.help`
- `APP_STORE_CONNECT_ISSUER_ID`: Your issuer ID
- `APP_STORE_CONNECT_KEY_IDENTIFIER`: Your key ID
- `APP_STORE_CONNECT_PRIVATE_KEY`: Your private key

### 3. Build Configuration
The `codemagic.yaml` file is already configured. Update these values:
- Replace `your-email@example.com` with your email
- Update App Store Connect credentials
- Adjust build settings as needed

## Common iOS Issues & Solutions

### 1. App Crashes on Launch
**Problem**: App opens then immediately crashes
**Solutions**:
- Check Info.plist permissions are correctly set
- Ensure bundle ID matches everywhere
- Verify signing certificates are valid
- Check for missing frameworks

### 2. WebView Issues
**Problem**: WebView doesn't load or crashes
**Solutions**:
- Add network permissions in Info.plist
- Set `NSAppTransportSecurity` to allow HTTP if needed
- Ensure camera permissions are properly requested

### 3. Build Failures
**Problem**: iOS build fails in CodeMagic
**Solutions**:
- Check Xcode version compatibility
- Verify all certificates are valid and not expired
- Ensure provisioning profiles include all devices
- Check for missing dependencies

## Deployment Steps

### 1. Initial Setup
1. Configure `codemagic.yaml` with your credentials
2. Test build locally: `flutter build apk` and `flutter build ios`
3. Commit and push changes

### 2. First Build
1. In CodeMagic, start a build for both workflows
2. Monitor build logs for any issues
3. Fix any configuration problems

### 3. Testing
1. Download APK/IPA from CodeMagic artifacts
2. Test on physical devices
3. Verify all features work correctly

### 4. Store Submission
1. Android: APK automatically uploads to Google Play internal track
2. iOS: IPA automatically uploads to TestFlight
3. Promote to production when ready

## Troubleshooting

### Android Issues
- **Build fails**: Check signing configuration and Gradle version
- **Upload fails**: Verify service account permissions
- **App crashes**: Check permissions in AndroidManifest.xml

### iOS Issues
- **Signing errors**: Regenerate certificates and provisioning profiles
- **WebView crashes**: Check Info.plist permissions
- **Build timeout**: Increase build duration in CodeMagic

### General Issues
- **Network errors**: Check your web app URL is accessible
- **Permission denied**: Verify all required permissions are requested
- **Performance issues**: Optimize WebView settings

## Best Practices

1. **Testing**: Always test on physical devices before release
2. **Versioning**: Use semantic versioning (1.0.0, 1.0.1, etc.)
3. **Monitoring**: Set up crash reporting (Firebase Crashlytics)
4. **Updates**: Plan for regular updates and bug fixes
5. **Store Optimization**: Prepare good screenshots and descriptions

## Support

If you encounter issues:
1. Check CodeMagic documentation
2. Review build logs carefully
3. Test locally before pushing to CI/CD
4. Contact CodeMagic support for platform-specific issues

## Next Steps

After successful deployment:
1. Set up analytics (Firebase Analytics)
2. Implement crash reporting
3. Plan for app updates and new features
4. Monitor user feedback and reviews
5. Optimize app store listings for better discoverability
