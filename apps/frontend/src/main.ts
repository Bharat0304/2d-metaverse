import './styles/global.css';
import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';
import { WSClient } from './ws/WSClient';

const WS_URL = 'ws://localhost:8080';

// ── DOM handles ──────────────────────────────────────────────
const loginScreen   = document.getElementById('login-screen')!;
const gameContainer = document.getElementById('game-container')!;
const connectBtn    = document.getElementById('connect-btn')     as HTMLButtonElement;
const nameInput     = document.getElementById('display-name')    as HTMLInputElement;
const spaceInput    = document.getElementById('space-id')        as HTMLInputElement;
const statusText    = document.getElementById('status-text')!;
const errorText     = document.getElementById('error-text')!;
const starField     = document.getElementById('star-field')!;

// ── Generate animated star field ─────────────────────────────
function buildStars(count = 140) {
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const size = Math.random() * 2.5 + 0.5;
    star.style.cssText = `
      left:   ${Math.random() * 100}%;
      top:    ${Math.random() * 100}%;
      width:  ${size}px;
      height: ${size}px;
      --dur:  ${(Math.random() * 4 + 2).toFixed(1)}s;
      --delay:${(Math.random() * 4).toFixed(1)}s;
    `;
    starField.appendChild(star);
  }
}
buildStars();

// ── Phaser Game instance ─────────────────────────────────────
let phaserGame: Phaser.Game | null = null;

function launchGame(spaceId: string, displayName: string) {
  phaserGame?.destroy(true);

  phaserGame = new Phaser.Game({
    type:            Phaser.AUTO,
    parent:          'phaser-canvas',
    backgroundColor: '#05050f',
    scale: {
      mode:   Phaser.Scale.RESIZE,
      width:  '100%',
      height: '100%',
    },
    physics: {
      default: 'arcade',
      arcade:  { debug: false },
    },
    scene: [GameScene],
  });

  // Pass spaceId + displayName once the game is ready
  phaserGame.events.once(Phaser.Core.Events.READY, () => {
    phaserGame!.scene.start('GameScene', { spaceId, displayName });
  });
}

// ── Connect flow ─────────────────────────────────────────────
connectBtn.addEventListener('click', async () => {
  const spaceId     = spaceInput.value.trim();
  const displayName = nameInput.value.trim() || 'Explorer';

  // Validate
  if (!spaceId) {
    showError('Please enter a Space ID.');
    return;
  }

  setConnecting(true);

  try {
    const ws = WSClient.getInstance();
    await ws.connect(WS_URL);

    // Transition: fade out login → show game
    statusText.textContent = '✓ Connected! Loading world…';

    loginScreen.style.animation = 'fadeOut 0.45s ease forwards';
    setTimeout(() => {
      loginScreen.style.display = 'none';
      gameContainer.style.display = 'block';
      launchGame(spaceId, displayName);
    }, 460);

  } catch {
    showError('Could not connect — is the WebSocket server running on port 8080?');
    setConnecting(false);
  }
});

// Allow Enter key on both inputs
[nameInput, spaceInput].forEach(el => {
  el.addEventListener('keydown', e => {
    if (e.key === 'Enter') connectBtn.click();
  });
});

// ── Helpers ───────────────────────────────────────────────────
function setConnecting(state: boolean) {
  connectBtn.disabled = state;
  statusText.textContent = state ? '🔗 Connecting to server…' : '';
  errorText.style.display = 'none';
}

function showError(msg: string) {
  errorText.textContent = msg;
  errorText.style.display = 'block';
  statusText.textContent  = '';
}
