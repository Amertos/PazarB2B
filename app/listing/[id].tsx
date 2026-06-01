import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  Alert,
  Linking,
  Image,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/colors";
import { useListings, CATEGORIES } from "@/context/ListingsContext";
import { useChat } from "@/context/ChatContext";
import { getApiUrl } from "@/lib/query-client";
import * as Haptics from "expo-haptics";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { getListingById, savedIds, toggleSaved } = useListings();
  const { startConversation } = useChat();

  const listing = getListingById(id || "");
  const cat = listing ? CATEGORIES.find(c => c.id === listing.category) : null;
  const isSaved = savedIds.includes(id || "");

  const webTopPad = Platform.OS === "web" ? 67 : 0;
  const botPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  if (!listing) {
    return (
      <View style={styles.notFound}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.textMuted} />
        <Text style={styles.notFoundText}>Oglas nije pronađen</Text>
        <Pressable onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>Nazad</Text>
        </Pressable>
      </View>
    );
  }

  async function handleChat() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const conv = await startConversation(listing!.companyId, listing!.companyName, listing!.id, listing!.title);
      router.push({ pathname: "/chat-thread/[id]", params: { id: conv.id } });
    } catch (e: any) {
      Alert.alert("Greška", "Nije moguće započeti razgovor");
    }
  }

  async function handleCall() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const res = await fetch(`${getApiUrl()}/api/companies/${listing!.companyId}`);
      if (res.ok) {
        const companyData = await res.json();
        if (companyData.phone) {
          Linking.openURL(`tel:${companyData.phone}`);
          return;
        }
      }
      Alert.alert("Greška", "Firma nema unet broj telefona.");
    } catch (e) {
      Alert.alert("Greška", "Nije moguće dohvatiti broj telefona.");
    }
  }

  function handleSave() {
    toggleSaved(listing!.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: botPad + 100 }}
      >
        <View style={[styles.heroArea, { backgroundColor: (cat?.color || Colors.primary) + "14" }]}>
          {listing.images && listing.images.length > 0 ? (
            <Image 
              source={{ uri: listing.images[0].startsWith('http') || listing.images[0].startsWith('data:') ? listing.images[0] : `${getApiUrl()}${listing.images[0]}` }} 
              style={{ width: '100%', height: '100%', resizeMode: 'cover' }} 
            />
          ) : (
            <View style={[styles.heroBg, { backgroundColor: (cat?.color || Colors.primary) + "22" }]}>
              <Ionicons name={(cat?.icon || "cube-outline") as any} size={80} color={cat?.color || Colors.primary} />
            </View>
          )}

          <View style={[styles.floatingHeader, { top: insets.top + webTopPad + 8 }]}>
            <Pressable style={styles.iconBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color={Colors.text} />
            </Pressable>
            <View style={styles.headerActions}>
              <Pressable style={styles.iconBtn} onPress={handleCall}>
                <Ionicons name="call-outline" size={22} color={Colors.text} />
              </Pressable>
              <Pressable
                style={[styles.iconBtn, isSaved && { backgroundColor: Colors.lightGreen }]}
                onPress={handleSave}
              >
                <Ionicons
                  name={isSaved ? "heart" : "heart-outline"}
                  size={22}
                  color={isSaved ? Colors.primary : Colors.text}
                />
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View style={styles.titleLeft}>
              <Text style={styles.listingTitle}>{listing.title}</Text>
              {listing.priceType === "free" ? (
                <Text style={styles.priceLabel}>Poklanjam</Text>
              ) : (
                <Text style={styles.priceValue}>
                  {listing.price?.toLocaleString()} RSD
                  {listing.priceUnit ? ` / ${listing.priceUnit}` : ""}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.locationText}>{listing.location}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Opis materijala</Text>
          <Text style={styles.description}>{listing.description}</Text>

          <View style={styles.divider} />

          <Pressable style={styles.companyCard} onPress={() => router.push({ pathname: '/reviews-list/[id]', params: { id: listing.companyId } })}>
            <View style={styles.companyAvatar}>
              <Text style={styles.companyAvatarText}>{listing.companyName.charAt(0)}</Text>
            </View>
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>{listing.companyName}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={13} color="#F59E0B" />
                <Text style={styles.ratingText}>{listing.companyRating.toFixed(1)}</Text>
                <Text style={styles.ratingCount}>({listing.companyReviewCount} ocena)</Text>
              </View>
            </View>
            <Pressable style={styles.profileBtn} onPress={() => router.push({ pathname: '/review/[id]', params: { id: listing.companyId } })}>
              <Text style={styles.profileBtnText}>Oceni</Text>
            </Pressable>
          </Pressable>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Detalji</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailCard}>
              <DetailRow label="KATEGORIJA" value={cat?.label || listing.category} />
            </View>
            {listing.quantity && (
              <View style={styles.detailCard}>
                <DetailRow label="KOLIČINA" value={listing.quantity} />
              </View>
            )}
            {listing.condition && (
              <View style={styles.detailCard}>
                <DetailRow label="STANJE" value={listing.condition} />
              </View>
            )}
            {listing.transport && (
              <View style={styles.detailCard}>
                <DetailRow label="TRANSPORT" value={listing.transport} />
              </View>
            )}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Lokacija preuzimanja</Text>
          <Pressable style={styles.mapPlaceholder} onPress={() => {
            const url = Platform.select({
              ios: `maps:0,0?q=${encodeURIComponent(listing.location)}`,
              android: `geo:0,0?q=${encodeURIComponent(listing.location)}`,
              web: `https://maps.google.com/?q=${encodeURIComponent(listing.location)}`
            });
            if (url) Linking.openURL(url);
          }}>
            <Ionicons name="map-outline" size={36} color={Colors.primary} />
            <Text style={styles.mapLocation}>{listing.location}</Text>
          </Pressable>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: botPad + 12 }]}>
        <Pressable
          style={({ pressed }) => [styles.callBtn, { opacity: pressed ? 0.85 : 1 }]}
          onPress={() => router.push({ pathname: '/listing/quote/[id]', params: { id: listing.id } })}
        >
          <Ionicons name="document-text-outline" size={18} color={Colors.primary} />
          <Text style={styles.callBtnText}>ZATRAŽI PONUDU</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.chatBtn, { opacity: pressed ? 0.85 : 1, flex: 1 }]}
          onPress={handleChat}
        >
          <LinearGradient
            colors={[Colors.accent, Colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.chatGradient}
          >
            <Ionicons name="chatbubble-outline" size={18} color="#fff" />
            <Text style={styles.chatBtnText}>POŠALJI PORUKU</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  heroArea: { height: 280, alignItems: "center", justifyContent: "center" },
  heroBg: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  floatingHeader: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerActions: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: { padding: 20, gap: 16 },
  titleRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  titleLeft: { flex: 1, gap: 6 },
  listingTitle: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.text, letterSpacing: -0.3, lineHeight: 30 },
  priceLabel: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.primary },
  priceValue: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.warning },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: -8 },
  locationText: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary },
  divider: { height: 1, backgroundColor: Colors.separator },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.text },
  description: { fontFamily: "Inter_400Regular", fontSize: 15, color: Colors.textSecondary, lineHeight: 24, marginTop: -8 },
  companyCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.inputBackground,
    borderRadius: 14,
    padding: 14,
  },
  companyAvatar: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.midGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  companyAvatarText: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.primary },
  companyInfo: { flex: 1, gap: 3 },
  companyName: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.text },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontFamily: "Inter_700Bold", fontSize: 13, color: Colors.text },
  ratingCount: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textMuted },
  profileBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  profileBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.text },
  detailsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: -8 },
  detailCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    padding: 14,
  },
  detailRow: { gap: 4 },
  detailLabel: { fontFamily: "Inter_600SemiBold", fontSize: 10, color: Colors.textMuted, letterSpacing: 0.5 },
  detailValue: { fontFamily: "Inter_700Bold", fontSize: 14, color: Colors.text },
  mapPlaceholder: {
    height: 120,
    backgroundColor: Colors.lightGreen,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: -8,
  },
  mapLocation: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.primary },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  callBtnText: { fontFamily: "Inter_700Bold", fontSize: 13, color: Colors.primary, letterSpacing: 0.5 },
  chatBtn: { borderRadius: 14, overflow: "hidden" },
  chatGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 15, gap: 8 },
  chatBtnText: { fontFamily: "Inter_700Bold", fontSize: 13, color: "#fff", letterSpacing: 0.5 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: Colors.background },
  notFoundText: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: Colors.textSecondary },
  backLink: { paddingVertical: 10, paddingHorizontal: 20 },
  backLinkText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.primary },
});
