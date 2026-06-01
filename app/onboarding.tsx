import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Pressable,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import * as Haptics from "expo-haptics";

const { width, height } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    icon: "leaf" as const,
    iconBg: "#C8E6D4",
    title: "Smanji otpad",
    subtitle: "Pretvori ostatke proizvodnje u profit.",
    description: "Povežite se sa lokalnim firmama i pronađite kupce za materijale koji vam više ne trebaju.",
    bgColor: "#EEF7F1",
    accentColor: Colors.primary,
  },
  {
    id: "2",
    icon: "search" as const,
    iconBg: "#C8E6D4",
    title: "Pronađi sirovinu",
    subtitle: "Kupi jeftine materijale od lokalnih partnera.",
    description: "Pristupite tržištu industrijskog viška u Novom Pazaru i okolini. Smanjite troškove nabavke.",
    bgColor: "#F0F9F4",
    accentColor: Colors.accent,
  },
  {
    id: "3",
    icon: "earth" as const,
    iconBg: "#C8E6D4",
    title: "Čuvaj Pazar",
    subtitle: "Zajedno gradimo čistiji grad.",
    description: "Svaki kilogram recikliranog materijala doprinosi čistijoj sredini i jačoj lokalnoj privredi.",
    bgColor: "#EEF4F0",
    accentColor: Colors.primaryDark,
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      await completeOnboarding();
      router.replace("/login");
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSkip = async () => {
    await completeOnboarding();
    router.replace("/login");
  };

  const webTopPad = Platform.OS === "web" ? 67 : 0;
  const webBotPad = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={[styles.container, { paddingTop: webTopPad, paddingBottom: webBotPad }]}>
      <Pressable
        style={[styles.skipBtn, { top: insets.top + 16 }]}
        onPress={handleSkip}
      >
        <Text style={styles.skipText}>Preskoči</Text>
      </Pressable>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        scrollEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(idx);
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.slideImageArea, { backgroundColor: item.bgColor }]}>
              <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
                <Ionicons name={item.icon} size={56} color={item.accentColor} />
              </View>
            </View>
            <View style={styles.slideContent}>
              <Text style={styles.slideTitle}>{item.title}</Text>
              <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
              <Text style={styles.slideDescription}>{item.description}</Text>
            </View>
          </View>
        )}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [styles.nextBtn, { opacity: pressed ? 0.85 : 1 }]}
          onPress={handleNext}
        >
          <LinearGradient
            colors={[Colors.accent, Colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextGradient}
          >
            <Text style={styles.nextText}>
              {currentIndex === SLIDES.length - 1 ? "Započni" : "Dalje"}
            </Text>
            <Ionicons
              name={currentIndex === SLIDES.length - 1 ? "checkmark" : "arrow-forward"}
              size={20}
              color="#fff"
            />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  skipBtn: {
    position: "absolute",
    right: 20,
    zIndex: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  skipText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: Colors.primary,
  },
  slide: {
    flex: 1,
  },
  slideImageArea: {
    height: height * 0.42,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  slideContent: {
    paddingHorizontal: 32,
    paddingTop: 36,
    gap: 12,
  },
  slideTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 30,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  slideSubtitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
    color: Colors.primary,
    lineHeight: 24,
  },
  slideDescription: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 24,
    gap: 20,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  nextBtn: {
    borderRadius: 14,
    overflow: "hidden",
  },
  nextGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  nextText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#fff",
    letterSpacing: 0.5,
  },
});
