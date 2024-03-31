'use client'
import { useEffect, useRef, useState } from "react"
// import Peer from "peerjs";
import {v4 as uuidv4} from 'uuid';

export default function CustomMedia(){
    // const [stream,setStream] = useState<MediaStream|null>(null);
    const meRef = useRef<HTMLVideoElement|null>(null);
    const remoteRef = useRef<HTMLVideoElement|null>(null);
    const textRef = useRef<HTMLInputElement>(null);
    // const [peerId, setPeerId] = useState('');
    const [myId,setMyId] = useState('');
    const peerInstance = useRef<any>(null);
    const [enableVideo,setEnableVideo] =useState(true);
    const [state,setState] = useState<MediaStream|null>(null);

    useEffect(()=>{
        
        let stream:MediaStream;

        async function connectPeer(){
            const peerJS = await import('peerjs');
            const peerConfig = {
                debug: 1,
                host: "crosshimalaya.roshanbhatta.com.np",
                port: 443,
                // port: 9000,
                path: "/myapp",
                secure: true,
                // key: "peerjs",
                // config: { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] }, // Replace with your own server URLs
            };

            const peer = new peerJS.default(peerConfig);
    
            peer.on('open', (id) => {
            //   setPeerId(id)
              console.log(id);
              setMyId(id);
            });
            
            peer.on('call', async (call) => {
                console.log("calling...")
                try{
                    stream = await navigator.mediaDevices.getUserMedia({ video: enableVideo, audio: true });
                    setState(stream);
                    if(meRef.current){
                        meRef.current.srcObject = stream;
                    }
                      call.answer(stream)
                      call.on('stream', function(remoteStream) {
                        if(remoteRef.current){
                            remoteRef.current.srcObject = remoteStream
                        }
                    });
                }catch(error){
                    console.log(error);
                }
               
              })
              peerInstance.current = peer;
        }
       
        connectPeer();

          return ()=>{
            if(stream){
                stream.getTracks().forEach(track=>track.stop());
            }
          }
        
    },[])

    const call = async (remotePeerId:string) => {
        let stream:MediaStream;
     
       try{
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if(meRef.current){
          meRef.current.srcObject = stream;
        }
    
        const call = peerInstance.current?.call(remotePeerId,stream);
        if(call){
            call.on('stream',async (remoteStream:any)=>{
                if(remoteRef.current){
                    remoteRef.current.srcObject = remoteStream;
                }
            })
        }
       } catch(error){
            console.log(error);
       }
  
        return ()=>{
            if(stream){
                stream.getTracks().forEach(track=>track.stop);
            }
        }
      }

      function handleConnect(){
        if(textRef.current){
            call(textRef.current.value);
        }
      }

      function handleVideo(){
        if(state){
            setEnableVideo(p=>!p);
            state.getVideoTracks()[0].enabled = enableVideo;
        }
      }

    return <div className='flex flex-col w-screen h-screen justify-center items-center gap-4'>
            <p>{myId}</p>
            <div className='flex flex-col gap-4'>
                <video ref={meRef} autoPlay muted={true} className='rounded-xl bg-blue-200 w-40 h-40 object-cover'/>
                <video ref={remoteRef} autoPlay className='rounded-xl bg-blue-200 w-40 h-40 object-cover' />
            </div>

            <div className='flex gap-4'>
                <input type='text' ref={textRef} className='border rounded'/>
                <button className='bg-blue-400 text-white p-2' onClick={handleConnect}>Connect</button>
                <button className='bg-blue-400 text-white p-2' onClick={handleVideo}>Toggle video</button>
            </div>
            
    </div>
}