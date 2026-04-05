"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "../../store/hooks";
import RoomSelection from "../../components/RoomSelection/RoomSelection";
import Chat from "../../components/Chat";
import GameFooter from "../../components/GameFooter";
import VideoCall from "../../components/VideoCall";
import ScreenShare from "../../components/ScreenShare";
import { AnimatePresence } from "framer-motion";

export default function Home() {
    const roomJoined = useAppSelector((state) => state.room.roomJoined);
    const showOfficeChat = useAppSelector((state) => state.chat.showOfficeChat);
    const username = useAppSelector((state) => state.player.username);
    
    const [screenDialogOpen, setScreenDialogOpen] = useState(false);
    const [showChat, setShowChat] = useState(false);

    useEffect(() => {
        // Only import and start Phaser once
        if (typeof window !== "undefined" && !((window as any).game)) {
            import("../../game/main").then(({ startGame }) => {
                startGame("game-container");
            });
        }
    }, []);

    return (
        <div className="relative h-screen w-screen overflow-hidden bg-black">
            {/* Phaser Game Container */}
            <div id="game-container" className="absolute inset-0 z-0 text-white"></div>

            {/* Overlays */}
            {!roomJoined && (
                <div className="absolute inset-0 z-10 bg-black/50">
                    <RoomSelection />
                </div>
            )}

            {roomJoined && (
                <div className="absolute inset-0 z-10 pointer-events-none">
                    {showChat && <Chat setShowChat={setShowChat} />}
                    <VideoCall />
                    <AnimatePresence mode="wait">
                        <GameFooter
                            key="game-footer"
                            isInsideOffice={showOfficeChat}
                            username={username}
                            setScreenDialogOpen={setScreenDialogOpen}
                            setShowChat={setShowChat}
                            showChat={showChat}
                        />
                    </AnimatePresence>
                </div>
            )}

            {showOfficeChat && (
                <div className="absolute inset-0 z-20 pointer-events-none">
                    <ScreenShare
                        screenDialogOpen={screenDialogOpen}
                        setScreenDialogOpen={setScreenDialogOpen}
                    />
                </div>
            )}
        </div>
    );
}
