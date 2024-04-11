'use client'
import { useMediaStream } from '@/app/hooks/useMediaStream';
import { usePeer } from '@/app/hooks/usePeer';
import useSocket from '@/app/hooks/useSocket';
import { MediaConnection } from 'peerjs';
import { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import io from 'socket.io-client';
import {v4 as uuidv4} from 'uuid'

const socket = io('wss://crosshimalaya.roshanbhatta.com.np');
// const socket = io('http://localhost:9001');

// const socket = io('http://localhost:9001');

export default function CustomStream({params}:{params:{idx:string}}){
    const video_id = params.idx;

    const client_id = uuidv4().slice(-12);
    const {peer,peerInstance} = usePeer(client_id,onOpenCallback);
    const {stream} = useMediaStream();
    const [remoteStream,setRemoteStream] = useState<MediaStream|null>(null);
    const [myCall, setMyCall] = useState<MediaConnection|null>(null);

    function onOpenCallback(id:string){
        console.log("hey my id is ",id);

        if(socket){
            console.log("I did come up here dude")
            socket.emit('client:connect',{
                video_id: video_id,
                client_id: id
            })
            console.log("I got an id ",id);
        }
    }

    useEffect(()=>{
        if(!peer || !stream) return;
        peer.on('call', async (call:MediaConnection)=>{
            console.log("i got a call");
            console.log("Answering the call with the stream.");
            call.answer(stream);
            call.on('stream', function(remoteStream) {
            console.log("streaming my video to other");
            setRemoteStream(remoteStream);
            })
        })

    },[peer,stream])

    useEffect(()=>{
        if(!socket || !stream || !peer) return;
            socket.on('host:connect', (msg:any) => {
                const call = peer.call(msg.host_id,stream);
                if(call){
                    call.on('stream',function(otherStream:MediaStream){
                        console.log("Starting streaming now")
                        setRemoteStream(otherStream);
                    })
                }
              });
        
    },[socket,stream,peer])

    function handleMsg(){
        socket.emit('client',{client:'hello my client id is 23456'});
    }

    return <div className='flex '>

        <button onClick={handleMsg}>Send</button>
        {
            stream&&
            <ReactPlayer url={stream} playing muted className='border-2 border-red-400 [&>video]:object-cover' width={'20%'} height={'20%'}/>
        }
        {
            remoteStream&&
            <ReactPlayer url={remoteStream} playing className='border-2 border-red-400 [&>video]:object-cover' width={'20%'} height={'20%'}/>
        }
    </div>
}