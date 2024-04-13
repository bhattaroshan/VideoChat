import ReactPlayer from "react-player";
import { twMerge } from "tailwind-merge";

export default function CustomPlayer({stream,className,user, muted=true}:
                {stream:MediaStream,className?:string,user?:string,muted?:boolean}){
    return <div className={twMerge('relative flex flex-col text-right text-white',className)}>
        {
            user && <div className='absolute top-2 right-2 bg-gray-400 p-2 rounded-md'>
                <p>{user}</p>
                </div>
        }
        <ReactPlayer url={stream} playing muted={muted} className='[&>video]:object-contain [&>video]:max-h-screen' width={'100%'} height={'100%'}/>
    </div>
}