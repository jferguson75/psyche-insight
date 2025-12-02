import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyCtIxvChFjA3dAudY6uK2xJCn-vW15v_HA",
  authDomain: "psych-insight.web.app",
  projectId: "psych-insight",
  storageBucket: "psych-insight.firebasestorage.app",
  messagingSenderId: "254295173498",
  appId: "1:254295173498:web:36819bf83b2ed126f90ec3",
  measurementId: "G-74YXT08KCC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence for mobile
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
export default app;
