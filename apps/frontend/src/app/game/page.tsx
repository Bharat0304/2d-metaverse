"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "../../store/hooks";
import RoomSelection from "../../components/RoomSelection/RoomSelection";
import Chat from "../../components/Chat";
import GameFooter from "../../components/GameFooter";
import ScreenShare from "../../components/ScreenShare";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";

const ProximityMessaging = dynamic(() => import("../../components/ProximityMessaging"), {
    ssr: false,
});

export default function Home() {
    const roomJoined = useAppSelector((state) => state.room.roomJoined);
    const showOfficeChat = useAppSelector((state) => state.chat.showOfficeChat);
    const username = useAppSelector((state) => state.player.username);
    const spaceId = useAppSelector((state) => state.room.spaceId);

    const [screenDialogOpen, setScreenDialogOpen] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        // Only import and start Phaser once
        if (mounted && typeof window !== "undefined" && !((window as any).game)) {
            console.log('Starting Phaser game...');
            const params = new URLSearchParams(window.location.search);
            const world = params.get("world") || "default";

            import("../../game/main").then(({ startGame }) => {
                console.log('Phaser main imported, starting game...');
                try {
                    const game = startGame("game-container", world);
                    console.log('Phaser game started successfully');
                } catch (error) {
                    console.error('Error starting Phaser game:', error);
                }
            }).catch(error => {
                console.error('Error importing Phaser main:', error);
            });
        }
    }, [mounted]);

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
                    {/* Room ID Display */}
                    <div className="absolute top-4 left-4 bg-gray-900/90 backdrop-blur rounded-lg p-3 text-white text-xs pointer-events-auto shadow-lg">
                        <div className="font-bold text-blue-400 mb-1">Room ID</div>
                        <div className="bg-gray-800 rounded px-2 py-1 font-mono text-sm select-all cursor-pointer hover:bg-gray-700 transition-colors"
                             onClick={() => {
                                 navigator.clipboard.writeText(spaceId);
                                 alert('Room ID copied to clipboard!');
                             }}
                             title="Click to copy">
                            {spaceId}
                        </div>
                        <div className="text-gray-400 mt-1 text-xs">
                            Share this ID with others to join the same room
                        </div>
                    </div>

                    {showChat && <Chat setShowChat={setShowChat} />}
                    <ProximityMessaging />
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
