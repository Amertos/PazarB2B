import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Moje Porudžbine</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.empty}>
        <Ionicons name="cart-outline" size={64} color={Colors.textMuted} />
        <Text style={styles.emptyTitle}>Nema porudžbina</Text>
        <Text style={styles.emptyText}>Trenutno nemate nijednu porudžbinu.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { padding: 8 },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, color: Colors.text },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontFamily: 'Inter_700Bold', fontSize: 20, color: Colors.text, marginTop: 16, marginBottom: 8 },
  emptyText: { fontFamily: 'Inter_400Regular', color: Colors.textMuted, textAlign: 'center' },
});
