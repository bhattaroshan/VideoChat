'use client'
import { useMediaStream } from '@/app/hooks/useMediaStream';
import { usePeer } from '@/app/hooks/usePeer';
import useSocket from '@/app/hooks/useSocket';
import { log } from 'console';
import { MediaConnection } from 'peerjs';
import { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import io from 'socket.io-client';
import {cloneDeep, update} from 'lodash';
import CustomPlayer from '@/app/components/CustomPlayer';
import { cn } from '@/app/utils';
import clsx from 'clsx';

const socket = io('wss://crosshimalaya.roshanbhatta.com.np');
// const socket = io('http://localhost:9001');


export default function CustomStream({params}:{params:{idx:string}}){
    const room_id = params.idx;

    const {peer,myId} = usePeer(onOpenCallback);
    const {stream} = useMediaStream();
    const [remoteStreams,setRemoteStreams] = useState<Record<string,any>>({});
    const streamLen = Object.keys(remoteStreams).length;
    console.log(streamLen);

    function updateStreams(client_id:string,currentStream:MediaStream){
        setRemoteStreams((prevStreams) => (
            {...prevStreams,[client_id]:{stream:currentStream}}
        ));
    }

    function deleteStream(client_id:string){
        setRemoteStreams((prevStreams) => {
            const updatedStreams = { ...prevStreams };
            delete updatedStreams[client_id];
            return updatedStreams;
        });
    }

    function onOpenCallback(id:string){
        console.log("MY ID ",id);
        if(socket){
            socket.emit('client:connect_request',room_id,myId)
        }
    }

    useEffect(() => {
        // Function to handle the beforeunload event
        const handleBeforeUnload = (event:any) => {
            socket.emit('client:disconnect', room_id, myId); // Send a disconnection message to the server
    
            if (peer) {
                peer.disconnect(); // Disconnect the peer
            }
            // event.preventDefault();
            // event.returnValue = ''; // This can trigger a confirmation prompt in some browsers
        };
    
        window.addEventListener('beforeunload', handleBeforeUnload);
    
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [socket, peer, myId]);


    useEffect(()=>{
        if(!stream || !myId) return;

        setRemoteStreams((prevStreams) => (
            {...prevStreams,[myId]:{stream:stream}}
        ));
    },[stream,myId])
    

    useEffect(()=>{
        if(!peer || !stream) return;
        peer.on('call', async (call:MediaConnection)=>{
            console.log("Got a call from ",call.peer);
            call.answer(stream);
            call.on('stream', function(otherStream) {
                updateStreams(call.peer,otherStream);
            })

            call.on('close',()=>{
                console.log("I sent close request to everybody");
                deleteStream(call.peer);
            })
        })

    },[peer,stream])

    useEffect(()=>{
        if(!socket || !stream || !peer) return;

        function handleDisconnect(client_id:string){
            deleteStream(client_id);
        }
        

        function handleConnect(client_id:string){
                const call = peer.call(client_id,stream);
                if(call){
                    call.on('stream',async function(otherStream:MediaStream){
                        console.log(remoteStreams);
                        updateStreams(client_id,otherStream);
                    })

                    call.on('close',()=>{
                        deleteStream(client_id);
                    })
                }
            }

        socket.on('client:connect', handleConnect);
        socket.on('client:disconnect', handleDisconnect);
        // socket.on('client:disconnect', handleDisconnect);

       return ()=>{
        socket.off('client:connect',handleConnect)
        socket.off('client:disconnect',handleDisconnect)
        // socket.off('client:disconnect',handleDisconnect)
       } 
    },[socket,stream,peer])

    return <div className={cn(`flex flex-wrap h-screen bg-gray-900 overflow-hidden w-screen min-h-screen gap-x-4 p-2 items-center justify-center`,{
    })}>
       
        {
            Object.keys.length>0&&
            (
                Object.keys(remoteStreams).map((v,i)=>{
                    const {stream:currentStream} = remoteStreams[v];
                    return <div key={i} className={cn({
                        'basis-full':streamLen===1,
                        'basis-5/12':streamLen===2,
                        'basis-1/3':streamLen>2 && streamLen<5,
                        'basis-1/4':streamLen>=5
                    })}>
                        <CustomPlayer muted={v===myId} stream={currentStream} className={cn('w-full h-full')}/>
                        </div>
                })

            )
           
        }
    </div>

}