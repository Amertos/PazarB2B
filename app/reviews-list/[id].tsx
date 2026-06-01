import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { apiRequest } from '@/lib/query-client';

export default function ReviewsListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [id]);

  async function fetchReviews() {
    try {
      const res = await apiRequest('GET', `/api/companies/${id}/reviews`);
      const data = await res.json();
      setReviews(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Sve ocene</Text>
        <View style={{ width: 40 }} />
      </View>
      
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Firma još uvek nema ocena.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.reviewer}>{item.reviewerName}</Text>
                <View style={styles.stars}>
                  {[1,2,3,4,5].map(star => (
                    <Ionicons key={star} name={star <= item.rating ? "star" : "star-outline"} size={16} color="#F59E0B" />
                  ))}
                </View>
              </View>
              {item.comment ? <Text style={styles.comment}>{item.comment}</Text> : null}
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('sr-RS')}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { padding: 8 },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, color: Colors.text },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { fontFamily: 'Inter_400Regular', color: Colors.textMuted },
  card: { backgroundColor: Colors.white, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  reviewer: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: Colors.text },
  stars: { flexDirection: 'row', gap: 2 },
  comment: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.textSecondary, marginBottom: 8, lineHeight: 20 },
  date: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.textMuted },
});
