import { User } from "./user.js";

export class SpaceManager {
  private static spaces: Map<string, Set<User>> = new Map();

  static join(spaceId: string, user: User) {
    if (!this.spaces.has(spaceId)) {
      this.spaces.set(spaceId, new Set());
    }

    this.spaces.get(spaceId)!.add(user);
    this.broadcastUsers(spaceId);
  }

  static leave(spaceId: string, user: User) {
    this.spaces.get(spaceId)?.delete(user);
    this.broadcastUsers(spaceId);
  }

  static broadcastUsers(spaceId: string) {
    const users = Array.from(this.spaces.get(spaceId) || []).map(
      u => ({
        sessionId: u.sessionId,
        x: u.x,
        y: u.y,
        username: u.username,
        character: u.character,
        anim: u.anim
      })
    );

    for (const user of this.spaces.get(spaceId) || []) {
      user.ws.send(JSON.stringify({
        type: "SPACE_USERS",
        users
      }));
    }
  }

  static broadcastMovement(spaceId: string, movedUser: User, anim?: string) {
    for (const user of this.spaces.get(spaceId) || []) {
      user.ws.send(JSON.stringify({
        type: "PLAYER_MOVED",
        sessionId: movedUser.sessionId,
        x: movedUser.x,
        y: movedUser.y,
        anim
      }));
    }
    this.checkProximity(spaceId, movedUser);  
  }
  private static checkProximity(spaceId: string, movedUser: User) {
    const users = Array.from(this.spaces.get(spaceId) || []);
    const PROXIMITY_RADIUS = 100;
  
    if (!this.ProximityMap.has(movedUser.sessionId)) {
      this.ProximityMap.set(movedUser.sessionId, new Set());
    }
  
    const currentNearby = this.ProximityMap.get(movedUser.sessionId)!;
  
    for (const other of users) {
      if (other.sessionId === movedUser.sessionId) continue;
  
      const dist = this.distannce(movedUser, other);
      const isNearby = dist <= PROXIMITY_RADIUS;
      const wasNearby = currentNearby.has(other.sessionId);
  
      // 🟢 ENTER
      if (isNearby && !wasNearby) {
        currentNearby.add(other.sessionId);
  
        movedUser.ws.send(JSON.stringify({
          type: "PROXIMITY_ENTER",
          with: other.sessionId
        }));
  
        other.ws.send(JSON.stringify({
          type: "PROXIMITY_ENTER",
          with: movedUser.sessionId
        }));
      }
  
      // 🔴 LEAVE
      if (!isNearby && wasNearby) {
        currentNearby.delete(other.sessionId);
  
        movedUser.ws.send(JSON.stringify({
          type: "PROXIMITY_LEAVE",
          with: other.sessionId
        }));
  
        other.ws.send(JSON.stringify({
          type: "PROXIMITY_LEAVE",
          with: movedUser.sessionId
        }));
      }
    }
  }
  
  private static ProximityMap:Map<string ,Set<string>> = new Map();
  private static distannce(a:User, b:User){
    const dx=a.x - b.x;
    const dy=a.y - b.y;
    return Math.sqrt(dx*dx + dy*dy);
  }
}
