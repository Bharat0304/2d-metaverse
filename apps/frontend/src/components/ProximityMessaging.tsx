"use client";

import { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '../store/hooks';
import { phaserEvents, Event } from '../game/scenes/EventBus';

interface NearbyUser {
  id: string;
  name: string;
  distance: number;
  stream?: MediaStream;
}

// ─── NearbyUserVideo ────────────────────────────────────────────────────────
const NearbyUserVideo = ({ user }: { user: NearbyUser }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && user.stream) {
      videoRef.current.srcObject = user.stream;
      videoRef.current.play().catch(() => {});
    }
  }, [user.stream]);

  return (
    <div className="relative bg-gray-900/80 backdrop-blur-md rounded-xl overflow-hidden border border-gray-700/50 w-36 shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-gray-500/50">
      {user.stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-28 object-cover"
        />
      ) : (
        <div className="w-full h-28 flex flex-col items-center justify-center bg-gray-800/80">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mb-2">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          </div>
          <span className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">No Video</span>
        </div>
      )}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent pt-6 pb-2 px-2">
        <div className="flex items-center justify-between">
          <span className="text-white text-xs font-semibold truncate drop-shadow-md">{user.name}</span>
          <span className="text-green-400 text-[10px] font-bold bg-green-400/20 px-1.5 py-0.5 rounded-full">{user.distance}px</span>
        </div>
      </div>
    </div>
  );
};

