/**
 * Network.ts — Plain WebSocket adapter for apps/ws backend.
 *
 * The apps/ws server handles:
 *   JOIN_SPACE  → JOINED_SPACE  (sessionId)
 *   MOVE        → PLAYER_MOVED  (sessionId, x, y) broadcast to others
 *   SPACE_USERS → list of users on connect
 *
 * This class mimics the Colyseus Network API surface so the rest of
 * the codebase (GameScene, MyPlayer) stays almost unchanged.
 */

import store from "../../store/store";
import { setIsLoading } from "../../store/features/room/roomSlice";
import {
    pushNewGlobalMessage,
    addGlobalChat,
    pushNewOfficeMessage,
    addOfficeChat,
} from "../../store/features/chat/chatSlice";
import { Event, phaserEvents } from "./EventBus";
import { officeNames } from "../../lib/utils";

const WS_URL =
    process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080";

export default class Network {
    private ws!: WebSocket;
    private username = "";
    private character = "";
    private _sessionId = "";
    private spaceId = "";

    // Called by Bootstrap
    constructor() {
        store.dispatch(setIsLoading(false));
    }

    get sessionId() {
        return this._sessionId;
    }

    // ── Room lifecycle ────────────────────────────────────────────────────────

    /** Join the plain-WS space — replaces Colyseus joinOrCreate */
    joinOrCreatePublicRoom = async (username: string, character: string) => {
        store.dispatch(setIsLoading(true));
        this.username  = username;
        this.character = character;
        this.spaceId   = "public";
        await this.connect();
        store.dispatch(setIsLoading(false));
    };

    createCustomRoom = async (
        username: string,
        roomName: string,
        _password: string | null,
        character: string
    ) => {
        store.dispatch(setIsLoading(true));
        this.username  = username;
        this.character = character;
        this.spaceId   = roomName;
        await this.connect();
        store.dispatch(setIsLoading(false));
    };

    joinCustomRoom = async (
        username: string,
        roomId: string,
        _password: string | null,
        character: string
    ) => {
        store.dispatch(setIsLoading(true));
        this.username  = username;
        this.character = character;
        this.spaceId   = roomId;
        await this.connect();
        store.dispatch(setIsLoading(false));
    };

    // ── WebSocket connection ──────────────────────────────────────────────────

    private connect(): Promise<void> {
        return new Promise((resolve) => {
            this.ws = new WebSocket(WS_URL);

            this.ws.onopen = () => {
                this.ws.send(
                    JSON.stringify({
                        type: "JOIN_SPACE",
                        spaceId: this.spaceId,
                        username: this.username,
                        character: this.character,
                    })
                );
            };

            this.ws.onmessage = (ev) => {
                const msg = JSON.parse(ev.data as string);
                this.handleMessage(msg, resolve);
            };

            this.ws.onerror = (e) => {
                console.warn("[WS] connection error", e);
                resolve(); // still proceed — game works offline
            };

            this.ws.onclose = () => {
                console.warn("[WS] disconnected");
            };
        });
    }

    private handleMessage(msg: any, resolve?: (v: void) => void) {
        switch (msg.type) {
            case "JOINED_SPACE":
                this._sessionId = msg.sessionId;

                // resolve the connect() promise so launchGame fires
                resolve?.();
                break;

            case "SPACE_USERS":
                // Sync full user list
                for (const u of msg.users as Array<{
                    sessionId: string;
                    username: string;
                    character: string;
                    x: number;
                    y: number;
                }>) {
                    if (u.sessionId === this._sessionId) continue;
                    phaserEvents.emit(Event.PLAYER_JOINED, this.makePlayerProxy(u), u.sessionId);
                }
                break;

            case "PLAYER_JOINED":
                if (msg.sessionId !== this._sessionId) {
                    phaserEvents.emit(Event.PLAYER_JOINED, this.makePlayerProxy(msg), msg.sessionId);
                }
                break;

            case "PLAYER_MOVED": {
                const player = (window as any).__otherPlayers?.get(msg.sessionId);
                if (player) {
                    player._serverX = msg.x;
                    player._serverY = msg.y;
                    player._anim   = msg.anim ?? player._anim;
                    // trigger onChange callbacks
                    player._onChangeCallbacks?.forEach((cb: () => void) => cb());
                }
                break;
            }

            case "PLAYER_LEFT":
                phaserEvents.emit(Event.PLAYER_LEFT, msg.sessionId);
                break;

            case "NEW_GLOBAL_CHAT_MESSAGE":
                store.dispatch(pushNewGlobalMessage(msg));
                break;

            case "GET_GLOBAL_CHAT":
                store.dispatch(addGlobalChat(msg.messages ?? []));
                break;

            case "NEW_OFFICE_MESSAGE":
                store.dispatch(pushNewOfficeMessage(msg));
                break;

            case "GET_OFFICE_CHAT":
                store.dispatch(addOfficeChat(msg.messages ?? []));
                break;
        }
    }

