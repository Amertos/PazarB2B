import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useChat, Conversation } from "@/context/ChatContext";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Upravo";
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function ConversationItem({ conversation, onPress }: { conversation: Conversation; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.convItem, { backgroundColor: pressed ? Colors.inputBackground : Colors.white }]}
      onPress={onPress}
    >
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{conversation.companyName.charAt(0)}</Text>
        </View>
        {conversation.isOnline && <View style={styles.onlineDot} />}
      </View>

      <View style={styles.convBody}>
        <View style={styles.convTopRow}>
          <Text style={styles.convName} numberOfLines={1}>{conversation.companyName}</Text>
          <Text style={styles.convTime}>{timeAgo(conversation.lastMessageTime)}</Text>
        </View>
        {conversation.listingTitle && (
          <Text style={styles.convListing} numberOfLines={1}>
            Re: {conversation.listingTitle}
          </Text>
        )}
        <Text
          style={[styles.convLastMsg, conversation.unread > 0 && { fontFamily: "Inter_600SemiBold", color: Colors.text }]}
          numberOfLines={1}
        >
          {conversation.lastMessage || "Započnite razgovor..."}
        </Text>
      </View>

      {conversation.unread > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{conversation.unread}</Text>
        </View>
      )}
    </Pressable>
  );
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { conversations } = useChat();

  const webTopPad = Platform.OS === "web" ? 67 : 0;
  const topPad = insets.top + webTopPad;
  const botPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  const sorted = [...conversations].sort(
    (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad }]}>
        <Text style={styles.headerTitle}>Poruke</Text>
        <Ionicons name="create-outline" size={22} color={Colors.primary} />
      </View>

      <FlatList
        data={sorted}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: botPad + 80 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={56} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Nema poruka</Text>
            <Text style={styles.emptyDesc}>
              Pošaljite poruku prodavcu direktno sa stranice oglasa
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <ConversationItem
            conversation={item}
            onPress={() => router.push({ pathname: "/chat-thread/[id]", params: { id: item.id } })}
          />
        )}
      />
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
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 24, color: Colors.text },
  convItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  avatarWrap: { position: "relative" },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.midGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.primary },
  onlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: Colors.white,
  },
  convBody: { flex: 1, gap: 3 },
  convTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  convName: { fontFamily: "Inter_700Bold", fontSize: 15, color: Colors.text, flex: 1 },
  convTime: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textMuted },
  convListing: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.primary },
  convLastMsg: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  unreadText: { fontFamily: "Inter_700Bold", fontSize: 11, color: Colors.white },
  separator: { height: 1, backgroundColor: Colors.separator, marginLeft: 80 },
  emptyState: { alignItems: "center", paddingTop: 80, paddingHorizontal: 40, gap: 12 },
  emptyTitle: { fontFamily: "Inter_600SemiBold", fontSize: 18, color: Colors.text },
  emptyDesc: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textMuted, textAlign: "center", lineHeight: 22 },
});
