const fs = require('fs');
const file = '/Users/dulaidila/.gemini/antigravity/scratch/minilife/src/pages/Kid/KidProfileTab.jsx';
let content = fs.readFileSync(file, 'utf8');

const target = `                    {/* ═════════════════════════════════════════════════════
                        SECTION 3: ACHIEVEMENTS SUMMARY CARD
                    ═════════════════════════════════════════════════════ */}
                    <button onClick={() => setShowAchievementsModal(true)} className="otter-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', marginTop: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 16, background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icons.Award size={22} style={{ color: '#D97706' }} />
                            </div>
                            <div>
                                <div style={{ fontSize: 16, fontWeight: 900, color: '#111827' }}>成就徽章</div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#9CA3AF' }}>已收集 {unlockedCount} / {ACHIEVEMENTS.length}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 100, height: 6, background: '#F3F4F6', borderRadius: 99, overflow: 'hidden' }}>
                                <div style={{ width: \`${(unlockedCount/ACHIEVEMENTS.length)*100}%\`, height: '100%', background: '#F59E0B', borderRadius: 99, transition: 'width 0.5s ease-out' }} />
                            </div>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Icons.ChevronRight size={18} style={{ color: '#9CA3AF' }} />
                            </div>
                        </div>
                    </button>`;

const replacement = `                    {/* ═════════════════════════════════════════════════════
                        SECTION 3: ACHIEVEMENTS SUMMARY CARD
                    ═════════════════════════════════════════════════════ */}
                    <button onClick={() => setShowAchievementsModal(true)} className="otter-card" style={{ padding: '22px 20px', display: 'flex', flexDirection: 'column', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', marginTop: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 12, background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icons.Award size={18} style={{ color: '#D97706' }} />
                                </div>
                                <span style={{ fontSize: 15, fontWeight: 800, color: '#4B5563' }}>成就收集</span>
                            </div>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icons.ChevronRight size={14} style={{ color: '#9CA3AF' }} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', width: '100%' }}>
                            <div style={{ fontSize: 32, fontWeight: 900, color: '#111827', letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                {unlockedCount}
                                <span style={{ fontSize: 16, color: '#9CA3AF', fontWeight: 800 }}>/{ACHIEVEMENTS.length}</span>
                            </div>
                            <div style={{ width: 100, height: 6, background: '#F3F4F6', borderRadius: 99, overflow: 'hidden', marginBottom: 8 }}>
                                <div style={{ width: \`${(unlockedCount/ACHIEVEMENTS.length)*100}%\`, height: '100%', background: '#F59E0B', borderRadius: 99, transition: 'width 0.5s ease-out' }} />
                            </div>
                        </div>
                    </button>`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Successfully replaced!');
} else {
    console.log('Target string not found in file!');
}
