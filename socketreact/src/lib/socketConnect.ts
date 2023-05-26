import { io } from "socket.io-client"

const wsSocket = io('http://44.213.111.179:8086/', {
    autoConnect: false,
});

export { wsSocket }

