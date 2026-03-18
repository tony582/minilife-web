import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Icons, AvatarDisplay } from '../../utils/Icons';

export const ProfileSelectionPage = () => {
    const { kids, changeActiveKid, changeAppState, setKidTab, parentSettings, setShowAddKidModal, setNewKidForm } = useAppContext();
    
    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 animate-fade-in relative">
            <div className="absolute top-8 left-8 flex items-center gap-2 text-white/50">
                <img src="/minilife_logo.png" className="w-10 h-10 rounded-2xl shadow-sm" alt="MiniLife Logo" /> <span className="font-black text-2xl tracking-widest text-[#2c3e50]">MiniLife</span>
            </div>
            <h1 className="text-white text-3xl font-black mb-12">是谁在使用呢？</h1>
            <div className="flex flex-wrap md:flex-nowrap justify-center gap-8 md:gap-12 max-w-5xl w-full px-4">
                {kids.map(k => (
                    <div key={k.id} onClick={() => { changeActiveKid(k.id); changeAppState('kid_app'); setKidTab('study'); }} className="group cursor-pointer flex flex-col items-center">
                        <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-6xl shadow-xl group-hover:scale-105 group-hover:ring-4 ring-white/50 transition-all overflow-hidden border-4 border-white">
                            <AvatarDisplay avatar={k.avatar} />
                        </div>
                        <span className="text-slate-300 mt-4 text-xl font-bold group-hover:text-white transition-colors">{k.name}</span>
                    </div>
                ))}

                {/* Add Kid Button (Netflix Style) */}
                {kids.length < 5 && (
                    <div onClick={() => {
                        changeActiveKid(null);
                        setNewKidForm({ name: '', gender: 'boy', avatar: '👦', dob: '' });
                        setShowAddKidModal(true);
                    }} className="group cursor-pointer flex flex-col items-center">
                        <div className="w-28 h-28 md:w-36 md:h-36 rounded-[2rem] border-4 border-dashed border-slate-700 bg-slate-800/50 flex items-center justify-center text-5xl text-slate-500 shadow-xl group-hover:scale-105 group-hover:border-slate-500 group-hover:text-slate-400 transition-all">
                            <Icons.Plus size={48} strokeWidth={3} />
                        </div>
                        <span className="text-slate-500 mt-4 text-xl font-bold group-hover:text-slate-400 transition-colors">添加小朋友</span>
                    </div>
                )}
            </div>
            <button onClick={() => parentSettings.pinEnabled ? changeAppState('parent_pin') : changeAppState('parent_app')} className="absolute bottom-10 flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-white/5 px-6 py-3 rounded-full font-bold">
                <Icons.Settings size={18} /> 家长管理入口
            </button>
        </div>
    );
};
