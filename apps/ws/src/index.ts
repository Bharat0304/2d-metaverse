import { WebSocket, WebSocketServer } from "ws";
const wss = new WebSocketServer({ port: 8080 });
const server=createServer();



wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected");
}) 
