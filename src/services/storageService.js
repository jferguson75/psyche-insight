import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  CONVERSATION_HISTORY: '@psych_insight:conversation_history',
  USER_PREFERENCES: '@psych_insight:user_preferences',
  CURRENT_SESSION: '@psych_insight:current_session'
};

/**
 * Save conversation history to local storage
 */
export const saveConversationHistory = async (userId, history) => {
  try {
    const key = `${STORAGE_KEYS.CONVERSATION_HISTORY}_${userId}`;
    await AsyncStorage.setItem(key, JSON.stringify(history));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Load conversation history from local storage
 */
export const loadConversationHistory = async (userId) => {
  try {
    const key = `${STORAGE_KEYS.CONVERSATION_HISTORY}_${userId}`;
    const data = await AsyncStorage.getItem(key);
    return { success: true, data: data ? JSON.parse(data) : [] };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Save user preferences
 */
export const saveUserPreferences = async (userId, preferences) => {
  try {
    const key = `${STORAGE_KEYS.USER_PREFERENCES}_${userId}`;
    await AsyncStorage.setItem(key, JSON.stringify(preferences));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Load user preferences
 */
export const loadUserPreferences = async (userId) => {
  try {
    const key = `${STORAGE_KEYS.USER_PREFERENCES}_${userId}`;
    const data = await AsyncStorage.getItem(key);
    return { 
      success: true, 
      data: data ? JSON.parse(data) : { audioEnabled: true, theme: 'dark' } 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Save current session state
 */
export const saveCurrentSession = async (userId, sessionData) => {
  try {
    const key = `${STORAGE_KEYS.CURRENT_SESSION}_${userId}`;
    await AsyncStorage.setItem(key, JSON.stringify(sessionData));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Load current session state
 */
export const loadCurrentSession = async (userId) => {
  try {
    const key = `${STORAGE_KEYS.CURRENT_SESSION}_${userId}`;
    const data = await AsyncStorage.getItem(key);
    return { success: true, data: data ? JSON.parse(data) : null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Clear all user data (for logout)
 */
export const clearUserData = async (userId) => {
  try {
    const keys = Object.values(STORAGE_KEYS).map(key => `${key}_${userId}`);
    await AsyncStorage.multiRemove(keys);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
