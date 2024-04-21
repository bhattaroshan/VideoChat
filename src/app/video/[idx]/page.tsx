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
import CameraIcon from '@/app/icons/camera';
import MicIcon from '@/app/icons/mic';
import NoMicIcon from '@/app/icons/nomic';
import HandRaiseIcon from '@/app/icons/handraise';
import HandRaiseSolidIcon from '@/app/icons/handraisesolid';

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
    const [muteMyMic,setMuteMyMic] = useState(false);
    const [raiseHand,setRaiseHand] = useState(false);
    const [userFeatures,setUserFeature] = useState<Record<string,any>>({});
    // const streamLen = Object.keys(remoteStreams).length;

    const [highlightedKey, setHighlightedKey] = useState(myId);

    
    function updateStreams(client_id:string,streamData:any){
        setRemoteStreams((prevStreams) => (
            {...prevStreams,[client_id]:streamData}
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
        if(Object.keys(remoteStreams).length===1){ //
            setHighlightedKey(myId);
        }
        else if(Object.keys(remoteStreams).filter((key)=>key!=myId).length>=1){ //more then me available
            if(remoteStreams[highlightedKey] && highlightedKey!=myId) return; //this client still exists, do nothing
            const keys = Object.keys(remoteStreams).filter((key)=>key!=myId);
            if(keys.length>=1){
                setHighlightedKey(keys[0]);
            }
        }
    },[remoteStreams])

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
            call.answer(stream);
            call.on('stream', function(otherStream) {
                updateStreams(call.peer,{stream:otherStream,muted:false});
            })

            call.on('close',()=>{
                deleteStream(call.peer);
            })
        })

    },[peer,stream])

    useEffect(()=>{
        if(!socket || !stream || !peer) return;

        function handleDisconnect(client_id:any){
            deleteStream(client_id);
            // if(!remoteStreams[highlightedKey]){
            //     setHighlightedKey(myId);
            // }
        }
        

        function handleConnect(client_id:any){
                const call = peer.call(client_id,stream,{
                    // metadata:{
                    //     "deviceType": /Mobi/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
                    // }
                });
                if(call){
                    call.on('stream',function(otherStream:MediaStream){
                        updateStreams(client_id,{stream:otherStream,muted:false});
                    })

                    call.on('close',()=>{
                        deleteStream(client_id);
                    })
                    // console.log(Object.keys(remoteStreams).length," is my length")
                    // if(Object.keys(remoteStreams).length<=1){
                    //     setHighlightedKey(client_id);
                    // }
                }
            }
        
        function handleClientCount(curr_room_id:any,counts:any){
            if(curr_room_id===room_id){
                setConnectedClients(counts);
            }
        }

        function handleSocketHandRaise(client_id:any,state:any){
            setUserFeature((prevStreams)=>{
                const currentStreams = {
                    ...prevStreams,
                    [client_id]: {
                        ...prevStreams.client_id,
                        raise_hand: state
                    }
                };
                return currentStreams;
            })
            
        }

        socket.on('client:connect', handleConnect);
        socket.on('client:disconnect', handleDisconnect);
        socket.on('client:count',handleClientCount);
        socket.on('client:raise_hand',handleSocketHandRaise);
        // socket.on('client:disconnect', handleDisconnect);

       return ()=>{
        socket.off('client:connect',handleConnect)
        socket.off('client:disconnect',handleDisconnect)
        socket.off('client:count',handleClientCount)
        socket.off('client:raise_hand',handleSocketHandRaise);
        // socket.off('client:disconnect',handleDisconnect)
       } 
    },[socket,stream,peer])

    function handleVideoClick(key:any){
        // setHighlightedPlayer(key);
        setHighlightedKey(key);
    }

    function handleJoinVideo(){
        setStreamingReady(true);
        if(socket){
            socket.emit('client:connect_request',room_id,myId);
        }
    }
    
    function handleHandRaise(){
        if(socket){
            socket.emit('client:raise_hand',!userFeatures[myId]?.raise_hand);
            setUserFeature((prevStreams)=>{
                const currentStreams = {
                    ...prevStreams,
                    [myId]: {
                        ...prevStreams.my_id,
                        raise_hand: !prevStreams[myId]?.raise_hand
                    }
                };
                return currentStreams;
            }) 
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

     // Function to toggle your microphone
     function handleMicMute() {
        // Use a functional update to modify remoteStreams
        setRemoteStreams((prevStreams) => {
            // Create a copy of the current state
            const updatedStreams = { ...prevStreams };

            // Check if your stream exists in the state object
            if (updatedStreams[myId]) {
                // Get the audio track from the stream
                const audioTrack = updatedStreams[myId].stream.getAudioTracks()[0];
                
                // Toggle the enabled property of the audio track
                audioTrack.enabled = muteMyMic;
                setMuteMyMic(p=>!p);

                // Update the stream object in the state
                updatedStreams[myId] = {
                    ...updatedStreams[myId], // Retain other properties
                    stream: updatedStreams[myId].stream,
                };
            }
            // Return the updated state
            return updatedStreams;
        });
    }
    // function handleMicMute(){
    //     // updateStreams(myId,{stream:remoteStreams[myId].stream,muted:!remoteStreams[myId].muted});
    //     if(remoteStreams[myId].stream){
    //         remoteStreams[myId].stream.getAudioTracks()[0].enabled = !muteMyMic;
    //         setMuteMyMic(p=>!p);
    //     }
    // }

    return <div className='bg-gray-900 '>
    {
    remoteStreams[highlightedKey] && streamingReady &&
    <div className='relative h-screen w-screen items-center justify-center flex overflow-hidden'>
        <div className={cn(`flex flex-col sm:flex-row bg-gray-800 p-2 rounded-lg h-[100%] sm:h-[40%] md:h-[50%] lg:h-[75%]`,{
            'gap-2':Object.keys(remoteStreams).length>1
        })}>

            <CustomPlayer muted={remoteStreams[highlightedKey].muted} stream={remoteStreams[highlightedKey].stream} userFeature={userFeatures[highlightedKey]}
                    className="rounded-lg md:min-w-[520px] lg:min-w-[790px]"/>

            <div className='flex flex-col gap-2 items-start overflow-y-auto'>
                {
                    remoteStreams && 
                    Object.keys(remoteStreams).filter((key)=>key!=highlightedKey).map((v,i)=>{
                        return <div key={i} onClick={()=>handleVideoClick(v)}>
                                    <CustomPlayer key={i} muted={remoteStreams[v].muted} stream={remoteStreams[v].stream} userFeature={userFeatures[v]}
                                        className='rounded-lg min-w-[10.64rem] max-h-[8rem] lg:min-w-[13.3rem] lg:max-h-[10rem]'/>
                                </div>
                    })
                }
            </div>
            
            
        </div>
        <div className='absolute flex gap-4 bottom-8 left-1/2 -translate-x-1/2'>
            <div className='w-fit h-fit p-4 
                        rounded-lg border bg-blue-400 border-blue-500 cursor-pointer
                      hover:bg-blue-300 group'>
                <CameraIcon className='bottom-4 w-6 h-6 text-blue-100 group-hover:text-white'/>
            </div>
            <div className='w-fit h-fit p-4 
                        rounded-lg border bg-blue-400 border-blue-500 cursor-pointer
                      hover:bg-blue-300 group' onClick={handleMicMute}>
                {
                    muteMyMic?
                    <NoMicIcon className='bottom-4 w-6 h-6 text-blue-100 group-hover:text-white'/>
                    :
                    <MicIcon className='bottom-4 w-6 h-6 text-blue-100 group-hover:text-white'/>
                }
            </div>
            <div className='w-fit h-fit p-4 
                        rounded-lg border bg-blue-400 border-blue-500 cursor-pointer
                      hover:bg-blue-300 group' onClick={handleHandRaise}>
                        {
                            userFeatures[myId]?.raise_hand ?
                                <HandRaiseSolidIcon className='bottom-4 w-6 h-6 text-yellow-400 group-hover:text-white'/>
                                :<HandRaiseIcon className='bottom-4 w-6 h-6 text-blue-100 group-hover:text-white'/>

                        }
            </div>
            <div className=' w-fit h-fit p-4 
                rounded-lg border bg-red-400 border-red-500 cursor-pointer
                hover:bg-red-300 active:bg-red-500 group' onClick={handleEndCall}>
                <HangUpIcon className='text-white bottom-4 w-6 h-6 group-hover:text-white'/>
            </div>
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