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

const socket = io('wss://crosshimalaya.roshanbhatta.com.np');
// const socket = io('http://localhost:9001');


export default function CustomStream({params}:{params:{idx:string}}){
    const room_id = params.idx;

    const {peer,myId} = usePeer(onOpenCallback);
    const {stream} = useMediaStream();
    const [remoteStreams,setRemoteStreams] = useState<Record<string,any>>({});
    const streamLen = Object.keys(remoteStreams).length;

    const [highlightedKey, setHighlightedKey] = useState(myId);


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
        

    // useEffect(() => {
    //     // Function to handle the beforeunload event
    //     const handleBeforeUnload = (event:any) => {
    //         socket.emit('client:disconnect', room_id, myId); // Send a disconnection message to the server
    
    //         if (peer) {
    //             peer.disconnect(); // Disconnect the peer
    //         }
    //         // event.preventDefault();
    //         // event.returnValue = ''; // This can trigger a confirmation prompt in some browsers
    //     };
    
    //     window.addEventListener('beforeunload', handleBeforeUnload);
    
    //     return () => {
    //         window.removeEventListener('beforeunload', handleBeforeUnload);
    //     };
    // }, [socket, peer, myId]);


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
                console.log("I am going in here okay")
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

        function handleDisconnect(client_id:any){
            deleteStream(client_id);
            if(!remoteStreams[highlightedKey]){
                setHighlightedKey(myId);
            }
        }
        

        function handleConnect(client_id:any){
                const call = peer.call(client_id,stream,{
                    metadata:{
                        "deviceType": /Mobi/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
                    }
                });
                if(call){
                    call.on('stream',function(otherStream:MediaStream){
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

    function handleVideoClick(key:any){
        // setHighlightedPlayer(key);
        console.log('hello there')
        setHighlightedKey(key);
    }

    return <div className={cn(`flex flex-col items-center justify-center bg-gray-900 h-screen overflow-hidden gap-2`,{
    })}>
        <div className='flex gap-2'>
        {
            remoteStreams && 
            Object.keys(remoteStreams).filter((key)=>key!=highlightedKey).map((v,i)=>{
                return <div key={i} onClick={()=>handleVideoClick(v)}>
                            <CustomPlayer key={i} muted={v===myId} stream={remoteStreams[v].stream} className='h-44 rounded-lg' />
                        </div>
            })
        }
        </div>
        {
            remoteStreams[highlightedKey] &&
                <CustomPlayer muted={highlightedKey===myId} stream={remoteStreams[highlightedKey].stream} className='rounded-lg h-[90%]'/>
        }
      
    </div>

}