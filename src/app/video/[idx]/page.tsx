'use client'
import { useMediaStream } from '@/app/hooks/useMediaStream';
import { usePeer } from '@/app/hooks/usePeer';
import useSocket from '@/app/hooks/useSocket';
import { log } from 'console';
import { AnswerOption, MediaConnection } from 'peerjs';
import { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import io from 'socket.io-client';
import {cloneDeep, update} from 'lodash';
import CustomPlayer from '@/app/components/CustomPlayer';
import { cn } from '@/app/utils';
import clsx from 'clsx';

// const socket = io('wss://crosshimalaya.roshanbhatta.com.np');
const socket = io('http://localhost:9001');


export default function CustomStream({params}:{params:{idx:string}}){
    const room_id = params.idx;

    const {peer,myId} = usePeer(onOpenCallback);
    const {stream} = useMediaStream();
    const [remoteStreams,setRemoteStreams] = useState<Record<string,any>>({});
    const streamLen = Object.keys(remoteStreams).length;
    console.log(streamLen);

    function updateStreams(client_id:string,currentStream:MediaStream,deviceType='unknown'){
        setRemoteStreams((prevStreams) => (
            {...prevStreams,[client_id]:{stream:currentStream,deviceType:deviceType}}
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

        // Check the resolution and aspect ratio
        

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
            call.answer(stream,);
            
            call.on('stream', function(otherStream) {
                // console.log("MY METADATA", call.metadata.deviceType);
                updateStreams(call.peer,otherStream,call.metadata.deviceType);
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
                const call = peer.call(client_id,stream,{
                    metadata:{
                        "deviceType": /Mobi/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
                    }
                });
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

    return <div className={cn(`flex flex-wrap h-screen bg-gray-900 overflow-hidden w-screen min-h-screen gap-x-4 items-center justify-center`,{
    })}>
       
        {
            Object.keys.length>0&&
            (
                Object.keys(remoteStreams).map((v,i)=>{
                    const {stream:currentStream,deviceType} = remoteStreams[v];
                    return <div key={i} className={cn('flex items-center justify-center rounded-lg overflow-hidden h-fit',{
                        'basis-5/12':streamLen===2,
                        'basis-5/6 md:basis-4/6':streamLen===1 || (streamLen===2 && v!=myId),
                        'basis-5/12 absolute top-4 right-4 h-1/6 border rounded-xl overflow-hidden': streamLen===2 && v===myId,
                        'basis-1/3':streamLen>2 && streamLen<5,
                        'basis-1/4':streamLen>=5
                    })}>
                        <CustomPlayer muted={v===myId} stream={currentStream} className={cn('w-full h-full',{
                            // 'h-[90%] w-full': deviceType!=='mobile',
                            // 'h-full w-auto': deviceType==='mobile',
                            // 'w-auto h-full':isMobileResolution(currentStream,v),
                            // 'w-full h-auto':!isMobileResolution(currentStream,v)
                        })}/>
                        </div>
                })

            )
           
        }
    </div>

}