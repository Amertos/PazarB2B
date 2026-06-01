import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

export default function SupportScreen() {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Pomoć i Podrška</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Ionicons name="mail-outline" size={32} color={Colors.primary} />
          <Text style={styles.cardTitle}>Kontaktirajte nas</Text>
          <Text style={styles.cardText}>support@pazarb2b.rs</Text>
        </View>
        
        <View style={styles.card}>
          <Ionicons name="call-outline" size={32} color={Colors.primary} />
          <Text style={styles.cardTitle}>Korisnička služba</Text>
          <Text style={styles.cardText}>+381 60 123 4567</Text>
        </View>
        
        <Pressable style={styles.btn} onPress={() => Alert.alert('FAQ', 'Pitanja i odgovori će biti dodati uskoro.')}>
          <Text style={styles.btnText}>Najčešća Pitanja (FAQ)</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { padding: 8 },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, color: Colors.text },
  content: { padding: 16, gap: 16 },
  card: { backgroundColor: Colors.white, padding: 20, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  cardTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 16, marginTop: 12, marginBottom: 4 },
  cardText: { fontFamily: 'Inter_400Regular', color: Colors.textSecondary },
  btn: { backgroundColor: Colors.white, padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.primary },
  btnText: { fontFamily: 'Inter_600SemiBold', color: Colors.primary },
});
