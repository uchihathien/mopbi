import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { useAuthStore } from '../../stores/authStore';
import { chatService } from '../../services/chat.service';

export default function ChatScreen() {
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const { user } = useAuthStore();

    useEffect(() => {
        loadChatHistory();
    }, []);

    const loadChatHistory = async () => {
        try {
            const data = await chatService.getChatHistory();
            const formattedMessages = data.messages.map((msg: any) => ({
                _id: msg.id,
                text: msg.message,
                createdAt: new Date(msg.createdAt),
                user: {
                    _id: msg.isUser ? user?.id || '1' : '2',
                    name: msg.isUser ? user?.fullName || 'Bạn' : 'AI Assistant',
                    avatar: msg.isUser ? undefined : '🤖',
                },
            })).reverse();
            setMessages(formattedMessages);
        } catch (error) {
            console.error('Load chat history error:', error);
        }
    };

    const onSend = useCallback(async (newMessages: IMessage[] = []) => {
        const userMessage = newMessages[0];
        setMessages((previousMessages) =>
            GiftedChat.append(previousMessages, newMessages)
        );

        setIsTyping(true);
        try {
            const response = await chatService.sendMessage(userMessage.text);

            const aiMessage: IMessage = {
                _id: Math.random().toString(),
                text: response.message,
                createdAt: new Date(),
                user: {
                    _id: '2',
                    name: 'AI Assistant',
                    avatar: '🤖',
                },
            };

            setMessages((previousMessages) =>
                GiftedChat.append(previousMessages, [aiMessage])
            );
        } catch (error) {
            console.error('Send message error:', error);
        } finally {
            setIsTyping(false);
        }
    }, []);

    return (
        <View style={styles.container}>
            <GiftedChat
                messages={messages}
                onSend={(messages) => onSend(messages)}
                user={{
                    _id: user?.id || '1',
                    name: user?.fullName || 'Bạn',
                }}
                isTyping={isTyping}
                placeholder="Nhập tin nhắn..."
                alwaysShowSend
                renderUsernameOnMessage
                locale="vi"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});
