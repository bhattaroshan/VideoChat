'use client'
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const useSocket = () => {
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:9001');
    setSocket(newSocket);

    const cleanup = () => {
        newSocket.close();
      };
  
      return cleanup;
  }, []);

  return socket;
};

export default useSocket;
