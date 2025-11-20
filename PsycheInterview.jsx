import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Brain, ChevronRight, Sparkles, RefreshCw } from 'lucide-react';

/**
 * CORE 10 QUESTIONS LIST
 * The foundation of the psychological profile.
 */
const CORE_QUESTIONS = [
  "What is the one rule or belief you enforce most strictly on yourself, and if you broke it, what is the deepest fear about yourself that would be realized?",
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

/**
 * API CONFIGURATION
 * In this environment, the key is injected automatically. 
 * For production, this would be in an environment variable.
 */
const API_KEY = ""; // Automatically injected by runtime

export default function App() {
  // --- State ---
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestionText, setCurrentQuestionText] = useState(CORE_QUESTIONS[0]);
  const [userAnswer, setUserAnswer] = useState("");
  const [conversationHistory, setConversationHistory] = useState([]);
  
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false); // AI Loading state
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const textareaRef = useRef(null);

  // --- Initialization ---
  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setUserAnswer(prev => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      console.warn("Speech Recognition not supported in this browser.");
    }
    
    // Initial Greeting
    if (audioEnabled) {
      speakText(currentQuestionText);
    }

    return () => {
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  // --- Helpers ---

  const speakText = (text) => {
    if (!synthRef.current || !audioEnabled) return;
    
    // Cancel previous speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.rate = 0.9; // Slightly slower for "therapist" vibe
    utterance.pitch = 1.0;
    
    // Try to select a nice voice
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Samantha"));
    if (preferredVoice) utterance.voice = preferredVoice;

    synthRef.current.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
      // Stop speaking if we start listening
      if (isSpeaking) {
        synthRef.current.cancel();
        setIsSpeaking(false);
      }
    }
  };

  // --- AI Logic (Gemini Integration) ---

  const callGeminiAPI = async (prompt) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`;
    
    const payload = {
      contents: [{ parts: [{ text: prompt }] }]
    };

    // Exponential backoff
    const delays = [1000, 2000, 4000, 8000, 16000];
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
        if (i === delays.length - 1) throw error; // Rethrow last error
        await new Promise(resolve => setTimeout(resolve, delays[i]));
      }
    }
  };

  const handleNext = async () => {
    if (!userAnswer.trim()) return;

    setIsThinking(true);
    if (isSpeaking) synthRef.current.cancel();

    // Save current Q&A to history
    const newHistory = [...conversationHistory, { question: currentQuestionText, answer: userAnswer }];
    setConversationHistory(newHistory);

    try {
      // 1. Construct Prompt for Gemini
      // We give it the history and the *planned* next question (from hardcoded list).
      // It decides whether to ask the planned one or a pivot.
      const nextCoreQ = CORE_QUESTIONS[(currentQuestionIndex + 1) % CORE_QUESTIONS.length];
      
      const systemPrompt = `
        You are an expert psychologist conducting a deep self-discovery interview.
        
        Here is the context:
        User's last answer: "${userAnswer}"
        The Current Question was: "${currentQuestionText}"
        
        The Next planned standard question is: "${nextCoreQ}"
        
        TASK:
        Analyze the user's answer. 
        1. If the answer was short, superficial, or unclear, stick to the plan and just return the string "NEXT_STANDARD".
        2. If the answer was deep, emotional, or revealed a contradiction, generate a specific, short, powerful follow-up question to dig deeper into that specific emotion or topic. Do not be repetitive.
        
        Output ONLY the question text. Do not include quotes or explanations.
      `;

      // 2. Call API
      const aiResponse = await callGeminiAPI(systemPrompt);
      
      let nextQuestionToAsk = nextCoreQ;
      let nextIndex = currentQuestionIndex + 1;

      if (aiResponse && !aiResponse.includes("NEXT_STANDARD") && aiResponse.length > 10) {
        // AI decided to pivot
        nextQuestionToAsk = aiResponse;
        // We don't advance the index if we are pivoting, or maybe we do? 
        // Let's not advance index so we eventually return to the core list.
        // Actually, let's keep the index same so the "next" standard question is still waiting in queue.
        nextIndex = currentQuestionIndex; 
      } else {
        // AI decided to move on
        nextIndex = currentQuestionIndex + 1;
      }

      // 3. Update State
      setCurrentQuestionIndex(nextIndex);
      setCurrentQuestionText(nextQuestionToAsk);
      setUserAnswer("");
      
      // 4. Speak new question
      if (audioEnabled) {
        // Small delay for effect
        setTimeout(() => speakText(nextQuestionToAsk), 500);
      }

    } catch (error) {
      console.error("AI Error:", error);
      // Fallback: Just go to next core question
      const nextQ = CORE_QUESTIONS[(currentQuestionIndex + 1) % CORE_QUESTIONS.length];
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentQuestionText(nextQ);
      setUserAnswer("");
      if (audioEnabled) speakText(nextQ);
    } finally {
      setIsThinking(false);
    }
  };

  // --- UI Rendering ---

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center relative overflow-hidden font-sans">
      
      {/* Background Ambient Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob ${isThinking ? 'animate-pulse' : ''}`}></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header / Nav */}
      <div className="w-full p-6 flex justify-between items-center z-10 max-w-3xl">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-400" />
          <h1 className="font-bold tracking-wider text-lg">PSYCHE.AI</h1>
        </div>
        <button 
          onClick={() => setAudioEnabled(!audioEnabled)}
          className="p-2 rounded-full hover:bg-slate-800 transition-colors"
        >
          {audioEnabled ? <Volume2 className="w-5 h-5 text-slate-400" /> : <VolumeX className="w-5 h-5 text-slate-600" />}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl px-6 z-10 gap-8">
        
        {/* Avatar / State Indicator */}
        <div className="relative h-32 w-32 flex items-center justify-center">
          {/* Outer Rings */}
          <div className={`absolute w-full h-full border-2 border-purple-500/30 rounded-full transition-all duration-1000 ${isListening ? 'scale-110 opacity-100' : 'scale-100 opacity-50'}`}></div>
          <div className={`absolute w-full h-full border-2 border-indigo-500/30 rounded-full transition-all duration-1000 delay-100 ${isListening ? 'scale-125 opacity-80' : 'scale-90 opacity-40'}`}></div>
          
          {/* Core Avatar */}
          <div className={`w-24 h-24 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-full shadow-2xl flex items-center justify-center transition-transform duration-500 ${isSpeaking ? 'scale-105 shadow-purple-500/50' : 'scale-100'}`}>
             {isThinking ? (
               <RefreshCw className="w-8 h-8 text-white animate-spin" />
             ) : isListening ? (
               <Mic className="w-8 h-8 text-white animate-pulse" />
             ) : (
               <Sparkles className="w-8 h-8 text-white/80" />
             )}
          </div>
        </div>

        {/* Question Display */}
        <div className="text-center space-y-4 min-h-[120px]">
          <h2 className="text-xl md:text-3xl font-light leading-relaxed text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">
            "{currentQuestionText}"
          </h2>
          {currentQuestionIndex >= CORE_QUESTIONS.length && (
             <span className="text-xs font-mono text-purple-400 tracking-widest uppercase">Extended Session</span>
          )}
        </div>

        {/* Input Area */}
        <div className="w-full bg-slate-800/50 backdrop-blur-md rounded-3xl p-4 border border-slate-700 shadow-xl">
          <textarea
            ref={textareaRef}
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Speak your answer or type here..."
            className="w-full bg-transparent text-slate-200 placeholder-slate-500 outline-none resize-none h-32 text-lg p-2"
          />
          
          <div className="flex justify-between items-center mt-4 border-t border-slate-700/50 pt-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {isListening ? (
                <span className="flex items-center gap-1 text-red-400 animate-pulse">● Listening...</span>
              ) : (
                <span>Tap microphone to speak</span>
              )}
            </div>

            <div className="flex gap-3">
              {/* Mic Button */}
              <button 
                onClick={toggleListening}
                className={`p-4 rounded-full transition-all duration-300 ${isListening ? 'bg-red-500 text-white shadow-lg shadow-red-500/40' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              >
                {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>

              {/* Next Button */}
              <button 
                onClick={handleNext}
                disabled={!userAnswer.trim() || isThinking}
                className={`px-6 py-3 rounded-full font-medium flex items-center gap-2 transition-all duration-300 ${
                  userAnswer.trim() && !isThinking
                    ? 'bg-white text-slate-900 hover:scale-105 shadow-lg shadow-white/20' 
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isThinking ? 'Analyzing...' : 'Next'} 
                {!isThinking && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* History Indicator (Subtle) */}
      <div className="w-full py-6 flex justify-center gap-2 z-10">
        {CORE_QUESTIONS.map((_, idx) => (
          <div 
            key={idx} 
            className={`h-1.5 rounded-full transition-all duration-500 ${
              idx < currentQuestionIndex ? 'w-8 bg-purple-500' : 
              idx === currentQuestionIndex ? 'w-8 bg-white' : 'w-2 bg-slate-700'
            }`}
          />
        ))}
      </div>
      
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}