import { useEffect, useState } from "react"


export const useMediaStream = ()=>{
    const [state,setState] = useState<MediaStream|null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(()=>{
        let stream:MediaStream;
        (async function initMedia(){
            try{
                stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: {
                        // Use constraints that are suitable for mobile devices
                        width: { ideal: 640 },
                        height: { ideal: 480 }
                    }
                    // video: true
                })
                setState(stream);
            }catch(error){
                console.log("Error in navigator");
            }
        })();
        setIsLoading(false);
    return ()=>{
        if(stream){
            stream.getTracks().forEach(track=>track.stop());
        }
      }
    },[])

    return {
        stream:state,
        isLoading: isLoading
    }
}