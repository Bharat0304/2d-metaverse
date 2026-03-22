import Phaser from 'phaser';
import { WSClient } from '../ws/WSClient';

// ── Constants ──────────────────────────────────────────────────
const MAP_W = 1000;
const MAP_H = 1000;
const TILE  = 32;
const PROXIMITY_RADIUS = 100;
const MOVE_STEP        = 32;       // pixels sent to server per keypress
const MOVE_INTERVAL_MS = 120;      // throttle: max moves per second ≈ 8

// Colors assigned to remote players (deep palette)
const PALETTE = [
  0x8b5cf6, 0xec4899, 0x14b8a6, 0xf59e0b,
  0xef4444, 0x3b82f6, 0x22c55e, 0xf97316,
];

// ── Types ──────────────────────────────────────────────────────
interface RemotePlayer {
  sessionId:    string;
  x:            number;
  y:            number;
  targetX:      number;
  targetY:      number;
  color:        number;
  glow:         Phaser.GameObjects.Arc;
  circle:       Phaser.GameObjects.Arc;
  nameTag:      Phaser.GameObjects.Text;
  proxRing:     Phaser.GameObjects.Arc;
  isNearby:     boolean;
}

// ── Scene ──────────────────────────────────────────────────────
export class GameScene extends Phaser.Scene {

  // Local player visuals
  private lpGlow!:    Phaser.GameObjects.Arc;
  private lpCircle!:  Phaser.GameObjects.Arc;
  private lpTag!:     Phaser.GameObjects.Text;
  private lpRing!:    Phaser.GameObjects.Arc;
  private lpX = MAP_W / 2;
  private lpY = MAP_H / 2 + 180;

  // ID assigned by server
  private mySessionId = '';
  private displayName = '';
  private spaceId     = '';

  // Remote players
  private players = new Map<string, RemotePlayer>();
  private colorIdx = 0;

  // Input
  private keys!: {
    up:    Phaser.Input.Keyboard.Key;
    down:  Phaser.Input.Keyboard.Key;
    left:  Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    w:     Phaser.Input.Keyboard.Key;
    s:     Phaser.Input.Keyboard.Key;
    a:     Phaser.Input.Keyboard.Key;
    d:     Phaser.Input.Keyboard.Key;
  };
  private moveTimer = 0;

  // WS reference
  private ws = WSClient.getInstance();

  constructor() {
    super({ key: 'GameScene' });
  }

  // Data is passed in from main.ts via scene.start(key, data)
  init(data: { spaceId: string; displayName: string }) {
    this.spaceId     = data.spaceId;
    this.displayName = data.displayName || 'Explorer';
  }

  // ── Create ────────────────────────────────────────────────
  create() {
    this.cameras.main.setBounds(0, 0, MAP_W, MAP_H);

    this.buildMap();
    this.buildLocalPlayer();
    this.setupKeys();
    this.setupWS();
    this.showHUD();

    // Follow local player smoothly
    this.cameras.main.startFollow(this.lpCircle, true, 0.08, 0.08);

    // Tell server we're joining
    this.ws.joinSpace(this.spaceId);
  }

  // ── Map / World ───────────────────────────────────────────
  private buildMap() {
    // Deep-space background
    this.add.rectangle(MAP_W / 2, MAP_H / 2, MAP_W, MAP_H, 0x05050f).setDepth(0);

    // Grid
    const grid = this.add.graphics().setDepth(1);
    grid.lineStyle(1, 0x12123a, 0.6);
    for (let x = 0; x <= MAP_W; x += TILE) {
      grid.moveTo(x, 0).lineTo(x, MAP_H);
    }
    for (let y = 0; y <= MAP_H; y += TILE) {
      grid.moveTo(0, y).lineTo(MAP_W, y);
    }
    grid.strokePath();

    this.buildDecor();
  }

