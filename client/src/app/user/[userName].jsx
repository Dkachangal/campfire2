import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { API_URL } from '../../config';

export default function UserProfileScreen() {
  const API_URL = 'https://campfire2-sndp.onrender.com/api'; 
  const { userName } = useLocalSearchParams();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const viewer = await AsyncStorage.getItem('userName');
      setCurrentUser(viewer);
      
      const res = await fetch(`${API_URL}/user/${userName}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setPosts(data.posts || []);
      }
      setLoading(false);
    };
    fetchData();
  }, [userName]);

  const toggleFollow = async () => {
    await fetch(`${API_URL}/user/follow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentUserName: currentUser, targetUserName: userName })
    });
    const res = await fetch(`${API_URL}/user/${userName}`);
    const data = await res.json();
    setProfile(data.user);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color="#E05A10" /></View>;
  if (!profile) return <View style={styles.center}><Text style={styles.error}>User not found</Text></View>;

  const isFollowing = profile.followers.includes(currentUser);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        
        <View style={styles.profileInfo}>
          <Image source={{ uri: profile.profilePicture }} style={styles.pfp} />
          <View>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.handle}>@{profile.userName}</Text>
          </View>
        </View>

        <Text style={styles.bio}>{profile.bio}</Text>
        
        <View style={styles.statsRow}>
          <Text style={styles.stat}><Text style={styles.statBold}>{profile.followers.length}</Text> Followers</Text>
          <Text style={styles.stat}><Text style={styles.statBold}>{profile.following.length}</Text> Following</Text>
        </View>

        {currentUser !== userName && (
          <TouchableOpacity style={[styles.followBtn, isFollowing && styles.followingBtn]} onPress={toggleFollow}>
            <Text style={[styles.followBtnText, isFollowing && styles.followingBtnText]}>{isFollowing ? 'Unfollow' : 'Follow'}</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList 
        data={posts} 
        keyExtractor={(item) => item._id} 
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            <Text style={styles.postText}>{item.text[0]}</Text>
            {item.text[1] && <Image source={{ uri: item.text[1] }} style={styles.postImage} />}
          </View>
        )} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCF8F2' },
  center: { flex: 1, backgroundColor: '#FCF8F2', justifyContent: 'center', alignItems: 'center' },
  error: { color: '#8A7563', fontSize: 18 },
  header: { padding: 20, backgroundColor: '#FCF8F2', borderBottomWidth: 1, borderColor: 'rgba(224, 90, 16, 0.1)' },
  backBtn: { marginBottom: 15 },
  backText: { color: '#E05A10', fontSize: 16, fontWeight: 'bold' },
  profileInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  pfp: { width: 70, height: 70, borderRadius: 35, marginRight: 15, backgroundColor: 'rgba(224, 90, 16, 0.1)' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#3D2B1F' },
  handle: { fontSize: 16, color: '#E05A10', fontWeight: 'bold' },
  bio: { color: '#5C4A3D', fontSize: 16, marginBottom: 20 },
  statsRow: { flexDirection: 'row', gap: 20, marginBottom: 20 },
  stat: { color: '#8A7563' },
  statBold: { color: '#3D2B1F', fontWeight: 'bold' },
  followBtn: { backgroundColor: '#E05A10', padding: 12, borderRadius: 12, alignItems: 'center' },
  followingBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#E05A10' },
  followBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  followingBtnText: { color: '#E05A10' },
  postCard: { backgroundColor: 'rgba(224, 90, 16, 0.04)', marginHorizontal: 15, marginTop: 15, padding: 20, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(224, 90, 16, 0.1)' },
  postText: { color: '#3D2B1F', fontSize: 16, marginBottom: 10 },
  postImage: { width: '100%', aspectRatio: 1, borderRadius: 16, marginTop: 10, backgroundColor: 'rgba(224, 90, 16, 0.05)' }
});