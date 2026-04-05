import store from "../../store/store";
import Network from "./Network";
import { OfficeManager } from "./OfficeManager";
import { Player } from "./Player";
import {
    disconnectFromVideoCall,
    disconnectUserForVideoCalling,
    removeAllPeerConnectionsForVideoCalling,
} from "../../store/features/webRtc/webcamSlice";
import videoCalling from "../service/VideoCalling";
import screenSharing from "../service/ScreenSharing";
import { clearOfficeChat, setShowOfficeChat } from "../../store/features/chat/chatSlice";
import {
    clearPlayerNameMap,
    removeAllPeerConnectionsForScreenSharing,
    setPlayerNameMap,
} from "../../store/features/webRtc/screenSlice";
import { officeNames, sanitizeUserIdForScreenSharing } from "../../lib/utils";

export class MyPlayer extends Player {
    private static SPEED = 300;
    private static PROXIMITY_CONNECT_DELAY = 500;

    private lastX: number;
    private lastY: number;
    private mySessionId: string;
    private character: string;

    private currentOffice: officeNames = null;
    private network: Network;
    private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
    private officeManager: OfficeManager;
    private proximityPlayers = new Map<string, Player>();
    private proximityTimers = new Map<string, { enterTime: number; connected: boolean }>();

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        character: string,
        username: string,
        mySessionId: string,
        isMicOn: boolean,
        isWebcamOn: boolean,
        network: Network,
        cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys
    ) {
        super(scene, x, y, character, username, isMicOn, isWebcamOn);
        this.character = character;
        this.mySessionId = mySessionId;
        this.officeManager = new OfficeManager();
        this.network = network;
        this.cursorKeys = cursorKeys;
    }

    private handlePlayerMovements() {
        let vx = 0, vy = 0;

        if (this.cursorKeys.left.isDown) {
            vx -= MyPlayer.SPEED;
            this.playAnimation(`${this.character}_left_run`);
        } else if (this.cursorKeys.right.isDown) {
            vx += MyPlayer.SPEED;
            this.playAnimation(`${this.character}_right_run`);
        } else if (this.cursorKeys.up.isDown) {
            vy -= MyPlayer.SPEED;
            this.playAnimation(`${this.character}_up_run`);
        } else if (this.cursorKeys.down.isDown) {
            vy += MyPlayer.SPEED;
            this.playAnimation(`${this.character}_down_run`);
        } else {
            const currentAnimKey = this.getCurrentAnimationKey();
            if (currentAnimKey) {
                const parts = currentAnimKey.split("_");
                parts[2] = "idle";
                const idleAnim = parts.join("_");
                if (currentAnimKey !== idleAnim) {
                    this.playAnimation(idleAnim);
                    this.network.updatePlayer(this.x, this.y, idleAnim);
                }
            }
        }

        (this.body as Phaser.Physics.Arcade.Body).setVelocity(vx, vy);

        if (vx !== 0 || vy !== 0) {
            this.network.updatePlayer(this.x, this.y, this.getCurrentAnimationKey());
        }
    }

    private joinOffice(officeName: officeNames) {
        this.currentOffice = officeName;
        this.proximityPlayers.clear();
        this.proximityTimers.clear();

        store.dispatch(setShowOfficeChat(true));

        if (store.getState().webcam.myWebcamStream) {
            this.startWebcam();
        }

        this.network.joinOffice(this.currentOffice);

        const { members } = this.network.getOfficeData(this.currentOffice);
        members.forEach((username, sessionId) => {
            store.dispatch(
                setPlayerNameMap({
                    peerId: sanitizeUserIdForScreenSharing(sessionId),
                    username,
                })
            );
        });
    }

    private leaveOffice() {
        this.network.leaveOffice(this.currentOffice);
        store.dispatch(clearOfficeChat());
        store.dispatch(setShowOfficeChat(false));
        store.dispatch(removeAllPeerConnectionsForVideoCalling());
        store.dispatch(removeAllPeerConnectionsForScreenSharing());
        store.dispatch(clearPlayerNameMap());
        this.currentOffice = null;
    }

    private handleOfficeJoiningAndLeaving() {
        const { x, y } = this;
        if (x !== this.lastX || y !== this.lastY) {
            const office = this.officeManager.update(x, y);
            if (office && this.currentOffice !== office) {
                this.joinOffice(office);
            } else if (!office && this.currentOffice) {
                this.leaveOffice();
            }
            this.lastX = x;
            this.lastY = y;
        }
    }

    private shareWebcamWithProximityPlayers(shouldConnectToOtherPlayers: boolean) {
        for (const sessionId of this.proximityPlayers.keys()) {
            videoCalling.shareWebcam(sessionId);
        }
        if (shouldConnectToOtherPlayers) {
            this.network.connectToProximityVideoCall(Array.from(this.proximityPlayers.keys()));
        }
    }

    private shareWebcamWithOfficePlayers(shouldConnectToOtherPlayers: boolean) {
        const { members } = this.network.getOfficeData(this.currentOffice);
        members.forEach((_username, sessionId) => {
            if (sessionId === this.mySessionId) return;
            videoCalling.shareWebcam(sessionId);
        });
        if (shouldConnectToOtherPlayers) {
            this.network.connectToOfficeVideoCall(this.currentOffice as string);
        }
    }

    async startWebcam(shouldConnectToOtherPlayers = false) {
        await videoCalling.getUserMedia();
        this.updateDisconnectStatus(false);
        if (this.currentOffice) {
            this.shareWebcamWithOfficePlayers(shouldConnectToOtherPlayers);
        } else {
            this.shareWebcamWithProximityPlayers(shouldConnectToOtherPlayers);
        }
    }

    async startScreenSharing() {
        await screenSharing.getUserMedia();
        const { members } = this.network.getOfficeData(this.currentOffice);
        members.forEach((_username, sessionId) => {
            if (sessionId === this.mySessionId) return;
            screenSharing.shareScreen(sessionId);
        });
    }

    updateDisconnectStatus(disconnected: boolean) {
        this.setDisconnectIcon(disconnected);
        const status = this.getCurrentStatus();
        this.network.updatePlayer(this.x, this.y, this.getCurrentAnimationKey(), status);
    }

    handleProximityChat(time: number, sessionId: string, otherPlayer: Player) {
        const distance = Phaser.Math.Distance.Between(this.x, this.y, otherPlayer.x, otherPlayer.y);
        const isProximityPlayerInOffice = OfficeManager.isInOffice(otherPlayer.x, otherPlayer.y);

        if (this.proximityTimers.has(sessionId) && distance > 50) {
            const timer = this.proximityTimers.get(sessionId)!;
            if (!timer.connected) {
                this.proximityTimers.delete(sessionId);
                return;
            }
            store.dispatch(disconnectUserForVideoCalling(sessionId));
            this.proximityPlayers.delete(sessionId);
            this.proximityTimers.delete(sessionId);
            this.network.removeFromProximityCall(sessionId);
            return;
        }

        if (this.proximityPlayers.has(sessionId) && isProximityPlayerInOffice) {
            store.dispatch(disconnectUserForVideoCalling(sessionId));
            this.proximityPlayers.delete(sessionId);
            this.proximityTimers.delete(sessionId);
            this.network.removeFromProximityCall(sessionId);
            return;
        }

        if (distance <= 50 && !this.currentOffice && !isProximityPlayerInOffice) {
            if (!this.proximityTimers.has(sessionId)) {
                this.proximityTimers.set(sessionId, { enterTime: time, connected: false });
                return;
            }
            const timer = this.proximityTimers.get(sessionId)!;
            if (!timer.connected && time - timer.enterTime >= MyPlayer.PROXIMITY_CONNECT_DELAY) {
                this.proximityPlayers.set(sessionId, otherPlayer);
                timer.connected = true;
                videoCalling.shareWebcam(sessionId);
            }
        }
    }

    handlePlayerLeft(sessionId: string) {
        store.dispatch(disconnectUserForVideoCalling(sessionId));
        this.proximityPlayers.delete(sessionId);
        this.proximityTimers.delete(sessionId);
    }

    playerStoppedScreenSharing() {
        this.network.playerStoppedScreenSharing(this.currentOffice);
    }

    playerStoppedWebcam() {
        store.dispatch(disconnectFromVideoCall());
        this.updateDisconnectStatus(true);
        if (this.currentOffice) {
            this.network.userStoppedOfficeWebcam(this.currentOffice);
        } else {
            this.network.userStoppedProximityWebcam(Array.from(this.proximityPlayers.keys()));
        }
    }

    addNewOfficeChatMessage = (message: string) => {
        this.network.addNewOfficeChatMessage(message, this.currentOffice);
    };

    initializePeers = () => {
        videoCalling
            .initializePeer(this.mySessionId)
            .then((peer) => console.log("video peer:", peer.id))
            .catch((err) => console.error("Failed to init video peer:", err));

        screenSharing
            .initializePeer(this.mySessionId)
            .then((peer) => console.log("screen peer:", peer.id))
            .catch((err) => console.error("Failed to init screen peer:", err));
    };

    update() {
        this.handlePlayerMovements();
        this.handleOfficeJoiningAndLeaving();
    }
}
