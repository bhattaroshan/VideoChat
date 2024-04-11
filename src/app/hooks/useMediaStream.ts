import { useEffect, useState } from "react"


export const useMediaStream = ()=>{
    const [state,setState] = useState<MediaStream|null>(null);

    useEffect(()=>{
        if(typeof window !== 'undefined'){

        (async function initMedia(){
            try{
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: true
                })
                setState(stream);
            }catch(error){
                console.log("Error in navigator");
            }
        })();
    }
    },[])

    return {
        stream:state
    }
}