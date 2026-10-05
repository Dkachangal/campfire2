import { useState, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { API_URL } from '../../config';

export default function FeedScreen() {
   const API_URL = 'https://campfire2-sndp.onrender.com/api';
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentUser, setCurrentUser] = useState('');

  // Auto-refreshes every time you navigate to this tab
  useFocusEffect(
    useCallback(() => {
      loadFeed();
      AsyncStorage.getItem('userName').then(setCurrentUser);
    }, [])
  );

  const loadFeed = async () => {
    const res = await fetch(`${API_URL}/discoverPage/feed?page=1`);
    if (res.ok) {
      const data = await res.json();
      setPosts(data.posts || []);
    }
  };

  const handleSearch = async (text) => {
    setSearchQuery(text);
    if (text.length > 1) {
      const res = await fetch(`${API_URL}/discoverPage/search?query=${text}`);
      const data = await res.json();
      setSearchResults(data.users || []);
    } else {
      setSearchResults([]);
    }
  };

  const interact = async (postId, action) => {
    await fetch(`${API_URL}/global/interact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, action, userName: currentUser })
    });
    loadFeed(); 
  };

  const renderPost = ({ item }) => {
    const images = item.text.slice(1); 

    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <TouchableOpacity style={styles.authorRow} onPress={() => router.push(`/user/${item.author}`)}>
            <View style={styles.authorAvatarPlaceholder}>
              <Text style={styles.authorInitial}>{item.author.charAt(0).toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.author}>@{item.author}</Text>
              {item.reposts?.includes(currentUser) && <Text style={styles.repostedTag}>🔁 Reposted by you</Text>}
            </View>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.postText}>{item.text[0]}</Text>
        
        {images.length > 0 && (
          <View style={styles.imageGrid}>
            {images.map((img, idx) => (
              <Image key={idx} source={{ uri: img }} style={styles.postImage} />
            ))}
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => interact(item._id, 'like')}>
            <Text style={styles.actionIcon}>🔥</Text>
            <Text style={styles.actionText}>{item.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => interact(item._id, 'repost')}>
            <Text style={styles.actionIcon}>🔁</Text>
            <Text style={styles.actionText}>{item.reposts?.length || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionText}>{Object.keys(item.comments || {}).length}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.brand}>CAMPFIRE</Text>
        <TextInput 
          style={styles.searchBar} 
          placeholder="Search for campers..." 
          placeholderTextColor="#A38F82" 
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {searchQuery.length > 1 ? (
        <FlatList 
          data={searchResults} 
          keyExtractor={(item) => item.userName} 
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.searchCard} onPress={() => router.push(`/user/${item.userName}`)}>
              <Image source={{ uri: item.profilePicture }} style={styles.searchPfp} />
              <View>
                <Text style={styles.searchName}>{item.name}</Text>
                <Text style={styles.searchHandle}>@{item.userName}</Text>
              </View>
            </TouchableOpacity>
          )} 
        />
      ) : (
        <FlatList 
          data={posts} 
          keyExtractor={(item) => item._id} 
          renderItem={renderPost}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCF8F2' },
  header: { padding: 20, backgroundColor: '#FCF8F2', zIndex: 10 },
  brand: { fontSize: 24, fontWeight: '900', color: '#E05A10', marginBottom: 15, letterSpacing: 2 },
  searchBar: { backgroundColor: 'rgba(224, 90, 16, 0.05)', color: '#3D2B1F', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(224, 90, 16, 0.15)', fontSize: 16 },
  searchCard: { padding: 15, borderBottomWidth: 1, borderColor: 'rgba(224, 90, 16, 0.1)', flexDirection: 'row', alignItems: 'center' },
  searchPfp: { width: 44, height: 44, borderRadius: 22, marginRight: 15, backgroundColor: 'rgba(224, 90, 16, 0.1)' },
  searchName: { color: '#3D2B1F', fontSize: 16, fontWeight: 'bold' },
  searchHandle: { color: '#E05A10', fontSize: 14 },
  postCard: { backgroundColor: 'rgba(224, 90, 16, 0.04)', marginHorizontal: 15, marginTop: 15, marginBottom: 5, padding: 20, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(224, 90, 16, 0.1)' },
  postHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  authorRow: { flexDirection: 'row', alignItems: 'center' },
  authorAvatarPlaceholder: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(224, 90, 16, 0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: 'rgba(224, 90, 16, 0.3)' },
  authorInitial: { color: '#E05A10', fontWeight: '900', fontSize: 16 },
  author: { color: '#3D2B1F', fontWeight: 'bold', fontSize: 16 },
  repostedTag: { color: '#A38F82', fontSize: 12, marginTop: 2 },
  postText: { color: '#5C4A3D', fontSize: 16, lineHeight: 24, marginBottom: 15 },
  imageGrid: { gap: 10, marginBottom: 15 },
  postImage: { width: '100%', aspectRatio: 1, borderRadius: 16, backgroundColor: 'rgba(224, 90, 16, 0.05)' },
  actions: { flexDirection: 'row', gap: 25, borderTopWidth: 1, borderTopColor: 'rgba(224, 90, 16, 0.1)', paddingTop: 15 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionIcon: { fontSize: 18 },
  actionText: { color: '#A38F82', fontSize: 15, fontWeight: '600' }
});