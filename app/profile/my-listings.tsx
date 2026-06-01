import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useListings } from '@/context/ListingsContext';

export default function MyListingsScreen() {
  const insets = useSafeAreaInsets();
  const { myListings, deleteListing } = useListings();

  function handleDelete(id: string) {
    Alert.alert(
      "Brisanje oglasa",
      "Da li ste sigurni da želite da obrišete ovaj oglas?",
      [
        { text: "Odustani", style: "cancel" },
        { text: "Obriši", style: "destructive", onPress: () => deleteListing(id) }
      ]
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Moji Oglasi</Text>
        <View style={{ width: 40 }} />
      </View>
      <FlatList
        data={myListings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nemate aktivnih oglasa.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Pressable 
              style={styles.cardContent} 
              onPress={() => router.push({ pathname: '/listing/[id]', params: { id: item.id } })}
            >
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.price}>{item.priceType === 'free' ? 'Besplatno' : `${item.price} RSD`}</Text>
            </Pressable>
            <View style={styles.actions}>
              <Pressable style={styles.actionBtn} onPress={() => router.push({ pathname: '/profile/edit-listing/[id]', params: { id: item.id } })}>
                <Ionicons name="pencil" size={18} color={Colors.textSecondary} />
                <Text style={styles.actionText}>Izmeni</Text>
              </Pressable>
              <Pressable style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash" size={18} color={Colors.error} />
                <Text style={[styles.actionText, { color: Colors.error }]}>Obriši</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { padding: 8 },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, color: Colors.text },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { fontFamily: 'Inter_400Regular', color: Colors.textMuted },
  card: { backgroundColor: Colors.white, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  cardContent: { padding: 16 },
  title: { fontFamily: 'Inter_600SemiBold', fontSize: 16, marginBottom: 4 },
  price: { fontFamily: 'Inter_700Bold', color: Colors.primary },
  actions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.inputBackground },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 6 },
  deleteBtn: { borderLeftWidth: 1, borderLeftColor: Colors.border },
  actionText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.textSecondary },
});
