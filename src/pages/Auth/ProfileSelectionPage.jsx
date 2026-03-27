import React, { useEffect } from 'react';
import { useDataContext } from '../../context/DataContext.jsx';
import { useUIContext } from '../../context/UIContext.jsx';
import { Icons, AvatarDisplay } from '../../utils/Icons';

export const ProfileSelectionPage = () => {
    const { kids, changeActiveKid } = useDataContext();
    const { changeAppState, setKidTab, parentSettings, setShowAddKidModal, setNewKidForm } = useUIContext();

    // Auto-skip: if only 1 kid, go directly to kid_app
    useEffect(() => {
        if (kids.length === 1) {
            changeActiveKid(kids[0].id);
            changeAppState('kid_app');
            setKidTab('study');
        }
    }, [kids]);

    // Don't render while auto-skipping
    if (kids.length === 1) return null;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative"
            style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>

            {/* Logo */}
            <div className="absolute top-8 left-8 flex items-center gap-2.5">
                <img src="/minilife_logo.png" className="w-10 h-10 rounded-2xl shadow-lg" alt="MiniLife Logo" />
                <span className="font-black text-xl tracking-wider text-white/30">MiniLife</span>
            </div>

            {/* Title */}
            <div className="text-center mb-14">
                <h1 className="text-white text-3xl md:text-4xl font-black mb-2">👋 谁来啦？</h1>
                <p className="text-white/40 text-sm font-medium">选择你的头像进入</p>
            </div>

            {/* Kid Avatars */}
            <div className="flex flex-wrap md:flex-nowrap justify-center gap-10 md:gap-14 max-w-5xl w-full px-4">
                {kids.map(k => (
                    <div key={k.id}
                        onClick={() => { changeActiveKid(k.id); changeAppState('kid_app'); setKidTab('study'); }}
                        className="group cursor-pointer flex flex-col items-center"
                    >
                        <div className="relative">
                            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center text-6xl shadow-2xl group-hover:scale-110 transition-all duration-300 overflow-hidden border-4 border-white/20 group-hover:border-white/60"
                                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                <AvatarDisplay avatar={k.avatar} />
                            </div>
                            {/* Glow effect on hover */}
                            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                style={{ boxShadow: '0 0 40px rgba(102, 126, 234, 0.4)' }} />
                        </div>
                        <span className="text-white/60 mt-5 text-xl font-bold group-hover:text-white transition-colors duration-200">{k.name}</span>
                    </div>
                ))}

                {/* Add Kid Button */}
                {kids.length < 5 && (
                    <div onClick={() => {
                        changeActiveKid(null);
                        setNewKidForm({ name: '', gender: 'boy', avatar: '👦', dob: '' });
                        setShowAddKidModal(true);
                    }} className="group cursor-pointer flex flex-col items-center">
                        <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-3 border-dashed border-white/15 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:border-white/30 transition-all duration-300"
                            style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <Icons.Plus size={44} strokeWidth={2} className="text-white/20 group-hover:text-white/50 transition-colors" />
                        </div>
                        <span className="text-white/30 mt-5 text-xl font-bold group-hover:text-white/50 transition-colors duration-200">添加</span>
                    </div>
                )}
            </div>

            {/* Parent Management — larger and more visible */}
            <button onClick={() => parentSettings.pinEnabled ? changeAppState('parent_pin') : changeAppState('parent_app')}
                className="absolute bottom-8 md:bottom-10 flex items-center gap-3 transition-all duration-200 active:scale-95 group"
                style={{
                    background: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '14px 32px',
                    borderRadius: '9999px',
                }}>
                <Icons.Settings size={20} className="text-white/40 group-hover:text-white/70 transition-colors" />
                <span className="text-white/50 font-bold text-base group-hover:text-white/80 transition-colors">家长管理</span>
                <Icons.ChevronRight size={16} className="text-white/30 group-hover:text-white/60 transition-colors" />
            </button>
        </div>
    );
};
