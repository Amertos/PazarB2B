import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  Dimensions,
  Image,
  ActivityIndicator,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  interpolate,
  useAnimatedScrollHandler,
  FadeInDown,
  FadeIn,
  ZoomIn,
  SlideInRight,
  runOnJS,
} from "react-native-reanimated";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useListings, CATEGORIES, Listing } from "@/context/ListingsContext";
import { useAuth } from "@/context/AuthContext";
import { getApiUrl } from "@/lib/query-client";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_W } = Dimensions.get("window");
const CARD_W = (SCREEN_W - 48) / 2;
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ─── Animated Card ────────────────────────────────────────────────────────────
function ListingCard({ listing, onPress, index }: { listing: Listing; onPress: () => void; index: number }) {
  const cat = CATEGORIES.find(c => c.id === listing.category);
  const catColor = cat?.color ?? Colors.primary;
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function onPressIn() { scale.value = withSpring(0.96, { damping: 15, stiffness: 400 }); }
  function onPressOut() { scale.value = withSpring(1, { damping: 12, stiffness: 300 }); }

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).springify().damping(14)}
      style={styles.cardOuter}
    >
      <AnimatedPressable
        style={[styles.card, animStyle]}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <View style={[styles.cardImage, { backgroundColor: catColor + "1A" }]}>
          {listing.images && listing.images.length > 0 ? (
            <Image 
              source={{ uri: listing.images[0].startsWith('http') || listing.images[0].startsWith('data:') ? listing.images[0] : `${getApiUrl()}${listing.images[0]}` }} 
              style={{ width: '100%', height: '100%', resizeMode: 'cover' }} 
            />
          ) : (
            <View style={[styles.cardIconCircle, { backgroundColor: catColor + "22" }]}>
              <Ionicons name={(cat?.icon ?? "cube-outline") as any} size={32} color={catColor} />
            </View>
          )}
          {listing.priceType === "free" && (
            <View style={styles.freeBadge}>
              <Text style={styles.freeBadgeText}>BESPLATNO</Text>
            </View>
          )}
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={2}>{listing.title}</Text>
          <View style={styles.cardLocation}>
            <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
            <Text style={styles.cardLocationText} numberOfLines={1}>{listing.location}</Text>
          </View>
          <View style={styles.cardFooter}>
            <Text
              style={[
                styles.cardPrice,
                listing.priceType === "free" ? { color: Colors.primary } : { color: Colors.warning },
              ]}
            >
              {listing.priceType === "free"
                ? "Poklanjam"
                : `${listing.price?.toLocaleString("sr-RS")} RSD${listing.priceUnit ? "/" + listing.priceUnit : ""}`}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Category Chip ────────────────────────────────────────────────────────────
function CategoryChip({
  cat,
  selected,
  onPress,
  index,
}: {
  cat: typeof CATEGORIES[0];
  selected: boolean;
  onPress: () => void;
  index: number;
}) {
  const scale = useSharedValue(1);
  const bg = useSharedValue(0);

  useEffect(() => {
    bg.value = withSpring(selected ? 1 : 0, { damping: 14 });
  }, [selected]);

  const chipStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: selected ? Colors.lightGreen : Colors.white,
    borderColor: selected ? Colors.primary : Colors.border,
  }));

  const labelStyle = useAnimatedStyle(() => ({
    color: selected ? Colors.primary : Colors.textSecondary,
  }));

  return (
    <Animated.View entering={SlideInRight.delay(index * 40).springify()}>
      <AnimatedPressable
        style={[styles.categoryChip, chipStyle]}
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.92, { damping: 15 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 12 }); }}
      >
        <View style={[styles.categoryIconCircle, { backgroundColor: cat.color + "1E" }]}>
          <Ionicons name={cat.icon as any} size={22} color={selected ? Colors.primary : cat.color} />
        </View>
        <Animated.Text style={[styles.categoryLabel, labelStyle]}>{cat.label}</Animated.Text>
      </AnimatedPressable>
    </Animated.View>
  );
}

