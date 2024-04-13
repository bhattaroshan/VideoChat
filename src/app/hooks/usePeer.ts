'use client'
import { MediaConnection } from "peerjs";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react"
import {v4 as uuidv4} from 'uuid'


export const usePeer = (onOpenCallback:(id:string)=>void)=>{
    console.log("I am from inside usePeer");
    const [peer,setPeer] = useState<any>(null);
    const [myId,setMyId] = useState(uuidv4().slice(-12));
    const isPeerSet = useRef(false);

    useEffect(()=>{
        if(isPeerSet.current) return;
        isPeerSet.current = true;
        let mypeer;
        (async function initPeer(){
            const peerJS = await import('peerjs');
            const peerConfig = {
                debug: 1,
                host: "crosshimalaya.roshanbhatta.com.np",
                port: 443,
                path: "/myapp",
                secure: true,
            };

            mypeer = new peerJS.default(myId,peerConfig);
            setPeer(mypeer);

            mypeer.on('open',async (id:string)=>{
                if (onOpenCallback && typeof onOpenCallback === 'function') {
                    onOpenCallback(id);
                }
            })

            // peer.call

            // peer.on('call', await onCallReceived);
            // peer.on('call', async (call:MediaConnection)=>{
                // if (onCallReceived && typeof onCallReceived === 'function') {
                //     onCallReceived(call);
                // } 
                // console.log("calling me")
               
            // })

        })();
    },[])
    return {
        peer: peer,
        myId: myId
    }
}