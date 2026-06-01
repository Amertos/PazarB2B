import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/colors";
import { useListings } from "@/context/ListingsContext";
import { apiRequest } from "@/lib/query-client";
import * as Haptics from "expo-haptics";

export default function EditListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { getListingById, refreshListings } = useListings();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const listing = getListingById(id);
    if (listing) {
      setTitle(listing.title);
      setDescription(listing.description);
      if (listing.price) setPrice(listing.price.toString());
    }
  }, [id]);

  async function handleSave() {
    setIsLoading(true);
    try {
      await apiRequest('PUT', `/api/listings/${id}`, {
        title,
        description,
        price: price ? parseFloat(price) : undefined
      });
      await refreshListings();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Uspeh", "Oglas je uspešno ažuriran.");
      router.back();
    } catch (e) {
      Alert.alert("Greška", "Nije moguće izmeniti oglas.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Izmeni oglas</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.formGroup}>
            <Text style={styles.label}>Naslov oglasa</Text>
            <TextInput style={styles.textInput} value={title} onChangeText={setTitle} />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Opis materijala</Text>
            <TextInput style={[styles.textInput, styles.textArea]} value={description} onChangeText={setDescription} multiline />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Cena (RSD)</Text>
            <TextInput style={styles.textInput} value={price} onChangeText={setPrice} keyboardType="numeric" />
          </View>

          <Pressable style={({ pressed }) => [styles.submitBtn, { opacity: pressed ? 0.88 : 1 }]} onPress={handleSave} disabled={isLoading}>
            <LinearGradient colors={[Colors.accent, Colors.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitGradient}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>SAČUVAJ IZMENE</Text>}
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { padding: 8 },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.text },
  content: { padding: 16, gap: 16 },
  formGroup: { gap: 8 },
  label: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.text },
  textInput: { backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.inputBorder, paddingHorizontal: 14, paddingVertical: 13, fontFamily: "Inter_400Regular", fontSize: 15, color: Colors.text },
  textArea: { minHeight: 96, paddingTop: 13, textAlignVertical: "top" },
  submitBtn: { borderRadius: 14, overflow: "hidden", marginTop: 20 },
  submitGradient: { paddingVertical: 15, alignItems: "center", justifyContent: "center" },
  submitText: { fontFamily: "Inter_700Bold", fontSize: 15, color: "#fff", letterSpacing: 1 },
});