    // ── Player proxy factory ──────────────────────────────────────────────────
    // The Colyseus client returned player objects with onChange().
    // We emulate that so GameScene/handlePlayerJoined keeps working.

    private makePlayerProxy(data: {
        sessionId: string;
        username: string;
        character: string;
        x: number;
        y: number;
        anim?: string;
        isMicOn?: boolean;
        isWebcamOn?: boolean;
    }) {
        const proxy = {
            anim: data.anim || `${data.character || 'nancy'}_down_idle`,
            x: data.x,
            y: data.y,
            username: data.username || "Explorer",
            isMicOn: data.isMicOn ?? false,
            isWebcamOn: data.isWebcamOn ?? false,
            isDisconnected: false,
            // internal storage used by PLAYER_MOVED handler
            _serverX: data.x,
            _serverY: data.y,
            _anim: data.anim || `${data.character || 'nancy'}_down_idle`,
            _onChangeCallbacks: [] as Array<() => void>,
            onChange(cb: () => void) {
                this._onChangeCallbacks.push(cb);
            },
        };

        // Register in global map so PLAYER_MOVED can look it up
        if (typeof window !== "undefined") {
            if (!(window as any).__otherPlayers) {
                (window as any).__otherPlayers = new Map();
            }
            (window as any).__otherPlayers.set(data.sessionId, proxy);
        }

        return proxy;
    }

    // ── Player updates ────────────────────────────────────────────────────────

    updatePlayer(
        x: number,
        y: number,
        anim: string,
        _status?: { isMicOn?: boolean; isWebcamOn?: boolean; isDisconnected?: boolean }
    ) {
        this.send({ type: "MOVE", x, y, anim });
    }

    // ── Office stubs (not implemented in plain WS server) ─────────────────────

    joinOffice(_officeName: officeNames)  { /* noop */ }
    leaveOffice(_officeName: officeNames) { /* noop */ }
    connectToOfficeVideoCall(_office: string) { /* noop */ }
    connectToProximityVideoCall(_sessionIds: string[]) { /* noop */ }
    removeFromProximityCall(_sessionId: string) { /* noop */ }
    userStoppedOfficeWebcam(_office: officeNames) { /* noop */ }
    userStoppedProximityWebcam(_players: string[]) { /* noop */ }
    playerStoppedScreenSharing = (_office: officeNames) => { /* noop */ };

    addNewOfficeChatMessage = (_message: string, _officeName: officeNames) => {
        /* noop — office chat not implemented in plain ws server */
    };

    addNewGlobalChatMessage = (message: string) => {
        this.send({
            type: "PUSH_GLOBAL_CHAT_MESSAGE",
            username: this.username,
            message,
        });
    };

    getOfficeData(_officeName: officeNames) {
        return { members: new Map<string, string>(), chat: [] };
    }

    /** handleServerMessages is called by GameScene.create() after listeners are added */
    handleServerMessages = () => {
        phaserEvents.emit(
            Event.INITIALIZE_PLAYER,
            this.character,
            this.username,
            this._sessionId,
            500, // spawn X
            500  // spawn Y
        );
    };

    // ── Helpers ───────────────────────────────────────────────────────────────

    private send(data: object) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }
}
