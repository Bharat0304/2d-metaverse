import * as Phaser from "phaser";

// ── Types ─────────────────────────────────────────────────────────────────────
interface RemotePlayer {
  container: Phaser.GameObjects.Container;
  nameTag: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const MAP_W  = 2560;
const MAP_H  = 1920;   // natural size of the office_map.png
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
};

// ── PreloadScene ──────────────────────────────────────────────────────────────
export class PreloadScene extends Phaser.Scene {
  constructor() { super({ key: "PreloadScene" }); }

  preload() {
    // Load the office map image
    this.load.image("officeMap", "/office_map.png");
  }

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
      duration: 900,
      ease: "Cubic.easeInOut",
      onUpdate: (t) => { fill.width = 320 * t.progress; },
      onComplete: () => this.scene.start("GameScene"),
    });
  }
}

// ── GameScene ─────────────────────────────────────────────────────────────────
export class GameScene extends Phaser.Scene {
  private ws!: WebSocket;
  private sessionId = "";
  private spaceId   = "";

  private player!:      Phaser.GameObjects.Container;
  private playerName  = "";
  private px = MAP_W / 2;
  private py = MAP_H / 2;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!:    Record<string, Phaser.Input.Keyboard.Key>;

  private others: Map<string, RemotePlayer> = new Map();
  private nearbyPlayers: Set<string> = new Set();
  private tickCount = 0;

  constructor() { super({ key: "GameScene" }); }

  // ── Preload ────────────────────────────────────────────────────────────────
  preload() {
    this.load.image("officeMap", "/office_map.png");
  }

  init(d: { name?: string; spaceId?: string }) {
    this.playerName = d.name ?? "You";
    this.spaceId    = d.spaceId ?? "space_1";
    this.others.clear();
    this.nearbyPlayers.clear();
    this.tickCount = 0;
    this.sessionId = "";
    this.px = MAP_W / 2;
    this.py = MAP_H / 2;
  }

  create() {
    // ── World bounds ────────────────────────────────────────────────────────
    this.cameras.main.setBounds(0, 0, MAP_W, MAP_H);

    // ── Background: the rendered office map image ───────────────────────────
    const map = this.add.image(0, 0, "officeMap").setOrigin(0, 0);
    // Scale to fill the world
    map.setScale(MAP_W / map.width, MAP_H / map.height);
    map.setDepth(0);

    // ── Dark overlay to deepen the atmosphere ──────────────────────────────
    const overlay = this.add.rectangle(0, 0, MAP_W, MAP_H, 0x0a0f1a, 0.22).setOrigin(0, 0).setDepth(1);

    // ── Room labels (floating above the image) ─────────────────────────────
    this.addRoomLabels();

    // ── Neon accent lines (room dividers, corridors) ───────────────────────
    this.addNeonAccents();

    // ── Player ─────────────────────────────────────────────────────────────
    this.buildPlayer();

    // ── Input ───────────────────────────────────────────────────────────────
    this.setupInput();

    // ── WebSocket ───────────────────────────────────────────────────────────
    this.connectWS();

    // ── Camera ─────────────────────────────────────────────────────────────
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.5);

