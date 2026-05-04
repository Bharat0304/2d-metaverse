/**
 * WebRTCManager - Manages peer-to-peer video/audio connections
 * 
 * Handles:
 * - Media access (camera/microphone)
 * - RTCPeerConnection management
 * - WebRTC signaling via WebSocket
 * - Proximity-based automatic connections
 */

export class WebRTCManager {
  private localStream: MediaStream | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private remoteStreams: Map<string, MediaStream> = new Map();
  private mySessionId: string;
  private sendSignalingMessage: (message: any) => void;
  private onRemoteStreamCallback?: (sessionId: string, stream: MediaStream) => void;
  private onStreamRemovedCallback?: (sessionId: string) => void;

  private iceConfig = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" }
    ]
  };

  constructor(
    mySessionId: string,
    sendSignalingMessage: (message: any) => void
  ) {
    this.mySessionId = mySessionId;
    this.sendSignalingMessage = sendSignalingMessage;
  }

  /**
   * Request access to camera and microphone
   */
  async startMedia(): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      // Add tracks to all existing peer connections and renegotiate
      for (const [sessionId, connection] of this.peerConnections.entries()) {
        const senders = connection.getSenders();
        this.localStream.getTracks().forEach(track => {
          const alreadyAdded = senders.some(sender => sender.track === track);
          if (!alreadyAdded) {
            connection.addTrack(track, this.localStream!);
          }
        });
        
        // Renegotiate
        const offer = await connection.createOffer();
        await connection.setLocalDescription(offer);
        this.sendSignalingMessage({
          type: "OFFER",
          from: this.mySessionId,
          to: sessionId,
          offer
        });
      }

      return this.localStream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      throw error;
    }
  }

  /**
   * Stop local media tracks
   */
  stopMedia(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }

  /**
   * Get local stream
   */
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  /**
   * Set callback for when remote stream is received
   */
  onRemoteStream(callback: (sessionId: string, stream: MediaStream) => void): void {
    this.onRemoteStreamCallback = callback;
  }

  /**
   * Set callback for when remote stream is removed
   */
  onStreamRemoved(callback: (sessionId: string) => void): void {
    this.onStreamRemovedCallback = callback;
  }

  /**
   * Create peer connection and initiate call (offer)
   */
  async initiateCall(remoteSessionId: string): Promise<void> {
    let connection = this.peerConnections.get(remoteSessionId);
    if (!connection) {
      connection = this.createPeerConnection(remoteSessionId);
      this.peerConnections.set(remoteSessionId, connection);
    }

    // Add local tracks if not already added
    if (this.localStream) {
      const senders = connection.getSenders();
      this.localStream.getTracks().forEach(track => {
        if (!senders.some(sender => sender.track === track)) {
          connection!.addTrack(track, this.localStream!);
        }
      });
    }

    // Create and send offer
    const offer = await connection.createOffer();
    await connection.setLocalDescription(offer);

    this.sendSignalingMessage({
      type: "OFFER",
      from: this.mySessionId,
      to: remoteSessionId,
      offer
    });
  }

  /**
   * Handle incoming offer and create answer
   */
  async handleOffer(remoteSessionId: string, offer: RTCSessionDescriptionInit): Promise<void> {
    let connection = this.peerConnections.get(remoteSessionId);
    if (!connection) {
      connection = this.createPeerConnection(remoteSessionId);
      this.peerConnections.set(remoteSessionId, connection);
    }

    // Add local tracks if not already added
    if (this.localStream) {
      const senders = connection.getSenders();
      this.localStream.getTracks().forEach(track => {
        if (!senders.some(sender => sender.track === track)) {
          connection!.addTrack(track, this.localStream!);
        }
      });
    }

    // Set remote description and create answer
    // If we're already signaling, we might get a collision. For simple case, we just set it.
    try {
        await connection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await connection.createAnswer();
        await connection.setLocalDescription(answer);

        this.sendSignalingMessage({
          type: "ANSWER",
          from: this.mySessionId,
          to: remoteSessionId,
          answer
        });
    } catch (e) {
        console.warn("Failed to handle offer, possibly due to glare/collision:", e);
    }
  }

  /**
   * Handle incoming answer
   */
  async handleAnswer(remoteSessionId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const connection = this.peerConnections.get(remoteSessionId);
    if (!connection) {
      console.warn(`No connection found for ${remoteSessionId}`);
      return;
    }

    await connection.setRemoteDescription(new RTCSessionDescription(answer));
  }

  /**
   * Handle ICE candidate
   */
  async handleIceCandidate(remoteSessionId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const connection = this.peerConnections.get(remoteSessionId);
    if (!connection) {
      console.warn(`No connection found for ${remoteSessionId}`);
      return;
    }

    await connection.addIceCandidate(new RTCIceCandidate(candidate));
  }

  /**
   * Close connection with a peer
   */
  closeConnection(remoteSessionId: string): void {
    const connection = this.peerConnections.get(remoteSessionId);
    if (connection) {
      connection.close();
      this.peerConnections.delete(remoteSessionId);
    }

    const stream = this.remoteStreams.get(remoteSessionId);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      this.remoteStreams.delete(remoteSessionId);
      this.onStreamRemovedCallback?.(remoteSessionId);
    }

    // Send call end signal
    this.sendSignalingMessage({
      type: "CALL_END",
      from: this.mySessionId,
      to: remoteSessionId
    });
  }

  /**
   * Handle call end signal
   */
  handleCallEnd(remoteSessionId: string): void {
    this.closeConnection(remoteSessionId);
  }

  /**
   * Close all connections
   */
  closeAllConnections(): void {
    this.peerConnections.forEach((connection, sessionId) => {
      connection.close();
      this.sendSignalingMessage({
        type: "CALL_END",
        from: this.mySessionId,
        to: sessionId
      });
    });
    this.peerConnections.clear();

    this.remoteStreams.forEach((stream, sessionId) => {
      stream.getTracks().forEach(track => track.stop());
      this.onStreamRemovedCallback?.(sessionId);
    });
    this.remoteStreams.clear();
  }

  /**
   * Create a new RTCPeerConnection with event handlers
   */
  private createPeerConnection(remoteSessionId: string): RTCPeerConnection {
    const connection = new RTCPeerConnection(this.iceConfig);

    connection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignalingMessage({
          type: "ICE_CANDIDATE",
          from: this.mySessionId,
          to: remoteSessionId,
          candidate: event.candidate
        });
      }
    };

    connection.ontrack = (event) => {
      const stream = event.streams[0];
      this.remoteStreams.set(remoteSessionId, stream);
      this.onRemoteStreamCallback?.(remoteSessionId, stream);
    };

    connection.onconnectionstatechange = () => {
      console.log(`Connection state with ${remoteSessionId}:`, connection.connectionState);
      if (connection.connectionState === "disconnected" || 
          connection.connectionState === "failed" ||
          connection.connectionState === "closed") {
        this.handleCallEnd(remoteSessionId);
      }
    };

    return connection;
  }

  /**
   * Toggle microphone
   */
  toggleMic(enabled: boolean): void {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = enabled;
      }
    }
  }

  /**
   * Toggle camera
   */
  toggleCamera(enabled: boolean): void {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = enabled;
      }
    }
  }

  /**
   * Get remote stream for a peer
   */
  getRemoteStream(sessionId: string): MediaStream | null {
    return this.remoteStreams.get(sessionId) || null;
  }

  /**
   * Get all active peer session IDs
   */
  getActivePeers(): string[] {
    return Array.from(this.peerConnections.keys());
  }
}
