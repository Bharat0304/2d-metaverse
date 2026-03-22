/**
 * WSClient — Singleton WebSocket client with typed event emitter.
 * Handles connection, JSON messaging, and per-event subscriptions.
 */

type MessageHandler = (message: Record<string, unknown>) => void;

export class WSClient {
  private static instance: WSClient;
  private ws: WebSocket | null = null;
  private handlers: Map<string, Set<MessageHandler>> = new Map();

  /** The sessionId assigned by the server on JOINED_SPACE */
  public sessionId: string | null = null;
  public connected = false;

  private constructor() {}

  static getInstance(): WSClient {
    if (!WSClient.instance) {
      WSClient.instance = new WSClient();
    }
    return WSClient.instance;
  }

  // ── Connection ─────────────────────────────────────────────

  connect(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.connected = true;
        console.log('[WS] Connected to', url);
        resolve();
      };

      this.ws.onerror = () => {
        reject(new Error('WebSocket connection failed'));
      };

      this.ws.onclose = () => {
        this.connected = false;
        console.log('[WS] Disconnected');
        this.emit('DISCONNECTED', { type: 'DISCONNECTED' });
      };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data as string) as Record<string, unknown>;
          const type = message['type'] as string;
          console.log('[WS] ←', type, message);
          this.emit(type, message);
        } catch {
          console.warn('[WS] Non-JSON message received:', event.data);
        }
      };
    });
  }

  disconnect(): void {
    this.ws?.close();
    this.ws = null;
  }

  // ── Sending ─────────────────────────────────────────────────

  send(message: Record<string, unknown>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('[WS] →', message['type'], message);
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('[WS] Cannot send — not connected');
    }
  }

  joinSpace(spaceId: string): void {
    this.send({ type: 'JOIN_SPACE', spaceId });
  }

  move(dx: number, dy: number): void {
    this.send({ type: 'MOVE', dx, dy });
  }

  // ── Event Emitter ────────────────────────────────────────────

  on(type: string, handler: MessageHandler): void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
  }

  off(type: string, handler: MessageHandler): void {
    this.handlers.get(type)?.delete(handler);
  }

  private emit(type: string, message: Record<string, unknown>): void {
    this.handlers.get(type)?.forEach(h => h(message));
  }
}
