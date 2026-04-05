import { sanitizeUserIdForScreenSharing } from "../../../lib/utils";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MediaConnection } from "peerjs";
import { enableMapSet } from "immer";

enableMapSet();

interface ScreenSharingState {
    playerNameMap: Record<string, string>;
    peerStreams: Record<
        string,
        { call: MediaConnection; stream: MediaStream; username: string }
    >;
    myScreenStream: MediaStream | null;
}

const initialState: ScreenSharingState = {
    playerNameMap: {},
    peerStreams: {},
    myScreenStream: null,
};

const screenReducer = createSlice({
    name: "screen-sharing",
    initialState,
    reducers: {
        setMyScreenStream: (state, action: PayloadAction<MediaStream>) => {
            state.myScreenStream = action.payload;
        },
        addScreenStream: (
            state,
            action: PayloadAction<{
                peerId: string;
                call: MediaConnection;
                userStream: MediaStream;
            }>
        ) => {
            const { peerId, call, userStream: stream } = action.payload;
            const username = state.playerNameMap[peerId] || peerId;
            state.peerStreams[peerId] = { call, stream, username };
        },
        disconnectUserForScreenSharing: (state, action: PayloadAction<string>) => {
            const sanitizedId = sanitizeUserIdForScreenSharing(action.payload);
            const peer = state.peerStreams[sanitizedId];
            if (peer) {
                peer.call.close();
                delete state.peerStreams[sanitizedId];
            }
        },
        removeAllPeerConnectionsForScreenSharing: (state) => {
            if (state.myScreenStream) {
                const tracks = state.myScreenStream.getTracks();
                tracks.forEach((track) => track.stop());
                state.myScreenStream = null;
            }
            Object.values(state.peerStreams).forEach((peer) => {
                peer.call.close();
            });
            state.peerStreams = {};
        },
        stopScreenSharing: (state) => {
            if (state.myScreenStream) {
                const tracks = state.myScreenStream.getTracks();
                tracks.forEach((track) => track.stop());
                state.myScreenStream = null;
            }
        },
        setPlayerNameMap: (
            state,
            action: PayloadAction<{ peerId: string; username: string }>
        ) => {
            state.playerNameMap[action.payload.peerId] = action.payload.username;
        },
        removePlayerNameMap: (state, action: PayloadAction<string>) => {
            delete state.playerNameMap[action.payload];
        },
        clearPlayerNameMap: (state) => {
            state.playerNameMap = {};
        },
    },
});

export const {
    setMyScreenStream,
    addScreenStream,
    disconnectUserForScreenSharing,
    removeAllPeerConnectionsForScreenSharing,
    stopScreenSharing,
    setPlayerNameMap,
    removePlayerNameMap,
    clearPlayerNameMap,
} = screenReducer.actions;

export default screenReducer.reducer;
