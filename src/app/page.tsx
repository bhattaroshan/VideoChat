'use client'
import Image from "next/image";
import CustomMedia from "./components/custommedia";
import { useRouter } from "next/navigation";
export default function Home() {
  const router = useRouter();

  router.push("/video/123");

  return (
    <div>
      <CustomMedia/>
    </div>
  )
}
