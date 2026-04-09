"use client";

import { useState, useEffect, useRef } from 'react';
import './dashboard.css';

export default function Dashboard() {
  const [activePage, setActivePage] = useState('dash');
  const [mapDetails, setMapDetails] = useState({ name: 'BATTLE ARENA', players: 28 });
  const [chatMsg, setChatMsg] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { ava: '🦊', name: 'PIXELWOLF', txt: 'yo that battle zone is insane 🔥', mine: false, nameColor: 'var(--green)' },
    { ava: '👾', name: 'NULL_7', txt: 'need more spawn tiles tho', mine: false, nameColor: 'var(--pink)' },
    { ava: '🤖', name: 'YOU', txt: 'working on it rn', mine: true, nameColor: 'var(--purple)' },
    { ava: '🐉', name: 'GHOST_X', txt: 'can someone open the portal?', mine: false, nameColor: 'var(--blue)' },
    { ava: '🧙', name: 'MOCHI_0', txt: 'event stage is 🔥🔥🔥', mine: false, nameColor: 'var(--orange)' },
  ]);
  const [popup, setPopup] = useState({ show: false, name: '', desc: '', players: 0, color: '', left: 0, top: 0 });
  const chatMsgsRef = useRef<HTMLDivElement>(null);

  // Positions for avatar animation
  const positions = [
    [{ l: 175, t: 170 }, { l: 130, t: 200 }, { l: 200, t: 260 }, { l: 175, t: 170 }],
    [{ l: 340, t: 90 }, { l: 380, t: 130 }, { l: 340, t: 90 }],
    [{ l: 520, t: 100 }, { l: 480, t: 150 }, { l: 520, t: 240 }, { l: 520, t: 100 }],
    [{ l: 290, t: 245 }, { l: 350, t: 280 }, { l: 290, t: 380 }, { l: 290, t: 245 }],
  ];
  const [paPositions, setPaPositions] = useState(positions.map(p => p[0]));

  useEffect(() => {
    const intervals = positions.map((posArr, i) => {
      let step = 0;
      return setInterval(() => {
        step = (step + 1) % posArr.length;
        setPaPositions(prev => {
          const next = [...prev];
          next[i] = posArr[step];
          return next;
        });
      }, 3000 + i * 700);
    });

    return () => intervals.forEach(clearInterval);
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

  const enterMap = (name: string, players: number) => {
    setMapDetails({ name, players });
    showPage('map');
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
      { ava: '🤖', name: 'YOU', txt: chatMsg, mine: true, nameColor: 'var(--purple)' }
    ]);
    setChatMsg('');
  };

  return (
    <div className="dashboard-container">
      <div className="checker"></div>

      {/* DASHBOARD PAGE */}
      <div id="page-dash" className={`page ${activePage === 'dash' ? 'active' : ''}`}>
        <div className="app">
          {/* SIDEBAR */}
          <aside className="sidebar">
            <div className="sb-logo">
              <div className="sb-logo-txt"><span>V</span><span>O</span><span>R</span><span>T</span><span>E</span><span>X</span></div>
            </div>
            <div className="sb-player">
              <div className="sp-ava">🤖</div>
              <div>
                <div className="sp-name">XEON_J</div>
                <div className="sp-rank">★ RANK #01 · LV.42</div>
              </div>
            </div>
            <nav className="sb-nav">
              <div className="sb-section">MAIN</div>
              <div className="sb-link active">
                <span className="sb-ico">🗺️</span>
                <span className="sb-txt">MY WORLDS</span>
              </div>
              <div className="sb-link">
                <span className="sb-ico">🔍</span>
                <span className="sb-txt">EXPLORE</span>
              </div>
              <div className="sb-link">
                <span className="sb-ico">⭐</span>
                <span className="sb-txt">FAVOURITES</span>
                <span className="sb-badge" style={{ background: 'var(--yellow)', color: 'var(--ink)' }}>3</span>
              </div>
              <div className="sb-link">
                <span className="sb-ico">📅</span>
                <span className="sb-txt">EVENTS</span>
                <span className="sb-badge" style={{ background: 'var(--red)', color: '#fff' }}>2</span>
              </div>
              <div className="sb-section">PLAYER</div>
              <div className="sb-link">
                <span className="sb-ico">🏆</span>
                <span className="sb-txt">LEADERBOARD</span>
              </div>
              <div className="sb-link">
                <span className="sb-ico">👥</span>
                <span className="sb-txt">FRIENDS</span>
                <span className="sb-badge" style={{ background: 'var(--green)', color: 'var(--ink)' }}>5</span>
              </div>
              <div className="sb-link">
                <span className="sb-ico">🎨</span>
                <span className="sb-txt">AVATAR</span>
              </div>
              <div className="sb-link">
                <span className="sb-ico">🛒</span>
                <span className="sb-txt">SHOP</span>
              </div>
              <div className="sb-section">ACCOUNT</div>
              <div className="sb-link">
                <span className="sb-ico">⚙️</span>
                <span className="sb-txt">SETTINGS</span>
              </div>
              <div className="sb-link">
                <span className="sb-ico">🔔</span>
                <span className="sb-txt">NOTIFICATIONS</span>
                <span className="sb-badge" style={{ background: 'var(--red)', color: '#fff' }}>7</span>
              </div>
            </nav>
            <div className="sb-footer">
              <button className="sb-lp-btn">↩ LOG OUT</button>
            </div>
          </aside>

          {/* MAIN */}
          <div className="main">
            <div className="topbar">
              <div className="tb-title">DASHBOARD <span>// MY WORLDS</span></div>
              <div className="tb-right">
                <input className="tb-search" type="text" placeholder="Search worlds..." />
                <button className="tb-btn" style={{ background: 'var(--green)', color: 'var(--ink)' }}>+ NEW WORLD</button>
                <div className="notif tb-btn" style={{ background: '#fff', fontSize: '16px', padding: '6px 10px' }}>🔔<div className="notif-dot"></div></div>
                <div style={{ width: '32px', height: '32px', border: '2px solid var(--ink)', background: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', cursor: 'pointer' }}>🤖</div>
              </div>
            </div>

            <div className="dash-body">
              {/* WELCOME BANNER */}
              <div className="welcome-banner">
                <div className="wb-dots"></div>
                <div className="wb-c">
                  <div className="wb-tag">▶ PLAYER STATUS: ACTIVE</div>
                  <div className="wb-title">WELCOME BACK, XEON_J! 👾</div>
                  <div className="wb-sub">You have 2 live events and 5 friends online right now.</div>
                </div>
                <div className="wb-btns">
                  <button className="wb-btn wb-btn-y">▶ QUICK SPAWN</button>
                  <button className="wb-btn wb-btn-w">⚡ VIEW EVENTS</button>
                </div>
              </div>

              {/* STAT CARDS */}
              <div className="stat-row">
                <div className="stat-card">
                  <div className="sc-stripe" style={{ background: 'var(--purple)' }}></div>
                  <span className="sc-ico">🗺️</span>
                  <span className="sc-val">6</span>
                  <span className="sc-lbl">MY WORLDS</span>
                  <div className="sc-chg chg-up">▲ +1 this week</div>
                </div>
                <div className="stat-card">
                  <div className="sc-stripe" style={{ background: 'var(--green)' }}></div>
                  <span className="sc-ico">👥</span>
                  <span className="sc-val">5</span>
                  <span className="sc-lbl">FRIENDS ONLINE</span>
                  <div className="sc-chg chg-up">▲ PIXELWOLF just joined</div>
                </div>
                <div className="stat-card">
                  <div className="sc-stripe" style={{ background: 'var(--yellow)' }}></div>
                  <span className="sc-ico">⏱️</span>
                  <span className="sc-val">142h</span>
                  <span className="sc-lbl">TOTAL PLAY TIME</span>
                  <div className="sc-chg chg-up">▲ +3h today</div>
                </div>
                <div className="stat-card">
                  <div className="sc-stripe" style={{ background: 'var(--red)' }}></div>
                  <span className="sc-ico">🏆</span>
                  <span className="sc-val">#01</span>
                  <span className="sc-lbl">GLOBAL RANK</span>
                  <div className="sc-chg" style={{ color: 'var(--yellow)' }}>★ RANK LEADER</div>
                </div>
              </div>

              {/* MY WORLDS */}
              <div className="sec-hdr">
                <div className="sec-hdr-l">
                  <span className="sec-hdr-tag">★ MY WORLDS</span>
                  <span className="sec-hdr-sub">6 worlds · 2 live</span>
                </div>
                <button className="sec-hdr-btn">VIEW ALL →</button>
              </div>

              <div className="maps-grid">
                <WorldCard 
                  name="BATTLE ARENA" players={28} maxPlayers={50} tag="COMBAT" type="PVP" live 
                  desc="My PVP world with custom spawn zones, weapon tiles and ranked matches."
                  color="var(--red)" bg="linear-gradient(135deg,#ffd166,#ff4d6d)"
                  onEnter={() => enterMap('BATTLE ARENA', 28)}
                />
                <WorldCard 
                  name="CHILL OFFICE" players={12} maxPlayers={30} tag="WORK" type="WORK" live 
                  desc="Team workspace with screen share zones, whiteboard rooms and focus areas."
                  color="var(--green)" bg="linear-gradient(135deg,#06d6a0,#118ab2)"
                  onEnter={() => enterMap('CHILL OFFICE', 12)}
                />
                <WorldCard 
                  name="PIXEL LOUNGE" players={44} maxPlayers={100} tag="SOCIAL" type="SOCIAL" 
                  desc="My public hangout world — music zones, chill corners and event stage."
                  color="var(--pink)" bg="linear-gradient(135deg,#f15bb5,#9b5de5)" badge="★ POPULAR"
                  onEnter={() => enterMap('PIXEL LOUNGE', 44)}
                />
                <WorldCard 
                  name="EDU CAMPUS" players={8} maxPlayers={50} tag="EDU" type="EDU" 
                  desc="Lecture halls, quiz zones and breakout rooms for online classes."
                  color="var(--blue)" bg="linear-gradient(135deg,#118ab2,#9b5de5)"
                  onEnter={() => enterMap('EDU CAMPUS', 8)}
                />
                <WorldCard 
                  name="XEON CONCERT" players={890} maxPlayers={1000} tag="EVENT" type="LIVE" live host="DJ_NOVA"
                  desc="The biggest concert world in VORTEX. Stage, VIP zones and crowd areas."
                  color="var(--orange)" bg="linear-gradient(135deg,#ff4d6d,#ff6d00)"
                  onEnter={() => enterMap('XEON CONCERT', 890)}
                />
                <div className="map-card mc-create">
                  <div className="mc-create-ico">+</div>
                  <div className="mc-create-txt">CREATE NEW WORLD<br /><br />FREE FOREVER</div>
                </div>
              </div>

              {/* BOTTOM ROW */}
              <div className="dash-bottom">
                <div className="act-box">
                  <div className="act-hdr">
                    <span className="act-hdr-t">⚡ RECENT ACTIVITY</span>
                    <button className="sec-hdr-btn" style={{ fontSize: '5px', padding: '4px 8px' }}>VIEW ALL</button>
                  </div>
                  <ActivityRow ico="🏆" title="You reached RANK #01" time="2 MINS AGO" badge="RANK UP" bg="#ffedf5" badgeColor="var(--yellow)" />
                  <ActivityRow ico="👥" title="PIXELWOLF joined your world" time="14 MINS AGO" badge="FRIEND" bg="#eafff8" badgeColor="var(--green)" />
                  <ActivityRow ico="🏗️" title="BATTLE ARENA updated" time="1H AGO" badge="BUILD" bg="#f5eeff" badgeColor="var(--purple)" badgeTxt="#fff" />
                  <ActivityRow ico="🎮" title="Won trivia match in LOUNGE" time="3H AGO" badge="WIN" bg="#ffedf5" badgeColor="var(--pink)" badgeTxt="#fff" />
                  <ActivityRow ico="📅" title="Concert event starts in 2h" time="UPCOMING" badge="EVENT" bg="#e6f4ff" badgeColor="var(--blue)" badgeTxt="#fff" last />
                </div>

                <div className="qs-box">
                  <div className="qs-hdr"><div className="qs-hdr-t">📊 PLAYER STATS</div></div>
                  <div className="qs-body">
                    <StatBar label="WORLDS VISITED" val="38 / 50" percent={76} color="var(--purple)" />
                    <StatBar label="EVENTS ATTENDED" val="12 / 20" percent={60} color="var(--yellow)" />
                    <StatBar label="MINI-GAMES WON" val="89%" percent={89} color="var(--green)" />
                    <StatBar label="BUILD SCORE" val="4,820 XP" percent={48} color="var(--blue)" />
                    <div className="mr-hdr" style={{ marginTop: '12px' }}>FRIENDS ONLINE <span className="mr-hdr-tag">5 / 12</span></div>
                    <div className="qs-friends">
                      <FriendCard ava="🦊" name="PIXEL" status="var(--green)" />
                      <FriendCard ava="👾" name="NULL" status="var(--green)" />
                      <FriendCard ava="🧙" name="MOCHI" status="var(--green)" />
                      <FriendCard ava="🐉" name="GHOST" status="var(--yellow)" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAP PAGE */}
      <div id="page-map" className={`page ${activePage === 'map' ? 'active' : ''}`}>
        <div className="app">
          {/* SIDEBAR */}
          <aside className="sidebar">
            <div className="sb-logo"><div className="sb-logo-txt"><span>V</span><span>O</span><span>R</span><span>T</span><span>E</span><span>X</span></div></div>
            <div className="sb-player">
              <div className="sp-ava">🤖</div>
              <div><div className="sp-name">XEON_J</div><div className="sp-rank">★ RANK #01 · LV.42</div></div>
            </div>
            <nav className="sb-nav">
              <div className="sb-section">MAIN</div>
              <div className="sb-link" onClick={() => showPage('dash')}><span className="sb-ico">🗺️</span><span className="sb-txt">MY WORLDS</span></div>
              <div className="sb-link"><span className="sb-ico">🔍</span><span className="sb-txt">EXPLORE</span></div>
              <div className="sb-link"><span className="sb-ico">⭐</span><span className="sb-txt">FAVOURITES</span></div>
              <div className="sb-link"><span className="sb-ico">📅</span><span className="sb-txt">EVENTS</span><span className="sb-badge" style={{ background: 'var(--red)', color: '#fff' }}>2</span></div>
              <div className="sb-section">PLAYER</div>
              <div className="sb-link"><span className="sb-ico">🏆</span><span className="sb-txt">LEADERBOARD</span></div>
              <div className="sb-link"><span className="sb-ico">👥</span><span className="sb-txt">FRIENDS</span><span className="sb-badge" style={{ background: 'var(--green)', color: 'var(--ink)' }}>5</span></div>
            </nav>
            <div className="sb-footer"><button className="sb-lp-btn" onClick={() => showPage('dash')}>← BACK TO DASH</button></div>
          </aside>

          <div className="main" style={{ position: 'relative' }}>
            <div className="map-topbar">
              <div className="mt-back" onClick={() => showPage('dash')}>← BACK</div>
              <div className="mt-world-name">{mapDetails.name}</div>
              <div className="mt-zone">📍 HUB PLAZA</div>
              <div className="mt-spacer"></div>
              <div className="mt-stat"><span>PLAYERS</span><b>{mapDetails.players}/50</b></div>
              <div className="mt-stat"><span>PING</span><b className="mt-ping">8ms</b></div>
              <div className="mt-stat"><span>ZONE</span><b>HUB</b></div>
              <button className="mt-btn" style={{ background: 'var(--yellow)', color: 'var(--ink)' }}>🔧 EDIT</button>
              <button className="mt-btn" style={{ background: 'var(--red)', color: '#fff' }}>⚙ SETTINGS</button>
              <button className="mt-btn" style={{ background: 'var(--purple)', color: '#fff' }}>👥 INVITE</button>
            </div>

            <div className="map-canvas-wrap" id="map-canvas" onClick={(e) => {
              const target = e.target as HTMLElement;
              if (!target.closest('.world-room') && !target.closest('.room-popup')) {
                closePopup();
              }
            }}>
              <div className="map-toolbar">
                <div className="tool-btn sel" title="Move">🚶</div>
                <div className="tool-btn" title="Build">🏗️</div>
                <div className="tool-btn" title="Interact">👆</div>
                <div className="tool-btn" title="Camera">📷</div>
                <div style={{ width: '38px', height: '2px', background: 'var(--ink)', margin: '4px 0' }}></div>
                <div className="tool-btn" title="Emote">😄</div>
                <div className="tool-btn" title="Inventory">🎒</div>
              </div>

              <Room 
                id="room-hub" icon="🏛️" name="HUB PLAZA" players={28} left={120} top={80} width={140} height={90} 
                onClick={(e) => openRoomPopup(e, 'HUB PLAZA', 'The main gathering zone', 28, 'var(--purple)')} 
              />
              <Room 
                icon="⚔️" name="BATTLE ZONE" players={14} left={320} top={60} width={120} height={80} color="var(--red)" bg="#fff5f7" 
                onClick={(e) => openRoomPopup(e, 'BATTLE ZONE', 'FPV combat area', 14, 'var(--red)')} 
              />
              <Room 
                icon="🎧" name="VOICE LOUNGE" players={6} left={500} top={80} width={110} height={80} color="var(--green)" bg="#f0fff8" 
                onClick={(e) => openRoomPopup(e, 'VOICE LOUNGE', 'Proximity audio zone', 6, 'var(--green)')} 
              />
              <Room 
                icon="✨" name="SPAWN POINT" players={0} left={100} top={240} width={110} height={80} color="var(--orange)" bg="#fffbe6" 
                onClick={(e) => openRoomPopup(e, 'SPAWN POINT', 'Entry zone', 0, 'var(--yellow)')} 
              />
              <Room 
                icon="🖥️" name="SCREEN ROOM" players={4} left={280} top={220} width={130} height={80} color="var(--blue)" bg="#e6f4ff" 
                onClick={(e) => openRoomPopup(e, 'SCREEN ROOM', 'Share your screen', 4, 'var(--blue)')} 
              />
              <Room 
                icon="🎵" name="EVENT STAGE" players={12} left={470} top={230} width={120} height={80} color="var(--pink)" bg="#ffedf5" 
                onClick={(e) => openRoomPopup(e, 'EVENT STAGE', 'Live events & shows', 12, 'var(--pink)')} 
              />
              <Room 
                icon="🛒" name="SHOP" players={0} left={160} top={390} width={110} height={75} 
                onClick={(e) => openRoomPopup(e, 'SHOP', 'Buy avatar items', 0, 'var(--orange)')} 
              />
              <Room 
                icon="🎮" name="MINI GAMES" players={8} left={340} top={380} width={120} height={75} color="var(--purple)" bg="#f5eeff" 
                onClick={(e) => openRoomPopup(e, 'MINI GAMES', 'Play embedded games', 8, 'var(--purple)')} 
              />
              <Room 
                icon="🌀" name="PORTAL" players={2} left={510} top={380} width={100} height={75} 
                onClick={(e) => openRoomPopup(e, 'PORTAL', 'Jump to other worlds', 2, 'var(--blue)')} 
              />

              <svg className="room-svg" style={{ position: 'absolute', inset: '48px 0 0 0', width: '100%', height: '100%' }}>
                <line x1="260" y1="125" x2="320" y2="100" stroke="#d4b8f0" strokeWidth="2" strokeDasharray="6,4" />
                <line x1="190" y1="125" x2="190" y2="240" stroke="#d4b8f0" strokeWidth="2" strokeDasharray="6,4" />
                <line x1="380" y1="140" x2="350" y2="220" stroke="#d4b8f0" strokeWidth="2" strokeDasharray="6,4" />
                <line x1="440" y1="100" x2="500" y2="100" stroke="#d4b8f0" strokeWidth="2" strokeDasharray="6,4" />
                <line x1="555" y1="160" x2="530" y2="230" stroke="#d4b8f0" strokeWidth="2" strokeDasharray="6,4" />
                <line x1="215" y1="280" x2="280" y2="270" stroke="#d4b8f0" strokeWidth="2" strokeDasharray="6,4" />
                <line x1="220" y1="310" x2="220" y2="390" stroke="#d4b8f0" strokeWidth="2" strokeDasharray="6,4" />
                <line x1="410" y1="300" x2="400" y2="380" stroke="#d4b8f0" strokeWidth="2" strokeDasharray="6,4" />
                <line x1="530" y1="310" x2="560" y2="380" stroke="#d4b8f0" strokeWidth="2" strokeDasharray="6,4" />
              </svg>

              <PlayerAva id="pa-you" name="YOU" icon="🤖" color="var(--purple)" bg="#f5eeff" pos={paPositions[0]} />
              <PlayerAva id="pa-1" name="PIXELWOLF" icon="🦊" bg="#fff9e6" pos={paPositions[1]} />
              <PlayerAva id="pa-2" name="NULL_7" icon="👾" bg="#ffedf5" pos={paPositions[2]} />
              <PlayerAva id="pa-3" name="GHOST_X" icon="🐉" bg="#e6f4ff" pos={paPositions[3]} />

              {popup.show && (
                <div className="room-popup" style={{ display: 'block', left: popup.left, top: popup.top }}>
                  <div className="rp-close" onClick={closePopup}>✕</div>
                  <div className="rp-hdr">{popup.name}</div>
                  <div className="rp-sub">{popup.desc}</div>
                  <div className="rp-row"><span>PLAYERS</span><b>{popup.players}</b></div>
                  <div className="rp-row"><span>CAPACITY</span><b>50</b></div>
                  <div className="rp-row"><span>AUDIO ZONE</span><b>ENABLED</b></div>
                  <button className="rp-btn" style={{ background: popup.color, color: '#fff' }}>▶ ENTER ROOM</button>
                </div>
              )}

              <div className="minimap">
                <div className="mm-title">MINIMAP</div>
                <div className="mm-grid">
                  <div className="mm-room" style={{ left: '14%', top: '10%', width: '20%', height: '22%' }}></div>
                  <div className="mm-room" style={{ left: '42%', top: '8%', width: '18%', height: '20%' }}></div>
                  <div className="mm-room" style={{ left: '66%', top: '10%', width: '17%', height: '20%' }}></div>
                  <div className="mm-room" style={{ left: '12%', top: '52%', width: '17%', height: '20%' }}></div>
                  <div className="mm-room" style={{ left: '38%', top: '50%', width: '19%', height: '20%' }}></div>
                  <div className="mm-room" style={{ left: '64%', top: '52%', width: '18%', height: '20%' }}></div>
                  <div className="mm-you"></div>
                </div>
              </div>

              <div className="zoom-ctrl">
                <div className="zc-btn">+</div>
                <div className="zc-btn">−</div>
                <div className="zc-btn" title="Reset">⌂</div>
              </div>

              <div className="voice-bar">
                <span className="vb-icon">🎤</span>
                <div className="vb-waves">
                  <div className="vb-w"></div><div className="vb-w"></div><div className="vb-w"></div>
                  <div className="vb-w"></div><div className="vb-w"></div>
                </div>
                <span className="vb-txt">SPATIAL AUDIO: ON</span>
                <button className="vb-mute">MUTE</button>
              </div>
            </div>

            <div className="map-right">
              <div className="mr-section" style={{ paddingTop: '62px' }}>
                <div className="mr-hdr">PLAYERS ONLINE <span className="mr-hdr-tag">{mapDetails.players}/50</span></div>
                <PlayerRow ava="🤖" name="XEON_J (YOU)" zone="HUB PLAZA" bg="#f5eeff" color="var(--purple)" status="var(--green)" />
                <PlayerRow ava="🦊" name="PIXELWOLF" zone="BATTLE ZONE" bg="#fff9e6" status="var(--green)" />
                <PlayerRow ava="👾" name="NULL_7" zone="VOICE LOUNGE" bg="#ffedf5" status="var(--green)" />
                <PlayerRow ava="🐉" name="GHOST_X" zone="SCREEN ROOM" bg="#e6f4ff" status="var(--yellow)" />
                <PlayerRow ava="🧙" name="MOCHI_0" zone="EVENT STAGE" bg="#eafff8" status="var(--green)" />
              </div>

              <div className="chat-area mr-section" style={{ borderBottom: 'none' }}>
                <div className="mr-hdr">WORLD CHAT <span className="mr-hdr-tag">LIVE</span></div>
                <div className="chat-msgs" ref={chatMsgsRef}>
                  {chatHistory.map((m, i) => (
                    <div key={i} className="chat-msg" style={{ flexDirection: m.mine ? 'row-reverse' : 'row' }}>
                      <div className="cm-ava" style={{ background: m.mine ? '#f5eeff' : '', borderColor: m.mine ? 'var(--purple)' : '' }}>{m.ava}</div>
                      <div className="cm-body" style={{ textAlign: m.mine ? 'right' : 'left' }}>
                        <div className="cm-name" style={{ color: m.nameColor }}>{m.name}</div>
                        <div className={`cm-txt ${m.mine ? 'mine' : ''}`}>{m.txt}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="chat-input-row">
                  <input 
                    className="chat-inp" type="text" placeholder="Say something..." 
                    value={chatMsg} onChange={e => setChatMsg(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendChat()}
                  />
                  <button className="chat-send" onClick={sendChat}>▶</button>
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
interface WorldCardProps {
  name: string;
  players: number;
  maxPlayers: number;
  tag: string;
  type: string;
  live?: boolean;
  desc: string;
  color: string;
  bg: string;
  badge?: string;
  host?: string;
  onEnter: () => void;
}

function WorldCard({ name, players, maxPlayers, tag, live, desc, color, bg, badge, host, onEnter }: WorldCardProps) {
  return (
    <div className="map-card" onClick={onEnter}>
      <div className="mc-thumb" style={{ background: bg }}>
        <div className="mc-grid-bg"></div>
        <div className="mc-badge" style={{ background: color, color: '#fff' }}>{tag}</div>
        {live && <div className="mc-live"><div className="mc-live-dot"></div><span className="mc-live-txt">LIVE</span></div>}
        {badge && <div className="mc-own-badge">{badge}</div>}
      </div>
      <div className="mc-body">
        <div className="mc-name">{name}</div>
        <div className="mc-meta">
          <div className="mc-players">
            <div className={`mc-dot-live`} style={{ background: live ? 'var(--green)' : 'var(--dim)' }}></div>
            {players} / {maxPlayers} online
          </div>
          <span className="mc-tag" style={{ background: color, color: '#fff' }}>{tag}</span>
        </div>
        <div className="mc-desc">{desc}</div>
        <div className="mc-footer">
          <span className="mc-host">HOST: {host || 'YOU'}</span>
          <button className="mc-enter-btn" style={{ background: color, color: '#fff' }}>ENTER ▶</button>
        </div>
      </div>
    </div>
  );
}

interface ActivityRowProps {
  ico: string;
  title: string;
  time: string;
  badge: string;
  bg: string;
  badgeColor: string;
  badgeTxt?: string;
  last?: boolean;
}

function ActivityRow({ ico, title, time, badge, bg, badgeColor, badgeTxt, last }: ActivityRowProps) {
  return (
    <div className="act-row" style={{ borderBottom: last ? 'none' : '' }}>
      <div className="act-ico" style={{ background: bg }}>{ico}</div>
      <div className="act-info">
        <div className="act-title">{title}</div>
        <div className="act-time">{time}</div>
      </div>
      <span className="act-badge" style={{ background: badgeColor, color: badgeTxt || 'var(--ink)' }}>{badge}</span>
    </div>
  );
}

interface StatBarProps {
  label: string;
  val: string;
  percent: number;
  color: string;
}

function StatBar({ label, val, percent, color }: StatBarProps) {
  return (
    <div className="qs-row">
      <div className="qs-lbl"><span>{label}</span><span style={{ color: 'var(--ink)' }}>{val}</span></div>
      <div className="qs-bar"><div className="qs-fill" style={{ width: `${percent}%`, background: color }}></div></div>
    </div>
  );
}

interface FriendCardProps {
  ava: string;
  name: string;
  status: string;
}

function FriendCard({ ava, name, status }: FriendCardProps) {
  return (
    <div className="qf">
      <span className="qf-ava">{ava}</span>
      <div className="qf-nm">{name}</div>
      <div className="qf-dot" style={{ background: status }}></div>
    </div>
  );
}

interface RoomProps {
  icon: string;
  name: string;
  players: number;
  left: number;
  top: number;
  width: number;
  height: number;
  color?: string;
  bg?: string;
  onClick: (e: React.MouseEvent) => void;
  id?: string;
}

function Room({ icon, name, players, left, top, width, height, color, bg, onClick, id }: RoomProps) {
  return (
    <div 
      id={id} className="world-room" 
      style={{ left, top, width, height, borderColor: color, background: bg }} 
      onClick={onClick}
    >
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
  pos: { l: number, t: number };
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

