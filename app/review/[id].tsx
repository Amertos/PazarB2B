import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { apiRequest } from '@/lib/query-client';

export default function ReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  async function handleSubmit() {
    if (rating === 0) {
      Alert.alert("Greška", "Molimo vas da izaberete ocenu (1-5).");
      return;
    }
    try {
      const res = await apiRequest('POST', `/api/companies/${id}/reviews`, {
        rating,
        comment
      });
      if (!res.ok) {
        const data = await res.json();
        Alert.alert("Greška", data.message || "Nešto nije u redu.");
        return;
      }
      Alert.alert("Uspeh", "Vaša ocena je uspešno zabeležena!");
      router.back();
    } catch (e) {
      Alert.alert("Greška", "Nije moguće poslati ocenu.");
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Oceni firmu</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>Izaberite ocenu:</Text>
        <View style={styles.starsRow}>
          {[1,2,3,4,5].map(star => (
            <Pressable key={star} onPress={() => setRating(star)}>
              <Ionicons name={star <= rating ? "star" : "star-outline"} size={40} color="#F59E0B" />
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Vaš komentar (opciono):</Text>
        <TextInput 
          style={styles.input}
          placeholder="Napišite svoje iskustvo..."
          value={comment}
          onChangeText={setComment}
          multiline
        />

        <Pressable style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>Pošalji ocenu</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { padding: 8 },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, color: Colors.text },
  content: { padding: 20 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 16, marginBottom: 12, marginTop: 20 },
  starsRow: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 12, minHeight: 100, textAlignVertical: 'top', fontFamily: 'Inter_400Regular' },
  submitBtn: { backgroundColor: Colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 30 },
  submitBtnText: { color: Colors.white, fontFamily: 'Inter_700Bold', fontSize: 16 },
});
