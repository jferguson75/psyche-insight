import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { auth } from '../config/firebase';
import { logOut } from '../services/authService';
import { 
  saveConversationHistory, 
  loadConversationHistory,
  saveCurrentSession,
  loadCurrentSession 
} from '../services/storageService';

/**
 * CORE 10 QUESTIONS LIST
 */
const CORE_QUESTIONS = [
  "What is the one rule or belief you enforce most strictly on yourself, and if you broke it, what is the deepest fear about yourself that would be realised?",
  "What is the recurring, seemingly minor inconvenience in your life that actually serves a secret, unconscious purpose?",
  "What is a trait in another person that you consistently judge, and in what subtle way do you possess or secretly wish you possessed that same trait?",
  "If you received a substantial inheritance, what is the first thing you would stop doing?",
  "Think back to a recent mistake. What did you tell yourself immediately after, and what does that reveal about your self-worth?",
  "Imagine your 80-year-old self looks at you with regret and says, 'If only you hadn't wasted time on X...' What is X?",
  "What is a possession, routine, or relationship you know is holding you back, but you refuse to let go of?",
  "When was the last time you felt a truly unadulterated emotion (joy, grief, anger) that wasn't influenced by how you thought you 'should' feel?",
  "If you could only have one: Total freedom from fear OR Total certainty of unconditional love. Which do you choose?",
  "Define 'enough' for your life. What evidence are you waiting for to tell you that you've reached it?"
];

const API_KEY = "AIzaSyBcgs-gUacFzu0O1bh-1CBjz1OITI_CnDU"; // Add your Gemini API key

