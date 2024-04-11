'use client'
import { MediaConnection } from "peerjs";
import { useEffect, useRef, useState } from "react"


export const usePeer = (clientId:string, onOpenCallback:(id:string)=>void,
                        onCallReceived:(call:MediaConnection)=>void)=>{
    const [peer,setPeer] = useState<any>(null);
    const [peerId,setPeerId] = useState<any>(null);
    const peerInstance = useRef<any>(null);

    useEffect(()=>{
        (async function initPeer(){
            const peerJS = await import('peerjs');
            const peerConfig = {
                debug: 1,
                host: "crosshimalaya.roshanbhatta.com.np",
                port: 443,
                path: "/myapp",
                secure: true,
            };

            let peer = new peerJS.default(clientId,peerConfig);
            peerInstance.current = peer;

            peer.on('open',async (id:string)=>{
                if (onOpenCallback && typeof onOpenCallback === 'function') {
                    onOpenCallback(id);
                }
            })

            peer.on('call', async (call:MediaConnection)=>{
                if (onCallReceived && typeof onCallReceived === 'function') {
                    onCallReceived(call);
                } 
            })

        })();
    },[])
    return {
        peerInstance: peerInstance
    }
}