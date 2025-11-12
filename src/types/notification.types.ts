export type NotificationType = 
  | 'rfq_created' 
  | 'bid_submitted' 
  | 'contract_awarded' 
  | 'contract_accepted'
  | 'milestone_updated'
  | 'invoice_submitted'
  | 'payment_received'
  | 'dispute_raised'
  | 'message_received'
  | 'document_uploaded'
  | 'user_assigned';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  isRead: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  readAt?: string;
}

export interface CreateNotificationRequest {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface NotificationFilters {
  isRead?: boolean;
  type?: NotificationType;
  priority?: NotificationPriority;
  page?: number;
  limit?: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
}
