import { auth, db } from '../config/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
  OAuthProvider,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

const RECAPTCHA_SITE_KEY = '6LcoZx0sAAAAALM_RESudX2VhSbvQBGTkhd0K7z9';

/**
 * Get reCAPTCHA token for authentication actions
 */
const getRecaptchaToken = async (action) => {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.grecaptcha) {
    return null; // Skip reCAPTCHA on mobile
  }

  try {
    await new Promise((resolve) => {
      window.grecaptcha.enterprise.ready(resolve);
    });
    
    const token = await window.grecaptcha.enterprise.execute(RECAPTCHA_SITE_KEY, { action });
    return token;
  } catch (error) {
    console.warn('reCAPTCHA error:', error);
    return null;
  }
};

/**
 * Sign up a new user
 */
export const signUp = async (email, password, displayName) => {
  try {
    // Get reCAPTCHA token for SIGNUP action
    const recaptchaToken = await getRecaptchaToken('SIGNUP');
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Store user profile in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      displayName: displayName || email.split('@')[0],
      createdAt: new Date().toISOString(),
      subscriptionStatus: 'free' // For future payment integration
    });
    
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Sign in existing user
 */
export const signIn = async (email, password) => {
  try {
    // Get reCAPTCHA token for LOGIN action
    const recaptchaToken = await getRecaptchaToken('LOGIN');
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Sign out current user
 */
export const logOut = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Get user profile from Firestore
 */
export const getUserProfile = async (uid) => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    } else {
      return { success: false, error: 'No user profile found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async () => {
  try {
    if (Platform.OS === 'web') {
      // Get reCAPTCHA token for GOOGLE_LOGIN action
      const recaptchaToken = await getRecaptchaToken('GOOGLE_LOGIN');
      
      // Web implementation using redirect (more reliable for Expo web)
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      // Trigger the redirect
      await signInWithRedirect(auth, provider);
      // Note: The page will redirect, so this function won't return
      // Result is handled by handleRedirectResult
      return { success: true };
    } else {
      // Mobile implementation - requires additional setup
      // For now, return error with instructions
      return { 
        success: false, 
        error: 'Google Sign-In on mobile requires additional configuration. Please use email/password for now.' 
      };
    }
  } catch (error) {
    console.error('Google sign-in error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Handle redirect result after Google sign-in
 * Call this when the app loads to complete the sign-in process
 */
export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    
    if (result) {
      const user = result.user;
      
      // Create or update user profile in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          displayName: user.displayName || user.email.split('@')[0],
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
          subscriptionStatus: 'free',
          authProvider: 'google'
        });
      }
      
      return { success: true, user };
    }
    
    return { success: false, error: 'No redirect result' };
  } catch (error) {
    console.error('Redirect result error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Auth state observer
 */
export const observeAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};