export default function InterviewScreen({ navigation, user }) {
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigation.replace('Login');
    }
  }, [user, navigation]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestionText, setCurrentQuestionText] = useState(CORE_QUESTIONS[0]);
  const [userAnswer, setUserAnswer] = useState("");
  const [conversationHistory, setConversationHistory] = useState([]);
  
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  const scrollViewRef = useRef(null);

  // Load saved session on mount
  useEffect(() => {
    loadSession();
    // Don't auto-play - let user click Play button
  }, []);

  // Save session whenever state changes
  useEffect(() => {
    if (auth.currentUser) {
      saveSession();
    }
  }, [conversationHistory, currentQuestionIndex, currentQuestionText]);

  const loadSession = async () => {
    if (!auth.currentUser) return;
    
    const historyResult = await loadConversationHistory(auth.currentUser.uid);
    const sessionResult = await loadCurrentSession(auth.currentUser.uid);
    
    if (historyResult.success && historyResult.data.length > 0) {
      setConversationHistory(historyResult.data);
    }
    
    if (sessionResult.success && sessionResult.data) {
      setCurrentQuestionIndex(sessionResult.data.questionIndex || 0);
      setCurrentQuestionText(sessionResult.data.questionText || CORE_QUESTIONS[0]);
    }
  };

  const saveSession = async () => {
    if (!auth.currentUser) return;
    
    await saveConversationHistory(auth.currentUser.uid, conversationHistory);
    await saveCurrentSession(auth.currentUser.uid, {
      questionIndex: currentQuestionIndex,
      questionText: currentQuestionText
    });
  };

  const speakText = (text) => {
    if (!audioEnabled || Platform.OS === 'web') return;
    
    Speech.speak(text, {
      rate: 0.9,
      pitch: 1.0,
      onStart: () => setIsSpeaking(true),
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
    });
  };

  const stopSpeaking = () => {
    if (Platform.OS !== 'web') {
      Speech.stop();
      setIsSpeaking(false);
    }
  };

  const toggleListening = () => {
    // Voice recognition is complex on mobile, showing alert for now
    Alert.alert(
      'Voice Input',
      'Voice recognition requires additional setup on mobile. Please use text input for now.',
      [{ text: 'OK' }]
    );
  };

  const callGeminiAPI = async (prompt) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`;
    
    const payload = {
      contents: [{ parts: [{ text: prompt }] }]
    };

    const delays = [1000, 2000, 4000, 8000];
    for (let i = 0; i < delays.length; i++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
      } catch (error) {
        if (i === delays.length - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delays[i]));
      }
    }
  };

  const handleNext = async () => {
    if (!userAnswer.trim()) {
      Alert.alert('Please Answer', 'Please provide an answer before continuing');
      return;
    }

    setIsThinking(true);
    stopSpeaking();

    const newHistory = [...conversationHistory, { 
      question: currentQuestionText, 
      answer: userAnswer,
      timestamp: new Date().toISOString()
    }];
    setConversationHistory(newHistory);

    try {
      const nextCoreQ = CORE_QUESTIONS[(currentQuestionIndex + 1) % CORE_QUESTIONS.length];
      
      const systemPrompt = `
        You are an expert psychologist conducting a deep self-discovery interview.
        
        User's last answer: "${userAnswer}"
        Current Question was: "${currentQuestionText}"
        Next planned standard question: "${nextCoreQ}"
        
        TASK:
        Analyse the user's answer. 
        1. If the answer was short, superficial, or unclear, return "NEXT_STANDARD".
        2. If the answer was deep, emotional, or revealed a contradiction, generate a specific, short, powerful follow-up question to dig deeper.
        
        Output ONLY the question text or "NEXT_STANDARD".
      `;

      const aiResponse = await callGeminiAPI(systemPrompt);
      
      let nextQuestionToAsk = nextCoreQ;
      let nextIndex = currentQuestionIndex + 1;

      if (aiResponse && !aiResponse.includes("NEXT_STANDARD") && aiResponse.length > 10) {
        nextQuestionToAsk = aiResponse.replace(/['"]+/g, '');
        nextIndex = currentQuestionIndex;
      } else {
        nextIndex = currentQuestionIndex + 1;
      }

      setCurrentQuestionIndex(nextIndex);
      setCurrentQuestionText(nextQuestionToAsk);
      setUserAnswer("");
      // Don't auto-play - let user click Play button

    } catch (error) {
      console.error("AI Error:", error);
      const nextQ = CORE_QUESTIONS[(currentQuestionIndex + 1) % CORE_QUESTIONS.length];
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentQuestionText(nextQ);
      setUserAnswer("");
      // Don't auto-play - let user click Play button
    } finally {
      setIsThinking(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? Your data is saved locally.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            const result = await logOut();
            if (!result.success) {
              Alert.alert('Error', result.error || 'Failed to logout');
            }
            // No need to navigate - auth state observer in App.js will handle it
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#0f172a', '#1e1b4b', '#312e81']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.logo}>🧠 PSYCHE.AI</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              onPress={() => setAudioEnabled(!audioEnabled)}
              style={styles.iconButton}
            >
              <Text style={styles.iconText}>{audioEnabled ? '🔊' : '🔇'}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleLogout}
              style={styles.iconButton}
            >
              <Text style={styles.iconText}>🚪</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Content Card Container */}
          <View style={styles.contentCard}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
            <View style={[styles.avatarRing, isListening && styles.avatarRingActive]} />
            <View style={[styles.avatarRing2, isListening && styles.avatarRing2Active]} />
            <View style={[styles.avatar, isSpeaking && styles.avatarSpeaking]}>
              <Text style={styles.avatarIcon}>
                {isThinking ? '⟳' : isListening ? '🎤' : '✨'}
              </Text>
            </View>
          </View>

          {/* Question */}
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>"{currentQuestionText}"</Text>
            <TouchableOpacity 
              onPress={() => speakText(currentQuestionText)}
              style={styles.playButton}
              disabled={isSpeaking}
            >
              <Text style={styles.playButtonIcon}>{isSpeaking ? '⏸' : '▶️'}</Text>
              <Text style={styles.playButtonText}>{isSpeaking ? 'Playing...' : 'Play Question'}</Text>
            </TouchableOpacity>
            {currentQuestionIndex >= CORE_QUESTIONS.length && (
              <Text style={styles.extendedBadge}>EXTENDED SESSION</Text>
            )}
          </View>

          {/* Input Area */}
          <View style={styles.inputCard}>
            <TextInput
              value={userAnswer}
              onChangeText={setUserAnswer}
              placeholder="Speak your answer or type here..."
              placeholderTextColor="#64748b"
              style={styles.textInput}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            
            <View style={styles.controlsContainer}>
              <View style={styles.statusContainer}>
                {isListening ? (
                  <Text style={styles.listeningText}>● Listening...</Text>
                ) : (
                  <Text style={styles.hintText}>Tap microphone to speak</Text>
                )}
              </View>

              <View style={styles.buttonGroup}>
                <TouchableOpacity 
                  onPress={toggleListening}
                  style={[styles.micButton, isListening && styles.micButtonActive]}
                >
                  <Text style={styles.micIcon}>{isListening ? '⏹' : '🎤'}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={handleNext}
                  disabled={!userAnswer.trim() || isThinking}
                  style={[
                    styles.nextButton, 
                    (!userAnswer.trim() || isThinking) && styles.nextButtonDisabled
                  ]}
                >
                  {isThinking ? (
                    <ActivityIndicator color="#0f172a" />
                  ) : (
                    <Text style={styles.nextButtonText}>Next →</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              {CORE_QUESTIONS.map((_, idx) => (
                <View 
                  key={idx} 
                  style={[
                    styles.progressDot,
                    idx < currentQuestionIndex && styles.progressDotCompleted,
                    idx === currentQuestionIndex && styles.progressDotCurrent
                  ]}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
  },
  headerLeft: {},
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  logo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
  },
  iconButton: {
    padding: 8,
  },
  iconText: {
    fontSize: 20,
  },
  scrollContent: {
    paddingHorizontal: Platform.OS === 'web' ? 20 : 24,
    paddingVertical: 40,
    alignItems: 'center',
    flexGrow: 1,
  },
  contentCard: {
    width: '100%',
    maxWidth: 900,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 24,
    padding: Platform.OS === 'web' ? 48 : 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 10,
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(10px)',
    }),
  },
  avatarContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
  },
  avatarRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  avatarRingActive: {
    transform: [{ scale: 1.1 }],
    opacity: 1,
  },
  avatarRing2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  avatarRing2Active: {
    transform: [{ scale: 1.25 }],
    opacity: 0.8,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSpeaking: {
    transform: [{ scale: 1.05 }],
  },
  avatarIcon: {
    fontSize: 36,
  },
  questionContainer: {
    marginBottom: 30,
    minHeight: 100,
  },
  questionText: {
    fontSize: 22,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 32,
    fontWeight: '300',
    marginBottom: 16,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
    alignSelf: 'center',
    marginBottom: 8,
  },
  playButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  playButtonText: {
    color: '#a78bfa',
    fontSize: 14,
    fontWeight: '600',
  },
  extendedBadge: {
    fontSize: 10,
    color: '#a78bfa',
    textAlign: 'center',
    marginTop: 12,
    letterSpacing: 2,
  },
  inputCard: {
    width: '100%',
    backgroundColor: 'rgba(30, 27, 75, 0.8)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    marginBottom: 20,
  },
  textInput: {
    color: '#ffffff',
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  controlsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.2)',
  },
  statusContainer: {
    marginBottom: 12,
  },
  listeningText: {
    color: '#ef4444',
    fontSize: 12,
  },
  hintText: {
    color: '#64748b',
    fontSize: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  micButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButtonActive: {
    backgroundColor: '#ef4444',
  },
  micIcon: {
    fontSize: 24,
  },
  nextButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    justifyContent: 'center',
    minWidth: 100,
  },
  nextButtonDisabled: {
    backgroundColor: '#334155',
    opacity: 0.5,
  },
  nextButtonText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 30,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#334155',
  },
  progressDotCompleted: {
    width: 32,
    backgroundColor: '#8b5cf6',
  },
  progressDotCurrent: {
    width: 32,
    backgroundColor: '#ffffff',
  },
});
