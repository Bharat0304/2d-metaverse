"use client";

import '../vortex.css';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
    const router = useRouter();
    const [remember, setRemember] = useState(true);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        router.push('/dashboard');
    };

    return (
        <div className="vx">
            <div className="checker"></div>

            {/* NAV */}
            <nav className="site-nav">
                <div className="logo" onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
                    <span>V</span><span>O</span><span>R</span><span>T</span><span>E</span><span>X</span>
                </div>
                <ul className="nav-links">
                    <li><a href="/">HOME</a></li>
                    <li><a href="/#gameplay">GAMEPLAY</a></li>
                    <li><a href="/#worlds">WORLDS</a></li>
                    <li><a href="/#leaderboard">RANKS</a></li>
                </ul>
                <div className="nav-r">
                    <div className="hearts">
                        <div className="h"></div><div className="h"></div><div className="h"></div>
                    </div>
                    <button className="nbtn nbtn-log" onClick={() => router.push('/login')}>LOG IN</button>
                    <button className="nbtn nbtn-play" onClick={() => router.push('/dashboard')}>▶ PLAY FREE</button>
                </div>
            </nav>

            {/* AUTH WRAP */}
            <div className="auth-wrap">
                <div className="auth-left login-left">
                    <div className="auth-shapes">
                        <div className="ash ash1"></div><div className="ash ash2"></div>
                        <div className="ash ash3"></div><div className="ash ash4"></div><div className="ash ash5"></div>
                    </div>
                    <div className="auth-brand">
                        <div className="auth-logo-row">
                            <div className="al tl-v">V</div><div className="al tl-o">O</div><div className="al tl-r">R</div>
                            <div className="al tl-t">T</div><div className="al tl-e">E</div><div className="al tl-x">X</div>
                        </div>
                        <p className="auth-tagline">▶ FPV METAVERSE · PLAY FREE ◀</p>
                        <p className="auth-desc">Welcome back, player. Your world is waiting — jump back in and keep building.</p>
                        <div className="auth-perks">
                            <div className="perk"><span className="perk-ico">🎧</span><span className="perk-txt">SPATIAL AUDIO ACTIVE</span></div>
                            <div className="perk"><span className="perk-ico">⚡</span><span className="perk-txt">8MS LOW-LATENCY SYNC</span></div>
                            <div className="perk"><span className="perk-ico">🏗️</span><span className="perk-txt">YOUR WORLDS ARE SAVED</span></div>
                            <div className="perk"><span className="perk-ico">★</span><span className="perk-txt">RANK PROGRESS PRESERVED</span></div>
                        </div>
                    </div>
                </div>

                <div className="auth-right">
                    <div className="auth-form-wrap">
                        <div className="auth-form-title">WELCOME BACK</div>
                        <p className="auth-form-sub">Log in to continue your adventure</p>

                        <div className="social-btns">
                            <button className="soc-btn"><span className="soc-ico">G</span><span style={{ fontFamily: 'var(--px)', fontSize: '6px' }}>GOOGLE</span></button>
                            <button className="soc-btn"><span className="soc-ico">D</span><span style={{ fontFamily: 'var(--px)', fontSize: '6px' }}>DISCORD</span></button>
                        </div>

                        <div className="divider">
                            <div className="div-line"></div><span className="div-txt">OR LOGIN WITH EMAIL</span><div className="div-line"></div>
                        </div>

                        <form onSubmit={handleLogin}>
                            <div className="form-grp">
                                <label className="form-lbl">USERNAME / EMAIL</label>
                                <input className="form-inp" type="text" placeholder="xeon_player@vortex.gg" />
                            </div>
                            <div className="form-grp">
                                <label className="form-lbl">PASSWORD</label>
                                <input className="form-inp" type="password" placeholder="••••••••••" />
                            </div>
                            <a href="#" className="form-forgot">FORGOT PASSWORD?</a>

                            <div className="form-check">
                                <input type="checkbox" id="rem" checked={remember} onChange={e => setRemember(e.target.checked)} />
                                <label htmlFor="rem" className="form-check-lbl">Remember me on this device</label>
                            </div>

                            <button type="submit" className="form-submit" style={{ background: 'var(--purple)' }}>▶ LOG IN</button>
                        </form>

                        <div className="switch-link">
                            DON&apos;T HAVE AN ACCOUNT?{' '}
                            <a onClick={() => router.push('/signup')} style={{ cursor: 'pointer' }}>CREATE ONE FREE</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