// ─── Stats Bar ───────────────────────────────────────────────────────────────
function StatsBar({ listingsCount, companiesCount }: { listingsCount: number; companiesCount: number }) {
  return (
    <Animated.View entering={FadeIn.delay(300)} style={styles.statsBar}>
      <View style={styles.statItem}>
        <Ionicons name="layers-outline" size={16} color={Colors.white} />
        <Text style={styles.statText}>{listingsCount} oglasa</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Ionicons name="business-outline" size={16} color={Colors.white} />
        <Text style={styles.statText}>{companiesCount}+ firmi</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Ionicons name="location-outline" size={16} color={Colors.white} />
        <Text style={styles.statText}>Novi Pazar</Text>
      </View>
    </Animated.View>
  );
}

// ─── Home Screen ─────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { listings, isLoading, loadMoreListings, hasNextPage, isFetchingNextPage } = useListings();
  const { company } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const scrollY = useSharedValue(0);

  const webTopPad = Platform.OS === "web" ? 67 : 0;
  const topPad = insets.top + webTopPad;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => { scrollY.value = e.contentOffset.y; },
  });

  const headerAnimStyle = useAnimatedStyle(() => {
    const elevation = interpolate(scrollY.value, [0, 40], [0, 1], "clamp");
    return {
      shadowOpacity: elevation * 0.12,
      elevation: elevation * 6,
    };
  });

  const filtered = listings.filter(l => {
    if (selectedCategory && l.category !== selectedCategory) return false;
    return true;
  });

  const uniqueCompanies = new Set(listings.map(l => l.companyId)).size;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Dobro jutro";
    if (h < 18) return "Dobar dan";
    return "Dobro veče";
  };

  return (
    <View style={styles.container}>
      {/* ── Sticky Header ── */}
      <Animated.View style={[styles.headerWrap, { paddingTop: topPad }, headerAnimStyle]}>
        <View style={styles.topRow}>
          <View style={styles.logoRow}>
            <Image
              source={require('@/assets/images/icon.png')}
              style={styles.logoIconBg}
              resizeMode="cover"
            />
            <View>
              <Text style={styles.logoText}>Pazar B2B</Text>
              <Text style={styles.logoSub}>Višak materijala — nova vrednost</Text>
            </View>
          </View>
          <Pressable
            style={styles.profileBtn}
            onPress={() => router.push("/(tabs)/profile")}
          >
            {company?.name ? (
              <View style={styles.profileInitials}>
                <Text style={styles.profileInitialsText}>{company.name.charAt(0).toUpperCase()}</Text>
              </View>
            ) : (
              <Ionicons name="person-circle-outline" size={32} color={Colors.primary} />
            )}
          </Pressable>
        </View>

        {/* Search bar */}
        <Pressable
          style={styles.searchBar}
          onPress={() => router.push("/(tabs)/search")}
        >
          <View style={styles.searchIconWrap}>
            <Ionicons name="search" size={16} color={Colors.primary} />
          </View>
          <Text style={styles.searchPlaceholder}>Pretraži materijale: npr. "drvo hrast"</Text>
          <View style={styles.searchFilter}>
            <Ionicons name="options-outline" size={16} color={Colors.textSecondary} />
          </View>
        </Pressable>
      </Animated.View>

      <Animated.ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 110 + insets.bottom + (Platform.OS === "web" ? 34 : 0) }}
      >
        {/* ── Hero Banner ── */}
        <Animated.View entering={FadeIn.duration(600)}>
          <LinearGradient
            colors={[Colors.primary, Colors.accent, "#3DB87A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBanner}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroGreeting}>{greeting()}{company?.name ? `, ${company.name.split(" ")[0]}` : ""}!</Text>
              <Text style={styles.heroTagline}>Kupujte, prodajte i poklonite{"\n"}industrijski višak</Text>
            </View>
            <View style={styles.heroDecoration}>
              <Ionicons name="leaf" size={64} color="rgba(255,255,255,0.12)" />
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── Stats Bar ── */}
        <StatsBar listingsCount={listings.length} companiesCount={uniqueCompanies} />

        {/* ── Categories ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>Kategorije</Text>
            </View>
            <Pressable
              onPress={() => setSelectedCategory(null)}
              style={[styles.seeAllBtn, !selectedCategory && styles.seeAllBtnActive]}
            >
              <Text style={[styles.seeAll, !selectedCategory && { color: Colors.primary }]}>Sve</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesRow}
          >
            {CATEGORIES.map((cat, i) => (
              <CategoryChip
                key={cat.id}
                cat={cat}
                selected={selectedCategory === cat.id}
                index={i}
                onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              />
            ))}
          </ScrollView>
        </View>

        {/* ── Featured Banner ── */}
        {!selectedCategory && listings.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.featuredBanner}>
            <LinearGradient
              colors={["#F0FFF5", "#E0F5EB"]}
              style={styles.featuredGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.featuredContent}>
                <View style={styles.featuredIcon}>
                  <Ionicons name="star" size={20} color={Colors.warning} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featuredTitle}>Oglas dana</Text>
                  <Text style={styles.featuredDesc} numberOfLines={1}>{listings[0].title}</Text>
                </View>
                <Pressable
                  style={styles.featuredBtn}
                  onPress={() => router.push({ pathname: "/listing/[id]", params: { id: listings[0].id } })}
                >
                  <Text style={styles.featuredBtnText}>Pogledaj</Text>
                  <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
                </Pressable>
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        {/* ── Listings Grid ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>
                {selectedCategory
                  ? CATEGORIES.find(c => c.id === selectedCategory)?.label ?? "Oglasi"
                  : "Najnoviji Oglasi"}
              </Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{filtered.length}</Text>
            </View>
          </View>

          {isLoading ? (
            <View style={styles.loadingGrid}>
              {[0, 1, 2, 3].map(i => (
                <Animated.View
                  key={i}
                  entering={FadeIn.delay(i * 80)}
                  style={styles.skeletonCard}
                >
                  <View style={styles.skeletonImage} />
                  <View style={styles.skeletonBody}>
                    <View style={styles.skeletonLine} />
                    <View style={[styles.skeletonLine, { width: "60%" }]} />
                  </View>
                </Animated.View>
              ))}
            </View>
          ) : filtered.length === 0 ? (
            <Animated.View entering={FadeIn} style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="leaf-outline" size={36} color={Colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>Nema oglasa</Text>
              <Text style={styles.emptyText}>Za izabranu kategoriju trenutno nema aktivnih oglasa</Text>
              <Pressable
                style={styles.emptyAction}
                onPress={() => setSelectedCategory(null)}
              >
                <Text style={styles.emptyActionText}>Prikaži sve</Text>
              </Pressable>
            </Animated.View>
          ) : (
            <View style={styles.grid}>
              {filtered.map((listing, i) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  index={i}
                  onPress={() => router.push({ pathname: "/listing/[id]", params: { id: listing.id } })}
                />
              ))}
            </View>
          )}

          {/* Load More Button */}
          {hasNextPage && !selectedCategory && (
            <View style={{ alignItems: 'center', marginTop: 24, marginBottom: 12 }}>
              <Pressable 
                style={[styles.featuredBtn, { paddingHorizontal: 24, paddingVertical: 12 }]} 
                onPress={loadMoreListings}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <>
                    <Text style={styles.featuredBtnText}>Učitaj još oglasa</Text>
                    <Ionicons name="chevron-down" size={16} color={Colors.primary} />
                  </>
                )}
              </Pressable>
            </View>
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Header
  headerWrap: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 12,
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
  },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.primary, lineHeight: 22 },
  logoSub: { fontFamily: "Inter_400Regular", fontSize: 10, color: Colors.textMuted, lineHeight: 14 },
  profileBtn: { padding: 2 },
  profileInitials: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInitialsText: { fontFamily: "Inter_700Bold", fontSize: 14, color: Colors.white },

  // Search
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.inputBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    height: 48,
    gap: 10,
    paddingHorizontal: 4,
  },
  searchIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.lightGreen,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  searchPlaceholder: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textMuted, flex: 1 },
  searchFilter: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },

  // Hero Banner
  heroBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    flexDirection: "row",
    minHeight: 110,
    alignItems: "center",
  },
  heroContent: { flex: 1, padding: 20, gap: 6 },
  heroGreeting: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "rgba(255,255,255,0.85)" },
  heroTagline: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.white, lineHeight: 24 },
  heroDecoration: {
    position: "absolute",
    right: 16,
    bottom: -8,
    opacity: 1,
  },

  // Stats Bar
  statsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#166534",
    marginHorizontal: 16,
    marginTop: 0,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    gap: 12,
  },
  statItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  statText: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: "rgba(255,255,255,0.9)" },
  statDivider: { width: 1, height: 14, backgroundColor: "rgba(255,255,255,0.3)" },

  // Section
  section: { paddingTop: 24, gap: 14 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionAccent: { width: 4, height: 18, borderRadius: 2, backgroundColor: Colors.primary },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.text },
  seeAll: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.textMuted },
  seeAllBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: Colors.lightGreen,
  },
  seeAllBtnActive: { borderWidth: 1, borderColor: Colors.primary },

  // Categories
  categoriesRow: { paddingHorizontal: 16, gap: 10, flexDirection: "row" },
  categoryChip: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    width: 74,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryLabel: { fontFamily: "Inter_500Medium", fontSize: 11, textAlign: "center" },

  // Featured Banner
  featuredBanner: { marginHorizontal: 16 },
  featuredGradient: { borderRadius: 16, padding: 14, borderWidth: 1, borderColor: Colors.border },
  featuredContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  featuredIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFF8E6",
    alignItems: "center",
    justifyContent: "center",
  },
  featuredTitle: { fontFamily: "Inter_700Bold", fontSize: 12, color: Colors.textMuted, textTransform: "uppercase", letterSpacing: 0.5 },
  featuredDesc: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.text, marginTop: 2 },
  featuredBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  featuredBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.primary },

  // Count badge
  countBadge: {
    backgroundColor: Colors.lightGreen,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countBadgeText: { fontFamily: "Inter_700Bold", fontSize: 13, color: Colors.primary },

  // Grid
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 14 },
  cardOuter: { width: CARD_W },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cardImage: {
    height: 118,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  cardIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  freeBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  freeBadgeText: { fontFamily: "Inter_700Bold", fontSize: 9, color: Colors.white, letterSpacing: 0.5 },
  cardBody: { padding: 12, gap: 5 },
  cardTitle: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.text, lineHeight: 18 },
  cardLocation: { flexDirection: "row", alignItems: "center", gap: 3 },
  cardLocationText: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textMuted, flex: 1 },
  cardFooter: { marginTop: 2 },
  cardPrice: { fontFamily: "Inter_700Bold", fontSize: 14 },

  // Skeleton loader
  loadingGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 14 },
  skeletonCard: {
    width: CARD_W,
    backgroundColor: Colors.white,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  skeletonImage: { height: 118, backgroundColor: Colors.lightGreen },
  skeletonBody: { padding: 12, gap: 8 },
  skeletonLine: { height: 12, borderRadius: 6, backgroundColor: Colors.lightGreen, width: "80%" },

  // Empty state
  emptyState: { alignItems: "center", paddingVertical: 48, gap: 10, paddingHorizontal: 24 },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.lightGreen,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: { fontFamily: "Inter_700Bold", fontSize: 17, color: Colors.text },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textMuted, textAlign: "center" },
  emptyAction: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 24,
  },
  emptyActionText: { fontFamily: "Inter_700Bold", fontSize: 14, color: Colors.white },
});
