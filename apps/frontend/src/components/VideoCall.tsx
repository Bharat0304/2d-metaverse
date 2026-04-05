import { useAppSelector } from "../store/hooks";
import { useState } from "react";

const VideoCall = () => {
    // Assuming you want to show Discord when the user is technically in a call
    const isDisconnectedFromVideoCalls = useAppSelector(
        (state) => state.webcam.isDisconnectedFromVideoCalls
    );

    // Replace this with your actual Discord Server ID that has widget enabled!
    const [discordServerId] = useState("123456789012345678");

    if (isDisconnectedFromVideoCalls) return null;

    return (
        <div className="absolute left-[35px] top-[10px] z-50 flex flex-col gap-2 pointer-events-auto">
            <div className="bg-[#313338] text-white p-3 rounded-lg shadow-2xl border border-[#1e1f22] w-[350px]">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold flex items-center gap-2">
                        {/* Discord Logo */}
                        <svg className="w-5 h-5 text-[#5865F2]" fill="currentColor" viewBox="0 0 127.14 96.36">
                            <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.33,46,96.22,53,91.08,65.69,84.69,65.69Z"/>
                        </svg>
                        Discord Voice & Video
                    </h3>
                </div>
                <p className="text-xs text-gray-300 mb-3 ml-[28px]">
                    Click a Voice Channel below to open Discord for high-quality audio and video connection.
                </p>
                <div className="bg-[#2b2d31] rounded-md overflow-hidden p-1">
                    <iframe 
                        src={`https://discord.com/widget?id=${discordServerId}&theme=dark`}
                        width="100%" 
                        height="380" 
                        allowTransparency={true} 
                        frameBorder="0" 
                        sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

export default VideoCall;
