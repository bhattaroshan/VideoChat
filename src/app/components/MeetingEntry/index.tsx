
'use client'

import { cn } from "@/app/utils"
import CustomPlayer from "../CustomPlayer"
import LoadIcon from "@/app/icons/load"
import CameraIcon from "@/app/icons/camera"
import MicIcon from "@/app/icons/mic"
import HangUpIcon from "@/app/icons/hangup"

export default function MeetingEntry({connectedClients,onClick,stream,muted}:
                    {connectedClients:number,onClick:()=>void,stream:MediaStream,muted:boolean}){
    
    return (  
    // <div className='flex flex-col md:flex-row gap-4 justify-center items-center w-screen h-screen'>
            // <div className='flex flex-col lg:flex-row items-center justify-center gap-2 md:gap-8'>
            <div className='flex flex-col lg:flex-row items-center justify-center gap-2 md:gap-8 w-screen h-screen'>
                <div className='flex flex-col items-center gap- gap-4 '>

                    <CustomPlayer muted={muted} stream={stream} 
                                className={cn('w-[320px] h-[240px] md:w-[427px] md:h-[320px] lg:w-[640px] lg:h-[480px]')}/>
                <div className='flex gap-4'>
                    <div className='p-4 rounded-lg border bg-blue-400 border-blue-500 cursor-pointer
                            hover:bg-blue-300 group'>
                        <CameraIcon className='bottom-4 w-5 h-5 text-blue-100 group-hover:text-white'/>
                    </div>
                    <div className='w-fit h-fit p-4 
                                rounded-lg border bg-blue-400 border-blue-500 cursor-pointer
                            hover:bg-blue-300 group'>
                        <MicIcon className='bottom-4 w-5 h-5 text-blue-100 group-hover:text-white'/>
                    </div>
                    <div className=' w-fit h-fit p-4 
                        rounded-lg border bg-red-400 border-red-500 cursor-pointer
                        hover:bg-red-300 active:bg-red-500 group'>
                        <HangUpIcon className='text-white bottom-4 w-6 h-6 group-hover:text-white'/>
                    </div>
                    </div>
                </div>
                <div className='flex flex-col justify-center items-center'>
                    <div className='flex flex-col items-center gap-2'>
                        <p className='hidden md:block text-4xl text-gray-200'>Ready to join?</p>
                        <p className='text-sm text-gray-200 font-thin'>
                            {
                                connectedClients===0 ? 'No one is on the meeting':
                                connectedClients===1? 'One person is on the meeting':
                                connectedClients+' people are on the meeting'
                            }
                        </p>
                    </div>
                    <button className='my-4 bg-white text-xl p-4 h-14 w-28 rounded-xl hover:bg-gray-200 font-semibold'
                        onClick={onClick}>Join</button>
                </div>
                </div>
    )
}