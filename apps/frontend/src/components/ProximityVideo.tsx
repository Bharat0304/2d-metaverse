import { useState, useEffect, useRef } from 'react';
import VideoCalling from '../game/service/VideoCalling';
import { useAppSelector } from '../store/hooks';
import SignalingClient from '../lib/signaling';

interface NearbyUser {
  id: string;
  name: string;
  distance: number;
  stream?: MediaStream;
}

// Separate component for nearby user video to avoid hooks in map
const NearbyUserVideo = ({ user }: { user: NearbyUser }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (videoRef.current && user.stream) {
      videoRef.current.srcObject = user.stream;
    }
  }, [user.stream]);

  return (
    <div className="bg-black rounded-lg overflow-hidden border-2 border-blue-500 w-48">
      {user.stream ? (
        <video 
          ref={videoRef}
          autoPlay 
          playsInline
          className="w-full h-32 object-cover"
        />
      ) : (
        <div className="w-full h-32 flex items-center justify-center bg-gray-800">
          <span className="text-white text-xs">Connecting...</span>
        </div>
      )}
      <div className="bg-gray-900 text-white text-xs p-2 text-center">
        {user.name} ({user.distance}px)
      </div>
    </div>
  );
};

const ProximityVideo = () => {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const signalingClient = useRef<SignalingClient | null>(null);
  const myUserId = useRef<string>(`user-${Math.random().toString(36).substr(2, 9)}`);

  // Get player data from store - using existing selectors
  const myPlayerPosition = useAppSelector((state) => state.player);
  const otherPlayers = useAppSelector((state) => state as any).players || [];

  // Initialize signaling client
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
    signalingClient.current = new SignalingClient(myUserId.current);
    signalingClient.current.connect(wsUrl);

    // Set up signaling message handlers
    signalingClient.current.on('offer', async (data) => {
      console.log('Received offer from', data.from);
      await handleOffer(data.from, data.offer);
    });

    signalingClient.current.on('answer', async (data) => {
      console.log('Received answer from', data.from);
      await handleAnswer(data.from, data.answer);
    });

    signalingClient.current.on('ice-candidate', async (data) => {
      console.log('Received ICE candidate from', data.from);
      await handleIceCandidate(data.from, data.candidate);
    });

    signalingClient.current.on('user-joined', (data) => {
      console.log('User joined:', data.userId);
      // Only add if not already in nearby users
      setNearbyUsers(prev => {
        if (!prev.find(u => u.id === data.userId) && data.userId !== myUserId.current) {
          return [...prev, { id: data.userId, name: data.userId, distance: 100 }];
        }
        return prev;
      });
      // Establish connection with new user only if we have camera on
      if (myStream && data.userId !== myUserId.current) {
        establishConnection(data.userId);
      }
    });

    signalingClient.current.on('existing-users', (data) => {
      console.log('Existing users:', data.users);
      // Add existing users and establish connections
      data.users.forEach((userId: string) => {
        if (userId !== myUserId.current) {
          setNearbyUsers(prev => {
            if (!prev.find(u => u.id === userId)) {
              return [...prev, { id: userId, name: userId, distance: 100 }];
            }
            return prev;
          });
          if (myStream) {
            establishConnection(userId);
          }
        }
      });
    });

    signalingClient.current.on('user-left', (data) => {
      console.log('User left:', data.userId);
      // Remove user from nearby users and close connection
      disconnectPlayer(data.userId);
      setNearbyUsers(prev => prev.filter(u => u.id !== data.userId));
    });

    return () => {
      signalingClient.current?.disconnect();
    };
  }, []);

  // Initialize camera/microphone
  const startMedia = async () => {
    console.log('Starting media devices...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      console.log('Stream obtained:', stream);
      console.log('Video tracks:', stream.getVideoTracks());
      console.log('Audio tracks:', stream.getAudioTracks());
      
      setMyStream(stream);
      setIsCameraOn(true);
      setIsMicOn(true);
      
      // Initialize WebRTC peer
      await VideoCalling.getUserMedia();
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Could not access camera or microphone. Please check permissions and ensure you are using HTTPS or localhost.');
    }
  };

  // Assign stream to video element when it changes
  useEffect(() => {
    if (localVideoRef.current && myStream) {
      localVideoRef.current.srcObject = myStream;
      localVideoRef.current.play().catch(err => {
        console.error('Error playing video:', err);
      });
    }
  }, [myStream]);

  const stopMedia = () => {
    if (myStream) {
      myStream.getTracks().forEach(track => track.stop());
      setMyStream(null);
      setIsCameraOn(false);
      setIsMicOn(false);
    }
  };

  const toggleCamera = async () => {
    console.log('Camera toggle clicked, current state:', isCameraOn);
    if (isCameraOn) {
      stopMedia();
    } else {
      await startMedia();
    }
  };

  const toggleMic = () => {
    console.log('Mic toggle clicked, current state:', isMicOn);
    if (myStream) {
      const audioTrack = myStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
        console.log('Mic track enabled:', audioTrack.enabled);
      }
    } else {
      console.log('No stream available for mic toggle');
    }
  };

  // Proximity detection logic
  useEffect(() => {
    const PROXIMITY_THRESHOLD = 200; // pixels

    const checkProximity = () => {
      const nearby: NearbyUser[] = [];
      
      // In production, this would detect actual nearby players from game state
      // For now, keeping it empty until real multiplayer is implemented
      
      setNearbyUsers(nearby);
    };

    const interval = setInterval(checkProximity, 500);
    return () => clearInterval(interval);
  }, []);

  // WebRTC signaling handlers
  const handleOffer = async (fromUserId: string, offer: RTCSessionDescriptionInit) => {
    try {
      const connection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      });

      if (myStream) {
        myStream.getTracks().forEach(track => {
          connection.addTrack(track, myStream!);
        });
      }

      connection.ontrack = (event) => {
        setNearbyUsers(prev => prev.map(user => 
          user.id === fromUserId ? { ...user, stream: event.streams[0] } : user
        ));
      };

      connection.onicecandidate = (event) => {
        if (event.candidate && signalingClient.current) {
          signalingClient.current.sendIceCandidate(fromUserId, event.candidate);
        }
      };

      await connection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await connection.createAnswer();
      await connection.setLocalDescription(answer);

      signalingClient.current?.sendAnswer(fromUserId, answer);
      peerConnections.current.set(fromUserId, connection);
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleAnswer = async (fromUserId: string, answer: RTCSessionDescriptionInit) => {
    try {
      const connection = peerConnections.current.get(fromUserId);
      if (connection) {
        await connection.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  const handleIceCandidate = async (fromUserId: string, candidate: RTCIceCandidateInit) => {
    try {
      const connection = peerConnections.current.get(fromUserId);
      if (connection) {
        await connection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  };

  // Establish WebRTC connection with nearby player
  const establishConnection = async (playerId: string) => {
    try {
      const connection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      });

      if (myStream) {
        myStream.getTracks().forEach(track => {
          connection.addTrack(track, myStream!);
        });
      }

      connection.ontrack = (event) => {
        setNearbyUsers(prev => prev.map(user => 
          user.id === playerId ? { ...user, stream: event.streams[0] } : user
        ));
      };

      connection.onicecandidate = (event) => {
        if (event.candidate && signalingClient.current) {
          signalingClient.current.sendIceCandidate(playerId, event.candidate);
        }
      };

      peerConnections.current.set(playerId, connection);
      
      // Create offer and send via signaling
      const offer = await connection.createOffer();
      await connection.setLocalDescription(offer);
      signalingClient.current?.sendOffer(playerId, offer);
      
    } catch (error) {
      console.error('Error establishing connection:', error);
    }
  };

  const disconnectPlayer = (playerId: string) => {
    const connection = peerConnections.current.get(playerId);
    if (connection) {
      connection.close();
      peerConnections.current.delete(playerId);
      
      setNearbyUsers(prev => prev.map(user => 
        user.id === playerId ? { ...user, stream: undefined } : user
      ));
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMedia();
      peerConnections.current.forEach(conn => conn.close());
    };
  }, []);

  return (
    <div className="absolute top-4 right-4 z-50 flex flex-col gap-2 pointer-events-auto">
      {/* My Camera Preview */}
      {isCameraOn && (
        <div className="bg-black rounded-lg overflow-hidden border-2 border-green-500 w-48">
          <video 
            ref={localVideoRef}
            autoPlay 
            muted 
            playsInline
            className="w-full h-32 object-cover"
            onLoadedMetadata={() => {
              console.log('Video loaded, playing...');
              localVideoRef.current?.play().catch(err => console.error('Play error:', err));
            }}
            onError={(e) => console.error('Video error:', e)}
          />
          <div className="bg-gray-900 text-white text-xs p-2 text-center">
            You
          </div>
        </div>
      )}

      {/* Nearby Users */}
      {nearbyUsers.map(user => (
        <NearbyUserVideo key={user.id} user={user} />
      ))}

      {/* Controls */}
      <div className="bg-gray-900 rounded-lg p-3 flex gap-2">
        <button
          onClick={toggleCamera}
          className={`p-2 rounded-full ${isCameraOn ? 'bg-green-500' : 'bg-red-500'} text-white`}
          title="Toggle Camera"
        >
          📹
        </button>
        <button
          onClick={toggleMic}
          className={`p-2 rounded-full ${isMicOn ? 'bg-green-500' : 'bg-red-500'} text-white`}
          title="Toggle Microphone"
        >
          🎤
        </button>
      </div>

      {/* Status */}
      <div className="bg-gray-900 rounded-lg p-2 text-white text-xs">
        <div>Nearby: {nearbyUsers.length}</div>
        <div className={isCameraOn ? 'text-green-400' : 'text-red-400'}>
          Camera: {isCameraOn ? 'ON' : 'OFF'}
        </div>
        <div className={isMicOn ? 'text-green-400' : 'text-red-400'}>
          Mic: {isMicOn ? 'ON' : 'OFF'}
        </div>
      </div>
    </div>
  );
};

export default ProximityVideo;
