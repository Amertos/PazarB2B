import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");

  function handleReset() {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert("Greška", "Unesite validnu email adresu.");
      return;
    }
    Alert.alert("Uspeh", `Link za resetovanje lozinke je uspešno poslat na ${email}.`);
    router.back();
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Zaboravljena lozinka</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Ionicons name="lock-open-outline" size={64} color={Colors.primary} style={styles.icon} />
          <Text style={styles.title}>Resetujte svoju lozinku</Text>
          <Text style={styles.desc}>
            Unesite email adresu vaše firme. Poslaćemo vam link sa uputstvom kako da resetujete vašu lozinku.
          </Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>E-mail adresa</Text>
            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={18} color={Colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="primer@firma.rs"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <Pressable style={({ pressed }) => [styles.submitBtn, { opacity: pressed ? 0.88 : 1 }]} onPress={handleReset}>
            <LinearGradient
              colors={[Colors.accent, Colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGradient}
            >
              <Text style={styles.submitText}>POŠALJI LINK</Text>
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { padding: 8 },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, color: Colors.text },
  content: { padding: 24, alignItems: 'center' },
  icon: { marginBottom: 16 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 22, color: Colors.text, marginBottom: 8, textAlign: 'center' },
  desc: { fontFamily: 'Inter_400Regular', fontSize: 15, color: Colors.textSecondary, textAlign: 'center', marginBottom: 32 },
  formGroup: { width: '100%', gap: 6, marginBottom: 24 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.text },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.inputBorder, paddingHorizontal: 14, height: 52, gap: 10 },
  inputIcon: {},
  input: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 15, color: Colors.text },
  submitBtn: { width: '100%', borderRadius: 14, overflow: 'hidden' },
  submitGradient: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  submitText: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#fff', letterSpacing: 1 },
});
