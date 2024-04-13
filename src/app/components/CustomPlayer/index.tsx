'use client'
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

export default function CustomPlayer({stream,className,user, muted=true}:
                {stream:MediaStream,className?:string,user?:string,muted?:boolean}){
    
    const [isReady,setIsReady] = useState(false);
    const videoRef = useRef<HTMLVideoElement|null>(null);
    
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);
    
    function handleReady(){
        setIsReady(true);
    }

    return <video ref={videoRef} muted={muted} autoPlay className={twMerge('object-contain',className)} />
}


