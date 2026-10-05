import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';
import { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription, mediaDevices, RTCView } from 'react-native-webrtc';

const configuration = { 
  iceServers: [
    { 
      urls: ['stun:://google.com', 'stun:://google.com'] 
    }
  ] 
};

export default function SurgeScreen() {
  const SOCKET_URL = 'https://campfire2-sndp.onrender.com/';
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [status, setStatus] = useState('Initializing camera...');
  const [partnerName, setPartnerName] = useState('');
  
  const socketRef = useRef(null);
  const pcRef = useRef(null);
  const currentRoomRef = useRef(null);
  const currentUserRef = useRef('');
  
  const localStreamRef = useRef(null); 
  const iceCandidateQueue = useRef([]); 

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const startSurge = async () => {
        const user = await AsyncStorage.getItem('userName');
        currentUserRef.current = user;

        try {
          // 🚨 FIX: Force native loudspeaker audio device mapping rules directly 
          // inside the standard native media stream constructor constraint engine!
          const stream = await mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              mandatory: {
                googEchoCancellation: true,
                googAutoGainControl: true,
                googNoiseSuppression: true,
              },
              optional: [
                { speakerphone: true } // Tells the native OS audio layer to target the large loudspeaker
              ]
            },
            video: { 
              facingMode: 'user',
              width: 640,
              height: 480,
              frameRate: 30
            } 
          });
          
          if (isMounted) {
            localStreamRef.current = stream; 
            setLocalStream(stream); 
            connectSocket();
          }
        } catch (err) {
          console.error("Camera access failed:", err);
          if (isMounted) setStatus('Camera/Mic initialization failed.');
        }
      };

      startSurge();

      return () => {
        isMounted = false;
        cleanupWebRTC();
        
        if (socketRef.current) {
          socketRef.current.emit('surge_leave');
          socketRef.current.disconnect();
        }
      };
    }, [])
  );

  const processIceQueue = () => {
    while (iceCandidateQueue.current.length > 0) {
      const candidate = iceCandidateQueue.current.shift();
      if (pcRef.current) {
        pcRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.log('ICE Queue Error', e));
      }
    }
  };

  const connectSocket = () => {
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on('connect', () => {
      setStatus('Searching for campers...');
      socketRef.current.emit('surge_join', { userName: currentUserRef.current });
    });

    socketRef.current.on('surge_status', (msg) => setStatus(msg));

    socketRef.current.on('surge_match', async ({ roomId, isCaller, partnerName }) => {
      setStatus('Connecting...');
      setPartnerName(partnerName);
      currentRoomRef.current = roomId;
      setupWebRTC(roomId, isCaller);
    });

    socketRef.current.on('surge_peer_left', () => {
      cleanupWebRTC(true); 
      setStatus('Partner left. Searching...');
      setPartnerName('');
    });

    socketRef.current.on('surge_offer', async (offer) => {
      if (!pcRef.current) return;
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        socketRef.current.emit('surge_answer', { roomId: currentRoomRef.current, answer });
        processIceQueue(); 
      } catch (err) {
        console.log('Error handling offer', err);
      }
    });

    socketRef.current.on('surge_answer', async (answer) => {
      if (!pcRef.current) return;
      try {
        if (pcRef.current.signalingState === 'have-local-offer') {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          processIceQueue(); 
        }
      } catch (err) {
        console.log('Error handling answer', err);
      }
    });

    socketRef.current.on('surge_ice_candidate', async (candidate) => {
      if (!pcRef.current) return;
      try {
        if (pcRef.current.remoteDescription) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          iceCandidateQueue.current.push(candidate);
        }
      } catch (err) {
        console.log('Error adding ICE candidate', err);
      }
    });
  };

  const setupWebRTC = async (roomId, isCaller) => {
    try {
      try {
        pcRef.current = new RTCPeerConnection(configuration);
      } catch (e) {
        pcRef.current = new RTCPeerConnection({});
      }
      
      iceCandidateQueue.current = []; 

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          pcRef.current.addTrack(track, localStreamRef.current);
        });
      }

      pcRef.current.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          const remoteStreamInstance = event.streams[0];
          if (remoteStreamInstance.getTracks().length > 0) {
            setRemoteStream(remoteStreamInstance);
            setStatus('Connected');
          }
        }
      };

      pcRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit('surge_ice_candidate', { roomId, candidate: event.candidate });
        }
      };

      if (isCaller) {
        // 🚨 FIX: Enforce audio receiving configurations during connection handshake 
        // to block the phone system from snapping back to headset ear mode.
        const offer = await pcRef.current.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });
        await pcRef.current.setLocalDescription(offer);
        socketRef.current.emit('surge_offer', { roomId, offer });
      }
    } catch (error) {
      console.error("Critical PeerConnection failure:", error);
      setStatus("Connection framework error.");
    }
  };

  const cleanupWebRTC = (keepLocalStream = false) => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    
    setRemoteStream(null);
    iceCandidateQueue.current = [];
    
    if (!keepLocalStream) {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      setLocalStream(null);
      localStreamRef.current = null;
    }
  };

  const handleNext = () => {
    cleanupWebRTC(true);
    setStatus('Searching for campers...');
    setPartnerName('');
    socketRef.current.emit('surge_next');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Surge ⚡</Text>
        {partnerName ? <Text style={styles.partnerName}>@{partnerName}</Text> : null}
      </View>

      <View style={styles.videoContainer}>
        {remoteStream ? (
          <RTCView streamURL={remoteStream.toURL()} style={styles.remoteVideo} objectFit="cover" />
        ) : (
          <View style={styles.statusBox}>
            <ActivityIndicator size="large" color="#E05A10" style={{ marginBottom: 15 }} />
            <Text style={styles.statusText}>{status}</Text>
          </View>
        )}

        {localStream && (
          <View style={styles.localVideoWrapper}>
            <RTCView streamURL={localStream.toURL()} style={styles.localVideo} objectFit="cover" zOrder={1} />
          </View>
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.nextBtn, !remoteStream && { opacity: 0.5 }]} 
          onPress={handleNext} 
          disabled={!remoteStream}
        >
          <Text style={styles.nextBtnText}>Next Camper ➔</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCF8F2' },
  header: { padding: 15, backgroundColor: '#FCF8F2', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderColor: 'rgba(224, 90, 16, 0.1)', zIndex: 10 },
  title: { fontSize: 24, fontWeight: '900', color: '#E05A10', letterSpacing: 1 },
  partnerName: { fontSize: 16, fontWeight: 'bold', color: '#3D2B1F', backgroundColor: 'rgba(224, 90, 16, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  videoContainer: { flex: 1, backgroundColor: '#EBE3DB', position: 'relative' },
  statusBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  statusText: { color: '#8A7563', fontSize: 18, textAlign: 'center', fontWeight: '500', lineHeight: 26 },
  remoteVideo: { flex: 1 },
  localVideoWrapper: { position: 'absolute', bottom: 20, right: 20, width: 110, height: 160, borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: '#E05A10', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8, zIndex: 2 },
  localVideo: { flex: 1 },
  controls: { padding: 20, paddingBottom: 100, backgroundColor: '#FCF8F2', alignItems: 'center' },
nextBtn: { backgroundColor: '#E05A10', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 30, shadowColor: '#E05A10', shadowOpacity: 0.3, shadowRadius: 10, elevation: 4 },
nextBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});