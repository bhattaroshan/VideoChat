const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'https://localhost:3000', // Allow requests from this origin
    methods: ['GET', 'POST'], // Allow only specified methods
    allowedHeaders: ['Authorization'], // Allow only specified headers
    credentials: true // Allow sending cookies
  }
});

const connectedClients = new Map();
const totalSessions = new Map();

function addIdToKey(key,client_id,socket_id){
  if(totalSessions.has(key) && totalSessions.get(key).length>0){
    totalSessions.get(key).push({
      host:false, 
      client_id:client_id,
      socket_id: socket_id
    });
  }else{
    totalSessions.set(key,[{
      host:true, 
      client_id:client_id,
      socket_id: socket_id
    }]);
  }
}

io.on('connection', (socket) => {
  console.log('A user connected');
  // console.log(socket)
  connectedClients.set(socket.id,socket);
  // connectedClients.forEach((socket,id)=>{
  //   console.log(id);
  // })
  socket.on('client:connect',(msg)=>{
    console.log("Hey I'm the connected user");
    console.log(msg);
    const key = msg.video_id;
    const client_id = msg.client_id;
    const socket_id = socket.id;

    //there is already host connected to this url, pass host id
    if(totalSessions.has(key) && totalSessions.get(key).length>0){ 
      let host_id = null;
      for(let i=0;i<totalSessions.get(msg.video_id).length;i++){
        if(totalSessions.get(msg.video_id)[i].host===true){
          host_id = totalSessions.get(msg.video_id)[i].client_id
          socket.emit('host:connect',{
                  host_id: host_id,
              });
          console.log("i did find the host")
          break;
        }
      }
    
    }

    if(key){
      addIdToKey(key,client_id,socket_id);
      console.log("total sessions here", totalSessions);
    }

    
   

  })

  
  socket.on('client',(msg)=>{
        console.log('receive a client notification');
        socket.broadcast.emit('client',msg);
  }); 
  
  socket.on('disconnect',()=>{
    connectedClients.delete(socket.id);
    console.log("after disconnection ")

    for(let [key,value] of totalSessions){
        for(let index=0; index<value.length; index++){
          const v = value[index];
          if(v.socket_id === socket.id){
            totalSessions.get(key).splice(index,1);
            break;
          }
          console.log(totalSessions);
        // }
    }
      // for (let v of value){
      //   console.log(v.indefOf(), v);
      // }

      // let index = totalSessions[key].findIndex(item=>item.socket_id == socket.id);
      // if(index!==-1){
      //   console.log('found the client with id ',totalSessions[key][index].client_id)
      //   totalSessions[key] = totalSessions[key].splice(index,1);
      //   break;
      // }
    }
    // console.log("client "+socket.id+" disconnected from the server");
    // console.log("-------DISCONNECT-------");
    // console.log(totalSessions);
    // console.log("-------DISCONNECT-------");
  });

});

server.listen(9001, () => {
console.log('Socket.IO server running on port 9001');
});

              