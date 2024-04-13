import { useEffect, useState } from "react"


export const useMediaStream = ()=>{
    const [state,setState] = useState<MediaStream|null>(null);

    useEffect(()=>{
        let stream:MediaStream;
        (async function initMedia(){
            try{
                stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: true
                })
                setState(stream);
            }catch(error){
                console.log("Error in navigator");
            }
        })();
    return ()=>{
        if(stream){
            stream.getTracks().forEach(track=>track.stop());
        }
      }
    },[])

    return {
        stream:state
    }
}