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
import {cloneDeep} from 'lodash';

// const socket = io('wss://crosshimalaya.roshanbhatta.com.np');
const socket = io('http://localhost:9001');


export default function CustomStream({params}:{params:{idx:string}}){
    const room_id = params.idx;

    const client_id = uuidv4().slice(-12);
    const {peer} = usePeer(client_id,onOpenCallback);
    const {stream} = useMediaStream();
    const [remoteStreams,setRemoteStreams] = useState<Record<string,any>>({});

    function onOpenCallback(id:string){
        console.log("MY ID ",id);
        if(socket){
            socket.emit('client:connect_request',room_id,client_id)
        }
    }

    useEffect(()=>{
        if(!peer || !stream) return;
        peer.on('call', async (call:MediaConnection)=>{
            console.log("Got a call from ",call.peer);
            call.answer(stream);
            call.on('stream', function(otherStream) {
                setRemoteStreams((prevStreams) => (
                        {...prevStreams,[call.peer]:{stream:otherStream}}
                    ));
                })

            call.on('close',()=>{
                console.log("I sent close request to everybody");
                setRemoteStreams((prevStreams) => {
                    console.log(prevStreams);
                    const updatedStreams = { ...prevStreams };
                    delete updatedStreams[call.peer];
                    return updatedStreams;
                });
            })
        })

    },[peer,stream])

    useEffect(()=>{
        if(!socket || !stream || !peer) return;

        // function handleDisconnect(client_id:string){
            // console.log("Yes the disconnection is triggered");
                // setRemoteStreams((prevStreams) => {
                //     console.log(prevStreams);
                //     const updatedStreams = { ...prevStreams };
                //     delete updatedStreams[client_id];
                //     return updatedStreams;
                // });
                // const playersCopy = cloneDeep(remoteStreams);
                // delete playersCopy[client_id];
                // setRemoteStreams(playersCopy);

               
        // }

        function handleConnect(client_id:string){
                const call = peer.call(client_id,stream);
                if(call){
                    call.on('stream',async function(otherStream:MediaStream){
                        console.log(remoteStreams);
                        setRemoteStreams((prevStreams) => (
                            {...prevStreams,[client_id]:{stream:otherStream}}
                        ));
                    })

                    call.on('close',()=>{
                        setRemoteStreams((prevStreams) => {
                            const updatedStreams = { ...prevStreams };
                            delete updatedStreams[call.peer];
                            return updatedStreams;
                        });
                    })
                }
            }

        socket.on('client:connect', handleConnect);
        // socket.on('client:disconnect', handleDisconnect);

       return ()=>{
        socket.off('client:connect',handleConnect)
        // socket.off('client:disconnect',handleDisconnect)
       } 
    },[socket,stream,peer])

    return <div className='flex bg-gray-900 min-h-screen items-center '>
        {
            stream&&
            <div className='flex w-screen h-screen'>
                <ReactPlayer url={stream} playing muted className='[&>video]:object-contain [&>video]:max-h-screen' 
                    width={`${Object.keys(remoteStreams).length>0?'20%':'100%'}`}  
                    height={`${Object.keys(remoteStreams).length>0?'20%':'100%'}`}>
               
                    </ReactPlayer>
                <div className='border border-gray-400 rounded-md z-[1000]'>
                    <p className='text-white z-[1000]'>Hello</p>
                </div>
            </div>
        }

        {
            Object.keys(remoteStreams).map((v)=>{
                const {stream:currentStream} = remoteStreams[v];
                return <ReactPlayer key={v} url={currentStream} playing className='border-2 border-red-400 [&>video]:object-cover' width={'20%'} height={'20%'}/>
            })
            // Object.values((remoteStreams)).map((v,i)=>{
            //     return <ReactPlayer key={i} url={v} playing className='border-2 border-red-400 [&>video]:object-cover' width={'20%'} height={'20%'}/>
            // })
        }
    </div>
}