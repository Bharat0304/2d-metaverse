import { WebSocketServer } from 'ws';
import { User } from './user.js';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);
});

// Keep existing user initialization
wss.on('connection', (ws) => {
  const user = new User(ws);
  user.initHandler();
});

