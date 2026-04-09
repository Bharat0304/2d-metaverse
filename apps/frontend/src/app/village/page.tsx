"use client";

import { useState, useEffect, useRef } from 'react';
import '../dashboard/dashboard.css'; // Reuse the base dashboard styles
import './village.css'; // Add village-specific overrides
import { useRouter } from 'next/navigation';

export default function VillageDashboard() {
  const router = useRouter();
  const [activePage, setActivePage] = useState('dash');
  const [mapDetails, setMapDetails] = useState({ name: 'SERENE VILLAGE', players: 18 });
  const [chatMsg, setChatMsg] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { ava: '🦊', name: 'PIXELWOLF', txt: 'the new village looks amazing! 🌿', mine: false, nameColor: 'var(--village-green)' },
    { ava: '🧙', name: 'MOCHI_0', txt: 'did you find the hidden well?', mine: false, nameColor: 'var(--village-brown)' },
    { ava: '🤖', name: 'YOU', txt: 'checking the market right now', mine: true, nameColor: 'var(--village-teal)' },
  ]);
  const [popup, setPopup] = useState({ show: false, name: '', desc: '', players: 0, color: '', left: 0, top: 0 });
  const chatMsgsRef = useRef<HTMLDivElement>(null);

  // Positions for village-themed avatar animation
  const positions = [
    [{ l: 150, t: 150 }, { l: 200, t: 180 }, { l: 150, t: 250 }, { l: 150, t: 150 }],
    [{ l: 400, t: 100 }, { l: 450, t: 150 }, { l: 400, t: 100 }],
    [{ l: 550, t: 120 }, { l: 500, t: 200 }, { l: 600, t: 280 }, { l: 550, t: 120 }],
    [{ l: 300, t: 300 }, { l: 350, t: 350 }, { l: 300, t: 450 }, { l: 300, t: 300 }],
  ];
  const [paPositions, setPaPositions] = useState(positions.map(p => p[0]));

  useEffect(() => {
    // Only import and start Phaser once
    if (typeof window !== "undefined" && !((window as any).game)) {
      import("../../game/main").then(({ startGame }) => {
        const game = startGame("game-container", "village");
        
        // Wait for Bootstrap to init network, then join room
        const checkNetwork = setInterval(() => {
          const bootstrap = game.scene.getScene('bootstrap') as any;
          if (bootstrap && bootstrap.network) {
            clearInterval(checkNetwork);
            bootstrap.network.joinOrCreatePublicRoom("Villager_" + Math.floor(Math.random() * 100), "nancy");
          }
        }, 100);
      });
    }
  }, []);

  useEffect(() => {
    if (chatMsgsRef.current) {
      chatMsgsRef.current.scrollTop = chatMsgsRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const showPage = (id: string) => {
    setActivePage(id);
    window.scrollTo(0, 0);
  };

  const openRoomPopup = (e: React.MouseEvent, name: string, desc: string, players: number, color: string) => {
    const el = e.currentTarget as HTMLElement;
    const canvas = document.getElementById('map-canvas');
    if (!canvas) return;

    let left = el.offsetLeft + el.offsetWidth + 8;
    let top = el.offsetTop;
    if (left + 220 > canvas.offsetWidth) left = el.offsetLeft - 228;

    setPopup({ show: true, name, desc, players, color, left, top });
  };

  const closePopup = () => setPopup(prev => ({ ...prev, show: false }));

  const sendChat = () => {
    if (!chatMsg.trim()) return;
    setChatHistory(prev => [
      ...prev,
      { ava: '🤖', name: 'YOU', txt: chatMsg, mine: true, nameColor: 'var(--village-teal)' }
    ]);
    setChatMsg('');
  };

  const enterVillageGame = () => {
    setActivePage('map');
  };

  return (
    <div className="dashboard-container village-theme">
      <div className="checker"></div>

      {/* PERMANENT GAME CONTAINER (Always in DOM) */}
      <div 
        id="game-container" 
        style={{ 
          position: 'fixed', 
          inset: 0, 
          zIndex: activePage === 'map' ? 5 : -1,
          visibility: activePage === 'map' ? 'visible' : 'hidden',
          backgroundColor: '#000'
        }}
      ></div>

      {/* DASHBOARD PAGE */}
      <div id="page-dash" className={`page ${activePage === 'dash' ? 'active' : ''}`}>
        <div className="app">
          {/* SIDEBAR */}
          <aside className="sidebar">
            <div className="sb-logo">
              <div className="sb-logo-txt"><span>S</span><span>E</span><span>R</span><span>E</span><span>N</span><span>E</span></div>
            </div>
            <div className="sb-player">
              <div className="sp-ava">🌿</div>
              <div>
                <div className="sp-name">VILLAGER_J</div>
                <div className="sp-rank">★ EXPLORER · LV.12</div>
              </div>
            </div>
            <nav className="sb-nav">
              <div className="sb-section">WORLD</div>
              <div className="sb-link active">
                <span className="sb-ico">🏡</span>
                <span className="sb-txt">MY VILLAGE</span>
              </div>
              <div className="sb-link">
                <span className="sb-ico">🗺️</span>
                <span className="sb-txt">EXPEDITION</span>
              </div>
              <div className="sb-link">
                <span className="sb-ico">🧺</span>
                <span className="sb-txt">MARKET</span>
                <span className="sb-badge" style={{ background: 'var(--village-accent)', color: 'var(--ink)' }}>2</span>
              </div>
              <div className="sb-section">COMMUNITY</div>
              <div className="sb-link">
                <span className="sb-ico">👥</span>
                <span className="sb-txt">TRIBE</span>
              </div>
              <div className="sb-link">
                <span className="sb-ico">🏆</span>
                <span className="sb-txt">HONORARY</span>
              </div>
            </nav>
            <div className="sb-footer">
              <button className="sb-lp-btn" onClick={() => router.push('/dashboard')}>← MAIN HUB</button>
            </div>
          </aside>

          {/* MAIN */}
          <div className="main">
            <div className="topbar">
              <div className="tb-title">SERENE VILLAGE <span>// OVERVIEW</span></div>
              <div className="tb-right">
                <button className="tb-btn" style={{ background: 'var(--village-green)', color: '#fff' }} onClick={enterVillageGame}>▶ ENTER VILLAGE</button>
                <div style={{ width: '32px', height: '32px', border: '2px solid var(--ink)', background: 'var(--village-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', cursor: 'pointer' }}>🌿</div>
              </div>
            </div>

            <div className="dash-body">
              {/* WELCOME BANNER */}
              <div className="welcome-banner village-banner">
                <div className="wb-dots"></div>
                <div className="wb-c">
                  <div className="wb-tag">▶ STATUS: PEACEFUL</div>
                  <div className="wb-title">WELCOME TO THE REVAMPED VILLAGE! 🌳</div>
                  <div className="wb-sub">A serene place to build, trade and interact with nature.</div>
                </div>
                <div className="wb-btns">
                  <button className="wb-btn wb-btn-y" onClick={() => showPage('map')}>▶ VIEW MAP</button>
                  <button className="wb-btn wb-btn-w" onClick={enterVillageGame}>⚡ SPAWN IN</button>
                </div>
              </div>

              {/* STAT CARDS */}
              <div className="stat-row">
                <div className="stat-card">
                  <div className="sc-stripe" style={{ background: 'var(--village-green)' }}></div>
                  <span className="sc-ico">🌳</span>
                  <span className="sc-val">42</span>
                  <span className="sc-lbl">TREES PLANTED</span>
                </div>
                <div className="stat-card">
                  <div className="sc-stripe" style={{ background: 'var(--village-teal)' }}></div>
                  <span className="sc-ico">🏠</span>
                  <span className="sc-val">12</span>
                  <span className="sc-lbl">BUILDINGS</span>
                </div>
                <div className="stat-card">
                  <div className="sc-stripe" style={{ background: 'var(--village-brown)' }}></div>
                  <span className="sc-ico">🧺</span>
                  <span className="sc-val">1.2k</span>
                  <span className="sc-lbl">VILLAGE COINS</span>
                </div>
                <div className="stat-card">
                  <div className="sc-stripe" style={{ background: 'var(--village-accent)' }}></div>
                  <span className="sc-ico">✨</span>
                  <span className="sc-val">#08</span>
                  <span className="sc-lbl">VILLAGE RANK</span>
                </div>
              </div>

              {/* MAP CARDS */}
              <div className="sec-hdr">
                <div className="sec-hdr-l">
                  <span className="sec-hdr-tag">★ FEATURED ZONES</span>
                </div>
              </div>

              <div className="maps-grid">
                <div className="map-card" onClick={() => showPage('map')}>
                  <div className="mc-thumb village-bg-1">
                    <div className="mc-badge" style={{ background: 'var(--village-green)', color: '#fff' }}>HUB</div>
                  </div>
                  <div className="mc-body">
                    <div className="mc-name">VILLAGE SQUARE</div>
                    <div className="mc-desc">The heart of the village. Meet explorers and trade items.</div>
                    <button className="mc-enter-btn" style={{ background: 'var(--village-green)', color: '#fff' }}>EXPLORE →</button>
                  </div>
                </div>
                <div className="map-card" onClick={() => showPage('map')}>
                  <div className="mc-thumb village-bg-2">
                    <div className="mc-badge" style={{ background: 'var(--village-teal)', color: '#fff' }}>WATER</div>
                  </div>
                  <div className="mc-body">
                    <div className="mc-name">CRYSTAL LAKE</div>
                    <div className="mc-desc">A peaceful fishing spot with proximity voice enabled.</div>
                    <button className="mc-enter-btn" style={{ background: 'var(--village-teal)', color: '#fff' }}>EXPLORE →</button>
                  </div>
                </div>
                <div className="map-card mc-create">
                  <div className="mc-create-ico">🌿</div>
                  <div className="mc-create-txt">NEW ZONE COMING SOON</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAP PAGE */}
      <div id="page-map" className={`page ${activePage === 'map' ? 'active' : ''}`}>
        <div className="app">
          <aside className="sidebar">
            <div className="sb-logo"><div className="sb-logo-txt"><span>S</span><span>E</span><span>R</span><span>E</span><span>N</span><span>E</span></div></div>
            <div className="sb-footer"><button className="sb-lp-btn" onClick={() => showPage('dash')}>← BACK</button></div>
          </aside>

          <div className="main" style={{ position: 'relative' }}>
            <div className="map-topbar village-topbar">
              <div className="mt-back" onClick={() => showPage('dash')}>← BACK</div>
              <div className="mt-world-name">{mapDetails.name}</div>
              <div className="mt-zone">📍 VILLAGE SQUARE</div>
              <div className="mt-spacer"></div>
              <div className="mt-stat"><span>PLAYERS</span><b>{mapDetails.players}/50</b></div>
              <button className="mt-btn" style={{ background: 'var(--village-green)', color: '#fff' }} onClick={enterVillageGame}>▶ JOIN GAME</button>
            </div>

            <div className="map-canvas-wrap village-canvas-wrap" id="map-canvas" style={{ padding: 0 }}>
              {/* The game-container is now fixed but we keep this div for layout/ref */}
              <div style={{ width: '100%', height: '100%', background: 'transparent' }}></div>
              
              {popup.show && (
                <div className="room-popup" style={{ display: 'block', left: popup.left, top: popup.top }}>
                  <div className="rp-close" onClick={closePopup}>✕</div>
                  <div className="rp-hdr">{popup.name}</div>
                  <div className="rp-sub">{popup.desc}</div>
                  <button className="rp-btn" style={{ background: popup.color, color: '#fff' }} onClick={closePopup}>▶ DISMISS</button>
                </div>
              )}
            </div>

            <div className="map-right">
              <div className="mr-section" style={{ paddingTop: '62px' }}>
                <div className="mr-hdr">VILLAGERS ONLINE <span className="mr-hdr-tag">18/50</span></div>
                <PlayerRow ava="🚶" name="VILLAGER_J (YOU)" zone="SQUARE" bg="#f0fff4" color="var(--village-green)" status="var(--village-green)" />
                <PlayerRow ava="🦊" name="PIXELWOLF" zone="DOCK" bg="#fffde7" status="var(--village-green)" />
              </div>

              <div className="chat-area mr-section" style={{ borderBottom: 'none' }}>
                <div className="mr-hdr">VILLAGE CHAT</div>
                <div className="chat-msgs" ref={chatMsgsRef}>
                  {chatHistory.map((m, i) => (
                    <div key={i} className="chat-msg" style={{ flexDirection: m.mine ? 'row-reverse' : 'row' }}>
                      <div className="cm-ava" style={{ background: m.mine ? '#f0fff4' : '', borderColor: m.mine ? 'var(--village-green)' : '' }}>{m.ava}</div>
                      <div className="cm-body" style={{ textAlign: m.mine ? 'right' : 'left' }}>
                        <div className="cm-name" style={{ color: m.nameColor }}>{m.name}</div>
                        <div className={`cm-txt ${m.mine ? 'mine' : ''}`}>{m.txt}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="chat-input-row">
                  <input className="chat-inp" type="text" placeholder="Whisper to village..." value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} />
                  <button className="chat-send" style={{ background: 'var(--village-green)' }} onClick={sendChat}>▶</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
interface RoomProps {
  icon: string;
  name: string;
  players: number;
  left: number;
  top: number;
  width: number;
  height: number;
  color?: string;
  onClick: (e: React.MouseEvent) => void;
}

function Room({ icon, name, players, left, top, width, height, color, onClick }: RoomProps) {
  return (
    <div className="world-room village-room" style={{ left, top, width, height, borderColor: color }} onClick={onClick}>
      <span className="wr-ico">{icon}</span>
      <span className="wr-name" style={{ color }}>{name}</span>
      <span className="wr-cnt">{players} players</span>
    </div>
  );
}

interface PlayerAvaProps {
  id: string;
  name: string;
  icon: string;
  color?: string;
  bg: string;
  pos: { l: number; t: number };
}

function PlayerAva({ id, name, icon, color, bg, pos }: PlayerAvaProps) {
  return (
    <div className="player-ava" id={id} style={{ left: pos.l, top: pos.t }}>
      <div className="pa-bubble" style={{ borderColor: color, color }}>{name}</div>
      <div className="pa-sprite" style={{ background: bg, borderColor: color }}>{icon}</div>
    </div>
  );
}

interface PlayerRowProps {
  ava: string;
  name: string;
  zone: string;
  bg: string;
  color?: string;
  status: string;
}

function PlayerRow({ ava, name, zone, bg, color, status }: PlayerRowProps) {
  return (
    <div className="pl-row">
      <div className="pl-ava" style={{ background: bg, borderColor: color }}>{ava}</div>
      <div className="pl-info"><div className="pl-name">{name}</div><div className="pl-zone">{zone}</div></div>
      <div className="pl-status" style={{ background: status }}></div>
    </div>
  );
}
