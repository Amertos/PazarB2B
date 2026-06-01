import { useEffect } from "react";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { View, ActivityIndicator } from "react-native";
import { Colors } from "@/constants/colors";

export default function IndexScreen() {
  const { company, isLoading, isOnboarded } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isOnboarded) {
      router.replace("/onboarding");
    } else if (!company) {
      router.replace("/login");
    } else {
      router.replace("/(tabs)");
    }
  }, [isLoading, company, isOnboarded]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}
