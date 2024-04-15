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
import MeetingEntry from '@/app/components/MeetingEntry';

const socket = io('wss://crosshimalaya.roshanbhatta.com.np');
// const socket = io('http://localhost:9001');


export default function CustomStream({params}:{params:{idx:string}}){
    const room_id = params.idx;

    const {peer,myId} = usePeer(onOpenCallback);
    const {stream} = useMediaStream();
    const [remoteStreams,setRemoteStreams] = useState<Record<string,any>>({});
    const [streamingReady,setStreamingReady] = useState(false);
    const [connectedClients,setConnectedClients] = useState(0);

    // const streamLen = Object.keys(remoteStreams).length;

    const [highlightedKey, setHighlightedKey] = useState(myId);


    function updateStreams(client_id:string,currentStream:MediaStream,muted:boolean){
        setRemoteStreams((prevStreams) => (
            {...prevStreams,[client_id]:{stream:currentStream,muted:muted}}
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
            socket.emit("client:count",room_id);
        }
    }


    useEffect(()=>{
        if(!stream || !myId) return;

        setRemoteStreams((prevStreams) => (
            {...prevStreams,[myId]:{stream:stream,muted:true}}
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
                updateStreams(call.peer,otherStream,false);
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
                    // metadata:{
                    //     "deviceType": /Mobi/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
                    // }
                });
                if(call){
                    call.on('stream',function(otherStream:MediaStream){
                        console.log(remoteStreams);
                        updateStreams(client_id,otherStream,false);
                    })

                    call.on('close',()=>{
                        deleteStream(client_id);
                    })
                }
            }
        
        function handleClientCount(counts:any){
            console.log("I got a count request ",counts);
            setConnectedClients(counts);
        }

        socket.on('client:connect', handleConnect);
        socket.on('client:disconnect', handleDisconnect);
        socket.on('client:count',handleClientCount);
        // socket.on('client:disconnect', handleDisconnect);

       return ()=>{
        socket.off('client:connect',handleConnect)
        socket.off('client:disconnect',handleDisconnect)
        socket.off('client:count',handleClientCount)
        // socket.off('client:disconnect',handleDisconnect)
       } 
    },[socket,stream,peer])

    function handleVideoClick(key:any){
        // setHighlightedPlayer(key);
        console.log('hello there')
        setHighlightedKey(key);
    }

    function handleJoinVideo(){
        setStreamingReady(true);
        if(socket){
            socket.emit('client:connect_request',room_id,myId);
        }
    }

    return <div className='bg-gray-900'>
        {
        remoteStreams[highlightedKey] && streamingReady &&
            <div className={cn(`flex flex-col items-center justify-center h-screen overflow-hidden gap-2`)}>
                <div className='flex gap-2'>
                    {
                        remoteStreams && 
                        Object.keys(remoteStreams).filter((key)=>key!=highlightedKey).map((v,i)=>{
                            return <div key={i} onClick={()=>handleVideoClick(v)}>
                                        <CustomPlayer key={i} muted={remoteStreams[v].muted} stream={remoteStreams[v].stream} className='h-40 rounded-lg' />
                                    </div>
                        })
                    }
                </div>
                
                <CustomPlayer muted={remoteStreams[highlightedKey].muted} stream={remoteStreams[highlightedKey].stream} 
                        className={cn('rounded-lg h-[70%]')}/>
            </div>
        }

        { //meeting entry room
            !streamingReady &&
            (
                <MeetingEntry connectedClients={connectedClients} onClick={handleJoinVideo} 
                    stream={remoteStreams[highlightedKey]?.stream} muted={true}/>
            )
        }
    
    </div>

}