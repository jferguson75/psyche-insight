# Deployment Guide

## Prerequisites

- Expo account (create at https://expo.dev)
- Apple Developer account ($99/year) for iOS
- Google Play Developer account ($25 one-time) for Android
- Domain name (optional, for custom web hosting)

## Building the App

### 1. Install EAS CLI

```bash
npm install -g eas-cli
```

### 2. Login to Expo

```bash
eas login
```

### 3. Configure EAS Build

```bash
eas build:configure
```

This creates an `eas.json` file with build configurations.

## iOS Deployment

### Build for iOS

```bash
# Development build
eas build --platform ios --profile development

# Production build for App Store
eas build --platform ios --profile production
```

### Submit to App Store

1. Build the production version
2. Download the `.ipa` file
3. Use Transporter app or:

```bash
eas submit --platform ios
```

Follow prompts for App Store Connect credentials.

### App Store Requirements

- App icon (1024x1024)
- Screenshots for all device sizes
- Privacy policy URL
- App description and keywords
- Age rating

## Android Deployment

### Build for Android

```bash
# Development build
eas build --platform android --profile development

# Production build for Play Store
eas build --platform android --profile production
```

### Submit to Google Play

```bash
eas submit --platform android
```

### Play Store Requirements

- App icon (512x512)
- Feature graphic (1024x500)
- Screenshots (at least 2)
- Privacy policy URL
- Content rating questionnaire

## Web Deployment

### Option 1: Expo Hosting (Easiest)

```bash
# Build for web
expo build:web

# Deploy to Expo hosting
expo publish:web
```

Your app will be available at: `https://your-username.github.io/your-repo`

### Option 2: Static Hosting (Vercel, Netlify)

1. **Build the web bundle:**
```bash
expo export:web
```

2. **Deploy the `web-build` folder:**

**Vercel:**
```bash
npm i -g vercel
vercel --prod
```

**Netlify:**
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=web-build
```

### Option 3: Custom Server

1. Build: `expo export:web`
2. Upload `web-build` folder to your server
3. Configure server to serve `index.html` for all routes

**Nginx example:**
```nginx
server {
    listen 80;
    server_name psyche-insight.com;
    root /var/www/psyche-insight/web-build;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Environment Variables for Production

### Create production environment file

`.env.production`:
```bash
GEMINI_API_KEY=your_production_key
```

### Use in build

Update `app.json`:
```json
{
  "expo": {
    "extra": {
      "geminiApiKey": process.env.GEMINI_API_KEY
    }
  }
}
```

Access in code:
```javascript
import Constants from 'expo-constants';
const API_KEY = Constants.expoConfig.extra.geminiApiKey;
```

## EAS.json Configuration Example

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_ENV": "production"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCD123456"
      },
      "android": {
        "serviceAccountKeyPath": "./path-to-service-account.json",
        "track": "production"
      }
    }
  }
}
```

## Pre-Deployment Checklist

- [ ] Firebase configured with production credentials
- [ ] Gemini API key set up for production (with billing)
- [ ] All environment variables secured
- [ ] App icon and splash screen created
- [ ] Privacy policy and terms of service pages
- [ ] Analytics configured
- [ ] Error tracking set up (Sentry, Crashlytics)
- [ ] App tested on physical devices
- [ ] Performance optimizations applied
- [ ] Security audit completed
- [ ] Backup strategy implemented

## Post-Deployment

### Monitor Your App

1. **Firebase Console**: User sign-ups, authentication issues
2. **Expo Dashboard**: Build status, updates
3. **App Store Connect**: Downloads, reviews, crashes
4. **Google Play Console**: Statistics, reviews, ANRs
5. **Analytics**: User behavior, retention

### Push Updates (Over-the-Air)

For minor updates without rebuilding:

```bash
eas update --branch production --message "Bug fixes"
```

Users will receive updates automatically.

## Estimated Costs

### Development
- **Expo**: Free (standard plan)
- **Firebase**: Free (Spark plan) for small scale
- **Gemini AI**: Pay-per-use (~$0.001/request)

### Production
- **iOS**: $99/year (Apple Developer)
- **Android**: $25 one-time (Google Play)
- **Expo**: $29/month (Production plan recommended)
- **Firebase**: $25-100/month (Blaze plan as you scale)
- **Hosting**: $0-20/month (depends on provider)

### Total First Year: ~$500-1000

## Scaling Considerations

As your app grows:
1. Upgrade to Firebase Blaze plan
2. Implement caching for API calls
3. Add CDN for web assets
4. Set up load balancing
5. Monitor and optimize Firestore reads/writes
6. Consider dedicated backend for heavy operations

## Support & Maintenance

- Set up automated testing (Jest, Detox)
- Create staging environment
- Document release process
- Plan for OS updates (iOS, Android)
- Schedule regular security audits

---

**Need Help?**
- Expo Documentation: https://docs.expo.dev
- Firebase Documentation: https://firebase.google.com/docs
- React Native Documentation: https://reactnative.dev