  private buildDecor() {
    const g = this.add.graphics().setDepth(2);
    const cx = MAP_W / 2;
    const cy = MAP_H / 2;

    // ── Main conference zone ──
    // Table
    g.fillStyle(0x151530, 1);
    g.fillRoundedRect(cx - 110, cy - 55, 220, 110, 14);
    g.lineStyle(2, 0x6366f1, 0.45);
    g.strokeRoundedRect(cx - 110, cy - 55, 220, 110, 14);

    // Chairs
    const chairs = [
      [cx - 60, cy - 85], [cx, cy - 85], [cx + 60, cy - 85],
      [cx - 60, cy + 85], [cx, cy + 85], [cx + 60, cy + 85],
      [cx - 140, cy - 32], [cx - 140, cy + 32],
      [cx + 140, cy - 32], [cx + 140, cy + 32],
    ];
    for (const [x, y] of chairs) {
      g.fillStyle(0x1e1e4a, 1);
      g.fillRoundedRect((x ?? 0) - 13, (y ?? 0) - 13, 26, 26, 5);
      g.lineStyle(1.5, 0x8b5cf6, 0.5);
      g.strokeRoundedRect((x ?? 0) - 13, (y ?? 0) - 13, 26, 26, 5);
    }

    // Table label
    this.add.text(cx, cy, 'CONF ROOM', {
      fontSize: '9px',
      color: '#4f46e5',
      fontFamily: 'Orbitron, monospace',
      letterSpacing: 2,
    }).setOrigin(0.5).setDepth(3).setAlpha(0.7);

    // ── Lounge area (top-left of center) ──
    const lx = cx - 240;
    const ly = cy - 160;
    // Sofa
    g.fillStyle(0x1c1c3a, 1);
    g.fillRoundedRect(lx - 60, ly - 20, 120, 40, 10);
    g.lineStyle(1.5, 0x22d3ee, 0.3);
    g.strokeRoundedRect(lx - 60, ly - 20, 120, 40, 10);
    g.fillStyle(0x152233, 1);
    g.fillRoundedRect(lx - 30, ly + 22, 60, 16, 5); // coffee table

    // ── Plants (corners of center zone) ──
    this.plant(g, cx - 280, cy - 280);
    this.plant(g, cx + 280, cy - 280);
    this.plant(g, cx - 280, cy + 280);
    this.plant(g, cx + 280, cy + 280);

    // ── Water cooler ──
    g.fillStyle(0x0ea5e9, 0.85);
    g.fillRoundedRect(cx + 220, cy - 220, 22, 36, 5);
    g.fillStyle(0x7dd3fc, 0.4);
    g.fillEllipse(cx + 231, cy - 220, 14, 8);

    // ── Room boundary ──
    g.lineStyle(1, 0x1e2a4a, 0.5);
    g.strokeRect(cx - 320, cy - 320, 640, 640);

    // Zone label
    this.add.text(cx, cy - 305, 'Main Space', {
      fontSize: '10px',
      color: '#334155',
      fontFamily: 'Inter, sans-serif',
      letterSpacing: 1,
    }).setOrigin(0.5).setDepth(3);
  }

  private plant(g: Phaser.GameObjects.Graphics, x: number, y: number) {
    // Pot
    g.fillStyle(0x7c3b1e, 1);
    g.fillRect(x - 6, y + 8, 12, 10);
    // Leaves
    g.fillStyle(0x14532d, 1);
    g.fillCircle(x, y, 14);
    g.fillStyle(0x16a34a, 0.85);
    g.fillCircle(x - 6, y - 6, 9);
    g.fillCircle(x + 7, y - 4, 9);
    g.fillCircle(x, y + 5, 8);
  }

  // ── Local Player ──────────────────────────────────────────
  private buildLocalPlayer() {
    const x = this.lpX;
    const y = this.lpY;

    // Outer glow
    this.lpGlow = this.add.arc(x, y, 28, 0, 360, false, 0x6366f1, 0.12).setDepth(5);
    // Proximity ring
    this.lpRing = this.add.arc(x, y, PROXIMITY_RADIUS, 0, 360, false, 0x6366f1, 0.0).setDepth(4);
    this.lpRing.setStrokeStyle(1, 0x6366f1, 0.25);
    // Body
    this.lpCircle = this.add.arc(x, y, 18, 0, 360, false, 0x6366f1, 1).setDepth(6);
    this.lpCircle.setStrokeStyle(2.5, 0xa5b4fc, 1);
    // Name tag
    this.lpTag = this.add.text(x, y - 30, this.displayName, {
      fontSize: '12px',
      fontFamily: 'Inter, sans-serif',
      color: '#e2e8f0',
      backgroundColor: '#1e1b4b',
      padding: { x: 7, y: 3 },
    }).setOrigin(0.5, 1).setDepth(7);

    // Pulse the glow forever
    this.tweens.add({
      targets:   this.lpGlow,
      scaleX:    1.5,
      scaleY:    1.5,
      alpha:     0.04,
      duration:  1800,
      yoyo:      true,
      repeat:    -1,
      ease:      'Sine.InOut',
    });
  }

