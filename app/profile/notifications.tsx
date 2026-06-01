import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Switch } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState(true);
  const [promotions, setPromotions] = useState(false);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Obaveštenja</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.content}>
        <View style={styles.row}>
          <View style={styles.textWrap}>
            <Text style={styles.rowTitle}>Nove poruke</Text>
            <Text style={styles.rowDesc}>Dobijajte obaveštenja kada vam neko pošalje poruku</Text>
          </View>
          <Switch value={messages} onValueChange={setMessages} trackColor={{ true: Colors.primary }} />
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <View style={styles.textWrap}>
            <Text style={styles.rowTitle}>Promocije</Text>
            <Text style={styles.rowDesc}>Obaveštenja o novim funkcijama i popustima</Text>
          </View>
          <Switch value={promotions} onValueChange={setPromotions} trackColor={{ true: Colors.primary }} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { padding: 8 },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, color: Colors.text },
  content: { padding: 16, backgroundColor: Colors.white, marginTop: 16, borderRadius: 12, marginHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  textWrap: { flex: 1, paddingRight: 10 },
  rowTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: Colors.text, marginBottom: 4 },
  rowDesc: { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.textMuted },
  divider: { height: 1, backgroundColor: Colors.border },
});
