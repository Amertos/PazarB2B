import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useChat, Message } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import * as Haptics from "expo-haptics";

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("sr-RS", { hour: "2-digit", minute: "2-digit" });
}

function formatDateGroup(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "DANAS";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "JUČE";
  return d.toLocaleDateString("sr-RS", { day: "numeric", month: "long" });
}

function MessageBubble({ message, isMe }: { message: Message; isMe: boolean }) {
  if (message.type === "file") {
    return (
      <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
        {!isMe && <View style={styles.bubbleAvatar} />}
        <View style={[styles.fileBubble, isMe && styles.fileBubbleMe]}>
          <View style={styles.fileIcon}>
            <Ionicons name="document-text" size={20} color="#E53E3E" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.fileName, isMe && { color: Colors.white }]}>{message.fileName}</Text>
            <Text style={[styles.fileSize, isMe && { color: "rgba(255,255,255,0.7)" }]}>{message.fileSize}</Text>
          </View>
        </View>
      </View>
    );
  }

  if (message.type === "location") {
    return (
      <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
        {!isMe && <View style={styles.bubbleAvatar} />}
        <View style={styles.locationBubble}>
          <View style={styles.locationMapPreview}>
            <Ionicons name="location" size={28} color={Colors.primary} />
          </View>
          <Text style={styles.locationLabel}>{message.locationLabel}</Text>
          <Pressable>
            <Text style={styles.locationLink}>Pogledaj na mapi</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
      {!isMe && <View style={styles.bubbleAvatar} />}
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
        <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>{message.text}</Text>
        <View style={styles.bubbleMeta}>
          <Text style={[styles.bubbleTime, isMe && styles.bubbleTimeMe]}>
            {formatTime(message.timestamp)}
          </Text>
          {isMe && (
            <Ionicons
              name={message.isRead ? "checkmark-done" : "checkmark"}
              size={14}
              color="rgba(255,255,255,0.7)"
            />
          )}
        </View>
      </View>
    </View>
  );
}

export default function ChatThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { conversations, sendMessage, markRead, loadMessages } = useChat();
  const { company } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoadingMsgs, setIsLoadingMsgs] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const conversation = conversations.find(c => c.id === id);
  const webTopPad = Platform.OS === "web" ? 67 : 0;
  const botPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  useEffect(() => {
    if (id) {
      markRead(id);
      fetchMessages();
      const interval = setInterval(() => {
        loadMessages(id).then(msgs => setMessages(msgs)).catch(() => {});
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [id]);

  async function fetchMessages() {
    if (!id) return;
    setIsLoadingMsgs(true);
    try {
      const msgs = await loadMessages(id);
      setMessages(msgs);
    } finally {
      setIsLoadingMsgs(false);
    }
  }

  async function handleSend() {
    const text = inputText.trim();
    if (!text || !id) return;
    setInputText("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await sendMessage(id, text);
      const msgs = await loadMessages(id);
      setMessages(msgs);
    } catch (e) {
      console.error("Send failed", e);
    }
  }

  if (!conversation && !isLoadingMsgs) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Razgovor nije pronađen</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Nazad</Text>
        </Pressable>
      </View>
    );
  }

  const reversedMessages = [...messages].reverse();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + webTopPad }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </Pressable>
        <View style={styles.headerInfo}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>
              {conversation?.companyName?.charAt(0) ?? "?"}
            </Text>
          </View>
          <View>
            <Text style={styles.headerName}>{conversation?.companyName ?? "Razgovor"}</Text>
            {conversation?.listingTitle ? (
              <Text style={styles.headerSub} numberOfLines={1}>re: {conversation.listingTitle}</Text>
            ) : null}
          </View>
        </View>
        <Pressable style={styles.callIconBtn} onPress={fetchMessages}>
          <Ionicons name="refresh-outline" size={22} color={Colors.text} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {isLoadingMsgs ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={reversedMessages}
            inverted
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <Ionicons name="chatbubble-outline" size={36} color={Colors.textMuted} />
                <Text style={styles.emptyChatText}>Nema poruka još uvek. Počnite razgovor!</Text>
              </View>
            }
            renderItem={({ item, index }) => {
              const isMe = item.senderId === company?.id;
              const prevMsg = reversedMessages[index + 1];
              const showDate =
                !prevMsg || formatDateGroup(prevMsg.timestamp) !== formatDateGroup(item.timestamp);
              return (
                <View>
                  {showDate && (
                    <View style={styles.dateGroup}>
                      <Text style={styles.dateGroupText}>{formatDateGroup(item.timestamp)}</Text>
                    </View>
                  )}
                  <MessageBubble message={item} isMe={isMe} />
                </View>
              );
            }}
          />
        )}

        <View style={[styles.inputRow, { paddingBottom: botPad + 8 }]}>
          <TextInput
            style={styles.textInput}
            placeholder="Napišite poruku..."
            placeholderTextColor={Colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
            onSubmitEditing={handleSend}
          />

          <Pressable
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F2F5" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { padding: 4 },
  headerInfo: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.midGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatarText: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.primary },
  headerName: { fontFamily: "Inter_700Bold", fontSize: 15, color: Colors.text },
  headerSub: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textMuted },
  callIconBtn: { padding: 6 },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyChat: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 60, gap: 12 },
  emptyChatText: { fontFamily: "Inter_400Regular", fontSize: 15, color: Colors.textMuted, textAlign: "center" },
  dateGroup: { alignItems: "center", paddingVertical: 8 },
  dateGroupText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: Colors.textMuted,
    backgroundColor: "rgba(0,0,0,0.06)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    letterSpacing: 0.5,
    overflow: "hidden",
  },
  msgRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 4,
    gap: 8,
  },
  msgRowMe: { flexDirection: "row-reverse" },
  bubbleAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.midGreen,
  },
  bubble: {
    maxWidth: "75%",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 4,
  },
  bubbleMe: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  bubbleThem: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  bubbleText: { fontFamily: "Inter_400Regular", fontSize: 15, color: Colors.text, lineHeight: 22 },
  bubbleTextMe: { color: Colors.white },
  bubbleMeta: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-end" },
  bubbleTime: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textMuted },
  bubbleTimeMe: { color: "rgba(255,255,255,0.7)" },
  fileBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    maxWidth: "75%",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fileBubbleMe: { backgroundColor: Colors.primary, borderColor: "transparent" },
  fileIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  fileName: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.text },
  fileSize: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textMuted },
  locationBubble: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: "hidden",
    maxWidth: "70%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  locationMapPreview: {
    height: 90,
    backgroundColor: Colors.lightGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  locationLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.text, padding: 10, paddingBottom: 4 },
  locationLink: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.primary, paddingHorizontal: 10, paddingBottom: 12 },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: Colors.inputBackground,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { backgroundColor: Colors.textMuted },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  notFoundText: { fontFamily: "Inter_500Medium", fontSize: 16, color: Colors.textSecondary },
  backLink: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.primary },
});
