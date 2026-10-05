import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { API_URL } from '../../config';

export default function ProfileScreen() {
  const API_URL = 'https://campfire2-sndp.onrender.com/api'; 
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const fetchProfile = async () => {
    try {
      const user = await AsyncStorage.getItem('userName');
      const res = await fetch(`${API_URL}/user/${user}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setPosts(data.posts || []);
      } else {
        setProfile(null); 
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.clear();
    router.replace('/(auth)/login');
  };

  if (loading) return <View style={[styles.container, styles.center]}><ActivityIndicator size="large" color="#E05A10" /></View>;

  if (!profile) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Account data not found.</Text>
        <TouchableOpacity style={styles.emergencyBtn} onPress={logout}>
          <Text style={styles.emergencyBtnText}>Force Log Out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        
        {/* Profile Identity */}
        <View style={styles.identityContainer}>
          <Image source={{ uri: profile.profilePicture }} style={styles.avatar} />
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.handle}>@{profile.userName}</Text>
          <Text style={styles.bio}>{profile.bio}</Text>
        </View>
        
        {/* Modern Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statBlock}>
            <Text style={styles.statNumber}>{posts.length}</Text>
            <Text style={styles.statLabel}>Sparks</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBlock}>
            <Text style={styles.statNumber}>{profile.followers?.length || 0}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBlock}>
            <Text style={styles.statNumber}>{profile.following?.length || 0}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>

      </View>

      <FlatList 
        data={posts} 
        keyExtractor={(item) => item._id} 
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            {item.author !== profile.userName && <Text style={styles.repostTag}>🔁 Reposted</Text>}
            <Text style={styles.postText}>{item.text[0]}</Text>
            {item.text.length > 1 && (
              <Image source={{ uri: item.text[1] }} style={styles.postImage} />
            )}
          </View>
        )} 
      />
        {/* PROMINENT LOGOUT BUTTON */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCF8F2' },
  center: { justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#8A7563', fontSize: 18, marginBottom: 20 },
  emergencyBtn: { backgroundColor: '#E05A10', padding: 15, borderRadius: 12 },
  emergencyBtnText: { color: '#FFF', fontWeight: 'bold' },
  header: { height: 300, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 25, backgroundColor: '#FCF8F2', borderBottomWidth: 1, borderColor: 'rgba(224, 90, 16, 0.1)' },
  identityContainer: { alignItems: 'center' },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: '#E05A10', marginBottom: 15, backgroundColor: 'rgba(224, 90, 16, 0.1)' },
  name: { fontSize: 26, fontWeight: '900', color: '#3D2B1F', marginBottom: 5 },
  handle: { fontSize: 16, color: '#E05A10', marginBottom: 10, fontWeight: 'bold' },
  bio: { color: '#5C4A3D', fontSize: 15, textAlign: 'center', paddingHorizontal: 20, lineHeight: 22 },
  statsContainer: { flexDirection: 'row', backgroundColor: 'rgba(224, 90, 16, 0.05)', borderRadius: 16, paddingVertical: 15, borderWidth: 1, borderColor: 'rgba(224, 90, 16, 0.15)', marginBottom: 20 },
  statBlock: { flex: 1, alignItems: 'center' },
  statNumber: { color: '#3D2B1F', fontSize: 20, fontWeight: '900', marginBottom: 4 },
  statLabel: { color: '#A38F82', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  statDivider: { width: 1, backgroundColor: 'rgba(224, 90, 16, 0.15)', marginVertical: 5 },
  logoutBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#E05A10', paddingVertical: 12, borderRadius: 16, alignItems: 'center' },
  logoutText: { color: '#E05A10', fontWeight: 'bold', fontSize: 16 },
  postCard: { backgroundColor: 'rgba(224, 90, 16, 0.04)', marginHorizontal: 15, marginTop: 15, marginBottom: 5, padding: 20, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(224, 90, 16, 0.1)' },
  repostTag: { color: '#A38F82', fontSize: 12, fontWeight: 'bold', marginBottom: 10, textTransform: 'uppercase' },
  postText: { color: '#3D2B1F', fontSize: 16, lineHeight: 24 },
  postImage: { width: '100%', aspectRatio: 1, borderRadius: 16, marginTop: 15, backgroundColor: 'rgba(224, 90, 16, 0.05)' }
});