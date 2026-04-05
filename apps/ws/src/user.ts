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
  public x = 500;
  public y = 500;
  public username = "Player";
  public character = "nancy";
  public anim = "nancy_down_idle";
  public ws: WebSocket;
   Map_WIDTH = 4000;
   Map_HEIGHT = 4000;

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
        await this.joinSpace(message.spaceId, message.username, message.character);
        break;

      case "MOVE":
        this.move(message.x, message.y, message.anim);
        break;
    }
  }

  async joinSpace(spaceId: string, username?: string, character?: string) {
    if (username) this.username = username;
    if (character) {
        this.character = character;
        this.anim = `${character}_down_idle`;
    }
    // TEMPORARY MOCK: Bypassing DB check for testing since the DB isn't running
    // const space = await prisma.space.findUnique({
    //   where: { id: spaceId },
    //   select: { id: true }
    // });
    // if (!space) {
    //   this.ws.send(JSON.stringify({
    //     type: "ERROR",
    //     message: "Space not found"
    //   }));
    //   return;
    // }

    this.spaceId = spaceId;
    SpaceManager.join(spaceId, this);

    this.ws.send(JSON.stringify({
      type: "JOINED_SPACE",
      sessionId: this.sessionId
    }));
  }

  move(x: number, y: number, anim?: string) {
    this.x = Math.max(0, Math.min(x, this.Map_WIDTH));
    this.y = Math.max(0, Math.min(y, this.Map_HEIGHT));
    if (anim) this.anim = anim;

    if(this.spaceId) {
      SpaceManager.broadcastMovement(this.spaceId, this, anim);
    }
  }

  cleanup() {
    console.log(`User ${this.sessionId} disconnected`);
  }
}
