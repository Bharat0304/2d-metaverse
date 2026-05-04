import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Bootstrap } from "../../game/scenes/Bootstrap";
import { useState } from "react";
import { Button } from "../ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card";

import { ArrowLeft, LoaderIcon } from "lucide-react";
import { VideoPlayer } from "../VideoPlayer";
import videoCalling from "../../game/service/VideoCalling";
import store from "../../store/store";
import { disconnectFromVideoCall } from "../../store/features/webRtc/webcamSlice";
import { WebcamButtons } from "../FloatingActions";
import CharacterCarousel from "./CharacterCarousel";
import { useAppSelector } from "../../store/hooks";

const PublicRoom = ({
    setCarouselApi,
    getSelectedCharacter,
    setShowPublicRoom,
    setShowCreateOrJoinCustomRoom,
}: {
    setCarouselApi: () => void;
    getSelectedCharacter: () => "nancy" | "ash" | "lucy" | "adam";
    setShowPublicRoom: React.Dispatch<React.SetStateAction<boolean>>;
    setShowCreateOrJoinCustomRoom: React.Dispatch<
        React.SetStateAction<boolean>
    >;
}) => {
    const bootstrap = (window as any).game?.scene.keys.bootstrap as Bootstrap;
    const [username, setUsername] = useState("");
    const [roomId, setRoomId] = useState("");
    const isLoading = useAppSelector((state) => state.room.isLoading);
    const myWebcamStream = useAppSelector(
        (state) => state.webcam.myWebcamStream
    );

    const handlePublicRoomJoin = (e: React.FormEvent) => {
        e.preventDefault();
        const selectedCharacter = getSelectedCharacter();
        const roomToJoin = roomId.trim() || "public";

        bootstrap.network
            .joinCustomRoom(username, roomToJoin, null, selectedCharacter)
            .then(() => {
                bootstrap.launchGame();
            })
            .catch((err) => {
                console.error("Failed to join room", err);
                alert("Could not join room. Please try again.");
            });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="relative text-2xl text-center">
                    <ArrowLeft
                        className="cursor-pointer text-zinc-500 absolute left-0"
                        onClick={() => {
                            setShowCreateOrJoinCustomRoom(false);
                            setShowPublicRoom(false);
                            {
                                myWebcamStream &&
                                    store.dispatch(disconnectFromVideoCall());
                            }
                        }}
                    />
                    Join Room
                </CardTitle>
                <CardDescription className="text-center">
                    Enter a room ID to join, or leave empty for a public room
                </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4 items-center">
                {myWebcamStream && (
                    <Card className="flex items-center justify-center">
                        <CardContent>
                            <VideoPlayer
                                stream={myWebcamStream}
                                className="w-48"
                                muted
                            />
                        </CardContent>
                    </Card>
                )}
                <div>
                    <CharacterCarousel setApi={setCarouselApi} />
                    <form
                        className="grid gap-2"
                        onSubmit={handlePublicRoomJoin}
                    >
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            type="text"
                            required
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                            }}
                        />
                        <Label htmlFor="roomId">Room ID (optional)</Label>
                        <Input
                            id="roomId"
                            type="text"
                            placeholder="e.g., my-room-123"
                            value={roomId}
                            onChange={(e) => {
                                setRoomId(e.target.value);
                            }}
                        />
                        <Button
                            className="w-full cursor-pointer mt-2"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    Joining Room{" "}
                                    <LoaderIcon className="ml-2 h-4 w-4 animate-spin" />
                                </>
                            ) : (
                                "Join Room"
                            )}
                        </Button>
                    </form>
                    {!myWebcamStream ? (
                        <Button
                            className="w-full cursor-pointer mt-2"
                            variant="outline"
                            onClick={async () => {
                                await videoCalling.getUserMedia();
                            }}
                        >
                            Start Webcam
                        </Button>
                    ) : (
                        <div className="flex gap-3 items-center justify-center mt-2">
                            <WebcamButtons shouldShowDisconnectButton={false} />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default PublicRoom;
