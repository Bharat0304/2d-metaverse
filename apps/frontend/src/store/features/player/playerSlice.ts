import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PlayerState {
    username: string;
    character: string;
    sessionId: string;
}

const playerSlice = createSlice({
    name: "player",
    initialState: {
        username: "",
        character: "",
        sessionId: "",
    } as PlayerState,
    reducers: {
        setPlayerInfo: (state, action: PayloadAction<PlayerState>) => {
            state.username = action.payload.username;
            state.character = action.payload.character;
            state.sessionId = action.payload.sessionId;
        },
    },
});

export const { setPlayerInfo } = playerSlice.actions;
export default playerSlice.reducer;