    this.updateHUD(`⚡ ${this.playerName} · ${this.spaceId}`);
  }

  // ── Room labels ────────────────────────────────────────────────────────────
  private addRoomLabels() {
    const labelStyle = {
      fontSize: "11px",
      color: "#38bdf8",
      fontFamily: "monospace",
      backgroundColor: "#0f172acc",
      padding: { x: 6, y: 3 },
    };

    const labels: [number, number, string][] = [
      [230,  80,  "📋  Conference Room"],
      [760,  80,  "🎤  All-Hands Hall"],
      [1300, 80,  "📋  Board Room"],
      [80,   520, "🔍  Focus Zone"],
      [760,  540, "☕  Lounge & Kitchen"],
      [1500, 440, "📋  Meeting Room"],
      [100,  880, "🖥️  Engineering Bay"],
      [850,  1280,"🎨  Product & Design"],
    ];

    labels.forEach(([x, y, text]) => {
      this.add.text(x, y, text, labelStyle).setDepth(5).setAlpha(0.88);
    });
  }

  // ── Neon accent lines ──────────────────────────────────────────────────────
  private addNeonAccents() {
    const g = this.add.graphics().setDepth(3);

    // Subtle neon corridor lines
    g.lineStyle(2, C.neonBlue, 0.2);
    // Vertical corridor
    g.lineBetween(MAP_W / 2, 0, MAP_W / 2, MAP_H);
    // Horizontal corridor
    g.lineBetween(0, MAP_H / 2, MAP_W, MAP_H / 2);
    // Outer border glow
    g.lineStyle(4, C.neonPurple, 0.5);
    g.strokeRect(4, 4, MAP_W - 8, MAP_H - 8);
  }

  // ── Avatar builder ─────────────────────────────────────────────────────────
  private makeAvatar(name: string, primary: number, secondary: number): Phaser.GameObjects.Container {
    const c = this.add.container(0, 0);

    // shadow blob
    const shadow = this.add.ellipse(0, 16, 26, 8, 0x000000, 0.4);

    // glow ring
    const glow = this.add.graphics();
    glow.fillStyle(primary, 0.18);
    glow.fillCircle(0, 0, 20);

    // body
    const body = this.add.graphics();
    // legs / feet
    body.fillStyle(0x1e293b);
    body.fillRoundedRect(-8, 7,  7, 10, 3);
    body.fillRoundedRect(1,  7,  7, 10, 3);
    // torso
    body.fillStyle(secondary);
    body.fillRoundedRect(-10, -5, 20, 16, 6);
    // collar triangle
    body.fillStyle(primary);
    body.fillTriangle(-4, -5, 4, -5, 0, 2);
    // head skin
    body.fillStyle(0xfbbf24);
    body.fillCircle(0, -16, 11);
    // hair
    body.fillStyle(0x1e293b);
    body.fillRoundedRect(-11, -27, 22, 13, 6);
    // eyes
    body.fillStyle(0x0f172a);
    body.fillCircle(-4, -16, 2.2);
    body.fillCircle(4,  -16, 2.2);
    // smile
    body.fillStyle(0x78350f);
    body.fillRoundedRect(-3, -11, 6, 2, 1);

    // name badge
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

  // ── Player ─────────────────────────────────────────────────────────────────
  private buildPlayer() {
    this.player = this.makeAvatar(this.playerName, C.neonBlue, 0x1e40af);
    this.player.setPosition(this.px, this.py);
    this.player.setDepth(20);
  }

  // ── Remote player helpers ──────────────────────────────────────────────────
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
    container.setPosition(MAP_W / 2, MAP_H / 2 - 100);
    container.setDepth(19);
    this.others.set(sessionId, { container, nameTag: sessionId });
  }

  // ── Input ─────────────────────────────────────────────────────────────────
  private setupInput() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      up:    this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down:  this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left:  this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  // ── WebSocket ─────────────────────────────────────────────────────────────
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

  // ── Update loop ────────────────────────────────────────────────────────────
  update() {
    let dx = 0, dy = 0;

    if (this.cursors.left.isDown  || this.wasd.left.isDown)  dx = -SPEED;
    if (this.cursors.right.isDown || this.wasd.right.isDown) dx =  SPEED;
    if (this.cursors.up.isDown    || this.wasd.up.isDown)    dy = -SPEED;
    if (this.cursors.down.isDown  || this.wasd.down.isDown)  dy =  SPEED;

    if (dx || dy) {
      this.px = Phaser.Math.Clamp(this.px + dx, 40, MAP_W - 40);
      this.py = Phaser.Math.Clamp(this.py + dy, 40, MAP_H - 40);
      this.player.setPosition(this.px, this.py);

      this.tickCount++;
      if (this.tickCount % 3 === 0 && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "MOVE", dx, dy }));
      }
    }
  }

  // ── HUD helpers ────────────────────────────────────────────────────────────
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