  private moveLocalPlayerTo(x: number, y: number) {
    this.lpX = x;
    this.lpY = y;
    this.lpCircle.setPosition(x, y);
    this.lpGlow.setPosition(x, y);
    this.lpTag.setPosition(x, y - 30);
    this.lpRing.setPosition(x, y);
  }

  // ── Remote Players ────────────────────────────────────────
  private spawnRemotePlayer(sessionId: string, x: number, y: number): RemotePlayer {
    const color = PALETTE[this.colorIdx % PALETTE.length] ?? 0x8b5cf6;
    this.colorIdx++;

    const glow    = this.add.arc(x, y, 28, 0, 360, false, color, 0.08).setDepth(5);
    const proxRing = this.add.arc(x, y, PROXIMITY_RADIUS, 0, 360, false, color, 0.0).setDepth(4);
    proxRing.setStrokeStyle(1.5, color, 0);
    const circle  = this.add.arc(x, y, 18, 0, 360, false, color, 1).setDepth(6);
    circle.setStrokeStyle(2, Phaser.Display.Color.IntegerToColor(color).lighten(25).color, 1);
    const nameTag = this.add.text(x, y - 30, sessionId.slice(0, 7), {
      fontSize: '11px',
      fontFamily: 'Inter, sans-serif',
      color: '#94a3b8',
      backgroundColor: '#0f172a',
      padding: { x: 5, y: 2 },
    }).setOrigin(0.5, 1).setDepth(7);

    return { sessionId, x, y, targetX: x, targetY: y, color, glow, circle, nameTag, proxRing, isNearby: false };
  }

  private destroyRemotePlayer(p: RemotePlayer) {
    p.glow.destroy();
    p.circle.destroy();
    p.nameTag.destroy();
    p.proxRing.destroy();
  }

  private updateRemotePlayerPosition(p: RemotePlayer) {
    p.circle.setPosition(p.x, p.y);
    p.glow.setPosition(p.x, p.y);
    p.nameTag.setPosition(p.x, p.y - 30);
    p.proxRing.setPosition(p.x, p.y);
  }

  // ── WebSocket Handlers ────────────────────────────────────
  private setupWS() {

    // ① Server assigned us a sessionId
    this.ws.on('JOINED_SPACE', (msg) => {
      this.mySessionId = msg['sessionId'] as string;
      this.ws.sessionId = this.mySessionId;
      this.lpTag.setText(this.displayName);
      this.updateHUDSession();
    });

    // ② Full roster of users currently in the space
    this.ws.on('SPACE_USERS', (msg) => {
      const ids = msg['users'] as string[];
      const myId = this.mySessionId;

      // Spawn any new players we haven't seen yet
      for (const id of ids) {
        if (id === myId) continue;
        if (!this.players.has(id)) {
          const p = this.spawnRemotePlayer(id, MAP_W / 2, MAP_H / 2);
          this.players.set(id, p);
        }
      }

      // Remove players who left
      for (const [id, p] of this.players) {
        if (!ids.includes(id)) {
          this.destroyRemotePlayer(p);
          this.players.delete(id);
        }
      }

      this.updateHUDCount();
      this.updateProximityPanel();
    });

    // ③ Someone moved — both us (server correction) and others
    this.ws.on('PLAYER_MOVED', (msg) => {
      const id = msg['sessionId'] as string;
      const sx = msg['x'] as number;
      const sy = msg['y'] as number;

      if (id === this.mySessionId) {
        // Server authoritative correction of our own position
        this.moveLocalPlayerTo(sx, sy);
        return;
      }

      // Spawn if we've not seen this player yet (can happen after reconnect)
      if (!this.players.has(id)) {
        const p = this.spawnRemotePlayer(id, sx, sy);
        this.players.set(id, p);
      }

      const p = this.players.get(id)!;
      p.targetX = sx;
      p.targetY = sy;
    });

    // ④ Proximity enter
    this.ws.on('PROXIMITY_ENTER', (msg) => {
      const otherId = msg['with'] as string;
      const p = this.players.get(otherId);
      if (!p) return;

      p.isNearby = true;
      // Fade in proximity ring
      this.tweens.add({
        targets:  p.proxRing,
        alpha:    0.18,
        duration: 300,
        ease:     'Power2',
        onComplete: () => p.proxRing.setStrokeStyle(1.5, p.color, 0.55),
      });
      this.toast(`🟢 ${p.sessionId.slice(0, 7)} entered your radius`, 'enter');
      this.updateProximityPanel();
    });

    // ⑤ Proximity leave
    this.ws.on('PROXIMITY_LEAVE', (msg) => {
      const otherId = msg['with'] as string;
      const p = this.players.get(otherId);
      if (!p) return;

      p.isNearby = false;
      this.tweens.add({
        targets:  p.proxRing,
        alpha:    0,
        duration: 300,
        ease:     'Power2',
        onComplete: () => p.proxRing.setStrokeStyle(1.5, p.color, 0),
      });
      this.toast(`🔴 ${p.sessionId.slice(0, 7)} left your radius`, 'leave');
      this.updateProximityPanel();
    });

    // ⑥ Disconnected
    this.ws.on('DISCONNECTED', () => {
      this.toast('⚠️ Disconnected from server', 'leave');
    });

    // ⑦ Error
    this.ws.on('ERROR', (msg) => {
      this.toast(`❌ ${msg['message'] as string}`, 'leave');
    });
  }

