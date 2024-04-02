import ReactPlayer from "react-player"

export default function RecordPlay({blob}:{blob:MediaStream}){
    return <div>
        <ReactPlayer url={blob} />
    </div>
}