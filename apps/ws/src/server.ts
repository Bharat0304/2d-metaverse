import { User } from "./user.js";

export class SpaceManager {
  private static spaces: Map<string, Set<User>> = new Map();

  /**
   * Called when a new user joins a space.
   * - Sends the list of EXISTING players to the new user (SPACE_USERS).
   * - Sends PLAYER_JOINED to every existing player so they add the newcomer.
   */
  static join(spaceId: string, user: User) {
    const existing = this.spaces.get(spaceId)
      ? Array.from(this.spaces.get(spaceId)!)
      : [];

    if (!this.spaces.has(spaceId)) {
      this.spaces.set(spaceId, new Set());
    }
    this.spaces.get(spaceId)!.add(user);

    // 1️⃣  Tell the newcomer about all players that were already in the room
    const existingData = existing.map(u => ({
      sessionId: u.sessionId,
      x: u.x,
      y: u.y,
      username: u.username,
      character: u.character,
      anim: u.anim,
    }));
    user.ws.send(JSON.stringify({ type: "SPACE_USERS", users: existingData }));

    // 2️⃣  Tell every existing player about the newcomer
    const newPlayerData = {
      type: "PLAYER_JOINED",
      sessionId: user.sessionId,
      x: user.x,
      y: user.y,
      username: user.username,
      character: user.character,
      anim: user.anim,
    };
    for (const existingUser of existing) {
      existingUser.ws.send(JSON.stringify(newPlayerData));
    }
  }

  static leave(spaceId: string, user: User) {
    this.spaces.get(spaceId)?.delete(user);
    this.ProximityMap.delete(user.sessionId);

    // Notify remaining players
    for (const remaining of this.spaces.get(spaceId) || []) {
      remaining.ws.send(JSON.stringify({
        type: "PLAYER_LEFT",
        sessionId: user.sessionId,
      }));
    }
  }

  static broadcastMovement(spaceId: string, movedUser: User, anim?: string) {
    for (const user of this.spaces.get(spaceId) || []) {
      // Skip broadcasting back to the mover themselves
      if (user.sessionId === movedUser.sessionId) continue;
      user.ws.send(JSON.stringify({
        type: "PLAYER_MOVED",
        sessionId: movedUser.sessionId,
        x: movedUser.x,
        y: movedUser.y,
        anim,
      }));
    }
    this.checkProximity(spaceId, movedUser);
  }
  static getUsers(spaceId: string): User[] {
    return Array.from(this.spaces.get(spaceId) || []);
  }

  static broadcastChat(spaceId: string, message: any) {
    for (const user of this.spaces.get(spaceId) || []) {
      user.ws.send(JSON.stringify(message));
    }
  }

  private static checkProximity(spaceId: string, movedUser: User) {
    const users = Array.from(this.spaces.get(spaceId) || []);
    const PROXIMITY_RADIUS = 200; // Phaser units (matches client-side threshold)

    if (!this.ProximityMap.has(movedUser.sessionId)) {
      this.ProximityMap.set(movedUser.sessionId, new Set());
    }

    const currentNearby = this.ProximityMap.get(movedUser.sessionId)!;

    for (const other of users) {
      if (other.sessionId === movedUser.sessionId) continue;

      const dist = this.distance(movedUser, other);
      const isNearby = dist <= PROXIMITY_RADIUS;
      const wasNearby = currentNearby.has(other.sessionId);

      // 🟢 ENTER proximity
      if (isNearby && !wasNearby) {
        currentNearby.add(other.sessionId);

        // Make sure the other player's map is also updated
        if (!this.ProximityMap.has(other.sessionId)) {
          this.ProximityMap.set(other.sessionId, new Set());
        }
        this.ProximityMap.get(other.sessionId)!.add(movedUser.sessionId);

        console.log(`[Proximity] ENTER: ${movedUser.sessionId} <-> ${other.sessionId} dist=${dist.toFixed(0)}`);

        movedUser.ws.send(JSON.stringify({ type: "PROXIMITY_ENTER", with: other.sessionId }));
        other.ws.send(JSON.stringify({ type: "PROXIMITY_ENTER", with: movedUser.sessionId }));
      }

      // 🔴 LEAVE proximity
      if (!isNearby && wasNearby) {
        currentNearby.delete(other.sessionId);
        this.ProximityMap.get(other.sessionId)?.delete(movedUser.sessionId);

        console.log(`[Proximity] LEAVE: ${movedUser.sessionId} <-> ${other.sessionId} dist=${dist.toFixed(0)}`);

        movedUser.ws.send(JSON.stringify({ type: "PROXIMITY_LEAVE", with: other.sessionId }));
        other.ws.send(JSON.stringify({ type: "PROXIMITY_LEAVE", with: movedUser.sessionId }));
      }
    }
  }

  private static ProximityMap: Map<string, Set<string>> = new Map();

  private static distance(a: User, b: User) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
