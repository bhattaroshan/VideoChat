'use client'
import Image from "next/image";
import CustomMedia from "./components/custommedia";
import { useRouter } from "next/navigation";
import {v4 as uuidv4} from 'uuid';

export default function Home() {
  const router = useRouter();

  function handleMeetingCreate(){
    router.push("/video/"+uuidv4().slice(-12));
  }

  return (
    <div className='w-screen h-screen'>
      <div className='bg-gray-900 w-screen lg:w-1/2 h-screen flex flex-col justify-center px-10 gap-4'>
        <p className='font-bold text-4xl text-white'>Video calls and meetings</p>
        <button className='bg-white font-bold text-xl p-4 rounded-lg w-52' onClick={handleMeetingCreate}>Create Meeting</button>
      </div>
    </div>
  )
}
