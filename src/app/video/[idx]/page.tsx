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
import HangUpIcon from '@/app/icons/hangup';
import { useRouter } from 'next/navigation';

const socket = io('wss://crosshimalaya.roshanbhatta.com.np');
// const socket = io('http://localhost:9001');


export default function CustomStream({params}:{params:{idx:string}}){
    const router = useRouter();
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
    }

    useEffect(()=>{
        if(!socket) return;
        socket.emit("client:count",room_id);

    },[socket])

    useEffect(()=>{
        if(!stream || !myId) return;

        setRemoteStreams((prevStreams) => (
            {...prevStreams,[myId]:{stream:stream,muted:true}}
        ));

        // setRemoteStreams((prevStreams) => (
        //             {...prevStreams,['123']:{stream:stream,muted:true}}
        //         ));
        // setRemoteStreams((prevStreams) => (
        //             {...prevStreams,['234']:{stream:stream,muted:true}}
        //         ));
        // setRemoteStreams((prevStreams) => (
        //             {...prevStreams,['345']:{stream:stream,muted:true}}
        //         ));
        // setRemoteStreams((prevStreams) => (
        //             {...prevStreams,['456']:{stream:stream,muted:true}}
        //         ));
        // setRemoteStreams((prevStreams) => (
        //             {...prevStreams,['567']:{stream:stream,muted:true}}
        //         ));
        // setRemoteStreams((prevStreams) => (
        //             {...prevStreams,['678']:{stream:stream,muted:true}}
        //         ));
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
        
        function handleClientCount(curr_room_id:any,counts:any){
            console.log("I got a count request ",counts);
            if(curr_room_id===room_id){
                setConnectedClients(counts);
            }
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

    function handleEndCall(){
        if (peer) {
            // Close all active connections
            // peer.connections.forEach((connection: any) => {
                // connection.close();
            // });
            peer.disconnect();
            peer.destroy();
            router.push('/');
        }
    }

    return <div className='bg-gray-900 '>
        {
        remoteStreams[highlightedKey] && streamingReady &&
        <div className='relative h-screen w-screen items-center justify-center flex overflow-hidden'>
            <div className={cn(`flex flex-col sm:flex-row bg-gray-800 p-2 rounded-lg h-[100%] sm:h-[40%] md:h-[50%] lg:h-[70%]`,{
                'gap-2':Object.keys(remoteStreams).length>1
            })}>

                <CustomPlayer muted={remoteStreams[highlightedKey].muted} stream={remoteStreams[highlightedKey].stream} 
                        className="rounded-lg"/>

                <div className='flex flex-col gap-2 items-start overflow-y-auto'>
                    {
                        remoteStreams && 
                        Object.keys(remoteStreams).filter((key)=>key!=highlightedKey).map((v,i)=>{
                            return <div key={i} onClick={()=>handleVideoClick(v)}>
                                        <CustomPlayer key={i} muted={remoteStreams[v].muted} stream={remoteStreams[v].stream} 
                                            className='rounded-lg min-w-[10.64rem] max-h-[8rem] lg:min-w-[13.3rem] lg:max-h-[10rem]' />
                                    </div>
                        })
                    }
                </div>
                
                
            </div>
            <div className='absolute bottom-8 left-1/2 -translate-x-1/2 w-fit h-fit p-4 
                rounded-full border bg-red-400 border-red-500 cursor-pointer
                hover:bg-red-300 active:bg-red-500 group' onClick={handleEndCall}>
                <HangUpIcon className='bottom-4 w-4 h-4 text-blue-100 group-hover:text-white'/>
            </div>
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