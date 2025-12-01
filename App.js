import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { observeAuthState, handleRedirectResult } from './src/services/authService';

// Screens
import LandingScreen from './src/screens/LandingScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import InterviewScreen from './src/screens/InterviewScreen';

const Stack = createNativeStackNavigator();

// Separate stacks for auth vs app content
function AuthStackScreens() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: 'fade' }}
    >
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}

function AppStackScreens({ user }) {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: 'fade' }}
    >
      <Stack.Screen name="Interview">
        {(props) => <InterviewScreen {...props} user={user} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

// Configure URL paths for web
const linking = {
  prefixes: [
    'http://localhost:8081',
    'https://psych-insight.web.app',
    'https://psych-insight.firebaseapp.com'
  ],
  config: {
    screens: {
      AuthStack: {
        path: '',
        screens: {
          Landing: '',
          Login: 'login',
          SignUp: 'signup',
        },
      },
      AppStack: {
        path: '',
        screens: {
          Interview: 'interview',
        },
      },
    },
  },
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigationRef = useRef();

  useEffect(() => {
    // Handle Google redirect result on app load
    handleRedirectResult().catch(err => {
      console.log('No redirect result or error:', err);
    });

    // Listen to authentication state changes
    const unsubscribe = observeAuthState((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Force navigation to interview when user becomes authenticated
  useEffect(() => {
    if (user && navigationRef.current && typeof window !== 'undefined') {
      // Check if we're on an auth page
      const currentPath = window.location.pathname;
      if (currentPath === '/login' || currentPath === '/signup' || currentPath === '/') {
        // Use window.history to change URL without page reload
        window.history.pushState({}, '', '/interview');
      }
    }
  }, [user]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking} ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="AppStack">
            {(props) => <AppStackScreens {...props} user={user} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="AuthStack" component={AuthStackScreens} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
});
