# Psyche Insight - Cross-Platform Psychological Self-Discovery App

A React Native mobile and web application that guides users through AI-powered psychological self-discovery interviews.

## 🎯 Features

- **Cross-Platform**: Runs on iOS, Android, and Web
- **Landing Page**: Introduces the app, its purpose, and target audience
- **Firebase Authentication**: Secure user login and signup
- **Local Storage**: User responses stored locally using AsyncStorage
- **Firestore Integration**: User credentials managed through Firebase
- **AI-Powered Questions**: Dynamic follow-up questions using Google Gemini AI
- **Voice & Text Input**: Flexible input methods for user comfort
- **Session Persistence**: Resume your session where you left off

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac only) or Android Studio for emulator
- Firebase account

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd /Users/jasonferguson/dev/psych-insight
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   
   a. Go to [Firebase Console](https://console.firebase.google.com/)
   
   b. Create a new project or use an existing one
   
   c. Enable Authentication:
      - Go to Authentication > Sign-in method
      - Enable "Email/Password"
   
   d. Create a Firestore Database:
      - Go to Firestore Database
      - Create database in production mode
      - Set up security rules (see below)
   
   e. Get your Firebase config:
      - Go to Project Settings > General
      - Scroll to "Your apps" and select Web app
      - Copy the configuration object
   
   f. Update `src/config/firebase.js` with your Firebase credentials:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

4. **Set up Gemini AI API Key**
   
   a. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   
   b. Update `src/screens/InterviewScreen.js`:
   ```javascript
   const API_KEY = "YOUR_GEMINI_API_KEY";
   ```

5. **Firebase Security Rules**

   Add these rules to your Firestore:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

### Running the App

#### Web
```bash
npm run web
```

#### iOS (Mac only)
```bash
npm run ios
```

#### Android
```bash
npm run android
```

#### General Start (choose platform)
```bash
npm start
```

Then press:
- `w` for web
- `i` for iOS simulator
- `a` for Android emulator
- Scan QR code with Expo Go app on your phone

## 📱 App Structure

```
psych-insight/
├── App.js                          # Main app entry with navigation
├── app.json                        # Expo configuration
├── package.json                    # Dependencies
├── babel.config.js                 # Babel configuration
├── src/
│   ├── config/
│   │   └── firebase.js            # Firebase initialization
│   ├── services/
│   │   ├── authService.js         # Authentication functions
│   │   └── storageService.js      # Local storage functions
│   └── screens/
│       ├── LandingScreen.js       # Landing/welcome page
│       ├── LoginScreen.js         # User login
│       ├── SignUpScreen.js        # User registration
│       └── InterviewScreen.js     # Main interview interface
└── assets/                         # Images and icons (to be added)
```

## 🔐 Authentication Flow

1. User lands on the **Landing Screen**
2. User can **Sign Up** (creates Firebase account + Firestore profile)
3. User can **Login** (authenticates with Firebase)
4. Once authenticated, user is directed to **Interview Screen**
5. Session state is automatically saved and persisted locally

## 💾 Data Storage

### Local Storage (AsyncStorage)
- Conversation history
- Current session state
- User preferences (audio settings, etc.)

### Firestore (Cloud)
- User profile (email, display name, created date)
- Subscription status (for future payment integration)

## 🎨 Design

- **Dark Theme**: Modern, calming dark purple gradient
- **Responsive**: Adapts to all screen sizes
- **Accessibility**: Clear typography and contrast ratios
- **Animations**: Subtle UI feedback for better UX

## 🔮 Future Enhancements

- [ ] Payment/subscription system integration
- [ ] Advanced voice recognition for mobile
- [ ] Export conversation history
- [ ] Analytics dashboard
- [ ] Social sharing features
- [ ] Multiple language support
- [ ] Therapist/coach dashboard
- [ ] iOS and Android app store deployment

## 🛠️ Technologies Used

- **React Native** - Cross-platform mobile framework
- **Expo** - Development toolchain
- **Firebase Authentication** - User management
- **Firestore** - Cloud database
- **AsyncStorage** - Local data persistence
- **React Navigation** - Navigation library
- **Google Gemini AI** - AI-powered question generation
- **Expo Speech** - Text-to-speech
- **Expo Linear Gradient** - Beautiful gradients

## 📄 License

This project is private and proprietary.

## 🤝 Support

For issues or questions, please contact the development team.

---

**Built with ❤️ for self-discovery and personal growth**
