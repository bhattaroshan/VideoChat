
'use client'

import { cn } from "@/app/utils"
import CustomPlayer from "../CustomPlayer"
import LoadIcon from "@/app/icons/load"

export default function MeetingEntry({connectedClients,onClick,stream,muted}:
                    {connectedClients:number,onClick:()=>void,stream:MediaStream,muted:boolean}){

    return  <div className='flex flex-col md:flex-row gap-4 justify-center items-center w-screen h-screen'>
            <div className='flex flex-col lg:flex-row items-center justify-center gap-8'>
                <div className='relative flex items-center justify-center'>
                    <CustomPlayer muted={muted} stream={stream} 
                                className={cn('rounded-lg h-[90%]',{
                                    'h-[400px] w-[500px] border':!stream
                                })}/>
                    {
                        !stream &&
                        <div className='animate-spin absolute left-1/2 top-1/2 z-[1000]'>
                            <LoadIcon className='text-white w-10 h-10 '/>
                        </div>
                    }
                </div>
                <div className='flex flex-col justify-center items-center'>
                    <div className='flex flex-col items-center gap-2'>
                        <p className='text-4xl text-gray-200'>Ready to join?</p>
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
            </div>
}