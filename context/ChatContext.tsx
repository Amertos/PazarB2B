import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef, ReactNode } from 'react';
import { apiRequest } from '@/lib/query-client';
import { useAuth } from './AuthContext';
import { AppState, AppStateStatus } from 'react-native';

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  type: 'text' | 'location' | 'file';
  locationLabel?: string;
  fileName?: string;
  fileSize?: string;
  isRead?: boolean;
}

export interface Conversation {
  id: string;
  companyId: string;
  companyName: string;
  isOnline: boolean;
  listingId?: string;
  listingTitle?: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  messages: Message[];
}

interface ChatContextValue {
  conversations: Conversation[];
  totalUnread: number;
  isLoading: boolean;
  sendMessage: (conversationId: string, text: string, type?: Message['type'], extra?: Partial<Message>) => Promise<void>;
  startConversation: (companyBId: string, companyName: string, listingId?: string, listingTitle?: string) => Promise<Conversation>;
  markRead: (conversationId: string) => void;
  loadMessages: (conversationId: string) => Promise<Message[]>;
  refreshConversations: () => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

function mapApiMessage(m: any): Message {
  return {
    id: m.id,
    senderId: m.senderId,
    text: m.text ?? '',
    timestamp: m.createdAt ?? m.timestamp ?? new Date().toISOString(),
    type: (m.type ?? 'text') as Message['type'],
    locationLabel: m.locationLabel,
    fileName: m.fileName,
    fileSize: m.fileSize,
    isRead: m.isRead,
  };
}

function mapApiConversation(c: any): Conversation {
  return {
    id: c.id,
    companyId: c.otherCompanyId ?? c.companyId ?? '',
    companyName: c.otherCompanyName ?? c.companyName ?? 'Firma',
    isOnline: false,
    listingId: c.listingId ?? undefined,
    listingTitle: c.listingTitle ?? undefined,
    lastMessage: c.lastMessage ?? '',
    lastMessageTime: c.lastMessageTime ?? c.createdAt ?? new Date().toISOString(),
    unread: c.unread ?? 0,
    messages: [],
  };
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const { company } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messageCache, setMessageCache] = useState<Record<string, Message[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (company) {
      loadConversations();
      startPolling();
    } else {
      setConversations([]);
      setMessageCache({});
      stopPolling();
    }
    return () => stopPolling();
  }, [company?.id]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active' && company) {
        loadConversations();
      }
    });
    return () => sub.remove();
  }, [company?.id]);

  function startPolling() {
    stopPolling();
    pollRef.current = setInterval(() => {
      if (company) loadConversations(true);
    }, 8000);
  }

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  async function loadConversations(silent = false) {
    if (!company) return;
    if (!silent) setIsLoading(true);
    try {
      const res = await apiRequest('GET', '/api/conversations');
      const data: any[] = await res.json();
      setConversations(data.map(mapApiConversation));
    } catch (e) {
      if (!silent) console.error('Failed to load conversations', e);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }

  async function loadMessages(conversationId: string): Promise<Message[]> {
    try {
      const res = await apiRequest('GET', `/api/conversations/${conversationId}/messages`);
      const data: any[] = await res.json();
      const mapped = data.map(mapApiMessage);
      setMessageCache(prev => ({ ...prev, [conversationId]: mapped }));
      setConversations(prev =>
        prev.map(c => c.id === conversationId ? { ...c, messages: mapped, unread: 0 } : c)
      );
      return mapped;
    } catch (e) {
      console.error('Failed to load messages', e);
      return messageCache[conversationId] ?? [];
    }
  }

  async function sendMessage(conversationId: string, text: string, type: Message['type'] = 'text', extra?: Partial<Message>) {
    if (!company) return;
    try {
      const res = await apiRequest('POST', `/api/conversations/${conversationId}/messages`, {
        text,
        type,
        locationLabel: extra?.locationLabel,
        fileName: extra?.fileName,
        fileSize: extra?.fileSize,
      });
      const msg: any = await res.json();
      const mapped = mapApiMessage(msg);

      setMessageCache(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] ?? []), mapped],
      }));

      setConversations(prev =>
        prev.map(c =>
          c.id === conversationId
            ? {
                ...c,
                messages: [...c.messages, mapped],
                lastMessage: text || extra?.fileName || extra?.locationLabel || '',
                lastMessageTime: mapped.timestamp,
                unread: 0,
              }
            : c,
        ),
      );
    } catch (e) {
      console.error('Failed to send message', e);
      throw e;
    }
  }

  async function startConversation(companyBId: string, companyName: string, listingId?: string, listingTitle?: string): Promise<Conversation> {
    const existing = conversations.find(c => c.companyId === companyBId && (!listingId || c.listingId === listingId));
    if (existing) return existing;

    const res = await apiRequest('POST', '/api/conversations', { companyBId, listingId });
    const data: any = await res.json();
    const conv: Conversation = {
      ...mapApiConversation({ ...data, otherCompanyId: companyBId, otherCompanyName: companyName }),
      listingTitle,
    };
    setConversations(prev => [conv, ...prev]);
    return conv;
  }

  function markRead(conversationId: string) {
    setConversations(prev =>
      prev.map(c => c.id === conversationId ? { ...c, unread: 0 } : c)
    );
  }

  const refreshConversations = useCallback(() => loadConversations(), [company?.id]);

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

  const value = useMemo(() => ({
    conversations,
    totalUnread,
    isLoading,
    sendMessage,
    startConversation,
    markRead,
    loadMessages,
    refreshConversations,
  }), [conversations, totalUnread, isLoading, messageCache]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
