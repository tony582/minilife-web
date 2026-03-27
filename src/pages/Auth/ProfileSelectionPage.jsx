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

    // Gradient palette per kid index
    const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    ];

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6"
            style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 40%, #0f172a 100%)' }}>

            {/* Logo */}
            <div className="flex items-center gap-2 mb-10">
                <img src="/minilife_logo.png" className="w-9 h-9 rounded-xl" alt="MiniLife" />
                <span className="font-black text-lg tracking-wider text-white/40">MiniLife</span>
            </div>

            {/* Title */}
            <h1 className="text-white text-2xl md:text-3xl font-black mb-2">谁在使用呢？</h1>
            <p className="text-white/35 text-sm mb-10">点击头像进入</p>

            {/* Kid Cards */}
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 w-full max-w-md md:max-w-3xl">
                {kids.map((k, i) => (
                    <div key={k.id}
                        onClick={() => { changeActiveKid(k.id); changeAppState('kid_app'); setKidTab('study'); }}
                        className="group cursor-pointer w-full md:w-auto md:flex-1"
                    >
                        <div className="flex md:flex-col items-center gap-4 md:gap-0 rounded-2xl px-5 py-4 md:py-8 md:px-6 transition-all duration-200 group-hover:scale-[1.03] group-active:scale-[0.98]"
                            style={{
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.08)',
                            }}>
                            <div className="w-16 h-16 md:w-28 md:h-28 rounded-full flex items-center justify-center text-4xl md:text-6xl overflow-hidden border-[3px] border-white/20 group-hover:border-white/50 transition-colors shrink-0"
                                style={{ background: gradients[i % gradients.length] }}>
                                <AvatarDisplay avatar={k.avatar} />
                            </div>
                            <span className="text-white/70 md:mt-4 text-lg font-bold group-hover:text-white transition-colors">{k.name}</span>
                        </div>
                    </div>
                ))}

                {/* Add Kid */}
                {kids.length < 5 && (
                    <div onClick={() => {
                        changeActiveKid(null);
                        setNewKidForm({ name: '', gender: 'boy', avatar: '👦', dob: '' });
                        setShowAddKidModal(true);
                    }} className="group cursor-pointer w-full md:w-auto md:flex-1">
                        <div className="flex md:flex-col items-center gap-4 md:gap-0 rounded-2xl px-5 py-4 md:py-8 md:px-6 transition-all duration-200 group-hover:scale-[1.03]"
                            style={{
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px dashed rgba(255,255,255,0.12)',
                            }}>
                            <div className="w-16 h-16 md:w-28 md:h-28 rounded-full flex items-center justify-center border-2 border-dashed border-white/15 group-hover:border-white/30 transition-colors shrink-0">
                                <Icons.Plus size={28} strokeWidth={2} className="text-white/20 group-hover:text-white/40 transition-colors" />
                            </div>
                            <span className="text-white/30 md:mt-4 text-lg font-bold group-hover:text-white/50 transition-colors">添加小朋友</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Parent Management */}
            <button onClick={() => parentSettings.pinEnabled ? changeAppState('parent_pin') : changeAppState('parent_app')}
                className="mt-12 flex items-center gap-2.5 transition-all duration-200 active:scale-95 hover:scale-105 group"
                style={{
                    background: 'rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    padding: '12px 28px',
                    borderRadius: '9999px',
                }}>
                <Icons.Settings size={18} className="text-white/60 group-hover:text-white transition-colors" />
                <span className="text-white/70 font-bold text-sm group-hover:text-white transition-colors">家长管理</span>
                <Icons.ChevronRight size={14} className="text-white/40 group-hover:text-white/70 transition-colors" />
            </button>
        </div>
    );
};
