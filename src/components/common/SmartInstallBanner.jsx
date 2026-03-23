import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

// ─── Environment Detection ───
const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
const isWeChat = /MicroMessenger/i.test(ua);
const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isSafari = isIOS && /Safari/i.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS/i.test(ua);
const isAndroid = /Android/i.test(ua);
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

const DISMISS_KEY = 'minilife_install_banner_dismissed';
const DISMISS_DAYS = 7; // Don't show again for 7 days after dismiss

function isDismissed() {
    const ts = localStorage.getItem(DISMISS_KEY);
    if (!ts) return false;
    return (Date.now() - parseInt(ts, 10)) < DISMISS_DAYS * 86400000;
}

// ─── Design tokens ───
const C = {
    orange: '#FF8C42', orangeHot: '#FF6B1A',
    textPrimary: '#1B2E4B', textSoft: '#5A6E8A', textMuted: '#9CAABE',
    bgCard: '#FFFFFF', bgLight: '#F0EBE1',
};

/**
 * Smart Install Banners
 * - WeChat: Full-screen overlay telling user to open in browser
 * - Safari iOS: Bottom floating bar with arrow to share button
 * - Android Chrome: Bottom floating bar (if not already installed)
 */
export const SmartInstallBanner = () => {
    const [dismissed, setDismissed] = useState(true);

    useEffect(() => {
        // Don't show if already installed as PWA
        if (isStandalone) return;
        // Don't show if recently dismissed
        if (isDismissed()) return;
        setDismissed(false);
    }, []);

    const handleDismiss = () => {
        localStorage.setItem(DISMISS_KEY, Date.now().toString());
        setDismissed(true);
    };

    if (dismissed) return null;

    // ═══════════════════════════════════════════════
    // WeChat Browser Overlay
    // ═══════════════════════════════════════════════
    if (isWeChat) {
        return createPortal(
            <div style={{
                position: 'fixed', inset: 0, zIndex: 99999,
                background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '0 24px', paddingTop: '60px',
            }}>
                {/* Arrow pointing to top-right */}
                <div style={{
                    position: 'absolute', top: 12, right: 28,
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                }}>
                    <svg width="54" height="54" viewBox="0 0 54 54" fill="none" style={{ transform: 'rotate(30deg)' }}>
                        <path d="M27 50V10M27 10L12 25M27 10L42 25" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>

                <div style={{
                    marginTop: 60, textAlign: 'center', color: 'white',
                    maxWidth: 320,
                }}>
                    {/* Icon */}
                    <div style={{
                        width: 80, height: 80, borderRadius: 20,
                        background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 24px', fontSize: 40,
                        border: '1.5px solid rgba(255,255,255,0.15)',
                    }}>
                        📲
                    </div>

                    <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>
                        请使用浏览器打开
                    </h2>
                    <p style={{ fontSize: 15, lineHeight: 1.7, opacity: 0.8, fontWeight: 500 }}>
                        点击右上角 <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(255,255,255,0.15)', borderRadius: 8,
                            padding: '2px 10px', margin: '0 4px', fontWeight: 800,
                        }}>⋯</span> 选择
                    </p>
                    <p style={{
                        fontSize: 16, fontWeight: 800, marginTop: 8,
                        color: C.orange,
                    }}>
                        「在默认浏览器中打开」
                    </p>
                    <p style={{ fontSize: 13, opacity: 0.5, marginTop: 16, fontWeight: 500 }}>
                        使用浏览器可获得完整功能体验
                    </p>

                    {/* Visual guide steps */}
                    <div style={{
                        marginTop: 32, background: 'rgba(255,255,255,0.06)',
                        borderRadius: 16, padding: '20px',
                        border: '1px solid rgba(255,255,255,0.08)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                            <div style={{
                                width: 30, height: 30, borderRadius: 10, flexShrink: 0,
                                background: C.orange, color: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 14, fontWeight: 900,
                            }}>1</div>
                            <span style={{ fontSize: 14, fontWeight: 600, opacity: 0.9, textAlign: 'left' }}>
                                点击右上角 <strong>「⋯」</strong> 按钮
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{
                                width: 30, height: 30, borderRadius: 10, flexShrink: 0,
                                background: C.orange, color: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 14, fontWeight: 900,
                            }}>2</div>
                            <span style={{ fontSize: 14, fontWeight: 600, opacity: 0.9, textAlign: 'left' }}>
                                选择 <strong>「在默认浏览器中打开」</strong>
                            </span>
                        </div>
                    </div>

                    {/* Dismiss */}
                    <button onClick={handleDismiss} style={{
                        marginTop: 32, padding: '10px 28px', borderRadius: 100,
                        background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    }}>
                        我知道了，继续使用
                    </button>
                </div>
            </div>,
            document.body
        );
    }

    // ═══════════════════════════════════════════════
    // Safari iOS — Bottom floating banner
    // ═══════════════════════════════════════════════
    if (isSafari && isIOS) {
        return createPortal(
            <div style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 99998,
                padding: '0 12px 12px',
                animation: 'slideUpBanner 0.4s ease-out',
            }}>
                <style>{`
                    @keyframes slideUpBanner { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                    @keyframes bounceArrow { 0%,100% { transform: translateY(0); } 50% { transform: translateY(6px); } }
                `}</style>

                {/* Downward arrow pointing to Safari share button (bottom center on iPhone) */}
                <div style={{
                    textAlign: 'center', marginBottom: 6,
                }}>
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ animation: 'bounceArrow 1.2s ease-in-out infinite' }}>
                        <path d="M16 4V24M16 24L8 16M16 24L24 16" stroke={C.orange} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>

                <div style={{
                    background: C.bgCard, borderRadius: 20, padding: '16px 18px',
                    boxShadow: '0 -4px 30px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
                    display: 'flex', alignItems: 'center', gap: 14,
                }}>
                    {/* App icon */}
                    <img src="/minilife_logo.png" alt="MiniLife" style={{
                        width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }} />

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: C.textPrimary, marginBottom: 3 }}>
                            添加 MiniLife 到主屏幕
                        </div>
                        <div style={{ fontSize: 12, color: C.textSoft, fontWeight: 500, lineHeight: 1.5 }}>
                            点击底部 <span style={{
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                width: 22, height: 22, borderRadius: 6,
                                background: '#007AFF12', border: '1px solid #007AFF20',
                                verticalAlign: 'middle', margin: '0 2px',
                            }}>
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M7 1v8M7 1L3.5 4.5M7 1l3.5 3.5" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M2 9v3a1 1 0 001 1h8a1 1 0 001-1V9" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </span> 分享按钮，选择 <strong style={{ color: C.orange }}>「添加到主屏幕」</strong>
                        </div>
                    </div>

                    {/* Close button */}
                    <button onClick={handleDismiss} style={{
                        width: 28, height: 28, borderRadius: 10, flexShrink: 0,
                        background: C.bgLight, border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: C.textMuted, fontSize: 16, fontWeight: 700,
                    }}>✕</button>
                </div>
            </div>,
            document.body
        );
    }

    // ═══════════════════════════════════════════════
    // Android Chrome — Bottom floating banner
    // ═══════════════════════════════════════════════
    if (isAndroid) {
        return createPortal(
            <div style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 99998,
                padding: '0 12px 12px',
                animation: 'slideUpBanner 0.4s ease-out',
            }}>
                <style>{`
                    @keyframes slideUpBanner { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                `}</style>

                <div style={{
                    background: C.bgCard, borderRadius: 20, padding: '16px 18px',
                    boxShadow: '0 -4px 30px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
                    display: 'flex', alignItems: 'center', gap: 14,
                }}>
                    <img src="/minilife_logo.png" alt="MiniLife" style={{
                        width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: C.textPrimary, marginBottom: 3 }}>
                            安装 MiniLife 到桌面
                        </div>
                        <div style={{ fontSize: 12, color: C.textSoft, fontWeight: 500, lineHeight: 1.5 }}>
                            点击右上角 <strong>⋮</strong> → <strong style={{ color: C.orange }}>「添加到主屏幕」</strong>
                        </div>
                    </div>

                    <button onClick={handleDismiss} style={{
                        width: 28, height: 28, borderRadius: 10, flexShrink: 0,
                        background: C.bgLight, border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: C.textMuted, fontSize: 16, fontWeight: 700,
                    }}>✕</button>
                </div>
            </div>,
            document.body
        );
    }

    return null;
};
