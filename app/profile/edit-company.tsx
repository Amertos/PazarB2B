import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';

export default function EditCompanyScreen() {
  const insets = useSafeAreaInsets();
  const { company } = useAuth();
  
  // Dummy local state to act as a form
  const [name, setName] = useState(company?.name || '');
  const [address, setAddress] = useState(company?.address || '');
  const [phone, setPhone] = useState(company?.phone || '');

  function handleSave() {
    Alert.alert("Sačuvano", "Vaši podaci su uspešno ažurirani.");
    router.back();
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Uređivanje Profila</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Ime firme</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />
        
        <Text style={styles.label}>Adresa</Text>
        <TextInput style={styles.input} value={address} onChangeText={setAddress} />
        
        <Text style={styles.label}>Telefon</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        
        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Sačuvaj izmene</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { padding: 8 },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, color: Colors.text },
  form: { padding: 16 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.text, marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 14, fontFamily: 'Inter_400Regular' },
  saveBtn: { backgroundColor: Colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 32 },
  saveBtnText: { color: Colors.white, fontFamily: 'Inter_700Bold', fontSize: 16 },
});
