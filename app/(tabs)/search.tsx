import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  TextInput,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useListings, CATEGORIES, Listing } from "@/context/ListingsContext";

function SearchResult({ listing, onPress }: { listing: Listing; onPress: () => void }) {
  const cat = CATEGORIES.find(c => c.id === listing.category);
  return (
    <Pressable
      style={({ pressed }) => [styles.resultCard, { opacity: pressed ? 0.9 : 1 }]}
      onPress={onPress}
    >
      <View style={[styles.resultImage, { backgroundColor: (cat?.color || Colors.primary) + "18" }]}>
        <Ionicons name={(cat?.icon || "cube-outline") as any} size={28} color={cat?.color || Colors.primary} />
      </View>
      <View style={styles.resultBody}>
        <Text style={styles.resultTitle} numberOfLines={1}>{listing.title}</Text>
        <Text style={styles.resultCompany} numberOfLines={1}>{listing.companyName}</Text>
        <View style={styles.resultMeta}>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.resultLocation} numberOfLines={1}>{listing.location}</Text>
          </View>
          <Text style={[
            styles.resultPrice,
            listing.priceType === "free" && { color: Colors.primary },
          ]}>
            {listing.priceType === "free"
              ? "Poklanjam"
              : `${listing.price?.toLocaleString()} RSD${listing.priceUnit ? "/" + listing.priceUnit : ""}`}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </Pressable>
  );
}

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { listings } = useListings();
  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "sale">("all");

  const webTopPad = Platform.OS === "web" ? 67 : 0;

  const results = useMemo(() => {
    return listings.filter(l => {
      const matchQ = !query || l.title.toLowerCase().includes(query.toLowerCase()) || l.description.toLowerCase().includes(query.toLowerCase());
      const matchCat = !selectedCat || l.category === selectedCat;
      const matchPrice = priceFilter === "all" || l.priceType === priceFilter;
      return matchQ && matchCat && matchPrice;
    });
  }, [listings, query, selectedCat, priceFilter]);

  const topPad = insets.top + webTopPad;
  const botPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad }]}>
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder='Pretraži materijale...'
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </Pressable>
          )}
        </View>

        <View style={styles.filterRow}>
          {(["all", "free", "sale"] as const).map(f => (
            <Pressable
              key={f}
              style={[styles.filterChip, priceFilter === f && styles.filterChipActive]}
              onPress={() => setPriceFilter(f)}
            >
              <Text style={[styles.filterChipText, priceFilter === f && styles.filterChipTextActive]}>
                {f === "all" ? "Sve" : f === "free" ? "Besplatno" : "Na prodaju"}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.catScroll}>
        <FlatList
          data={[{ id: null, label: "Sve", icon: "apps-outline", color: Colors.primary }, ...CATEGORIES.map(c => ({ ...c, id: c.id }))]}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          keyExtractor={item => item.id || "all"}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.catPill, selectedCat === item.id && styles.catPillActive]}
              onPress={() => setSelectedCat(selectedCat === item.id ? null : item.id)}
            >
              <Ionicons
                name={item.icon as any}
                size={14}
                color={selectedCat === item.id ? Colors.white : Colors.textSecondary}
              />
              <Text style={[styles.catPillText, selectedCat === item.id && styles.catPillTextActive]}>
                {item.label}
              </Text>
            </Pressable>
          )}
        />
      </View>

      <Text style={styles.resultCount}>
        {results.length} {results.length === 1 ? "oglas" : "oglasa"}
      </Text>

      <FlatList
        data={results}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingBottom: botPad + 80 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Nema rezultata</Text>
            <Text style={styles.emptyDesc}>Pokušajte sa drugačijim pojmom pretrage</Text>
          </View>
        }
        renderItem={({ item }) => (
          <SearchResult
            listing={item}
            onPress={() => router.push({ pathname: "/listing/[id]", params: { id: item.id } })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    paddingHorizontal: 14,
    height: 46,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: Colors.text,
  },
  filterRow: { flexDirection: "row", gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textSecondary },
  filterChipTextActive: { color: Colors.white },
  catScroll: { paddingVertical: 12 },
  catPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catPillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catPillText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textSecondary },
  catPillTextActive: { color: Colors.white },
  resultCount: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.textMuted,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    gap: 12,
    paddingRight: 12,
  },
  resultImage: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  resultBody: { flex: 1, paddingVertical: 12, gap: 4 },
  resultTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.text },
  resultCompany: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary },
  resultMeta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  resultLocation: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textMuted },
  resultPrice: { fontFamily: "Inter_700Bold", fontSize: 13, color: Colors.warning },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyTitle: { fontFamily: "Inter_600SemiBold", fontSize: 18, color: Colors.text },
  emptyDesc: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textMuted, textAlign: "center" },
});
