'use client'
import { useMediaStream } from "@/app/hooks/useMediaStream";
import ReactPlayer from "react-player";


export default function VideoTest(){
    const {stream} = useMediaStream();
    
    return <div className='w-screen h-screen'>
        {
            stream&&
                <ReactPlayer url={stream} playing muted className='border-2 border-red-400'/>
        }
    </div>
}