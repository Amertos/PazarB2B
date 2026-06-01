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
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import * as Haptics from "expo-haptics";

const INDUSTRIES = [
  "Tekstilna industrija",
  "Drvna industrija",
  "Kožarska industrija",
  "Metalurgija",
  "Plastična industrija",
  "Prehrambena industrija",
  "Hemijska industrija",
  "Elektro industrija",
  "Građevinarstvo",
  "Ostalo",
];

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [industry, setIndustry] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showIndustryPicker, setShowIndustryPicker] = useState(false);

  const webTopPad = Platform.OS === "web" ? 67 : 0;
  const webBotPad = Platform.OS === "web" ? 34 : 0;

  async function handleRegister() {
    if (!name || !contactPerson || !email || !phone || !address || !industry || !password) {
      setError("Molimo popunite sva obavezna polja");
      return;
    }
    if (!termsAccepted) {
      setError("Morate prihvatiti uslove korišćenja");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const pib = Math.floor(100000000 + Math.random() * 900000000).toString();
      await register({ name, pib, contactPerson, email, phone, address, industry, password });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e.message || "Greška pri registraciji");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: webTopPad, paddingBottom: webBotPad }]}>
      <LinearGradient colors={["#EEF7F1", "#F5F8F5"]} style={StyleSheet.absoluteFill} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={Colors.primary} />
            </Pressable>
            <Text style={styles.headerTitle}>Registracija novog biznisa</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Pazar B2B Višak</Text>
            <Text style={styles.cardDesc}>
              Popunite podatke o Vašem preduzeću kako biste pristupili platformi za razmenu materijala.
            </Text>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={Colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Field label="Naziv Firme (PIB)" icon="business-outline" placeholder="npr. Tekstil d.o.o. 101234567" value={name} onChangeText={setName} />
            <Field label="Ime i Prezime kontakt osobe" icon="person-outline" placeholder="Unesite Vaše ime i prezime" value={contactPerson} onChangeText={setContactPerson} />
            <Field label="E-mail adresa" icon="mail-outline" placeholder="primer@firma.rs" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <Field label="Broj telefona" icon="call-outline" placeholder="+381 60 123 456" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <Field label="Adresa u Novom Pazaru" icon="location-outline" placeholder="Ulica i broj" value={address} onChangeText={setAddress} />
            <Field label="Lozinka" icon="lock-closed-outline" placeholder="Kreirajte lozinku" value={password} onChangeText={setPassword} secureTextEntry />

            <View style={styles.formGroup}>
              <Text style={styles.label}>Primarna delatnost</Text>
              <Pressable
                style={styles.inputRow}
                onPress={() => setShowIndustryPicker(true)}
              >
                <Ionicons name="apps-outline" size={18} color={Colors.primary} />
                <Text style={[styles.inputText, !industry && { color: Colors.textMuted }]}>
                  {industry || "Izaberite delatnost"}
                </Text>
                <Ionicons name="chevron-down" size={18} color={Colors.textSecondary} />
              </Pressable>
            </View>

            <Pressable
              style={styles.termsRow}
              onPress={() => setTermsAccepted(v => !v)}
            >
              <View style={[styles.checkbox, termsAccepted && styles.checkboxActive]}>
                {termsAccepted && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={styles.termsText}>
                Prihvatam{" "}
                <Text style={styles.termsLink}>uslove korišćenja</Text>
                {" "}i politiku privatnosti platforme Pazar B2B.
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.registerBtn, { opacity: pressed ? 0.88 : 1 }]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <LinearGradient
                colors={[Colors.accent, Colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.registerGradient}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.registerBtnText}>KREIRAJ NALOG</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </Pressable>

            <View style={styles.loginRow}>
              <Text style={styles.loginHint}>Već imate nalog? </Text>
              <Pressable onPress={() => router.replace("/login")}>
                <Text style={styles.loginLink}>Prijavite se</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showIndustryPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Izaberite delatnost</Text>
            {INDUSTRIES.map(ind => (
              <Pressable
                key={ind}
                style={({ pressed }) => [styles.industryItem, { opacity: pressed ? 0.7 : 1 }]}
                onPress={() => {
                  setIndustry(ind);
                  setShowIndustryPicker(false);
                }}
              >
                <Text style={[styles.industryText, ind === industry && styles.industryTextActive]}>
                  {ind}
                </Text>
                {ind === industry && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Field({ label, icon, secureTextEntry, ...rest }: any) {
  const [secure, setSecure] = useState(secureTextEntry || false);
  return (
    <View style={styles.formGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <Ionicons name={icon} size={18} color={Colors.primary} />
        <TextInput
          style={[styles.inputText, { flex: 1 }]}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={secure}
          {...rest}
        />
        {secureTextEntry && (
          <Pressable onPress={() => setSecure(!secure)}>
            <Ionicons name={secure ? "eye-outline" : "eye-off-outline"} size={18} color={Colors.textSecondary} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 20, gap: 16 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 4 },
  backBtn: { padding: 4 },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.text },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    gap: 14,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 6,
  },
  cardTitle: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.primary },
  cardDesc: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FEF2F2", borderRadius: 10, padding: 12 },
  errorText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.error, flex: 1 },
  formGroup: { gap: 6 },
  label: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.text },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    paddingHorizontal: 14,
    height: 52,
    gap: 10,
  },
  inputText: { fontFamily: "Inter_400Regular", fontSize: 15, color: Colors.text },
  termsRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  termsText: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary, flex: 1, lineHeight: 20 },
  termsLink: { color: Colors.primary, fontFamily: "Inter_600SemiBold" },
  registerBtn: { borderRadius: 14, overflow: "hidden" },
  registerGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, gap: 10 },
  registerBtnText: { fontFamily: "Inter_700Bold", fontSize: 15, color: "#fff", letterSpacing: 1 },
  loginRow: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  loginHint: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textSecondary },
  loginLink: { fontFamily: "Inter_700Bold", fontSize: 14, color: Colors.primary },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: "flex-end" },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 4,
  },
  modalHandle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: "center", marginBottom: 12 },
  modalTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.text, marginBottom: 8 },
  industryItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.separator },
  industryText: { fontFamily: "Inter_400Regular", fontSize: 16, color: Colors.text },
  industryTextActive: { fontFamily: "Inter_600SemiBold", color: Colors.primary },
});
