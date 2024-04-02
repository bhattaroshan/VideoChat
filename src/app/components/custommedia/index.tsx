'use client'
import CameraIcon from "@/icons/camera";
import MicIcon from "@/icons/mic";
import NoCameraIcon from "@/icons/nocamera";
import NoMicIcon from "@/icons/nomic";
import { useEffect, useRef, useState } from "react"
// import Peer from "peerjs";
import {v4 as uuidv4} from 'uuid';
import RecordPlay from "../record";
import ReactPlayer from "react-player";
import HangUpIcon from "@/icons/hangup";
import RecordIcon from "@/icons/record";

export default function CustomMedia({meetId}:{meetId?:string}){
    // const [stream,setStream] = useState<MediaStream|null>(null);
    const myMeetId = meetId ? meetId : uuidv4().slice(-12);

    const meRef = useRef<HTMLVideoElement|null>(null);
    const remoteRef = useRef<HTMLVideoElement|null>(null);
    const textRef = useRef<HTMLInputElement>(null);
    const [myId,setMyId] = useState('');
    const peerInstance = useRef<any>(null);

    const [state,setState] = useState<MediaStream|null>(null);
    const [remoteState,setRemoteState] = useState<MediaStream|null>(null);

    const [cameraOn,setCameraOn] = useState(true);
    const [micOn,setMicOn] = useState(true);

    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder|null>(null);
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
    const recordedRef = useRef<HTMLVideoElement|null>(null);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [ready,setReady] = useState(false);

  
    useEffect(() => {
        if (mediaRecorder) {
          const handleDataAvailable = (event: BlobEvent) => {
            if (event.data.size > 0) {
                console.log("trigger");
              setRecordedChunks((prevChunks) => [...prevChunks, event.data]);
            }
          };
    
          mediaRecorder.ondataavailable = handleDataAvailable;
    
          return () => {
            mediaRecorder.ondataavailable = null;
          };
        }
      }, [mediaRecorder]);

     
      useEffect(() => {
        if (state && remoteState && meRef.current && remoteRef.current) {
          const canvas = canvasRef.current;
          const localVideo = meRef.current;
          const remoteVideo = remoteRef.current;
    
          if (canvas && localVideo && remoteVideo) {
            console.log("i did come inside big giant condition")
            // const width = localVideo.width + remoteVideo.width;
            // const height = Math.max(localVideo.height, remoteVideo.height);
            const width = 1920;
            const height = 1080;
            // canvas.width = width;
            // canvas.height = height;
            canvas.width = width
            canvas.height = height;
            console.log("my width and height is ",canvas.width,canvas.height);
    
            const context = canvas.getContext('2d');
    
            const drawStreams = () => {
              if (context) {
                console.log("context is successfull");
                context.clearRect(0, 0,width,height);
                context.drawImage(localVideo, 0, 0, width/2, height);
                context.drawImage(remoteVideo, width/2, 0,width/2,height);
                requestAnimationFrame(drawStreams);
              }
            };

            drawStreams();
    
            const combinedStream = canvas.captureStream();
            const source1Track = state.getAudioTracks();
            if(source1Track.length>0){
                const audioStream = new MediaStream(source1Track);
                combinedStream.addTrack(audioStream.getAudioTracks()[0]);
            }
            const source2Track = remoteState.getAudioTracks();
            if(source2Track.length>0){
                const audioStream2 = new MediaStream(source2Track);
                combinedStream.addTrack(audioStream2.getAudioTracks()[0]);
            }
            // const options = { mimeType: 'video/webm; codecs="vp8"' };
            // const options = { mimeType: 'video/webm; codecs="vp8"' };
            const mediaRecorder = new MediaRecorder(combinedStream);
            setMediaRecorder(mediaRecorder);
            mediaRecorder.start(1000);
    
            return () => {
              mediaRecorder.stop();
            };
          }
        }
      }, [remoteState, state, meRef.current, remoteRef.current]);

    useEffect(()=>{
        
        let stream:MediaStream;

        async function connectPeer(){
            const peerJS = await import('peerjs');
            const peerConfig = {
                debug: 1,
                host: "crosshimalaya.roshanbhatta.com.np",
                port: 443,
                path: "/myapp",
                secure: true,
            };

            const peer = new peerJS.default(myMeetId,peerConfig);
    
            peer.on('open', (id) => {
            //   setPeerId(id)
              console.log(id);
              setMyId(id);
            });
            
            peer.on('call', async (call) => {
                console.log("calling...")
                try{
                    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                    setState(stream);
                    if(meRef.current){
                        meRef.current.srcObject = stream;
                    }
                      call.answer(stream)
                      call.on('stream', function(remoteStream) {
                        if(remoteRef.current){
                            remoteRef.current.srcObject = remoteStream
                        }
                    });
                }catch(error){
                    console.log(error);
                }
               
              })
              peerInstance.current = peer;
        }
       
        connectPeer();

          return ()=>{
            if(stream){
                stream.getTracks().forEach(track=>track.stop());
            }
          }
        
    },[])

    const call = async (remotePeerId:string) => {
        let stream:MediaStream;
     
       try{
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if(meRef.current){
          meRef.current.srcObject = stream;
        }
        
        // setRemoteState(stream);
        setState(stream);
        // const options = {
        //     mimeType: 'video/webm'
        //   };
        // const media = new MediaRecorder(stream);
        // setMediaRecorder(media);
        // media.start(1000);
        // media.ondataavailable = (event) => {
        //     if(event.data.size>0){
        //         console.log(event.data);
        //         setRecordedChunks([...recordedChunks,event.data]);
        //     }

        // }        


        const call = peerInstance.current?.call(remotePeerId,stream);
        if(call){
            // call.on('stream',async (remoteStream:any)=>{
            call.on('stream',function(remoteStream:MediaStream){
                   setRemoteState(remoteStream);
                   if(remoteRef.current) {
                    remoteRef.current.srcObject = remoteStream;
                }
              
            })
        }
       } catch(error){
            console.log(error);
       }

       
        return ()=>{
            if(stream){
                stream.getTracks().forEach(track=>track.stop);
            }
        }
      }

      function handleConnect(){
        if(textRef.current){
            call(textRef.current.value);
        }
      }

    //   async function startRecording(){

    //         console.log("came inside function");
    //     if(state){
    //         console.log("came inside");
    //         const media = new MediaRecorder(state)
    //         mediaRecorder.current = media;
    //         mediaRecorder.current.start(1000);
    //         mediaRecorder.current.ondataavailable = (event) => {
    //             console.log("trigerring");
    //             if(event.data.size<=0){
    //                 return;
    //             }

    //             setRecordedChunks([...recordedChunks,event.data]);
    //         }
    //     }
    //   }

      async function stopRecording(){
        if(mediaRecorder){
            mediaRecorder.stop(); 
            setReady(true);

            mediaRecorder.onstop = async () => {
                console.log("the length is ",recordedChunks.length);
                const blob = new Blob(recordedChunks, {type: mediaRecorder.mimeType});
                if(recordedRef.current)
                    recordedRef.current.src = URL.createObjectURL(blob);
                // const url = window.URL.createObjectURL(blob);
                // const link = document.createElement('a');
                // link.href = url;
                // link.download = 'recorded-video.mkv';
                // document.body.appendChild(link);
                // link.click();
                // document.body.removeChild(link);
                // window.URL.revokeObjectURL(url);
            };
        }
      }
    //     if(mediaRecorder){
    //         mediaRecorder.stop();
    
    //         mediaRecorder.onstop = async () => {
    //             const blob = new Blob(recordedChunks, { type: 'video/webm' });
    //             const url = window.URL.createObjectURL(blob);
    //             const link = document.createElement('a');
    //             link.href = url;
    //             link.download = 'recorded-video.webm';
    //             document.body.appendChild(link);
    //             link.click();
    //             document.body.removeChild(link);
    //             window.URL.revokeObjectURL(url);
    //         };
    //     }
    //   }

    function handleCameraClick(){
        if(state){
            state.getVideoTracks()[0].enabled = !cameraOn;
            setCameraOn(p=>!p);
        }

       
    }

    function handleMicClick(){
        if(state){
            state.getAudioTracks()[0].enabled = !micOn;
            setMicOn(p=>!p);
        }

    }
    function handleRecordClose(e:MouseEvent){
        setReady(false);
       e.stopPropagation(); 
    }

    return <div className={`relative flex flex-col gap-4 items-center w-screen h-screen bg-gray-800 ${ready&&'backdrop-blur-lg'}`}>
                    {
                        ready &&
                // <div className='absolute flex justify-center items-center bg-red-200 rounded-lg w-[800px] h-[500px] 
                                // left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[1001] backdrop-blur-lg' >
                        <div className='w-screen h-screen absolute z-[1001]'>
                            <button className='absolute top-0 right-0 text-white p-2 rounded bg-blue-400' onClick={(e)=>handleRecordClose}>Close</button>
                            <ReactPlayer url={URL.createObjectURL(new Blob(recordedChunks))} controls width='100%' height='100%' onClickPreview={(e)=>e.stopPropagation()}/>
                        </div>
                // </div>
                    }
            <canvas ref={canvasRef}  className='bg-black hidden '/>
        <div className='relative flex flex-col w-screen h-max-10/12 gap-4 items-center bg-gray overflow-hidden'>
            <video ref={meRef} autoPlay muted={true} className='absolute left-4 top-4 rounded-xl bg-blue-200 w-1/5 h-1/3 min-w-24 min-h-28  md:min-w-44 md:min-h-48 object-cover z-[1000]'/>
            <video ref={remoteRef} autoPlay className='bg-gray-400 w-screen h-10/12 object-cover' />
            
            <div className='absolute flex gap-4 left-1/2 bottom-6 -translate-x-1/2 '>
                {
                    cameraOn?
                <div className='w-fit h-fit p-4 
                                rounded-full border bg-blue-400 border-blue-500 cursor-pointer
                                hover:bg-blue-300 group' onClick={handleCameraClick}>
                    <CameraIcon className='bottom-4 w-8 h-8 text-blue-100 group-hover:text-white'/>
                </div>:
                <div className='w-fit h-fit p-4 
                                rounded-full border bg-blue-400 border-blue-500 cursor-pointer
                                hover:bg-blue-300 group' onClick={handleCameraClick}>
                    <NoCameraIcon className='bottom-4 w-8 h-8 text-blue-100 group-hover:text-white'/>
                </div>
                }
                {
                    micOn?
                <div className='w-fit h-fit p-4 
                                rounded-full border bg-blue-400 border-blue-500 cursor-pointer
                                hover:bg-blue-300 group' onClick={handleMicClick}>
                    <MicIcon className='bottom-4 w-8 h-8 text-blue-100 group-hover:text-white'/>
                </div>:
                <div className='w-fit h-fit p-4 
                                rounded-full border bg-blue-400 border-blue-500 cursor-pointer
                                hover:bg-blue-300 group' onClick={handleMicClick}>
                    <NoMicIcon className='bottom-4 w-8 h-8 text-blue-100 group-hover:text-white'/>
                </div>
                }
                <div className='w-fit h-fit p-4 
                                rounded-full border bg-red-400 border-red-500 cursor-pointer
                                hover:bg-red-300 active:bg-red-500 group' onClick={handleMicClick}>
                    <RecordIcon className='bottom-4 w-8 h-8 text-blue-100 group-hover:text-white'/>
                </div>                        
                <div className='w-fit h-fit p-4 
                                rounded-full border bg-red-400 border-red-500 cursor-pointer
                                hover:bg-red-300 active:bg-red-500 group' onClick={handleMicClick}>
                    <HangUpIcon className='bottom-4 w-8 h-8 text-blue-100 group-hover:text-white'/>
                </div>
            </div>
        </div>
            
            <div className='flex justify-center gap-4 w-screen md:w-6/12'>
                <input type='text' ref={textRef} className='border rounded'/>
                <button className='bg-blue-400 text-white p-2' onClick={handleConnect}>Connect</button>
                <button className='bg-blue-400 text-white p-2' onClick={stopRecording}>Play Recording</button>
            </div>
           
    </div>
}