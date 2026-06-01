import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  Alert,
  Image,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { useListings } from "@/context/ListingsContext";
import { getApiUrl } from "@/lib/query-client";
import * as Haptics from "expo-haptics";
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

function MenuRow({ icon, label, subtitle, onPress, danger = false }: {
  icon: string; label: string; subtitle?: string; onPress?: () => void; danger?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.menuRow, { opacity: pressed ? 0.75 : 1 }]}
      onPress={onPress}
    >
      <View style={[styles.menuIcon, { backgroundColor: danger ? "#FEF2F2" : Colors.lightGreen }]}>
        <Ionicons name={icon as any} size={20} color={danger ? Colors.error : Colors.primary} />
      </View>
      <View style={styles.menuBody}>
        <Text style={[styles.menuLabel, danger && { color: Colors.error }]}>{label}</Text>
        {subtitle && <Text style={styles.menuSub}>{subtitle}</Text>}
      </View>
      {!danger && <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { company, logout, updateCompany } = useAuth();
  const { myListings } = useListings();
  const [logoUri, setLogoUri] = useState<string | null>(company?.logo || null);

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      const base64Uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setLogoUri(base64Uri);
      await updateCompany({ logo: base64Uri });
    }
  }

  const webTopPad = Platform.OS === "web" ? 67 : 0;
  const topPad = insets.top + webTopPad;
  const botPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  function handleLogout() {
    Alert.alert(
      "Odjava",
      "Da li ste sigurni da se želite odjaviti?",
      [
        { text: "Otkaži", style: "cancel" },
        {
          text: "Odjavi se",
          style: "destructive",
          onPress: async () => {
            await logout();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.replace("/login");
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad }]}>
        <Text style={styles.headerTitle}>Pazar B2B Višak</Text>
        <Ionicons name="settings-outline" size={22} color={Colors.textSecondary} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: botPad + 80 }}
      >
        <View style={styles.profileCard}>
          <View style={styles.companyLogoWrap}>
            <View style={styles.companyLogo}>
              {logoUri ? (
                <Image source={{ uri: logoUri.startsWith('http') || logoUri.startsWith('data:') ? logoUri : `${getApiUrl()}${logoUri}` }} style={{ width: 90, height: 90, borderRadius: 18 }} />
              ) : (
                <Ionicons name="business-outline" size={32} color={Colors.white} />
              )}
            </View>
            <Pressable style={styles.editLogoBadge} onPress={pickImage}>
              <Ionicons name="pencil" size={12} color={Colors.white} />
            </Pressable>
          </View>

          <Text style={styles.companyName}>{company?.name || "Vaša firma"}</Text>
          <View style={styles.pibBadge}>
            <Text style={styles.pibText}>PIB: {company?.pib || "—"}</Text>
          </View>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.locationText}>{company?.address || "—"}</Text>
          </View>

          {company && company.rating > 0 && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingText}>{company.rating.toFixed(1)}</Text>
              <Text style={styles.ratingCount}>({company.reviewCount} ocena)</Text>
            </View>
          )}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{myListings.length}</Text>
            <Text style={styles.statLabel}>Oglasi</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{company?.reviewCount || 0}</Text>
            <Text style={styles.statLabel}>Ocene</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{company?.rating?.toFixed(1) || "—"}</Text>
            <Text style={styles.statLabel}>Prosek</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>UPRAVLJANJE POSLOVANJEM</Text>
          <View style={styles.menuCard}>
            <MenuRow
              icon="bookmark-outline"
              label="Sačuvani Oglasi"
              subtitle="Pregled lajkovanih oglasa"
              onPress={() => router.push('/profile/saved-listings')}
            />
            <View style={styles.menuSeparator} />
            <MenuRow
              icon="archive-outline"
              label="Moji Oglasi"
              subtitle="Aktivni i arhivirani oglasi materijala"
              onPress={() => router.push('/profile/my-listings')}
            />
            <View style={styles.menuSeparator} />
            <MenuRow
              icon="cart-outline"
              label="Moje Porudžbine"
              subtitle="Istorija kupovine i statusi isporuke"
              onPress={() => router.push('/profile/orders')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PODEŠAVANJA</Text>
          <View style={styles.menuCard}>
            <MenuRow
              icon="business-outline"
              label="Uređivanje Profila Firme"
              onPress={() => router.push('/profile/edit-company')}
            />
            <View style={styles.menuSeparator} />
            <MenuRow
              icon="notifications-outline"
              label="Podešavanja Obaveštenja"
              onPress={() => router.push('/profile/notifications')}
            />
            <View style={styles.menuSeparator} />
            <MenuRow
              icon="help-circle-outline"
              label="Pomoć i Podrška"
              onPress={() => router.push('/profile/support')}
            />
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.logoutBtn, { opacity: pressed ? 0.85 : 1 }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Odjavi se</Text>
        </Pressable>

        <Text style={styles.version}>Pazar B2B Višak App{"\n"}Verzija v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.primary },
  profileCard: {
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    gap: 8,
  },
  companyLogoWrap: { position: "relative", marginBottom: 4 },
  companyLogo: {
    width: 90,
    height: 90,
    borderRadius: 18,
    backgroundColor: Colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
  },
  editLogoBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.white,
  },
  companyName: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.text, textAlign: "center" },
  pibBadge: {
    backgroundColor: Colors.lightGreen,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pibText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.primary },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  locationText: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontFamily: "Inter_700Bold", fontSize: 14, color: Colors.text },
  ratingCount: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textMuted },
  statsRow: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.separator,
    paddingVertical: 16,
  },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statValue: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.text },
  statLabel: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textMuted },
  statDivider: { width: 1, backgroundColor: Colors.separator },
  section: { paddingHorizontal: 16, paddingTop: 20, gap: 10 },
  sectionLabel: { fontFamily: "Inter_700Bold", fontSize: 11, color: Colors.textMuted, letterSpacing: 1 },
  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  menuIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  menuBody: { flex: 1, gap: 2 },
  menuLabel: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.text },
  menuSub: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary },
  menuSeparator: { height: 1, backgroundColor: Colors.separator, marginLeft: 66 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  logoutText: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: Colors.error },
  version: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textMuted, textAlign: "center", marginTop: 20, lineHeight: 18 },
});
