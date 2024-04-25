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
    socket.join(room_id);
    const totalClientsInRoom = io.sockets.adapter.rooms.get(room_id)?.size || 0;
    socket.broadcast.to(room_id).emit("client:connect",client_id);
    console.log("My connected devices ",totalClientsInRoom);
    io.emit("client:count",room_id,totalClientsInRoom); //broadcast to everyone

    socket.on("client:raise_hand",(state)=>{
      socket.broadcast.to(room_id).emit("client:raise_hand",client_id,state);
    });

    socket.on('disconnect',()=>{
      const totalClientsInRoom = io.sockets.adapter.rooms.get(room_id)?.size || 0;
      socket.broadcast.to(room_id).emit("client:disconnect",client_id);
      io.emit("client:count",room_id,totalClientsInRoom); //broadcast to everyone
      })
    })
  
    socket.on('client:count',(room_id)=>{
      const totalClientsInRoom = io.sockets.adapter.rooms.get(room_id)?.size || 0;
      console.log("hello client count request ",totalClientsInRoom)
      io.emit("client:count",room_id,totalClientsInRoom);
    })

  socket.on('disconnect',()=>{
    
  });

});

server.listen(9001,() => {
console.log('Socket.IO server running on port 9001');
});

