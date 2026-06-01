import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/colors";
import { useListings, CATEGORIES } from "@/context/ListingsContext";
import { useAuth } from "@/context/AuthContext";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";

export default function NewListingScreen() {
  const insets = useSafeAreaInsets();
  const { addListing } = useListings();
  const { company } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState(company?.address || "");
  const [priceType, setPriceType] = useState<"sale" | "free">("sale");
  const [price, setPrice] = useState("");
  const [priceUnit, setPriceUnit] = useState("kom");
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [error, setError] = useState("");

  const webTopPad = Platform.OS === "web" ? 67 : 0;

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled) {
      const uris = result.assets.map(a => a.base64 ? `data:image/jpeg;base64,${a.base64}` : a.uri);
      setImages(prev => [...prev, ...uris].slice(0, 10));
    }
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Dozvola potrebna", "Dozvolite pristup kameri u podešavanjima.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8, base64: true });
    if (!result.canceled) {
      const uri = result.assets[0].base64 ? `data:image/jpeg;base64,${result.assets[0].base64}` : result.assets[0].uri;
      setImages(prev => [...prev, uri].slice(0, 10));
    }
  }

  async function handleSubmit() {
    if (!title.trim()) { setError("Unesite naslov oglasa"); return; }
    if (!category) { setError("Izaberite kategoriju"); return; }
    if (!location.trim()) { setError("Unesite lokaciju preuzimanja"); return; }
    if (priceType === "sale" && !price.trim()) { setError("Unesite cenu"); return; }
    setError("");
    setIsLoading(true);
    try {
      await addListing({
        title: title.trim(),
        description: description.trim(),
        category,
        priceType,
        price: priceType === "sale" ? parseFloat(price) : undefined,
        priceUnit: priceType === "sale" ? priceUnit : undefined,
        location: location.trim(),
        images,
        companyId: company?.id || "me",
        isAvailable: true,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e.message || "Greška pri postavljanju oglasa");
    } finally {
      setIsLoading(false);
    }
  }

  const topPad = insets.top + webTopPad;
  const botPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={[styles.header, { paddingTop: topPad }]}>
          <Pressable onPress={() => router.replace("/(tabs)")} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Postavi novi višak</Text>
          <View style={{ width: 34 }} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: botPad + 100 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={Colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={styles.sectionLabel}>DODAJ SLIKE</Text>
          <Pressable style={styles.imagePicker} onPress={pickImage}>
            {images.length === 0 ? (
              <View style={styles.imagePickerInner}>
                <View style={styles.cameraCircle}>
                  <Ionicons name="camera-outline" size={28} color={Colors.primary} />
                </View>
                <Text style={styles.imagePickerTitle}>DODAJ SLIKE</Text>
                <Text style={styles.imagePickerDesc}>Kliknite da dodate fotografije materijala (do 10 slika)</Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: "100%" }} contentContainerStyle={{ padding: 12, gap: 8 }}>
                {images.map((uri, i) => (
                  <View key={i} style={styles.imageThumbnailWrap}>
                    <Pressable
                      style={styles.removeImageBtn}
                      onPress={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                    >
                      <Ionicons name="close-circle" size={20} color="#fff" />
                    </Pressable>
                    <View style={styles.imageThumbnail}>
                      <Ionicons name="image-outline" size={24} color={Colors.primary} />
                    </View>
                  </View>
                ))}
                {images.length < 10 && (
                  <Pressable style={styles.addMoreBtn} onPress={pickImage}>
                    <Ionicons name="add" size={24} color={Colors.primary} />
                  </Pressable>
                )}
              </ScrollView>
            )}
          </Pressable>
          <Pressable style={styles.cameraBtn} onPress={takePhoto}>
            <Ionicons name="camera-outline" size={18} color={Colors.primary} />
            <Text style={styles.cameraBtnText}>Slikaj telefonom</Text>
          </Pressable>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Naslov oglasa</Text>
            <TextInput
              style={styles.textInput}
              placeholder="npr. Armaturna mreža Q335"
              placeholderTextColor={Colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Opis materijala (količina, stanje)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Detaljan opis materijala, dimenzije, stanje..."
              placeholderTextColor={Colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Kategorija</Text>
            <Pressable style={styles.selectRow} onPress={() => setShowCategoryPicker(true)}>
              <Text style={[styles.selectText, !category && { color: Colors.textMuted }]}>
                {category ? CATEGORIES.find(c => c.id === category)?.label : "Izaberi kategoriju"}
              </Text>
              <Ionicons name="chevron-down" size={18} color={Colors.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Lokacija preuzimanja</Text>
            <View style={styles.inputIconRow}>
              <Ionicons name="location-outline" size={18} color={Colors.textMuted} />
              <TextInput
                style={[styles.textInput, { flex: 1, borderWidth: 0, backgroundColor: "transparent", paddingHorizontal: 4 }]}
                placeholder="Grad ili opština"
                placeholderTextColor={Colors.textMuted}
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </View>

          <View style={styles.priceSection}>
            <Text style={styles.sectionLabel}>CENA I USLOVI</Text>

            <Pressable
              style={styles.radioRow}
              onPress={() => setPriceType("sale")}
            >
              <View style={[styles.radio, priceType === "sale" && styles.radioActive]}>
                {priceType === "sale" && <View style={styles.radioDot} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.radioLabel}>Prodajem</Text>
                {priceType === "sale" && (
                  <View style={styles.priceInputRow}>
                    <TextInput
                      style={styles.priceInput}
                      placeholder="Iznos"
                      placeholderTextColor={Colors.textMuted}
                      value={price}
                      onChangeText={setPrice}
                      keyboardType="numeric"
                    />
                    <TextInput
                      style={styles.unitInput}
                      value={priceUnit}
                      onChangeText={setPriceUnit}
                      placeholder="RSD"
                      placeholderTextColor={Colors.textMuted}
                    />
                  </View>
                )}
              </View>
            </Pressable>

            <Pressable
              style={styles.radioRow}
              onPress={() => setPriceType("free")}
            >
              <View style={[styles.radio, priceType === "free" && styles.radioActive]}>
                {priceType === "free" && <View style={styles.radioDot} />}
              </View>
              <View>
                <Text style={styles.radioLabel}>Poklanjam</Text>
                <Text style={styles.radioSub}>Besplatno preuzimanje</Text>
              </View>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.footer, { paddingBottom: botPad + 16 }]}>
        <Pressable
          style={({ pressed }) => [styles.submitBtn, { opacity: pressed ? 0.88 : 1 }]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <LinearGradient
            colors={[Colors.accent, Colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitGradient}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="arrow-up-circle-outline" size={20} color="#fff" />
                <Text style={styles.submitText}>POSTAVI OGLAS</Text>
              </>
            )}
          </LinearGradient>
        </Pressable>
        <Text style={styles.termsNotice}>
          Objavljivanjem oglasa prihvatate uslove korišćenja Pazar B2B platforme.
        </Text>
      </View>

      <Modal visible={showCategoryPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Izaberite kategoriju</Text>
            <ScrollView>
              {CATEGORIES.map(cat => (
                <Pressable
                  key={cat.id}
                  style={({ pressed }) => [styles.catItem, { opacity: pressed ? 0.7 : 1 }]}
                  onPress={() => { setCategory(cat.id); setShowCategoryPicker(false); }}
                >
                  <View style={[styles.catIconSmall, { backgroundColor: cat.color + "18" }]}>
                    <Ionicons name={cat.icon as any} size={18} color={cat.color} />
                  </View>
                  <Text style={[styles.catItemText, cat.id === category && { color: Colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                    {cat.label}
                  </Text>
                  {cat.id === category && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  closeBtn: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 17, color: Colors.text },
  content: { padding: 16, gap: 16 },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FEF2F2", borderRadius: 10, padding: 12 },
  errorText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.error, flex: 1 },
  sectionLabel: { fontFamily: "Inter_700Bold", fontSize: 12, color: Colors.primary, letterSpacing: 1 },
  imagePicker: {
    borderWidth: 2,
    borderColor: Colors.midGreen,
    borderRadius: 14,
    borderStyle: "dashed",
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.lightGreen,
    overflow: "hidden",
  },
  imagePickerInner: { alignItems: "center", padding: 24, gap: 10 },
  cameraCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.midGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  imagePickerTitle: { fontFamily: "Inter_700Bold", fontSize: 14, color: Colors.primary, letterSpacing: 0.5 },
  imagePickerDesc: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary, textAlign: "center" },
  imageThumbnailWrap: { width: 80, height: 80, position: "relative" },
  removeImageBtn: { position: "absolute", top: -6, right: -6, zIndex: 1 },
  imageThumbnail: {
    width: 80,
    height: 80,
    backgroundColor: Colors.midGreen,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  addMoreBtn: {
    width: 80,
    height: 80,
    backgroundColor: Colors.lightGreen,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.midGreen,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.lightGreen,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: -8,
  },
  cameraBtnText: { fontFamily: "Inter_500Medium", fontSize: 14, color: Colors.primary },
  formGroup: { gap: 8 },
  label: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.text },
  textInput: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: Colors.text,
  },
  textArea: { minHeight: 96, paddingTop: 13 },
  selectRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    paddingHorizontal: 14,
    height: 52,
  },
  selectText: { fontFamily: "Inter_400Regular", fontSize: 15, color: Colors.text },
  inputIconRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    paddingHorizontal: 14,
    height: 52,
    gap: 8,
  },
  priceSection: { gap: 12, backgroundColor: Colors.white, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.border },
  radioRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  radioActive: { borderColor: Colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  radioLabel: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.text },
  radioSub: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textMuted },
  priceInputRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  priceInput: {
    flex: 1,
    backgroundColor: Colors.inputBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    paddingHorizontal: 12,
    height: 44,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: Colors.text,
  },
  unitInput: {
    width: 60,
    backgroundColor: Colors.inputBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    paddingHorizontal: 12,
    height: 44,
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.primary,
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
  },
  submitBtn: { borderRadius: 14, overflow: "hidden" },
  submitGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 15, gap: 10 },
  submitText: { fontFamily: "Inter_700Bold", fontSize: 15, color: "#fff", letterSpacing: 1 },
  termsNotice: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textMuted, textAlign: "center" },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: "flex-end" },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "70%",
  },
  modalHandle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: "center", marginBottom: 12 },
  modalTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.text, marginBottom: 12 },
  catItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.separator },
  catIconSmall: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  catItemText: { fontFamily: "Inter_400Regular", fontSize: 16, color: Colors.text, flex: 1 },
});
