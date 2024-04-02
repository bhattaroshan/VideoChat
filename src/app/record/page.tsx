'use client'
// import ReactPlayer from "react-player";
import dynamic from 'next/dynamic';

// Dynamically import ReactPlayer with ssr: false
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });


export default function Player(){
    return <div>
        <ReactPlayer url='https://www.youtube.com/watch?v=0PwkFvRf_DY' controls />
    </div>
}