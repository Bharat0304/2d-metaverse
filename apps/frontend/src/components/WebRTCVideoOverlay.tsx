import { useState, useEffect, useRef } from 'react';

interface RemoteVideo {
  sessionId: string;
  stream: MediaStream;
}

interface WebRTCVideoOverlayProps {
  localStream: MediaStream | null;
  remoteVideos: RemoteVideo[];
  isMicOn: boolean;
  isCameraOn: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onStartMedia: () => Promise<void>;
  onStopMedia: () => void;
}

const WebRTCVideoOverlay: React.FC<WebRTCVideoOverlayProps> = ({
  localStream,
  remoteVideos,
  isMicOn,
  isCameraOn,
  onToggleMic,
  onToggleCamera,
  onStartMedia,
  onStopMedia,
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  // Assign local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(err => {
        console.error('Error playing local video:', err);
      });
    }
  }, [localStream]);

  // Assign remote streams to video elements
  useEffect(() => {
    remoteVideos.forEach(({ sessionId, stream }) => {
      const videoEl = remoteVideoRefs.current.get(sessionId);
      if (videoEl && videoEl.srcObject !== stream) {
        videoEl.srcObject = stream;
        videoEl.play().catch(err => {
          console.error(`Error playing remote video for ${sessionId}:`, err);
        });
      }
    });
  }, [remoteVideos]);

  return (
    <div className="absolute top-4 right-4 z-50 flex flex-col gap-2 pointer-events-auto">
      {/* Local Video */}
      {isCameraOn && localStream && (
        <div className="bg-black rounded-lg overflow-hidden border-2 border-green-500 w-48 shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-32 object-cover"
          />
          <div className="bg-gray-900 text-white text-xs p-2 text-center font-semibold">
            You
          </div>
        </div>
      )}

      {/* Remote Videos */}
      {remoteVideos.map(({ sessionId }) => (
        <div
          key={sessionId}
          className="bg-black rounded-lg overflow-hidden border-2 border-blue-500 w-48 shadow-lg"
        >
          <video
            ref={(el) => {
              if (el) remoteVideoRefs.current.set(sessionId, el);
            }}
            autoPlay
            playsInline
            className="w-full h-32 object-cover"
          />
          <div className="bg-gray-900 text-white text-xs p-2 text-center font-semibold">
            {sessionId.slice(0, 8)}...
          </div>
        </div>
      ))}

      {/* Controls */}
      <div className="bg-gray-900/90 backdrop-blur rounded-lg p-3 flex gap-2 shadow-lg">
        <button
          onClick={async () => {
            if (isCameraOn) {
              onStopMedia();
            } else {
              await onStartMedia();
            }
          }}
          className={`p-3 rounded-full transition-all ${
            isCameraOn ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
          } text-white shadow-md`}
          title="Toggle Camera"
        >
          📹
        </button>
        <button
          onClick={onToggleMic}
          className={`p-3 rounded-full transition-all ${
            isMicOn ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
          } text-white shadow-md`}
          title="Toggle Microphone"
        >
          🎤
        </button>
      </div>

      {/* Status */}
      <div className="bg-gray-900/90 backdrop-blur rounded-lg p-3 text-white text-xs shadow-lg">
        <div className="flex justify-between items-center mb-1">
          <span>Connected:</span>
          <span className="font-bold text-blue-400">{remoteVideos.length}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Camera:</span>
          <span className={isCameraOn ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
            {isCameraOn ? 'ON' : 'OFF'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>Mic:</span>
          <span className={isMicOn ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
            {isMicOn ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default WebRTCVideoOverlay;
