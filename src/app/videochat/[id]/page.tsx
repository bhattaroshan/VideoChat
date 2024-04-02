import CustomMedia from "@/app/components/custommedia";


export default function VideoChat({params}:{params:{id:string}}){
    const meetId = params.id;
    return <div>
        <CustomMedia meetId={meetId}/>
    </div>
}