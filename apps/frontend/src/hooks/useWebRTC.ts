import { useState, useEffect, useRef } from 'react';

interface RemoteVideo {
  sessionId: string;
  stream: MediaStream;
}

export const useWebRTC = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteVideos, setRemoteVideos] = useState<RemoteVideo[]>([]);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const webRTCManagerRef = useRef<any>(null);

  useEffect(() => {
    // Get WebRTCManager from global window object (set by Network)
    const checkWebRTCManager = () => {
      const network = (window as any).gameNetwork;
      if (network?.webrtcManager) {
        webRTCManagerRef.current = network.webrtcManager;

        // Set up callbacks
        webRTCManagerRef.current.onRemoteStream((sessionId: string, stream: MediaStream) => {
          setRemoteVideos(prev => {
            const exists = prev.find(v => v.sessionId === sessionId);
            if (exists) {
              return prev.map(v => v.sessionId === sessionId ? { sessionId, stream } : v);
            }
            return [...prev, { sessionId, stream }];
          });
        });

        webRTCManagerRef.current.onStreamRemoved((sessionId: string) => {
          setRemoteVideos(prev => prev.filter(v => v.sessionId !== sessionId));
        });
      }
    };

    checkWebRTCManager();
    const interval = setInterval(checkWebRTCManager, 1000);

    return () => {
      clearInterval(interval);
      if (webRTCManagerRef.current) {
        webRTCManagerRef.current.stopMedia();
      }
    };
  }, []);

  const startMedia = async () => {
    if (!webRTCManagerRef.current) {
      console.warn('WebRTCManager not initialized');
      return;
    }

    try {
      const stream = await webRTCManagerRef.current.startMedia();
      setLocalStream(stream);
      setIsMicOn(true);
      setIsCameraOn(true);
    } catch (error) {
      console.error('Error starting media:', error);
    }
  };

  const stopMedia = () => {
    if (webRTCManagerRef.current) {
      webRTCManagerRef.current.stopMedia();
    }
    setLocalStream(null);
    setIsMicOn(false);
    setIsCameraOn(false);
  };

  const toggleMic = () => {
    if (webRTCManagerRef.current) {
      webRTCManagerRef.current.toggleMic(!isMicOn);
      setIsMicOn(!isMicOn);
    }
  };

  const toggleCamera = () => {
    if (webRTCManagerRef.current) {
      webRTCManagerRef.current.toggleCamera(!isCameraOn);
      setIsCameraOn(!isCameraOn);
    }
  };

  return {
    localStream,
    remoteVideos,
    isMicOn,
    isCameraOn,
    startMedia,
    stopMedia,
    toggleMic,
    toggleCamera,
  };
};
