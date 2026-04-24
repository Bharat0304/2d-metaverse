"use client";

import './vortex.css';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LandingPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');

    const go = (path: string) => router.push(path);

    return (
        <div className="vx">
            {/* CHECKER BG */}
            <div className="checker"></div>

            {/* NAV */}
            <nav className="site-nav">
                <div className="logo" onClick={() => go('/')}>
                    <span>V</span><span>O</span><span>R</span><span>T</span><span>E</span><span>X</span>
                </div>
                <ul className="nav-links">
                    <li><a href="#gameplay">GAMEPLAY</a></li>
                    <li><a href="#features">FEATURES</a></li>
                    <li><a href="#worlds">WORLDS</a></li>
                    <li><a href="#leaderboard">RANKS</a></li>
                </ul>
                <div className="nav-r">
                    <div className="hearts">
                        <div className="h"></div><div className="h"></div><div className="h"></div>
                    </div>
                    <button className="nbtn nbtn-log" onClick={() => go('/login')}>LOG IN</button>
                    <button className="nbtn nbtn-play" onClick={() => go('/dashboard')}>▶ PLAY FREE</button>
                </div>
            </nav>

            {/* ═══ HERO ═══ */}
            <section className="hero">
                <div className="hero-shapes">
                    <div className="sh sh1"></div><div className="sh sh2"></div><div className="sh sh3"></div>
                    <div className="sh sh4"></div><div className="sh sh5"></div><div className="sh sh6"></div>
                </div>
                <div className="hero-c">
                    <div className="eyebrow">
                        <div className="blink"></div>OPEN BETA — PLAY FREE NOW<div className="blink"></div>
                    </div>
                    <div className="title-row">
                        <div className="tl tl-v">V</div><div className="tl tl-o">O</div><div className="tl tl-r">R</div>
                        <div className="tl tl-t">T</div><div className="tl tl-e">E</div><div className="tl tl-x">X</div>
                    </div>
                    <p className="hero-sub">▶ FPV METAVERSE · WALK · TALK · BUILD · DOMINATE ◀</p>
                    <p className="hero-desc">
                        A pixel-perfect multiplayer world where your avatar is always live.<br />
                        Like Gather Town or ZEP — but built for real gamers.
                    </p>
                    <div className="hero-btns">
                        <button className="pbtn pb-r" onClick={() => go('/dashboard')}>▶ PLAY FREE</button>
                        <button className="pbtn pb-y" onClick={() => go('/dashboard')}>★ BUILD WORLD</button>
                        <button className="pbtn pb-g">◈ WATCH TRAILER</button>
                        <button className="pbtn pb-p" onClick={() => go('/login')}>↩ LOG IN</button>
                    </div>
                    <div className="stat-strip">
                        <div className="ss">
                            <div className="ss-bar" style={{ background: 'var(--red)' }}></div>
                            <span className="ss-n" style={{ color: 'var(--red)' }}>24,891</span>
                            <span className="ss-l">ONLINE NOW</span>
                        </div>
                        <div className="ss">
                            <div className="ss-bar" style={{ background: 'var(--green)' }}></div>
                            <span className="ss-n" style={{ color: 'var(--green)' }}>183</span>
                            <span className="ss-l">WORLDS LIVE</span>
                        </div>
                        <div className="ss">
                            <div className="ss-bar" style={{ background: 'var(--blue)' }}></div>
                            <span className="ss-n" style={{ color: 'var(--blue)' }}>8ms</span>
                            <span className="ss-l">AVG PING</span>
                        </div>
                        <div className="ss">
                            <div className="ss-bar" style={{ background: 'var(--purple)' }}></div>
                            <span className="ss-n" style={{ color: 'var(--purple)' }}>LV.99</span>
                            <span className="ss-l">MAX RANK</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* MARQUEE 1 */}
            <div className="mq mq1"><div className="mqi">
                <span>★ SPATIAL AUDIO</span><span className="sep"> /// </span>
                <span>▶ 24K ONLINE</span><span className="sep"> /// </span>
                <span>⚡ 8MS PING</span><span className="sep"> /// </span>
                <span>★ FPV AVATAR</span><span className="sep"> /// </span>
                <span>▶ BUILD FREE</span><span className="sep"> /// </span>
                <span>⚡ PROXIMITY VOICE</span><span className="sep"> /// </span>
                <span>★ MINI-GAMES</span><span className="sep"> /// </span>
                <span>★ SPATIAL AUDIO</span><span className="sep"> /// </span>
                <span>▶ 24K ONLINE</span><span className="sep"> /// </span>
                <span>⚡ 8MS PING</span><span className="sep"> /// </span>
                <span>★ FPV AVATAR</span><span className="sep"> /// </span>
                <span>▶ BUILD FREE</span><span className="sep"> /// </span>
                <span>⚡ PROXIMITY VOICE</span><span className="sep"> /// </span>
                <span>★ MINI-GAMES</span><span className="sep"> /// </span>
            </div></div>

            {/* ═══ MAP / GAMEPLAY ═══ */}
            <section className="sec map-sec" id="gameplay">
                <span className="stag" style={{ color: 'var(--purple)' }}>// GAMEPLAY</span>
                <div className="stitle">NAVIGATE YOUR <em style={{ color: 'var(--red)' }}>PIXEL WORLD</em></div>
                <div className="map-grid">
                    <div className="pmap">
                        <div className="pm-h" style={{ background: 'var(--purple)' }}>
                            <span className="pm-ht">▶ WORLD MAP — VORTEX-01</span>
                            <div className="pm-dots">
                                <div className="pd" style={{ background: 'var(--red)' }}></div>
                                <div className="pd" style={{ background: 'var(--yellow)' }}></div>
                                <div className="pd" style={{ background: 'var(--green)' }}></div>
                            </div>
                        </div>
                        <div className="pm-g">
                            <div className="rm">LOBBY</div>
                            <div className="rm hub" style={{ position: 'relative' }}>
                                HUB<br />
                                <span style={{ fontSize: '5px', fontFamily: 'var(--mn)', opacity: .6 }}>MAIN PLAZA</span>
                                <div className="ava av1"></div><div className="ava av2"></div>
                            </div>
                            <div className="rm yw">★ EVENT</div>
                            <div className="rm">SPAWN</div>
                            <div className="rm cy" style={{ position: 'relative' }}>VOICE<div className="ava av3"></div></div>
                            <div className="rm bl">ARENA</div>
                            <div className="rm">SHOP</div>
                            <div className="rm">GALLERY</div>
                            <div className="rm">OFFICE</div>
                            <div className="rm">STAGE</div>
                            <div className="rm">LOUNGE</div>
                            <div className="rm">LAB</div>
                            <div className="rm cy">SCREEN</div>
                            <div className="rm">PORTAL</div>
                            <div className="rm yw">CUSTOM</div>
                        </div>
                        <div className="pm-f">
                            <span className="pmi">ZONE: <b>HUB</b></span>
                            <span className="pmi">PLAYERS: <b>3/50</b></span>
                            <span className="pmi">PING: <b>8ms</b></span>
                            <span className="pmi">WORLD: <b>VX-01</b></span>
                        </div>
                    </div>
                    <div className="map-info">
                        <h3>WALK AROUND.<br />TALK TO PEOPLE.<br />MAKE THINGS HAPPEN.</h3>
                        <p>Move your pixel avatar in real-time, trigger voice by proximity, build the world your way. Gather Town meets your favourite shooter.</p>
                        <div className="frow"><span className="fb" style={{ background: 'var(--red)' }}>▸</span>Proximity voice — hear people as you approach</div>
                        <div className="frow"><span className="fb" style={{ background: 'var(--green)' }}>▸</span>FPV toggle — switch to first-person camera</div>
                        <div className="frow"><span className="fb" style={{ background: 'var(--blue)' }}>▸</span>Tile-based world builder, drag-and-drop objects</div>
                        <div className="frow"><span className="fb" style={{ background: 'var(--purple)' }}>▸</span>Screen share, whiteboards, interactive objects</div>
                        <div className="frow"><span className="fb" style={{ background: 'var(--pink)' }}>▸</span>Private rooms, portals, spawn zones, event stages</div>
                        <div className="frow"><span className="fb" style={{ background: 'var(--yellow)', color: 'var(--ink)' }}>▸</span>Emoji reactions, status bubbles, avatar emotes</div>
                        <div style={{ marginTop: '24px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <button className="pbtn pb-p" style={{ fontSize: '7px', padding: '10px 16px' }} onClick={() => go('/dashboard')}>▶ TRY MAP</button>
                            <button className="pbtn pb-w" style={{ fontSize: '7px', padding: '10px 16px' }}>◈ DOCS</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* MARQUEE 2 */}
            <div className="mq mq2"><div className="mqi">
                <span>◈ SCREEN SHARE</span><span className="sep"> /// </span>
                <span>★ WORLD BUILDER</span><span className="sep"> /// </span>
                <span>◈ PRIVATE ROOMS</span><span className="sep"> /// </span>
                <span>★ AVATAR SKINS</span><span className="sep"> /// </span>
                <span>◈ LIVE EVENTS</span><span className="sep"> /// </span>
                <span>★ LEADERBOARDS</span><span className="sep"> /// </span>
                <span>◈ SCREEN SHARE</span><span className="sep"> /// </span>
                <span>★ WORLD BUILDER</span><span className="sep"> /// </span>
                <span>◈ PRIVATE ROOMS</span><span className="sep"> /// </span>
                <span>★ AVATAR SKINS</span><span className="sep"> /// </span>
                <span>◈ LIVE EVENTS</span><span className="sep"> /// </span>
                <span>★ LEADERBOARDS</span><span className="sep"> /// </span>
            </div></div>

            {/* ═══ FEATURES ═══ */}
            <section className="sec feat-sec" id="features">
                <span className="stag" style={{ color: 'var(--blue)' }}>// POWER-UPS</span>
                <div className="stitle">CORE <em style={{ color: 'var(--blue)' }}>SYSTEMS</em> UNLOCKED</div>
                <div className="feat-grid">
                    <div className="fc"><div className="fc-t" style={{ background: 'var(--red)' }}></div><div className="fc-n">01 //</div><span className="fc-i">🎧</span><div className="fc-nm">SPATIAL AUDIO</div><div className="fc-tx">3D positional sound — voices fade with distance. Multiple zones, music layers, proximity whisper.</div></div>
                    <div className="fc"><div className="fc-t" style={{ background: 'var(--green)' }}></div><div className="fc-n">02 //</div><span className="fc-i">🕹️</span><div className="fc-nm">FPV CONTROL</div><div className="fc-tx">WASD movement, sprint, collision detection, FPV camera toggle. Built for speed, presence.</div></div>
                    <div className="fc"><div className="fc-t" style={{ background: 'var(--yellow)' }}></div><div className="fc-n">03 //</div><span className="fc-i">🏗️</span><div className="fc-nm">WORLD BUILDER</div><div className="fc-tx">Tile editor with objects, spawn logic, portals, event zones. Zero code required.</div></div>
                    <div className="fc"><div className="fc-t" style={{ background: 'var(--blue)' }}></div><div className="fc-n">04 //</div><span className="fc-i">⚡</span><div className="fc-nm">LOW-LATENCY SYNC</div><div className="fc-tx">WebSocket multiplayer at sub-12ms. Avatar syncs across every client instantly.</div></div>
                    <div className="fc"><div className="fc-t" style={{ background: 'var(--pink)' }}></div><div className="fc-n">05 //</div><span className="fc-i">🎮</span><div className="fc-nm">MINI-GAMES</div><div className="fc-tx">Drop trivia, chess, pixel art or custom games directly on the tile grid.</div></div>
                    <div className="fc"><div className="fc-t" style={{ background: 'var(--purple)' }}></div><div className="fc-n">06 //</div><span className="fc-i">🔐</span><div className="fc-nm">PRIVATE ZONES</div><div className="fc-tx">Passcode rooms, invite portals, role-based access per zone. Full VIP event control.</div></div>
                </div>
            </section>

            {/* ═══ WORLDS ═══ */}
            <section className="sec world-sec" id="worlds">
                <span className="stag" style={{ color: 'var(--pink)' }}>// SELECT STAGE</span>
                <div className="stitle">CHOOSE YOUR <em style={{ color: 'var(--pink)' }}>ARENA</em></div>
                <div className="world-grid">
                    <div className="wc" onClick={() => go('/dashboard')}><div className="wt wt1"><span className="wt-ico">⚔️</span></div><div className="wb"><div className="wc-tag">COMBAT ZONE</div><div className="wc-nm">BATTLE ARENA</div><div className="wc-bot"><div className="wc-pl">● 1,240 online</div><span className="pill" style={{ background: 'var(--red)', color: '#fff' }}>PVP</span></div></div></div>
                    <div className="wc" onClick={() => go('/dashboard')}><div className="wt wt2"><span className="wt-ico">💼</span></div><div className="wb"><div className="wc-tag">PRODUCTIVITY</div><div className="wc-nm">OFFICE SPACE</div><div className="wc-bot"><div className="wc-pl">● 892 online</div><span className="pill" style={{ background: 'var(--green)', color: 'var(--ink)' }}>WORK</span></div></div></div>
                    <div className="wc" onClick={() => go('/dashboard')}><div className="wt wt3"><span className="wt-ico">🎉</span></div><div className="wb"><div className="wc-tag">SOCIAL HUB</div><div className="wc-nm">HANGOUT ZONE</div><div className="wc-bot"><div className="wc-pl">● 3,107 online</div><span className="pill" style={{ background: 'var(--pink)', color: '#fff' }}>SOCIAL</span></div></div></div>
                    <div className="wc" onClick={() => go('/dashboard')}><div className="wt wt4"><span className="wt-ico">📚</span></div><div className="wb"><div className="wc-tag">EDUCATION</div><div className="wc-nm">CAMPUS</div><div className="wc-bot"><div className="wc-pl">● 440 online</div><span className="pill" style={{ background: 'var(--blue)', color: '#fff' }}>EDU</span></div></div></div>
                    <div className="wc" onClick={() => go('/dashboard')}><div className="wt wt5"><span className="wt-ico">🎵</span></div><div className="wb"><div className="wc-tag">LIVE EVENT</div><div className="wc-nm">CONCERT HALL</div><div className="wc-bot"><div className="wc-pl">● 5,600 online</div><span className="pill" style={{ background: 'var(--orange)', color: '#fff' }}>LIVE</span></div></div></div>
                    <div className="wc" onClick={() => go('/dashboard')}><div className="wt wt6"><span className="wt-ico" style={{ color: '#bbb', fontSize: '28px' }}>+</span></div><div className="wb"><div className="wc-tag">YOURS TO MAKE</div><div className="wc-nm">BUILD CUSTOM</div><div className="wc-bot"><div className="wc-pl">★ Start free →</div><span className="pill" style={{ background: 'var(--yellow)', color: 'var(--ink)' }}>FREE</span></div></div></div>
                </div>
            </section>

            {/* ═══ HOW IT WORKS ═══ */}
            <section className="sec how-sec">
                <span className="stag" style={{ color: 'var(--green)' }}>// PROTOCOL</span>
                <div className="stitle">SPAWN IN <em style={{ color: 'var(--green)' }}>4 STEPS</em></div>
                <div className="steps">
                    <div className="step"><div className="step-top" style={{ background: 'var(--red)' }}></div><div className="step-n" style={{ color: 'var(--red)' }}>01</div><div className="step-nm">CREATE ACCOUNT</div><div className="step-d">Sign up free. Pick your username and base avatar skin in seconds.</div></div>
                    <div className="step"><div className="step-top" style={{ background: 'var(--yellow)' }}></div><div className="step-n" style={{ color: 'var(--yellow)' }}>02</div><div className="step-nm">PICK A WORLD</div><div className="step-d">Browse servers, join via invite link, or spin up your own world in 30s.</div></div>
                    <div className="step"><div className="step-top" style={{ background: 'var(--green)' }}></div><div className="step-n" style={{ color: 'var(--green)' }}>03</div><div className="step-nm">SPAWN AVATAR</div><div className="step-d">Enter the world. Walk, talk, interact. Proximity voice activates instantly.</div></div>
                    <div className="step"><div className="step-top" style={{ background: 'var(--purple)' }}></div><div className="step-n" style={{ color: 'var(--purple)' }}>04</div><div className="step-nm">BUILD &amp; OWN</div><div className="step-d">Customize tiles, drop objects, invite your crew. Your world, your rules.</div></div>
                </div>
            </section>

            {/* ═══ LEADERBOARD + EVENTS ═══ */}
            <section className="sec lb-sec" id="leaderboard">
                <span className="stag" style={{ color: 'var(--yellow)' }}>// LIVE DATA</span>
                <div className="stitle">LEADERBOARD &amp; <em style={{ color: 'var(--yellow)' }}>EVENTS</em></div>
                <div className="lb-grid">
                    <div className="lb-box">
                        <div className="lb-hd" style={{ background: 'var(--purple)' }}><span className="lb-ht">★ TOP PLAYERS</span><span className="lb-lv" style={{ color: 'var(--yellow)' }}>● LIVE</span></div>
                        <div className="lb-rw"><div className="lb-rk" style={{ color: 'var(--yellow)' }}>01</div><div className="lb-av" style={{ background: '#fff9e6' }}>XJ</div><div className="lb-nm">XEON_J</div><div className="lb-bw"><div className="lb-bf" style={{ width: '100%', background: 'var(--red)' }}></div></div><div className="lb-sc" style={{ color: 'var(--red)' }}>99,421</div></div>
                        <div className="lb-rw"><div className="lb-rk" style={{ color: '#aaa' }}>02</div><div className="lb-av" style={{ background: '#eafff8' }}>PX</div><div className="lb-nm">PIXELWOLF</div><div className="lb-bw"><div className="lb-bf" style={{ width: '86%', background: 'var(--green)' }}></div></div><div className="lb-sc" style={{ color: 'var(--green)' }}>85,200</div></div>
                        <div className="lb-rw"><div className="lb-rk" style={{ color: 'var(--pink)' }}>03</div><div className="lb-av" style={{ background: '#ffedf5' }}>N7</div><div className="lb-nm">NULL_7</div><div className="lb-bw"><div className="lb-bf" style={{ width: '74%', background: 'var(--pink)' }}></div></div><div className="lb-sc" style={{ color: 'var(--pink)' }}>73,050</div></div>
                        <div className="lb-rw"><div className="lb-rk" style={{ color: 'var(--dim)' }}>04</div><div className="lb-av" style={{ background: '#e6f4ff' }}>VR</div><div className="lb-nm">VORTEX_R</div><div className="lb-bw"><div className="lb-bf" style={{ width: '61%', background: 'var(--blue)' }}></div></div><div className="lb-sc" style={{ color: 'var(--blue)' }}>60,880</div></div>
                        <div className="lb-rw"><div className="lb-rk" style={{ color: 'var(--dim)' }}>05</div><div className="lb-av" style={{ background: '#f5eeff' }}>GX</div><div className="lb-nm">GHOST_X</div><div className="lb-bw"><div className="lb-bf" style={{ width: '50%', background: 'var(--purple)' }}></div></div><div className="lb-sc" style={{ color: 'var(--purple)' }}>49,200</div></div>
                        <div className="lb-rw" style={{ borderBottom: 'none' }}><div className="lb-rk" style={{ color: 'var(--dim)' }}>06</div><div className="lb-av" style={{ background: '#fff9e6' }}>M0</div><div className="lb-nm">MOCHI_0</div><div className="lb-bw"><div className="lb-bf" style={{ width: '40%', background: 'var(--yellow)' }}></div></div><div className="lb-sc" style={{ color: 'var(--orange)' }}>40,510</div></div>
                    </div>
                    <div className="lb-box">
                        <div className="ev-hd" style={{ background: 'var(--yellow)' }}><span className="ev-ht" style={{ color: 'var(--ink)' }}>⚡ LIVE EVENTS &amp; SCHEDULE</span></div>
                        <div className="ev-rw"><div className="ev-dot ev-live" style={{ background: 'var(--red)' }}></div><div className="ev-nm">BATTLE ROYALE — ARENA-01</div><span className="ev-bg" style={{ background: 'var(--red)', color: '#fff' }}>LIVE</span></div>
                        <div className="ev-rw"><div className="ev-dot ev-live" style={{ background: 'var(--pink)' }}></div><div className="ev-nm">PIXEL ART CONTEST</div><span className="ev-bg" style={{ background: 'var(--pink)', color: '#fff' }}>LIVE</span></div>
                        <div className="ev-rw"><div className="ev-dot" style={{ background: 'var(--green)' }}></div><div className="ev-nm">TEAM DEATHMATCH</div><span className="ev-bg" style={{ background: 'var(--green)', color: 'var(--ink)' }}>IN 2H</span></div>
                        <div className="ev-rw"><div className="ev-dot" style={{ background: 'var(--blue)' }}></div><div className="ev-nm">VORTEX CONCERT — HALL C</div><span className="ev-bg" style={{ background: 'var(--blue)', color: '#fff' }}>IN 4H</span></div>
                        <div className="ev-rw"><div className="ev-dot" style={{ background: 'var(--purple)' }}></div><div className="ev-nm">WORLD BUILDER SHOWDOWN</div><span className="ev-bg" style={{ background: 'var(--purple)', color: '#fff' }}>TOMORROW</span></div>
                        <div className="ev-rw" style={{ borderBottom: 'none' }}><div className="ev-dot" style={{ background: '#e0e0e0' }}></div><div className="ev-nm" style={{ color: '#bbb' }}>TRIVIA NIGHT — LOBBY-02</div><span className="ev-bg" style={{ background: '#eee', color: '#aaa' }}>ENDED</span></div>
                        <div className="ev-ft">
                            <button className="pbtn pb-y" style={{ width: '100%', fontSize: '7px', padding: '10px' }} onClick={() => go('/login')}>▶ VIEW ALL EVENTS</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ CTA ═══ */}
            <section className="cta-sec">
                <div className="cta-grad"></div><div className="cta-dots"></div>
                <div className="cta-c">
                    <div className="cta-tl">READY PLAYER ONE?<br />YOUR WORLD AWAITS.</div>
                    <p className="cta-sb">FREE TO START · NO DOWNLOAD · RUNS IN BROWSER</p>
                    <div className="cta-row">
                        <input className="cta-inp" type="text" placeholder="ENTER YOUR USERNAME..." value={username} onChange={e => setUsername(e.target.value)} />
                        <button className="cta-b" onClick={() => go('/dashboard')}>▶ SPAWN IN</button>
                    </div>
                    <p className="cta-nt">// NO CREDIT CARD · FREE FOREVER FOR PUBLIC WORLDS</p>
                </div>
            </section>

            {/* FOOTER */}
            <footer>
                <div className="ft-logo"><span>V</span><span>O</span><span>R</span><span>T</span><span>E</span><span>X</span></div>
                <ul className="ft-links">
                    <li><a href="#">DOCS</a></li><li><a href="#">API</a></li>
                    <li><a href="#">DISCORD</a></li><li><a href="#">GITHUB</a></li>
                    <li><a href="#">CAREERS</a></li><li><a href="#">PRIVACY</a></li>
                </ul>
                <div className="ft-cp">© 2026 VORTEX METAVERSE — v2.4.1</div>
            </footer>
        </div>
    );
}
