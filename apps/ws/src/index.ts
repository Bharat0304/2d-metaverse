import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });
const rooms:any={};
wss.on('connection', function connection(ws) {
  ws.on('error', console.error);
});
  wss.on('message', function message(data) {
    console.log('received: %s', data);
  });
 

