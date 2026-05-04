"use client";

import { useState } from "react";
import { WelcomeModal } from "../lobby/WelcomeModal";
import { JoinPublicRoomModal } from "../lobby/JoinPublicRoomModal";
import { JoinCustomRoomModal } from "../lobby/JoinCustomRoomModal";
import { GameBackground } from "../lobby/GameBackground";
import { Bootstrap } from "../../game/scenes/Bootstrap";

type Screen = "welcome" | "public" | "custom";

const RoomSelection = () => {
    const [screen, setScreen] = useState<Screen>("welcome");

    const getBootstrap = () => (window as any).game?.scene.keys.bootstrap as Bootstrap;

    const handleJoinPublic = (username: string, avatarId: string) => {
        const bootstrap = getBootstrap();
        if (!bootstrap) return;
        
        bootstrap.network
            .joinOrCreatePublicRoom(username, avatarId)
            .then(() => {
                bootstrap.launchGame();
            });
    };

    const handleJoinCustom = (username: string, roomCode: string, avatarId: string) => {
        const bootstrap = getBootstrap();
        if (!bootstrap) return;

        bootstrap.network
            .joinCustomRoom(username, roomCode, null, avatarId)
            .then(() => {
                bootstrap.launchGame();
            })
            .catch((err) => {
                console.error("Failed to join custom room", err);
                alert("Could not join room. Make sure the code is correct.");
            });
    };

    const handleCreateCustom = (username: string, roomName: string, avatarId: string) => {
        const bootstrap = getBootstrap();
        if (!bootstrap) return;

        bootstrap.network
            .createCustomRoom(username, roomName, null, avatarId)
            .then(() => {
                bootstrap.launchGame();
            })
            .catch((err) => {
                console.error("Failed to create custom room", err);
                alert("Could not create room.");
            });
    };

    return (
        <div className="w-screen h-screen absolute left-0 top-0 flex flex-col gap-2 items-center justify-center pointer-events-auto overflow-hidden">
            {/* Animated pixel art village background */}
            <GameBackground />

            {/* Modal layer */}
            <div style={{ position: "relative", zIndex: 10 }}>
                {screen === "welcome" && (
                    <WelcomeModal
                        onJoinPublic={() => setScreen("public")}
                        onJoinCustom={() => setScreen("custom")}
                    />
                )}

                {screen === "public" && (
                    <JoinPublicRoomModal
                        onBack={() => setScreen("welcome")}
                        onJoin={handleJoinPublic}
                    />
                )}

                {screen === "custom" && (
                    <JoinCustomRoomModal
                        onBack={() => setScreen("welcome")}
                        onJoin={handleJoinCustom}
                        onCreate={handleCreateCustom}
                    />
                )}
            </div>
        </div>
    );
};

export default RoomSelection;
