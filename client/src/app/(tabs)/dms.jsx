import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { API_URL } from '../../config';

export default function DmsScreen() {
  const API_URL = 'https://campfire2-sndp.onrender.com/api';
  const router = useRouter();
  const [chats, setChats] = useState([]);
  const [currentUser, setCurrentUser] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchChats();
    }, [])
  );

  const fetchChats = async () => {
    const user = await AsyncStorage.getItem('userName');
    setCurrentUser(user);
    const res = await fetch(`${API_URL}/messages/list/${user}`);
    if (res.ok) {
      const data = await res.json();
      setChats(data.chatCandidates || []);
    }
  };

  const openChat = (receiver) => {
    const roomId = [currentUser, receiver].sort().join('_');
    router.push({ pathname: `/chat/${roomId}`, params: { receiverUserName: receiver } });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>
      
      {chats.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Follow campers to start chatting.</Text>
        </View>
      ) : (
        <FlatList 
          data={chats} 
          keyExtractor={(item) => item.userName} 
          contentContainerStyle={{ paddingTop: 15 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.chatRow} onPress={() => openChat(item.userName)}>
              <Image source={{ uri: item.profilePicture }} style={styles.pfp} />
              <View style={styles.chatInfo}>
                <Text style={styles.chatName}>{item.name}</Text>
                <Text style={styles.chatUser}>@{item.userName}</Text>
              </View>
              <View style={styles.chatAction}><Text style={styles.chatArrow}>➔</Text></View>
            </TouchableOpacity>
          )} 
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCF8F2' },
  header: { padding: 20, backgroundColor: '#FCF8F2', borderBottomWidth: 1, borderColor: 'rgba(224, 90, 16, 0.1)' },
  title: { fontSize: 28, fontWeight: '900', color: '#E05A10' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#A38F82', fontSize: 16 },
  chatRow: { padding: 16, marginHorizontal: 15, marginBottom: 12, backgroundColor: 'rgba(224, 90, 16, 0.05)', borderRadius: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(224, 90, 16, 0.15)' },
  pfp: { width: 54, height: 54, borderRadius: 27, backgroundColor: 'rgba(224, 90, 16, 0.1)', marginRight: 15 },
  chatInfo: { flex: 1 },
  chatName: { color: '#3D2B1F', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  chatUser: { color: '#E05A10', fontSize: 14 },
  chatAction: { backgroundColor: 'rgba(224, 90, 16, 0.1)', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  chatArrow: { color: '#E05A10', fontSize: 16, fontWeight: 'bold' }
});