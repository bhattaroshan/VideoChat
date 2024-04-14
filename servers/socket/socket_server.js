const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    //  origin: 'https://abcvideochat.vercel.app', // Allow requests from this origin
    // origin: ['https://localhost:3000','https://192.168.10.72:3000'], // Allow requests from this origin
    origin: "*",
    methods: ['GET', 'POST'], // Allow only specified methods
    allowedHeaders: ['Authorization'], // Allow only specified headers
    credentials: true // Allow sending cookies
  }
});

io.on('connection', (socket) => {

  socket.on('client:connect_request',(room_id,client_id)=>{
    console.log('got a connection request from ',client_id,' in room ',room_id);
    socket.join(room_id);

    socket.broadcast.to(room_id).emit("client:connect",client_id);

    socket.on('disconnect',()=>{
      socket.broadcast.to(room_id).emit("client:disconnect",client_id);
      })

    })
  
    

  
  socket.on('disconnect',()=>{
    
  });

});

server.listen(9001,() => {
console.log('Socket.IO server running on port 9001');
});

              