import { io } from "socket.io-client"

const wsSocket = io('ws://localhost:8085', {
    autoConnect: false,
});

export { wsSocket }

