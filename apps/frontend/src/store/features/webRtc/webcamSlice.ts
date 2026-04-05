import { sanitizeUserIdForVideoCalling } from "../../../lib/utils";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MediaConnection } from "peerjs";

interface InitialState {
    myWebcamStream: MediaStream | null;
    peerStreams: Record<string, { call: MediaConnection; stream: MediaStream }>;
    isWebcamOn: boolean;
    isMicOn: boolean;
    isDisconnectedFromVideoCalls: boolean;
}

const initialState: InitialState = {
    myWebcamStream: null,
    peerStreams: {},
    isWebcamOn: false,
    isMicOn: false,
    isDisconnectedFromVideoCalls: false,
};

const webcamSlice = createSlice({
    name: "webcam",
    initialState,
    reducers: {
        setMyWebcamStream: (state, action: PayloadAction<MediaStream>) => {
            state.myWebcamStream = action.payload;
            state.isWebcamOn = true;
            state.isMicOn = true;
            state.isDisconnectedFromVideoCalls = false;
        },
        toggleWebcam: (state) => {
            if (!state.myWebcamStream) return;
            const tracks = state.myWebcamStream.getVideoTracks();
            if (tracks[0]) {
                tracks[0].enabled = !tracks[0].enabled;
                state.isWebcamOn = tracks[0].enabled;
            }
        },
        toggleMic: (state) => {
            if (!state.myWebcamStream) return;
            const tracks = state.myWebcamStream.getAudioTracks();
            if (tracks[0]) {
                tracks[0].enabled = !tracks[0].enabled;
                state.isMicOn = tracks[0].enabled;
            }
        },
        turnOffWebcamAndMic: (state) => {
            if (!state.myWebcamStream) return;
            const videoTracks = state.myWebcamStream.getVideoTracks();
            const audioTracks = state.myWebcamStream.getAudioTracks();
            if (videoTracks[0]) videoTracks[0].enabled = false;
            if (audioTracks[0]) audioTracks[0].enabled = false;
            state.isWebcamOn = false;
            state.isMicOn = false;
        },
        addWebcamStream: (
            state,
            action: PayloadAction<{
                peerId: string;
                call: MediaConnection;
                userStream: MediaStream;
            }>
        ) => {
            const { peerId, call, userStream: stream } = action.payload;
            state.peerStreams[peerId] = { call, stream };
        },
        disconnectUserForVideoCalling: (state, action: PayloadAction<string>) => {
            const sanitizedId = sanitizeUserIdForVideoCalling(action.payload);
            const peer = state.peerStreams[sanitizedId];
            if (peer) {
                peer.call.close();
                delete state.peerStreams[sanitizedId];
            }
        },
        removeAllPeerConnectionsForVideoCalling: (state) => {
            Object.values(state.peerStreams).forEach((peer) => {
                peer.call.close();
            });
            state.peerStreams = {};
        },
        disconnectFromVideoCall: (state) => {
            if (state.myWebcamStream) {
                const tracks = state.myWebcamStream.getTracks();
                tracks.forEach((track) => track.stop());
                state.myWebcamStream = null;
                state.isWebcamOn = false;
                state.isMicOn = false;
            }
            Object.values(state.peerStreams).forEach((peer) => {
                peer.call.close();
            });
            state.peerStreams = {};
            state.isDisconnectedFromVideoCalls = true;
        },
    },
});

export const {
    setMyWebcamStream,
    toggleWebcam,
    toggleMic,
    turnOffWebcamAndMic,
    addWebcamStream,
    disconnectUserForVideoCalling,
    removeAllPeerConnectionsForVideoCalling,
    disconnectFromVideoCall,
} = webcamSlice.actions;

export default webcamSlice.reducer;
