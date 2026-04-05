import { sanitizeUserIdForScreenSharing } from "../../lib/utils";
import { addScreenStream, setMyScreenStream, stopScreenSharing } from "../../store/features/webRtc/screenSlice";
import store from "../../store/store";
import Peer from "peerjs";

class ScreenSharing {
    private static instance: ScreenSharing;
    private peer: Peer | null = null;
    private initializationPromise: Promise<Peer> | null = null;
    myScreenStream: MediaStream | null = null;

    private constructor() {}

    public static getInstance(): ScreenSharing {
        if (!ScreenSharing.instance) {
            ScreenSharing.instance = new ScreenSharing();
        }
        return ScreenSharing.instance;
    }

    public async initializePeer(userId: string): Promise<Peer> {
        if (this.initializationPromise) return this.initializationPromise;
        if (this.peer) return Promise.resolve(this.peer);

        this.initializationPromise = new Promise((resolve, reject) => {
            const sanitizedId = sanitizeUserIdForScreenSharing(userId);
            const peer = new Peer(sanitizedId);

            peer.on("open", () => {
                this.peer = peer;
                resolve(peer);
            });

            peer.on("call", (call) => {
                call.answer();
                call.on("stream", (userStream) => {
                    store.dispatch(addScreenStream({ peerId: call.peer, call, userStream }));
                });
            });

            peer.on("error", (error) => {
                console.error("Screen peer error:", error);
                reject(error);
            });
        });

        return this.initializationPromise;
    }

    public shareScreen(sessionId: string) {
        if (!this.peer) {
            console.warn("Cannot share screen - Peer not initialized");
            return;
        }
        const myScreenStream = store.getState().screen.myScreenStream;
        if (!myScreenStream) return;

        try {
            const userId = sanitizeUserIdForScreenSharing(sessionId);
            this.peer.call(userId, myScreenStream);
        } catch (err) {
            console.error("Error while sharing screen:", err);
        }
    }

    async getUserMedia() {
        const stream = await navigator.mediaDevices.getDisplayMedia();
        store.dispatch(setMyScreenStream(stream));
        const [track] = stream.getTracks();
        track.onended = () => {
            store.dispatch(stopScreenSharing());
        };
    }
}

export default ScreenSharing.getInstance();
