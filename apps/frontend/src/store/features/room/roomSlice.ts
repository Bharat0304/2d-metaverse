import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RoomInfo {
    roomId: string;
    roomName: string;
    hasPassword: boolean;
}

const roomSlice = createSlice({
    name: "room",
    initialState: {
        roomJoined: false,
        isLoading: true,
        availableRooms: new Array<RoomInfo>(),
        spaceId: "",
    },
    reducers: {
        setRoomJoined: (state, action: PayloadAction<boolean>) => {
            state.roomJoined = action.payload;
        },
        setIsLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setSpaceId: (state, action: PayloadAction<string>) => {
            state.spaceId = action.payload;
        },
        addAvailableRooms: (state, action: PayloadAction<RoomInfo>) => {
            state.availableRooms.push(action.payload);
        },
        removeFromAvailableRooms: (state, action: PayloadAction<string>) => {
            state.availableRooms = state.availableRooms.filter(
                (room) => room.roomId !== action.payload
            );
        },
    },
});

export const {
    setRoomJoined,
    setIsLoading,
    setSpaceId,
    addAvailableRooms,
    removeFromAvailableRooms,
} = roomSlice.actions;

export default roomSlice.reducer;
