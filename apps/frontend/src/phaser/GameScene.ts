import * as Phaser from "phaser";
import { officeMap, eventMap, TILE_SIZE } from "./maps";

// ── Types ─────────────────────────────────────────────────────────────────────
interface RemotePlayer {
  container: Phaser.GameObjects.Container;
  nameTag: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const SPEED  = 3;
const WS_URL = "ws://localhost:3001";

// ── Colour palette ─────────────────────────────────────────────────────────────
const C = {
  neonBlue:   0x38bdf8,
  neonPurple: 0x818cf8,
  neonGreen:  0x4ade80,
  neonAmber:  0xfbbf24,
  chairSeat:  0x5b21b6,
  chairBack:  0x4c1d95,
  wall:       0x0f172a,
  floor:      0x1e293b,
  table:      0x78350f,
  plant:      0x166534,
  gameObject: 0x0ea5e9,
  stage:      0xa21caf
};

export class PreloadScene extends Phaser.Scene {
  constructor() { super({ key: "PreloadScene" }); }

  create() {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0f1a);

    const bar = this.add.rectangle(width / 2, height / 2, 320, 8, 0x1e293b).setOrigin(0.5);
    const fill = this.add.rectangle(width / 2 - 160, height / 2, 0, 8, C.neonBlue).setOrigin(0, 0.5);

    this.add.text(width / 2, height / 2 - 28, "⚡  Loading ZEP Office…", {
      fontSize: "17px", color: "#38bdf8", fontFamily: "monospace"
    }).setOrigin(0.5);

    this.tweens.add({
      targets: fill,
      duration: 300,
      ease: "Cubic.easeInOut",
      onUpdate: (t) => { fill.width = 320 * t.progress; },
      onComplete: () => this.scene.start("GameScene"),
    });
  }
}

export class GameScene extends Phaser.Scene {
  private ws!: WebSocket;
  private sessionId = "";
  private spaceId   = "";

  private player!:      Phaser.GameObjects.Container;
  private playerName  = "";
  private px = 200;
  private py = 200;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!:    Record<string, Phaser.Input.Keyboard.Key>;

  private others: Map<string, RemotePlayer> = new Map();
  private nearbyPlayers: Set<string> = new Set();
  private tickCount = 0;

  private currentMapName: 'office' | 'event' = 'office';
  private mapTilesLayer!: Phaser.GameObjects.Container;
  private mapBoundsW = 0;
  private mapBoundsH = 0;
  private colliders: Phaser.Geom.Rectangle[] = [];

  constructor() { super({ key: "GameScene" }); }

  init(d: { name?: string; spaceId?: string }) {
    this.playerName = d.name ?? "You";
    this.spaceId    = d.spaceId ?? "space_1";
    this.others.clear();
    this.nearbyPlayers.clear();
    this.tickCount = 0;
    this.sessionId = "";
    this.px = 400;
    this.py = 400;
  }

