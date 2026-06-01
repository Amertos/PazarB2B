import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/query-client';

export default function QuoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { company } = useAuth();
  
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState("Poštovani, zainteresovani smo za ovaj materijal. Molim vas pošaljite nam zvaničnu ponudu i uslove isporuke.");

  async function handleSend() {
    if (!quantity.trim()) {
      Alert.alert("Greška", "Unesite željenu količinu.");
      return;
    }
    try {
      // 1. Fetch listing to get companyId
      const listingRes = await apiRequest('GET', `/api/listings/${id}`);
      const listing = await listingRes.json();
      
      // 2. Find or create conversation
      const convRes = await apiRequest('POST', '/api/conversations', { companyBId: listing.companyId, listingId: id });
      const conv = await convRes.json();
      
      // 3. Send quote message
      const fullMessage = `ZAHTEV ZA PONUDU:\nKoličina: ${quantity}\nPoruka: ${message}`;
      await apiRequest('POST', `/api/conversations/${conv.id}/messages`, { text: fullMessage, type: 'quote' });
      
      Alert.alert("Uspeh", "Zahtev za ponudu je poslat prodavcu.");
      router.replace({ pathname: '/chat-thread/[id]', params: { id: conv.id } });
    } catch (e) {
      Alert.alert("Greška", "Nije moguće poslati zahtev.");
    }
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Zatraži ponudu</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={24} color={Colors.primary} />
            <Text style={styles.infoText}>Prodavcu će biti poslata poruka sa vašim zahtevom. Odgovoriće vam u Chat sekciji.</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Potrebna količina</Text>
            <TextInput
              style={styles.input}
              placeholder="npr. 5 tona, 100 komada..."
              placeholderTextColor={Colors.textMuted}
              value={quantity}
              onChangeText={setQuantity}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Dodatna poruka</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Unesite poruku..."
              placeholderTextColor={Colors.textMuted}
              value={message}
              onChangeText={setMessage}
              multiline
            />
          </View>

          <Pressable style={({ pressed }) => [styles.submitBtn, { opacity: pressed ? 0.88 : 1 }]} onPress={handleSend}>
            <LinearGradient
              colors={[Colors.accent, Colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGradient}
            >
              <Text style={styles.submitText}>POŠALJI ZAHTEV</Text>
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
  content: { padding: 20 },
  infoBox: { flexDirection: 'row', backgroundColor: Colors.lightGreen, padding: 16, borderRadius: 12, alignItems: 'center', gap: 12, marginBottom: 24, borderWidth: 1, borderColor: Colors.midGreen },
  infoText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.primary },
  formGroup: { gap: 8, marginBottom: 20 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.text },
  input: { backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.inputBorder, paddingHorizontal: 14, paddingVertical: 14, fontFamily: 'Inter_400Regular', fontSize: 15, color: Colors.text },
  textArea: { minHeight: 120, textAlignVertical: 'top' },
  submitBtn: { width: '100%', borderRadius: 14, overflow: 'hidden', marginTop: 10 },
  submitGradient: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  submitText: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#fff', letterSpacing: 1 },
});
