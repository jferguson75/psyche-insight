import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function LandingScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#0f172a', '#1e1b4b', '#312e81']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>🧠</Text>
            </View>
            <Text style={styles.title}>PSYCHE INSIGHT</Text>
            <Text style={styles.subtitle}>
              Discover Your Inner Self Through AI-Guided Reflection
            </Text>
          </View>

          {/* Purpose Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What is Psyche Insight?</Text>
            <Text style={styles.sectionText}>
              Psyche Insight is an AI-powered psychological self-discovery tool that guides you through 
              deep, meaningful conversations about yourself. Using advanced AI, it asks thought-provoking 
              questions and adapts to your responses, helping you uncover hidden patterns, beliefs, and 
              motivations that shape your life.
            </Text>
          </View>

          {/* Features Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How It Works</Text>
            <View style={styles.featureList}>
              <FeatureItem 
                icon="💬"
                title="Thoughtful Questions"
                description="Answer 10 core psychological questions designed by experts"
              />
              <FeatureItem 
                icon="🤖"
                title="AI-Powered Insights"
                description="AI adapts and asks deeper follow-up questions based on your answers"
              />
              <FeatureItem 
                icon="🎤"
                title="Voice or Text"
                description="Respond using your voice or by typing - whatever feels natural"
              />
              <FeatureItem 
                icon="🔒"
                title="Private & Secure"
                description="Your responses are stored locally on your device"
              />
            </View>
          </View>

          {/* Audience Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Who Is This For?</Text>
            <Text style={styles.sectionText}>
              • Anyone seeking deeper self-understanding{'\n'}
              • People working on personal growth and development{'\n'}
              • Those exploring their values, fears, and motivations{'\n'}
              • Individuals preparing for therapy or coaching{'\n'}
              • Anyone curious about what drives their behavior
            </Text>
          </View>

          {/* CTA Buttons */}
          <View style={styles.ctaContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('SignUp')}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.secondaryButtonText}>Already have an account? Sign In</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Your journey to self-discovery starts here
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const FeatureItem = ({ icon, title, description }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <View style={styles.featureContent}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconText: {
    fontSize: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 18,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  sectionText: {
    fontSize: 16,
    color: '#cbd5e1',
    lineHeight: 24,
  },
  featureList: {
    gap: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  featureIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
  ctaContainer: {
    marginTop: 20,
    marginBottom: 40,
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#a78bfa',
    textDecorationLine: 'underline',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerText: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
  },
});
