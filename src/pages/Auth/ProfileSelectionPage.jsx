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

    if (kids.length === 1) return null;

    return (
        <div className="min-h-[100dvh] flex flex-col items-center justify-evenly px-6 py-10"
            style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>

            {/* Logo */}
            <div className="flex items-center gap-2 mb-6 md:mb-8">
                <img src="/minilife_logo.png" className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl shadow-lg" alt="MiniLife" />
                <span className="font-black text-base md:text-xl tracking-wider text-white/50">MiniLife</span>
            </div>

            {/* Title */}
            <h1 className="text-white text-2xl md:text-4xl font-black mb-1 md:mb-2">谁在使用呢？</h1>
            <p className="text-white/40 text-xs md:text-sm font-medium mb-8 md:mb-12">选择你的头像进入</p>

            {/* Kid Avatars */}
            <div className="flex flex-wrap md:flex-nowrap justify-center gap-6 md:gap-14 max-w-5xl w-full px-2">
                {kids.map(k => (
                    <div key={k.id}
                        onClick={() => { changeActiveKid(k.id); changeAppState('kid_app'); setKidTab('study'); }}
                        className="group cursor-pointer flex flex-col items-center"
                    >
                        <div className="relative">
                            <div className="w-20 h-20 md:w-36 md:h-36 rounded-full flex items-center justify-center text-4xl md:text-6xl shadow-2xl group-hover:scale-110 transition-all duration-300 overflow-hidden border-[3px] md:border-4 border-white/20 group-hover:border-white/60"
                                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                <AvatarDisplay avatar={k.avatar} />
                            </div>
                            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                style={{ boxShadow: '0 0 40px rgba(102, 126, 234, 0.4)' }} />
                        </div>
                        <span className="text-white/60 mt-2 md:mt-4 text-base md:text-xl font-bold group-hover:text-white transition-colors duration-200">{k.name}</span>
                    </div>
                ))}

                {/* Add Kid */}
                {kids.length < 5 && (
                    <div onClick={() => {
                        changeActiveKid(null);
                        setNewKidForm({ name: '', gender: 'boy', avatar: '👦', dob: '' });
                        setShowAddKidModal(true);
                    }} className="group cursor-pointer flex flex-col items-center">
                        <div className="w-20 h-20 md:w-36 md:h-36 rounded-full border-[3px] md:border-3 border-dashed border-white/15 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:border-white/30 transition-all duration-300"
                            style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <Icons.Plus size={32} strokeWidth={2} className="text-white/20 group-hover:text-white/50 transition-colors" />
                        </div>
                        <span className="text-white/30 mt-2 md:mt-4 text-base md:text-xl font-bold group-hover:text-white/50 transition-colors duration-200">添加</span>
                    </div>
                )}
            </div>

            {/* Parent Management */}
            <button onClick={() => parentSettings.pinEnabled ? changeAppState('parent_pin') : changeAppState('parent_app')}
                className="mt-10 md:mt-14 flex items-center gap-2.5 transition-all duration-200 active:scale-95 hover:scale-105 group"
                style={{
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    padding: '14px 28px',
                    borderRadius: '9999px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
                }}>
                <Icons.Settings size={18} className="text-white/70 group-hover:text-white transition-colors" />
                <span className="text-white/80 font-bold text-sm group-hover:text-white transition-colors">家长管理</span>
                <Icons.ChevronRight size={14} className="text-white/50 group-hover:text-white/80 transition-colors" />
            </button>
        </div>
    );
};