  create() {
    this.mapTilesLayer = this.add.container(0, 0);
    this.loadMapData(this.currentMapName === 'office' ? officeMap : eventMap);

    this.buildPlayer();
    this.setupInput();
    this.connectWS();
    this.createMapSwitchUI();

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.5);
    this.updateHUD(`⚡ ${this.playerName} · ${this.spaceId}`);
  }

  private loadMapData(mapData: string[][]) {
    this.mapTilesLayer.removeAll(true);
    this.colliders = [];
    
    this.mapBoundsW = mapData[0].length * TILE_SIZE;
    this.mapBoundsH = mapData.length * TILE_SIZE;
    
    this.cameras.main.setBounds(0, 0, this.mapBoundsW, this.mapBoundsH);
    
    const floorBg = this.add.rectangle(0, 0, this.mapBoundsW, this.mapBoundsH, C.floor).setOrigin(0, 0);
    this.mapTilesLayer.add(floorBg);
    
    for (let y = 0; y < mapData.length; y++) {
      for (let x = 0; x < mapData[y].length; x++) {
        const symbol = mapData[y][x];
        const tx = x * TILE_SIZE;
        const ty = y * TILE_SIZE;
        
        let color = -1;
        let isSolid = false;
        
        switch (symbol) {
          case 'W': color = C.wall; isSolid = true; break;
          case 'T': color = C.table; isSolid = true; break;
          case 'C': color = C.chairBack; break;
          case 'S': color = C.neonBlue; break;
          case 'P': color = C.plant; isSolid = true; break;
          case 'G': color = C.gameObject; isSolid = true; break;
          case 'ST': color = C.stage; break;
          case '0': 
          default:
            continue; 
        }
        
        if (color !== -1) {
          const rect = this.add.rectangle(tx, ty, TILE_SIZE, TILE_SIZE, color).setOrigin(0, 0);
          rect.setStrokeStyle(1, 0x000000, 0.3);
          this.mapTilesLayer.add(rect);
        }
        
        if (symbol === 'ST') {
           const label = this.add.text(tx + 4, ty + 8, "STAGE", { fontSize: "8px", color: "#fff", fontFamily: "monospace" });
           this.mapTilesLayer.add(label);
        }
        
        if (isSolid) {
          this.colliders.push(new Phaser.Geom.Rectangle(tx, ty, TILE_SIZE, TILE_SIZE));
        }
      }
    }
  }

  private switchMap() {
    this.currentMapName = this.currentMapName === 'office' ? 'event' : 'office';
    const newMapData = this.currentMapName === 'office' ? officeMap : eventMap;
    
    this.loadMapData(newMapData);
    
    // Reposition player
    this.px = 400;
    this.py = 400;
    this.player.setPosition(this.px, this.py);
    this.cameras.main.setBounds(0, 0, this.mapBoundsW, this.mapBoundsH);
  }
  
  private createMapSwitchUI() {
    const btn = document.createElement("button");
    btn.innerText = "Switch Map";
    btn.style.position = "absolute";
    btn.style.top = "20px";
    btn.style.right = "20px";
    btn.style.padding = "10px 15px";
    btn.style.backgroundColor = "#4ade80";
    btn.style.color = "#000";
    btn.style.fontWeight = "bold";
    btn.style.border = "none";
    btn.style.borderRadius = "8px";
    btn.style.cursor = "pointer";
    btn.style.zIndex = "1000";
    
    btn.onclick = () => {
      this.switchMap();
    };
    
    document.body.appendChild(btn);
    this.events.on('shutdown', () => btn.remove());
  }

  private makeAvatar(name: string, primary: number, secondary: number): Phaser.GameObjects.Container {
    const c = this.add.container(0, 0);

    const shadow = this.add.ellipse(0, 16, 26, 8, 0x000000, 0.4);
    const glow = this.add.graphics();
    glow.fillStyle(primary, 0.18);
    glow.fillCircle(0, 0, 20);

    const body = this.add.graphics();
    body.fillStyle(0x1e293b);
    body.fillRoundedRect(-8, 7,  7, 10, 3);
    body.fillRoundedRect(1,  7,  7, 10, 3);
    body.fillStyle(secondary);
    body.fillRoundedRect(-10, -5, 20, 16, 6);
    body.fillStyle(primary);
    body.fillTriangle(-4, -5, 4, -5, 0, 2);
    body.fillStyle(0xfbbf24);
    body.fillCircle(0, -16, 11);
    body.fillStyle(0x1e293b);
    body.fillRoundedRect(-11, -27, 22, 13, 6);
    body.fillStyle(0x0f172a);
    body.fillCircle(-4, -16, 2.2);
    body.fillCircle(4,  -16, 2.2);
    body.fillStyle(0x78350f);
    body.fillRoundedRect(-3, -11, 6, 2, 1);

    const badge = this.add.text(0, -34, name, {
      fontSize: "9px",
      color: "#f1f5f9",
      fontFamily: "monospace",
      backgroundColor: "#0f172acc",
      padding: { x: 5, y: 2 },
    }).setOrigin(0.5);

    c.add([shadow, glow, body, badge]);
    return c;
  }

  private buildPlayer() {
    this.player = this.makeAvatar(this.playerName, C.neonBlue, 0x1e40af);
    this.player.setPosition(this.px, this.py);
    this.player.setDepth(20);
  }

  private avatarColors = [
    { p: 0xef4444, s: 0x991b1b },
    { p: 0xf97316, s: 0x9a3412 },
    { p: 0xeab308, s: 0x854d0e },
    { p: 0x4ade80, s: 0x166534 },
    { p: 0x14b8a6, s: 0x134e4a },
    { p: 0xec4899, s: 0x9d174d },
    { p: 0xa855f7, s: 0x6b21a8 },
  ];

  private hashCode(s: string) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
    return h;
  }

  private addRemotePlayer(sessionId: string) {
    const idx = Math.abs(this.hashCode(sessionId)) % this.avatarColors.length;
    const { p, s } = this.avatarColors[idx];
    const container = this.makeAvatar(sessionId.slice(0, 6), p, s);
    container.setPosition(this.mapBoundsW / 2, this.mapBoundsH / 2 - 100);
    container.setDepth(19);
    this.others.set(sessionId, { container, nameTag: sessionId });
  }

  private setupInput() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      up:    this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down:  this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left:  this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  private connectWS() {
    try {
      this.ws = new WebSocket(WS_URL);
      this.ws.onopen = () =>
        this.ws.send(JSON.stringify({ type: "JOIN_SPACE", spaceId: this.spaceId }));
      this.ws.onmessage = (ev) => this.handleWSMessage(JSON.parse(ev.data));
      this.ws.onerror = () => console.warn("[WS] offline");
    } catch {
      console.warn("[WS] offline");
    }
  }

  private handleWSMessage(msg: any) {
    switch (msg.type) {
      case "JOINED_SPACE":
        this.sessionId = msg.sessionId;
        this.updateHUD(`⚡ ${this.playerName} · ${this.sessionId.slice(0, 6)}`);
        break;

      case "SPACE_USERS":
        for (const [id, rp] of this.others) {
          if (!msg.users.includes(id)) { rp.container.destroy(); this.others.delete(id); }
        }
        for (const id of msg.users as string[]) {
          if (id !== this.sessionId && !this.others.has(id)) this.addRemotePlayer(id);
        }
        break;

      case "PLAYER_MOVED": {
        const rp = this.others.get(msg.sessionId);
        if (rp && msg.sessionId !== this.sessionId) {
          rp.container.setPosition(msg.x, msg.y);
        }
        break;
      }

      case "PROXIMITY_ENTER":
        this.nearbyPlayers.add(msg.with);
        this.showToast("👋 Someone's nearby — wave hello!");
        break;

      case "PROXIMITY_LEAVE":
        this.nearbyPlayers.delete(msg.with);
        if (!this.nearbyPlayers.size) this.hideToast();
        break;
    }
  }

  private isColliding(nx: number, ny: number) {
    const pBounds = new Phaser.Geom.Rectangle(nx - 10, ny - 5, 20, 10);
    for (const c of this.colliders) {
      if (Phaser.Geom.Intersects.RectangleToRectangle(pBounds, c)) {
        return true;
      }
    }
    return false;
  }

  update() {
    let dx = 0, dy = 0;

    if (this.cursors.left.isDown  || this.wasd.left.isDown)  dx = -SPEED;
    if (this.cursors.right.isDown || this.wasd.right.isDown) dx =  SPEED;
    if (this.cursors.up.isDown    || this.wasd.up.isDown)    dy = -SPEED;
    if (this.cursors.down.isDown  || this.wasd.down.isDown)  dy =  SPEED;

    if (dx || dy) {
      let nextX = this.px + dx;
      let nextY = this.py + dy;
      
      nextX = Phaser.Math.Clamp(nextX, 20, this.mapBoundsW - 20);
      nextY = Phaser.Math.Clamp(nextY, 20, this.mapBoundsH - 20);
      
      if (!this.isColliding(nextX, nextY)) {
         this.px = nextX;
         this.py = nextY;
         this.player.setPosition(this.px, this.py);

         this.tickCount++;
         if (this.tickCount % 3 === 0 && this.ws?.readyState === WebSocket.OPEN) {
           this.ws.send(JSON.stringify({ type: "MOVE", dx, dy }));
         }
      }
    }
  }

  private updateHUD(text: string) {
    const el = document.getElementById("hud-text");
    if (el) el.textContent = text;
  }

  private showToast(msg: string) {
    const t = document.getElementById("proximity-toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 3000);
  }

  private hideToast() {
    document.getElementById("proximity-toast")?.classList.remove("show");
  }
}
