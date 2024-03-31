'use client'
import { useEffect, useRef, useState } from "react"
import Peer from "peerjs";

const peer = new Peer();

export default function CustomMedia(){
    if(typeof window === undefined) return;
    // const [stream,setStream] = useState<MediaStream|null>(null);
    const meRef = useRef<HTMLVideoElement|null>(null);
    const remoteRef = useRef<HTMLVideoElement|null>(null);
    const textRef = useRef<HTMLInputElement>(null);
    const [peerId, setPeerId] = useState('');
    const peerInstance = useRef<Peer>(null);
    const [myId,setMyId] = useState('');

    useEffect(()=>{
        let stream:MediaStream;
        peer.on('open', (id) => {
          setPeerId(id)
          console.log(id);
          setMyId(id);
        });
        
        peer.on('call', async (call) => {
            console.log("calling...")
            try{
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true },);
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
    
    
        const call = peer.call(remotePeerId,stream);
        call.on('stream',async (remoteStream)=>{
            if(remoteRef.current){
                remoteRef.current.srcObject = remoteStream;
            }
        })
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

    return <div className='flex flex-col w-screen h-screen justify-center items-center gap-4'>
            <p>{myId}</p>
            <div className='flex flex-col gap-4'>
                <video ref={meRef} autoPlay className='rounded-xl bg-blue-200' />
                <video ref={remoteRef} autoPlay className='rounded-xl bg-blue-200' />
            </div>

            <div className='flex gap-4'>
                <input type='text' ref={textRef} className='border rounded'/>
                <button className='bg-blue-400 text-white p-2' onClick={handleConnect}>Connect</button>
            </div>
            
    </div>
}