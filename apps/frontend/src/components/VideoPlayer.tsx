import { useEffect, useRef } from "react";

interface VideoPlayerProps extends Omit<React.VideoHTMLAttributes<HTMLVideoElement>, "src" | "srcObject"> {
    stream: MediaProvider;
    className?: string;
}

export function VideoPlayer({
    stream,
    className,
    ...props
}: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
        }
    }, [stream]);

    return (
        <video
            ref={videoRef}
            autoPlay
            playsInline
            className={`rounded-lg ${className && className}`}
            {...(props as any)}
        />
    );
};
