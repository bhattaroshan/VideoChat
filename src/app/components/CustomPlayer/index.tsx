'use client'
import { cn } from "@/app/utils";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

export default function CustomPlayer({stream,className,user, muted=true}:
                {stream:MediaStream,className?:string,user?:string,muted?:boolean}){
    
    const videoRef = useRef<HTMLVideoElement|null>(null);
    const [highlight,setHighlight] = useState(false);
    
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);
    
    function handleMouseOver(){
        setHighlight(true);
    }

    function handleMouseLeave(){
        setHighlight(false);
    }

    return <video ref={videoRef} muted={muted} autoPlay playsInline={true} className={cn('object-contain cursor-pointer',className,{
        'border-2 border-yellow-400':highlight,
        // 'border-2 border-gray-400 box-border':!highlight,
    })} 
        onMouseOver={handleMouseOver} onMouseLeave={handleMouseLeave}/>
}


