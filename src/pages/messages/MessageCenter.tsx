import { useState } from 'react';
import { useGetConversationsQuery, useGetMessagesQuery, useSendMessageMutation } from '@/store/api/messageApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const MessageCenter = () => {
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');

  const { data: conversationsData } = useGetConversationsQuery({ page: 1, limit: 50 });
  const { data: messagesData } = useGetMessagesQuery(
    { conversationId: selectedConversation!, page: 1, limit: 100 },
    { skip: !selectedConversation }
  );

  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    try {
      const formData = new FormData();
      formData.append('conversationId', selectedConversation);
      formData.append('content', messageText);

      await sendMessage(formData).unwrap();
      setMessageText('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const selectedConv = conversationsData?.conversations.find(
    (c) => c._id === selectedConversation
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground">Communicate with team members and vendors</p>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <Card className="col-span-4">
          <CardContent className="p-0">
            <div className="p-4 border-b">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversations
              </h3>
            </div>
            <ScrollArea className="h-[calc(100vh-300px)]">
              {conversationsData?.conversations.map((conversation) => (
                <div
                  key={conversation._id}
                  className={`p-4 border-b cursor-pointer transition-colors hover:bg-accent ${
                    selectedConversation === conversation._id ? 'bg-accent' : ''
                  }`}
                  onClick={() => setSelectedConversation(conversation._id)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium truncate">{conversation.subject}</p>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="ml-2">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      {conversation.lastMessage && (
                        <>
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(conversation.lastMessage.createdAt), 'MMM d, h:mm a')}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Messages Area */}
        <Card className="col-span-8">
          <CardContent className="p-0 flex flex-col h-full">
            {selectedConversation ? (
              <>
                {/* Header */}
                <div className="p-4 border-b">
                  <h3 className="font-semibold">{selectedConv?.subject}</h3>
                  <div className="flex gap-2 mt-2">
                    {selectedConv?.participants.map((participant) => (
                      <Badge key={participant.userId} variant="outline">
                        {participant.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messagesData?.messages.map((message) => (
                      <div key={message._id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{message.senderName}</span>
                            <Badge variant="secondary" className="text-xs">
                              {message.senderRole}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(message.createdAt), 'MMM d, h:mm a')}
                            </span>
                          </div>
                          <div className="bg-muted rounded-lg p-3">
                            <p className="text-sm">{message.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage} disabled={isSending || !messageText.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select a conversation to view messages
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MessageCenter;
