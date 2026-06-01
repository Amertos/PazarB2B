import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Image } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useListings } from '@/context/ListingsContext';

export default function SavedListingsScreen() {
  const insets = useSafeAreaInsets();
  const { listings, savedIds, toggleSaved } = useListings();

  const savedListings = listings.filter(l => savedIds.includes(l.id));

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Sačuvani Oglasi</Text>
        <View style={{ width: 40 }} />
      </View>
      <FlatList
        data={savedListings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="bookmark-outline" size={64} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Nemate sačuvanih oglasa</Text>
            <Text style={styles.emptyText}>Ovde će se pojaviti svi oglasi koje ste lajkovali.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable 
            style={styles.card} 
            onPress={() => router.push({ pathname: '/listing/[id]', params: { id: item.id } })}
          >
            {item.images && item.images.length > 0 ? (
              <Image source={{ uri: item.images[0] }} style={styles.image} />
            ) : (
              <View style={[styles.image, styles.noImage]}>
                <Ionicons name="image-outline" size={24} color={Colors.textMuted} />
              </View>
            )}
            <View style={styles.cardInfo}>
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.price}>{item.priceType === 'free' ? 'Besplatno' : `${item.price} RSD`}</Text>
              <Text style={styles.company}>{item.companyName}</Text>
            </View>
            <Pressable style={styles.heartBtn} onPress={() => toggleSaved(item.id)}>
              <Ionicons name="heart" size={24} color={Colors.primary} />
            </Pressable>
          </Pressable>
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
  empty: { padding: 40, alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  emptyTitle: { fontFamily: 'Inter_700Bold', fontSize: 20, color: Colors.text, marginTop: 16, marginBottom: 8 },
  emptyText: { fontFamily: 'Inter_400Regular', color: Colors.textMuted, textAlign: 'center' },
  card: { flexDirection: 'row', backgroundColor: Colors.white, padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  image: { width: 80, height: 80, borderRadius: 8, marginRight: 12 },
  noImage: { backgroundColor: Colors.inputBackground, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1, justifyContent: 'center' },
  title: { fontFamily: 'Inter_600SemiBold', fontSize: 15, marginBottom: 4, color: Colors.text },
  price: { fontFamily: 'Inter_700Bold', color: Colors.primary, marginBottom: 4 },
  company: { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.textSecondary },
  heartBtn: { padding: 8 },
});
