"use client";

import '../vortex.css';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignupPage() {
    const router = useRouter();
    const [selectedAvatar, setSelectedAvatar] = useState(0);
    const [agreed, setAgreed] = useState(false);
    const [password, setPassword] = useState('');
    const [strength, setStrength] = useState(0);

    const avatars = ['🤖', '🦊', '👾', '🧙', '🐉', '💀'];

    const updateStrength = (val: string) => {
        setPassword(val);
        let score = 0;
        if (val.length >= 6) score++;
        if (val.length >= 10) score++;
        if (/[A-Z]/.test(val) && /[0-9]/.test(val)) score++;
        if (/[^A-Za-z0-9]/.test(val)) score++;
        setStrength(score);
    };

    const strengthColors = ['#ff4d6d', '#ffd166', '#06d6a0', '#9b5de5'];
    const barColor = strength > 0 ? strengthColors[Math.min(strength - 1, 3)] : '#f0e8ff';

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        router.push('/game');
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
                    <button className="nbtn nbtn-play" onClick={() => router.push('/signup')}>▶ SIGN UP</button>
                </div>
            </nav>

            {/* AUTH WRAP */}
            <div className="auth-wrap">
                {/* LEFT PANEL */}
                <div className="auth-left signup-left">
                    <div className="auth-shapes">
                        <div className="ash ash1s"></div><div className="ash ash2s"></div>
                        <div className="ash ash3s"></div><div className="ash ash4s"></div>
                    </div>
                    <div className="auth-brand">
                        <div className="auth-logo-row">
                            <div className="al tl-v">V</div><div className="al tl-o">O</div><div className="al tl-r">R</div>
                            <div className="al tl-t">T</div><div className="al tl-e">E</div><div className="al tl-x">X</div>
                        </div>
                        <p className="auth-tagline">▶ JOIN THE METAVERSE FREE ◀</p>
                        <p className="auth-desc">Build worlds, meet players, host events. Your pixel universe starts here — free forever.</p>
                        <div className="auth-perks">
                            <div className="perk"><span className="perk-ico">🌍</span><span className="perk-txt">1 FREE WORLD INSTANTLY</span></div>
                            <div className="perk"><span className="perk-ico">🎨</span><span className="perk-txt">10 AVATAR SKINS UNLOCKED</span></div>
                            <div className="perk"><span className="perk-ico">🏆</span><span className="perk-txt">JOIN GLOBAL LEADERBOARD</span></div>
                            <div className="perk"><span className="perk-ico">🎮</span><span className="perk-txt">ALL MINI-GAMES INCLUDED</span></div>
                        </div>
                    </div>
                </div>

                {/* RIGHT FORM PANEL */}
                <div className="auth-right">
                    <div className="auth-form-wrap">
                        {/* Progress dots */}
                        <div className="prog-dots">
                            <div className="pdot done" title="Account"></div>
                            <div className="pdot on" title="Avatar"></div>
                            <div className="pdot" title="World"></div>
                        </div>

                        <div className="auth-form-title">CREATE ACCOUNT</div>
                        <p className="auth-form-sub">Join 24,891 players in the metaverse</p>

                        <div className="social-btns">
                            <button className="soc-btn"><span className="soc-ico">G</span><span style={{ fontFamily: 'var(--px)', fontSize: '6px' }}>GOOGLE</span></button>
                            <button className="soc-btn"><span className="soc-ico">D</span><span style={{ fontFamily: 'var(--px)', fontSize: '6px' }}>DISCORD</span></button>
                        </div>

                        <div className="divider">
                            <div className="div-line"></div><span className="div-txt">OR SIGN UP WITH EMAIL</span><div className="div-line"></div>
                        </div>

                        <form onSubmit={handleSignup}>
                            <div className="form-row">
                                <div className="form-grp">
                                    <label className="form-lbl">FIRST NAME</label>
                                    <input className="form-inp" type="text" placeholder="Player" />
                                </div>
                                <div className="form-grp">
                                    <label className="form-lbl">LAST NAME</label>
                                    <input className="form-inp" type="text" placeholder="One" />
                                </div>
                            </div>

                            <div className="form-grp">
                                <label className="form-lbl">USERNAME</label>
                                <input className="form-inp" type="text" placeholder="xeon_destroyer" />
                            </div>

                            <div className="form-grp">
                                <label className="form-lbl">EMAIL ADDRESS</label>
                                <input className="form-inp" type="email" placeholder="you@vortex.gg" />
                            </div>

                            <div className="form-grp">
                                <label className="form-lbl">PASSWORD</label>
                                <input
                                    className="form-inp"
                                    type="password"
                                    placeholder="••••••••••"
                                    value={password}
                                    onChange={e => updateStrength(e.target.value)}
                                />
                                {/* Password strength bars */}
                                <div className="strength">
                                    {[0, 1, 2, 3].map(i => (
                                        <div
                                            key={i}
                                            className="str-bar"
                                            style={{ background: i < strength ? barColor : '#f0e8ff' }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="form-grp">
                                <label className="form-lbl">PICK YOUR AVATAR</label>
                                <div className="avatar-pick">
                                    {avatars.map((a, i) => (
                                        <div
                                            key={i}
                                            className={`ava-opt${selectedAvatar === i ? ' sel' : ''}`}
                                            onClick={() => setSelectedAvatar(i)}
                                        >
                                            {a}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={agreed}
                                    onChange={e => setAgreed(e.target.checked)}
                                />
                                <label htmlFor="terms" className="form-check-lbl">
                                    I agree to the{' '}
                                    <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="form-submit"
                                style={{ background: 'var(--green)', color: 'var(--ink)' }}
                            >
                                ▶ CREATE ACCOUNT FREE
                            </button>
                        </form>

                        <div className="switch-link">
                            ALREADY HAVE AN ACCOUNT?{' '}
                            <a onClick={() => router.push('/login')} style={{ cursor: 'pointer' }}>LOG IN HERE</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
