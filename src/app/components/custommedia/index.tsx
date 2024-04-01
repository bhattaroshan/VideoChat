'use client'
import CameraIcon from "@/icons/camera";
import MicIcon from "@/icons/mic";
import NoCameraIcon from "@/icons/nocamera";
import NoMicIcon from "@/icons/nomic";
import { useEffect, useRef, useState } from "react"
// import Peer from "peerjs";
import {v4 as uuidv4} from 'uuid';

export default function CustomMedia(){
    // const [stream,setStream] = useState<MediaStream|null>(null);
    const meRef = useRef<HTMLVideoElement|null>(null);
    const remoteRef = useRef<HTMLVideoElement|null>(null);
    const textRef = useRef<HTMLInputElement>(null);
    const [myId,setMyId] = useState('');
    const peerInstance = useRef<any>(null);

    const [state,setState] = useState<MediaStream|null>(null);
    const [remoteState,setRemoteState] = useState<MediaStream|null>(null);

    const [cameraOn,setCameraOn] = useState(true);
    const [micOn,setMicOn] = useState(true);
    

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
                    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
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
        
        setRemoteState(stream);
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
            //state.getVideoTracks()[0].enabled = enableVideo;
        }
      }

    function handleCameraClick(){
        if(state){
            state.getVideoTracks()[0].enabled = !cameraOn;
            setCameraOn(p=>!p);
        }

        if(remoteState){
            remoteState.getVideoTracks()[0].enabled = !cameraOn;
            setCameraOn(p=>!p);
        }
    }

    function handleMicClick(){
        if(state){
            state.getAudioTracks()[0].enabled = !micOn;
            setMicOn(p=>!p);
        }

        if(remoteState){
            remoteState.getAudioTracks()[0].enabled = !micOn;
            setMicOn(p=>!p);
        }
    }

    return <div className='flex flex-col gap-4 items-center w-screen h-screen'>
        <div className='relative flex flex-col w-screen h-max-10/12 gap-4 items-center bg-black'>
            <video ref={meRef} autoPlay muted={Boolean(state)} className='absolute left-4 top-4 rounded-xl bg-blue-200 w-1/5 h-1/3 min-w-24 min-h-28  md:min-w-44 md:min-h-48 object-cover z-[1000]'/>
            <video ref={remoteRef} autoPlay muted={Boolean(remoteState)} className='relative bg-gray-400 w-screen md:w-8/12 h-auto max-h-screen object-cover' />
            
            <div className='absolute flex gap-4 left-1/2 bottom-6 -translate-x-1/2 '>
                {
                    cameraOn?
                <div className='w-fit h-fit p-4 
                                rounded-full border bg-blue-400 border-blue-500 cursor-pointer
                                hover:bg-blue-300 group' onClick={handleCameraClick}>
                    <CameraIcon className='bottom-4 w-8 h-8 text-blue-100 group-hover:text-white'/>
                </div>:
                <div className='w-fit h-fit p-4 
                                rounded-full border bg-blue-400 border-blue-500 cursor-pointer
                                hover:bg-blue-300 group' onClick={handleCameraClick}>
                    <NoCameraIcon className='bottom-4 w-8 h-8 text-blue-100 group-hover:text-white'/>
                </div>
                }
                {
                    micOn?
                <div className='w-fit h-fit p-4 
                                rounded-full border bg-blue-400 border-blue-500 cursor-pointer
                                hover:bg-blue-300 group' onClick={handleMicClick}>
                    <MicIcon className='bottom-4 w-8 h-8 text-blue-100 group-hover:text-white'/>
                </div>:
                <div className='w-fit h-fit p-4 
                                rounded-full border bg-blue-400 border-blue-500 cursor-pointer
                                hover:bg-blue-300 group' onClick={handleMicClick}>
                    <NoMicIcon className='bottom-4 w-8 h-8 text-blue-100 group-hover:text-white'/>
                </div>
                }
            </div>
        </div>
            
            <div className='flex gap-4 w-screen md:w-6/12'>
                <input type='text' ref={textRef} className='border rounded'/>
                <button className='bg-blue-400 text-white p-2' onClick={handleConnect}>Connect</button>
            </div>
    </div>
}