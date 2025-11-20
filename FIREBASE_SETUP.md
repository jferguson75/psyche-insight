# Firebase Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select existing project
3. Follow the setup wizard

## Step 2: Enable Authentication

1. In Firebase Console, go to **Build > Authentication**
2. Click "Get Started"
3. Click on "Sign-in method" tab
4. Enable "Email/Password" provider
5. Click "Save"

## Step 3: Create Firestore Database

1. In Firebase Console, go to **Build > Firestore Database**
2. Click "Create database"
3. Select "Start in production mode"
4. Choose your Cloud Firestore location (closest to your users)
5. Click "Enable"

## Step 4: Set Security Rules

1. In Firestore Database, go to the "Rules" tab
2. Replace the rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click "Publish"

## Step 5: Get Web Configuration

1. In Firebase Console, click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>) to add a web app
5. Register your app with a nickname (e.g., "Psyche Insight Web")
6. Copy the `firebaseConfig` object

## Step 6: Update App Configuration

1. Open `src/config/firebase.js`
2. Replace the placeholder values with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Step 7: (Optional) Set up for iOS

1. In Firebase Console Project Settings, add an iOS app
2. Download `GoogleService-Info.plist`
3. Follow Expo's Firebase iOS setup instructions

## Step 8: (Optional) Set up for Android

1. In Firebase Console Project Settings, add an Android app
2. Use package name: `com.psycheinsight.app`
3. Download `google-services.json`
4. Follow Expo's Firebase Android setup instructions

## Firestore Structure

The app will automatically create this structure:

```
users/
  └── {userId}/
      ├── email: string
      ├── displayName: string
      ├── createdAt: timestamp
      └── subscriptionStatus: string ("free")
```

## Testing Authentication

1. Run the app: `npm start`
2. Create a test account through Sign Up
3. Verify user appears in Firebase Console > Authentication
4. Verify user document created in Firestore > users collection

## Common Issues

### "Firebase app not initialized"
- Check that firebase.js is correctly configured
- Ensure all config values are correct (no placeholder text)

### "Permission denied" on Firestore
- Verify security rules are published
- Check that user is authenticated before accessing Firestore

### "API key not valid"
- Copy the entire API key without extra spaces
- Make sure you're using the web API key, not restricted keys

## Security Best Practices

1. **Never commit** your Firebase config to public repositories
2. Set up **Firebase App Check** for production
3. Use **environment variables** for sensitive data
4. Enable **multi-factor authentication** for admin accounts
5. Regularly review **Security Rules** in Firebase Console
6. Monitor **Usage and Billing** to detect unusual activity

## Next Steps for Production

- [ ] Set up Firebase App Check
- [ ] Configure custom domain for Firebase Auth
- [ ] Set up error monitoring (Crashlytics)
- [ ] Configure analytics
- [ ] Set up backup strategy for Firestore
- [ ] Review and tighten security rules
- [ ] Enable audit logging
