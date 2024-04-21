'use client'
import useIsAudioActive from "@/app/hooks/useAudioActive";
import HandRaiseIcon from "@/app/icons/handraise";
import HandRaiseSolidIcon from "@/app/icons/handraisesolid";
import LoadIcon from "@/app/icons/load";
import SpeakerIcon from "@/app/icons/speaker";
import { cn } from "@/app/utils";
import { isEqual } from "lodash";
import React from "react";
import { useEffect, useRef, useState, memo } from "react";
import { twMerge } from "tailwind-merge";
function CustomPlayer({stream,className,id,muted=true,userFeature}:
                {stream:MediaStream,className?:string,muted?:boolean,id?:string,userFeature?:Record<string,any>}){
    
    const videoRef = useRef<HTMLVideoElement|null>(null);
    const [highlight,setHighlight] = useState(false);
    // const userTalking = useIsAudioActive({source:stream});
    const userTalking = false;
    const [startPlaying,setStartPlaying] = useState(false);
                    
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

    function handleVideoPlay(){
        console.log("video starting to play");
        setStartPlaying(true);
    }

    return <div className={cn('relative inline-flex')}>
        {
            // videoRef.current && videoRef.current?.clientWidth &&
            <video ref={videoRef} muted={muted} autoPlay playsInline={true} id={id} 
                        className={cn('object-contain cursor-pointer',className,{
                        'border-2 border-yellow-400':stream && highlight,
                        'border-2 border-gray-400':stream && !highlight,
                        // 'opacity-100 transition-opacity delay-200':startPlaying
                        // 'border-2 border-green-400': useIsAudioActive({source:stream})
                })} 
                    // onLoadedMetadata={handleVideoPlay}
                    // onPlaying={handleVideoPlay}
                    
                    onMouseOver={handleMouseOver} onMouseLeave={handleMouseLeave}/>

        }

     {
        userTalking&&
        <div className="absolute top-4 right-4">
            <SpeakerIcon className='w-6 h-6 text-white z-[1000]'/>
        </div>
     }
     {
        userFeature?.raise_hand && 
        <div className="absolute top-4 right-4">
            <HandRaiseSolidIcon className='text-yellow-400 w-8 h-8'/>
        </div> 
    }
     { 
        !stream &&
        <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000]'>
            <LoadIcon className='text-white w-10 h-10 animate-spin'/>
        </div>
    }
    
    </div>
    
}

export default (CustomPlayer);