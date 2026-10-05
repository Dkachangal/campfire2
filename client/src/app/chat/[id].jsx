import { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { API_URL, SOCKET_URL } from '../../config';

export default function ChatScreen() {
  const SOCKET_URL = 'https://campfire2-sndp.onrender.com/';
  const API_URL = 'https://campfire2-sndp.onrender.com/api'; 
  const router = useRouter();
  const { id: roomId, receiverUserName } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const socketRef = useRef(null);
  const flatListRef = useRef();

  useEffect(() => {
    const initChat = async () => {
      const user = await AsyncStorage.getItem('userName');
      setCurrentUser(user);

      const res = await fetch(`${API_URL}/messages/history/${roomId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.history || []);
      }

      socketRef.current = io(SOCKET_URL);
      socketRef.current.emit("join_chat", { roomId });
      
      socketRef.current.on("msg_from_server", (newMsg) => {
        setMessages((prev) => [...prev, newMsg]);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      });
    };
    initChat();

    return () => socketRef.current?.disconnect();
  }, [roomId]);

  const sendMessage = () => {
    if (!text.trim()) return;
    const msgData = { roomId, senderUserName: currentUser, receiverUserName, text };
    socketRef.current.emit("msg_to_server", msgData);
    setText('');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerText}>@ {receiverUserName}</Text>
        </View>
        
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.chatPadding}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            const isMe = item.senderUserName === currentUser;
            return (
              <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
                <Text style={[styles.msgText, !isMe && { color: '#3D2B1F' }]}>
                  {item.message || item.text}
                </Text>
              </View>
            );
          }}
        />

        <View style={styles.inputBox}>
          <TextInput 
            style={styles.input} 
            value={text} 
            onChangeText={setText} 
            placeholder="Send a spark..." 
            placeholderTextColor="#A38F82" 
            multiline
          />
          <TouchableOpacity style={[styles.sendBtn, !text.trim() && { opacity: 0.5 }]} onPress={sendMessage}>
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FCF8F2' },
  container: { flex: 1 },
  header: { padding: 15, backgroundColor: '#FCF8F2', flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: 'rgba(224, 90, 16, 0.1)' },
  backBtn: { marginRight: 15, padding: 5 },
  backText: { color: '#E05A10', fontSize: 24, fontWeight: 'bold' },
  headerText: { color: '#3D2B1F', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
  chatPadding: { padding: 15, paddingBottom: 30 },
  bubble: { maxWidth: '80%', padding: 15, marginVertical: 6, borderRadius: 20 },
  myBubble: { alignSelf: 'flex-end', backgroundColor: '#E05A10', borderBottomRightRadius: 4, shadowColor: '#E05A10', shadowOpacity: 0.2, shadowRadius: 5, elevation: 2 },
  theirBubble: { alignSelf: 'flex-start', backgroundColor: 'rgba(224, 90, 16, 0.08)', borderWidth: 1, borderColor: 'rgba(224, 90, 16, 0.15)', borderBottomLeftRadius: 4 },
  msgText: { color: '#FFF', fontSize: 16, lineHeight: 22 },
  inputBox: { flexDirection: 'row', padding: 15, backgroundColor: '#FCF8F2', borderTopWidth: 1, borderColor: 'rgba(224, 90, 16, 0.1)', alignItems: 'flex-end' },
  input: { flex: 1, backgroundColor: 'rgba(224, 90, 16, 0.05)', color: '#3D2B1F', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 15, borderRadius: 25, marginRight: 10, fontSize: 16, maxHeight: 120, borderWidth: 1, borderColor: 'rgba(224, 90, 16, 0.15)' },
  sendBtn: { backgroundColor: '#E05A10', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  sendIcon: { color: '#FFF', fontSize: 20, fontWeight: 'bold' }
});