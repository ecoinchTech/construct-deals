export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participants: {
    userId: string;
    name: string;
    role: string;
  }[];
  subject: string;
  relatedTo?: {
    type: 'rfq' | 'bid' | 'contract' | 'invoice' | 'dispute';
    id: string;
  };
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConversationRequest {
  participantIds: string[];
  subject: string;
  relatedTo?: {
    type: 'rfq' | 'bid' | 'contract' | 'invoice' | 'dispute';
    id: string;
  };
  initialMessage?: string;
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  attachments?: File[];
}

export interface ConversationFilters {
  relatedTo?: {
    type: string;
    id: string;
  };
  search?: string;
  page?: number;
  limit?: number;
}
