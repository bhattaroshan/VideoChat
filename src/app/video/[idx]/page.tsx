'use client'
import { useMediaStream } from '@/app/hooks/useMediaStream';
import { usePeer } from '@/app/hooks/usePeer';
import useSocket from '@/app/hooks/useSocket';
import { log } from 'console';
import { MediaConnection } from 'peerjs';
import { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import io from 'socket.io-client';
import {v4 as uuidv4} from 'uuid'

const socket = io('wss://crosshimalaya.roshanbhatta.com.np');
// const socket = io('http://localhost:9001');

// const socket = io('http://localhost:9001');

export default function CustomStream({params}:{params:{idx:string}}){
    const room_id = params.idx;

    const client_id = uuidv4().slice(-12);
    const {peer} = usePeer(client_id,onOpenCallback);
    const {stream} = useMediaStream();
    const [remoteStreams,setRemoteStreams] = useState<Record<string,MediaStream>>({});

    function onOpenCallback(id:string){
        console.log("hey my id is ",id);

        if(socket){
            console.log("I did come up here dude")
            socket.emit('client:connect_request',room_id,client_id)
            console.log("I got an id ",id);
        }
    }

    useEffect(()=>{
        if(!peer || !stream) return;
        peer.on('call', async (call:MediaConnection)=>{
            console.log("i got a call");
            console.log("Answering the call with the stream.");
            call.answer(stream);
            call.on('stream', function(otherStream) {
            console.log("streaming my video to other");
            setRemoteStreams((prevStreams) => {
                console.log("the previous streams are ",prevStreams);
                const updatedStreams = {...prevStreams,[call.peer]:otherStream}
                console.log("The updated streams are ", updatedStreams);
                return updatedStreams;
                });
            })
        })

    },[peer,stream])

    useEffect(()=>{
        if(!socket || !stream || !peer) return;

        function handleConnect(client_id:string){
            // socket.on('client:connect', (client_id) => {
                console.log("I got a request to connect")
                const call = peer.call(client_id,stream);
                if(call){
                    
                    call.on('stream',async function(otherStream:MediaStream){
                        if(otherStream){

                        console.log('call is not null',otherStream,Math.random());
                       
                        console.log('call is not null',otherStream,Math.random()); 
                        setRemoteStreams((prevStreams) => {
                            console.log("the previous streams are ",prevStreams);
                            const updatedStreams = {...prevStreams,[client_id]:otherStream}
                            console.log("The updated streams are ", updatedStreams);
                            return updatedStreams;
                        });
                        console.log("the streams are ",remoteStreams)
                        }
                    })
                }
            //   });
            }

        socket.on('client:connect', handleConnect);

       return ()=>{
        socket.off('client:connect',handleConnect)
       } 
    },[socket,stream,peer])

    function handleMsg(){
        socket.emit('client',{client:'hello my client id is 23456'});
    }

    return <div className='flex flex-col'>

        <button onClick={handleMsg}>Send</button>
        {
            stream&&
            <ReactPlayer url={stream} playing muted className='border-2 border-red-400 [&>video]:object-cover' width={'20%'} height={'20%'}/>
        }
        <div className='flex gap-4'>

        {
            Object.keys(remoteStreams).length>0 &&
            Object.values((remoteStreams)).map((v,i)=>{
                return <ReactPlayer key={i} url={v} playing className='border-2 border-red-400 [&>video]:object-cover' width={'20%'} height={'20%'}/>
            })
        }
        </div>
    </div>
}