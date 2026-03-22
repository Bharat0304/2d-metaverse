import WebSocket from "ws";
import { prisma } from "@repo/db";
import { SpaceManager } from "./server.js";

function generateSessionId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let sessionId = "";
  for (let i = 0; i < 16; i++) {
    sessionId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return sessionId;
}

export class User {
  public readonly sessionId: string;
  public spaceId: string | null = null;
  public x = 0;
  public y = 0;
  public ws: WebSocket;
   Map_WIDTH = 1000;
   Map_HEIGHT = 1000;

  constructor(ws: WebSocket) {
    this.ws = ws;
    this.sessionId = generateSessionId();
  }

  initHandler() {
    this.ws.on("message", async (data) => {
      const message = JSON.parse(data.toString());
      await this.handleMessage(message);
    });

    this.ws.on("close", () => {
      if (this.spaceId) {
        SpaceManager.leave(this.spaceId, this);
      }
      this.cleanup();
    });
  }

  async handleMessage(message: any) {
    switch (message.type) {
      case "JOIN_SPACE":
        await this.joinSpace(message.spaceId);
        break;

      case "MOVE":
        this.move(message.dx, message.dy);
        break;
    }
  }

  async joinSpace(spaceId: string) {
    const space = await prisma.space.findUnique({
      where: { id: spaceId },
      select: { id: true }
    });

    if (!space) {
      this.ws.send(JSON.stringify({
        type: "ERROR",
        message: "Space not found"
      }));
      return;
    }

    this.spaceId = spaceId;
    SpaceManager.join(spaceId, this);

    this.ws.send(JSON.stringify({
      type: "JOINED_SPACE",
      sessionId: this.sessionId
    }));
  }

  move(dx: number, dy: number) {
    this.x =Math.max(0, Math.min(this.x+dx ,this.Map_WIDTH));
    this.y =Math.max(0, Math.min(this.y+dy ,this.Map_HEIGHT));

    if(this.spaceId) {
      SpaceManager.broadcastMovement(this.spaceId, this);
    }
  }

  cleanup() {
    console.log(`User ${this.sessionId} disconnected`);
  }
}