  // ── Keys ──────────────────────────────────────────────────
  private setupKeys() {
    const kb = this.input.keyboard!;
    this.keys = {
      up:    kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      left:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      w:     kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      s:     kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      a:     kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      d:     kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  // ── Update Loop ───────────────────────────────────────────
  update(_time: number, delta: number) {
    this.handleMovement(delta);
    this.interpolateRemotePlayers();
  }

  private handleMovement(delta: number) {
    this.moveTimer += delta;
    if (this.moveTimer < MOVE_INTERVAL_MS) return;
    this.moveTimer = 0;

    const { up, down, left, right, w, s, a, d } = this.keys;
    let dx = 0;
    let dy = 0;

    if (left.isDown  || a.isDown) dx = -MOVE_STEP;
    if (right.isDown || d.isDown) dx =  MOVE_STEP;
    if (up.isDown    || w.isDown) dy = -MOVE_STEP;
    if (down.isDown  || s.isDown) dy =  MOVE_STEP;

    if (dx === 0 && dy === 0) return;

    // Client-side prediction — move immediately, server will confirm/correct
    const nx = Phaser.Math.Clamp(this.lpX + dx, 0, MAP_W);
    const ny = Phaser.Math.Clamp(this.lpY + dy, 0, MAP_H);
    this.moveLocalPlayerTo(nx, ny);

    // Inform server
    this.ws.move(dx, dy);
  }

  private interpolateRemotePlayers() {
    for (const p of this.players.values()) {
      // Smooth lerp toward server position
      p.x = Phaser.Math.Linear(p.x, p.targetX, 0.18);
      p.y = Phaser.Math.Linear(p.y, p.targetY, 0.18);
      this.updateRemotePlayerPosition(p);
    }
  }

  // ── HUD & Toast ───────────────────────────────────────────
  private showHUD() {
    const hud      = document.getElementById('hud');
    const proxPanel = document.getElementById('proximity-panel');
    const controls  = document.getElementById('controls-hint');

    if (hud)       hud.style.display       = 'block';
    if (proxPanel) proxPanel.style.display = 'block';
    if (controls)  controls.style.display  = 'block';

    const spaceEl = document.getElementById('space-name');
    if (spaceEl) spaceEl.textContent = this.spaceId.slice(0, 16) + '…';
  }

  private updateHUDCount() {
    const el = document.getElementById('player-count');
    if (el) el.textContent = `${this.players.size + 1} online`;
  }

  private updateHUDSession() {
    const el = document.getElementById('my-session');
    if (el) el.textContent = this.mySessionId.slice(0, 8);

    const spaceEl = document.getElementById('space-name');
    if (spaceEl) spaceEl.textContent = this.spaceId.slice(0, 18);
  }

  private updateProximityPanel() {
    const el = document.getElementById('nearby-users');
    if (!el) return;

    const nearby = [...this.players.values()].filter(p => p.isNearby);

    if (nearby.length === 0) {
      el.innerHTML = '<span class="no-nearby">No one nearby</span>';
    } else {
      el.innerHTML = nearby.map(p =>
        `<div class="nearby-player">
          <span class="nearby-dot" style="background:#${p.color.toString(16).padStart(6,'0')};box-shadow:0 0 8px #${p.color.toString(16).padStart(6,'0')}"></span>
          <span>${p.sessionId.slice(0, 8)}</span>
        </div>`
      ).join('');
    }
  }

  private toast(text: string, type: 'enter' | 'leave') {
    const el = document.getElementById('notif-toast');
    if (!el) return;
    el.textContent = text;
    el.className = `show ${type}`;
    setTimeout(() => { el.className = ''; }, 2800);
  }
}
