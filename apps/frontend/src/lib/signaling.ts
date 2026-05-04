class SignalingClient {
  private ws: WebSocket | null = null;
  private userId: string;
  private messageHandlers: Map<string, (data: any) => void> = new Map();

  constructor(userId: string) {
    this.userId = userId;
  }

  connect(url: string) {
    console.log('Connecting to WebSocket at:', url);
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('Signaling WebSocket connected, sending join for user:', this.userId);
      // Send join message
      this.send({ type: 'join', userId: this.userId });
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('Received message from server:', message.type);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing signaling message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket closed for user:', this.userId);
      // Attempt to reconnect after 5 seconds
      setTimeout(() => this.connect(url), 5000);
    };
  }

  private handleMessage(message: any) {
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message);
    } else {
      console.log('No handler for message type:', message.type);
    }
  }

  on(messageType: string, handler: (data: any) => void) {
    this.messageHandlers.set(messageType, handler);
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('Sending message:', data);
      this.ws.send(JSON.stringify(data));
    } else {
      console.error('WebSocket not connected, readyState:', this.ws?.readyState);
    }
  }

  // WebRTC signaling methods
  sendOffer(targetUserId: string, offer: RTCSessionDescriptionInit) {
    this.send({
      type: 'offer',
      from: this.userId,
      to: targetUserId,
      offer,
    });
  }

  sendAnswer(targetUserId: string, answer: RTCSessionDescriptionInit) {
    this.send({
      type: 'answer',
      from: this.userId,
      to: targetUserId,
      answer,
    });
  }

  sendIceCandidate(targetUserId: string, candidate: RTCIceCandidateInit) {
    this.send({
      type: 'ice-candidate',
      from: this.userId,
      to: targetUserId,
      candidate,
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export default SignalingClient;
