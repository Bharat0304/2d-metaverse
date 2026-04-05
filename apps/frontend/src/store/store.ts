import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import chatReducer from "./features/chat/chatSlice";
import roomReducer from "./features/room/roomSlice";
import screenReducer from "./features/webRtc/screenSlice";
import webcamReducer from "./features/webRtc/webcamSlice";
import playerReducer from "./features/player/playerSlice";

const store = configureStore({
    reducer: {
        chat: chatReducer,
        room: roomReducer,
        screen: screenReducer,
        webcam: webcamReducer,
        player: playerReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>;

export default store;