// ─── ProximityMessaging ─────────────────────────────────────────────────────
const ProximityMessaging = () => {
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const webRTCManagerRef = useRef<any>(null);

  const roomJoined = useAppSelector((state) => state.room.roomJoined);
  const spaceId = useAppSelector((state) => state.room.spaceId);
  const mySessionId = useAppSelector((state) => state.player.sessionId);

  // ── Attach WebRTCManager once game is ready ──────────────────────────────
  useEffect(() => {
    const tryAttach = () => {
      const network = (window as any).gameNetwork;
      if (!network?.webrtcManager) return false;
      const mgr = network.webrtcManager;
      webRTCManagerRef.current = mgr;

      // When a remote stream arrives → attach it to the matching nearby user
      mgr.onRemoteStream((sessionId: string, stream: MediaStream) => {
        setNearbyUsers(prev =>
          prev.map(u => u.id === sessionId ? { ...u, stream } : u)
        );
      });

      // When a remote stream is removed → clear it
      mgr.onStreamRemoved((sessionId: string) => {
        setNearbyUsers(prev =>
          prev.map(u => u.id === sessionId ? { ...u, stream: undefined } : u)
        );
      });

      return true;
    };

    if (!tryAttach()) {
      const interval = setInterval(() => {
        if (tryAttach()) clearInterval(interval);
      }, 500);
      return () => clearInterval(interval);
    }
  }, []);

  // ── Listen to Phaser Proximity Events ────────────────────────────────────
  useEffect(() => {
    const onProximityEnter = (sessionId: string) => {
      if (isCameraOn && webRTCManagerRef.current) {
        webRTCManagerRef.current.initiateCall(sessionId);
      }
    };
    
    const onProximityLeave = (sessionId: string) => {
      if (webRTCManagerRef.current) {
        webRTCManagerRef.current.closeConnection(sessionId);
      }
    };

    phaserEvents.on(Event.PROXIMITY_ENTER, onProximityEnter);
    phaserEvents.on(Event.PROXIMITY_LEAVE, onProximityLeave);
    
    return () => {
      phaserEvents.off(Event.PROXIMITY_ENTER, onProximityEnter);
      phaserEvents.off(Event.PROXIMITY_LEAVE, onProximityLeave);
    };
  }, [isCameraOn]);

  // ── Poll window.__otherPlayers for nearby user list ──────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      const map = (window as any).__otherPlayers as Map<string, any> | undefined;
      if (!map || map.size === 0) {
        setNearbyUsers([]);
        return;
      }
      setNearbyUsers(prev => {
        const updated: NearbyUser[] = [];
        map.forEach((player, sessionId) => {
          const existing = prev.find(u => u.id === sessionId);
          updated.push({
            id: sessionId,
            name: player.username || 'Player',
            distance: 0,
            stream: existing?.stream, // preserve existing stream
          });
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Attach local stream to <video> element ───────────────────────────────
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(() => {});
    }
  }, [localStream]);

  // ── Camera toggle ────────────────────────────────────────────────────────
  const toggleCamera = async () => {
    if (isCameraOn) {
      // Stop camera
      webRTCManagerRef.current?.stopMedia();
      setLocalStream(null);
      setIsCameraOn(false);
    } else {
      // Start camera via WebRTCManager (keeps stream in sync with WebRTC calls)
      if (!webRTCManagerRef.current) {
        alert('Game not ready yet. Please wait a moment and try again.');
        return;
      }
      try {
        const stream: MediaStream = await webRTCManagerRef.current.startMedia();
        setLocalStream(stream);
        setIsCameraOn(true);

        // Ensure initial mic state is applied
        mgr.toggleMic(isMicOn);
        
        // Initiate calls with any users already in proximity
        nearbyUsers.forEach(u => {
          mgr.initiateCall(u.id);
        });
      } catch (err) {
        console.error('Could not start camera:', err);
        alert('Could not access camera/mic. Check browser permissions.');
      }
    }
  };

  const toggleMic = () => {
    if (webRTCManagerRef.current && localStream) {
      const newState = !isMicOn;
      webRTCManagerRef.current.toggleMic(newState);
      setIsMicOn(newState);
    } else {
      // If stream hasn't started yet, just toggle the preference
      setIsMicOn(!isMicOn);
    }
  };

  return (
    <div className="absolute top-4 right-4 z-50 flex flex-col gap-3 pointer-events-auto items-end">
      {/* My Camera Preview */}
      {isCameraOn && localStream && (
        <div className="relative bg-gray-900/80 backdrop-blur-md rounded-xl overflow-hidden border border-green-500/50 w-36 shadow-xl shadow-green-500/10">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-28 object-cover"
          />
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent pt-6 pb-2 px-2 text-center">
             <span className="text-white text-xs font-semibold drop-shadow-md">You</span>
          </div>
        </div>
      )}

      {/* Nearby Users */}
      {nearbyUsers.length > 0 && (
        <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-4 w-80 border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Nearby ({nearbyUsers.length})
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMic}
                className={`p-1.5 rounded-full transition-all ${isMicOn ? 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}
                title="Toggle Microphone"
              >
                {isMicOn ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.172 3.172a4 4 0 015.656 0L12 6.343l2.172-2.171a4 4 0 115.656 5.656L17.657 12l2.172 2.172a4 4 0 11-5.656 5.656L12 17.657l-2.172 2.171a4 4 0 11-5.656-5.656L6.343 12 4.172 9.828a4 4 0 01-1-2.656V5.828a4 4 0 011-2.656z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18"></path></svg>
                )}
              </button>
              <button
                onClick={toggleCamera}
                className={`p-1.5 rounded-full transition-all ${isCameraOn ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}
                title="Toggle Camera"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {nearbyUsers.map(user => (
              <NearbyUserVideo key={user.id} user={user} />
            ))}
          </div>
        </div>
      )}

      {/* Show just a small pill if no nearby users but camera is toggled */}
      {nearbyUsers.length === 0 && (
        <div className="bg-gray-900/80 backdrop-blur-lg rounded-full px-4 py-2 flex items-center gap-3 border border-white/10 shadow-lg">
           <span className="text-gray-400 text-xs font-medium">Looking for others...</span>
           <div className="w-px h-4 bg-gray-700"></div>
           <button
             onClick={toggleMic}
             className={`transition-colors ${isMicOn ? 'text-indigo-400' : 'text-red-400'}`}
             title="Toggle Microphone"
           >
             {isMicOn ? (
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
             ) : (
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.172 3.172a4 4 0 015.656 0L12 6.343l2.172-2.171a4 4 0 115.656 5.656L17.657 12l2.172 2.172a4 4 0 11-5.656 5.656L12 17.657l-2.172 2.171a4 4 0 11-5.656-5.656L6.343 12 4.172 9.828a4 4 0 01-1-2.656V5.828a4 4 0 011-2.656z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18"></path></svg>
             )}
           </button>
           <button
             onClick={toggleCamera}
             className={`transition-colors ${isCameraOn ? 'text-green-400' : 'text-red-400'}`}
             title="Toggle Camera"
           >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
           </button>
        </div>
      )}
    </div>
  );
};

export default ProximityMessaging;
