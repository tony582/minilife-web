import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Icons, AvatarDisplay, getLevelTier, getLevelReq } from '../../utils/Icons';
import { KidStudyTab } from './KidStudyTab';
import { KidHabitTab } from './KidHabitTab';
import { KidWealthTab } from './KidWealthTab';
import { KidShopTab } from './KidShopTab';
import { KidProfileTab } from './KidProfileTab';

export const KidApp = () => {
    const {
        kids,
        activeKidId,
        tasks,
        orders,
        transactions,
        showKidSwitcher,
        setShowKidSwitcher,
        showParentPinModal,
        setShowParentPinModal,
        pinInput,
        setPinInput,
        showAvatarPickerModal,
        setShowAvatarPickerModal,
        pendingAvatar,
        setPendingAvatar,
        showLevelModal,
        setShowLevelModal,
        kidTab,
        setKidTab,
        changeActiveKid,
        changeAppState,
        parentSettings,
        setKids,
        notify,
        apiFetch
    } = useAppContext();

    const activeKid = kids.find(k => k.id === activeKidId);

    const switchKid = (kidId) => {
        changeActiveKid(kidId);
        setShowKidSwitcher(false);
        setKidTab('study');
    };

    const openParentFromKid = () => {
        if (parentSettings.pinEnabled) {
            setShowParentPinModal(true);
        } else {
            changeAppState('parent_app');
        }
    };

    const handlePinClick = (num) => {
        if (pinInput.length < 4) {
            const newVal = pinInput + num;
            setPinInput(newVal);
            if (newVal.length === 4) {
                if (newVal === parentSettings.pinCode) {
                    setShowParentPinModal(false);
                    setPinInput('');
                    changeAppState('parent_app');
                } else {
                    notify("家长密码错误！", "error");
                    setPinInput('');
                }
            }
        }
    };

    if (!activeKid) return null;

    const myTasks = tasks.filter(t => t.kidId === activeKidId || t.kidId === 'all');
    const myOrders = orders.filter(o => o.kidId === activeKidId);
    const nextLevelExp = getLevelReq(activeKid.level);

    return (
        <div className="min-h-screen bg-[#f4f7f9] font-sans pb-24 text-left animate-fade-in">
            <div className="bg-white border-b border-slate-100 px-4 md:px-8 py-3 flex justify-between items-center sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-2">
                    <img src="/minilife_logo.png" className="w-8 h-8 rounded-xl shadow-sm border border-slate-100/50" alt="Logo" /> <span className="font-black text-xl text-slate-800 tracking-tight">MiniLife</span>
                </div>
                <div className="flex items-center gap-2">
                    {/* 孩子切换器 */}
                    <div className="relative">
                        <button
                            onClick={() => setShowKidSwitcher(!showKidSwitcher)}
                            className="flex items-center gap-2 bg-slate-50 pl-1.5 pr-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors border border-slate-200"
                        >
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-lg overflow-hidden"><AvatarDisplay avatar={activeKid.avatar} /></div>
                            <span className="text-sm font-bold text-slate-700">{activeKid.name}</span>
                            <Icons.ChevronRight size={14} className={`text-slate-400 transition-transform ${showKidSwitcher ? 'rotate-90' : ''}`} />
                        </button>
                        {showKidSwitcher && (
                            <>
                                {/* Transparent Backdrop for clicking outside */}
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowKidSwitcher(false)}
                                ></div>
                                <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 min-w-[160px] z-50 animate-fade-in">
                                    {kids.map(k => (
                                        <button
                                            key={k.id}
                                            onClick={() => switchKid(k.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left ${k.id === activeKidId ? 'bg-indigo-50' : ''
                                                }`}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-xl overflow-hidden"><AvatarDisplay avatar={k.avatar} /></div>
                                            <span className={`font-bold text-sm ${k.id === activeKidId ? 'text-indigo-600' : 'text-slate-700'}`}>{k.name}</span>
                                            {k.id === activeKidId && <Icons.Check size={14} className="text-indigo-500 ml-auto" />}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* 家长入口 */}
                    <button
                        onClick={openParentFromKid}
                        className="flex items-center gap-1.5 text-sm font-bold text-slate-500 bg-slate-50 px-3.5 py-2 rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-colors border border-slate-200"
                    >
                        <Icons.Lock size={14} /> 家长
                    </button>
                </div>
            </div>

            {showParentPinModal && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-slate-800/90 w-full max-w-sm rounded-[2rem] p-8 text-center shadow-2xl border border-white/10">
                        <button onClick={() => { setShowParentPinModal(false); setPinInput(''); }} className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                            <Icons.X size={20} />
                        </button>
                        <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center text-slate-400 mb-4 mx-auto">
                            <Icons.Lock size={28} />
                        </div>
                        <h2 className="text-white text-xl font-black mb-6">输入家长 PIN 码</h2>
                        <div className="flex gap-3 justify-center mb-8">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className={`w-4 h-4 rounded-full transition-all ${i < pinInput.length ? 'bg-indigo-500 scale-110' : 'bg-slate-600'}`}></div>
                            ))}
                        </div>
                        <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                                <button key={n} onClick={() => handlePinClick(n)} className="w-16 h-16 bg-slate-700 rounded-2xl text-white text-2xl font-bold hover:bg-slate-600 transition-colors flex items-center justify-center">{n}</button>
                            ))}
                            <div className="w-16 h-16"></div>
                            <button onClick={() => handlePinClick(0)} className="w-16 h-16 bg-slate-700 rounded-2xl text-white text-2xl font-bold hover:bg-slate-600 transition-colors flex items-center justify-center">0</button>
                            <button onClick={() => setPinInput(pinInput.slice(0, -1))} className="w-16 h-16 text-slate-400 flex items-center justify-center hover:text-white transition-colors rounded-2xl hover:bg-slate-700">
                                <Icons.X size={22} />
                            </button>
                        </div>
                        <button onClick={() => { setShowParentPinModal(false); setPinInput(''); }} className="mt-6 text-slate-500 hover:text-slate-300 text-sm font-bold transition-colors">取消</button>
                    </div>
                </div>
            )}

            {/* --- 专属头像选择器 Modal --- */}
            {showAvatarPickerModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[250] flex items-center justify-center p-4 pb-12 animate-fade-in">

                    {/* Modal Container */}
                    <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl relative flex flex-col max-h-[75vh] md:max-h-[80vh] w-full z-10">

                        {/* Sticky Header */}
                        <h3 className="font-black text-xl text-slate-800 mb-4 shrink-0 text-center">选择新头像</h3>

                        {/* Scrollable Body */}
                        <div className="flex-1 overflow-y-auto min-h-0 pr-2 -mr-2">
                            {/* Upload Button */}
                            <div className="w-full mb-6 mt-1">
                                <input
                                    type="file"
                                    id="avatar-upload"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                            const img = new Image();
                                            img.onload = () => {
                                                const canvas = document.createElement('canvas');
                                                const MAX_SIZE = 256;
                                                let width = img.width;
                                                let height = img.height;
                                                if (width > height) {
                                                    if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
                                                } else {
                                                    if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
                                                }
                                                canvas.width = width;
                                                canvas.height = height;
                                                const ctx = canvas.getContext('2d');
                                                ctx.drawImage(img, 0, 0, width, height);
                                                setPendingAvatar(canvas.toDataURL('image/jpeg', 0.8));
                                            };
                                            img.src = event.target.result;
                                        };
                                        reader.readAsDataURL(file);
                                    }}
                                />
                                <label htmlFor="avatar-upload" className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-3 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors active:scale-95">
                                    <Icons.Camera size={24} className="text-slate-400" />
                                    <span className="text-xs">拍照 / 上传相册图片</span>
                                </label>
                            </div>

                            <div className="grid grid-cols-4 gap-4 pb-4">
                                {/* Special visual slot for base64 pending avatar if present and not an emoji */}
                                <div className={`col-span-4 flex justify-center mb-2 ${pendingAvatar && pendingAvatar.startsWith('data:image/') ? 'block' : 'hidden'}`}>
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-[3px] border-indigo-400 shadow-lg scale-110">
                                            <img src={pendingAvatar} alt="Pending Avatar" className="w-full h-full object-cover" />
                                        </div>
                                        <button onClick={() => setPendingAvatar('')} className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full shadow-md hover:bg-rose-600">
                                            <Icons.X size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Emoji presets */}
                                {['👦', '👧', '🦁', '🦊', '🐱', '🐶', '🐰', '🐯', '🐼', '🐨', '🦖', '🚀'].map(emoji => (
                                    <button
                                        key={emoji}
                                        onClick={() => setPendingAvatar(emoji)}
                                        className={`w-14 h-14 text-3xl flex items-center justify-center rounded-2xl transition-all flex-shrink-0 ${pendingAvatar === emoji ? 'bg-indigo-100 border-[3px] border-indigo-400 scale-110 shadow-lg' : 'bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:scale-105'} ${pendingAvatar?.startsWith('data:image/') ? 'opacity-50 grayscale' : ''}`}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sticky Footer */}
                        <div className="shrink-0 mt-4 pt-4 border-t border-slate-100 bg-white flex gap-3">
                            <button onClick={() => { setShowAvatarPickerModal(false); setPendingAvatar(''); }} className="flex-1 py-3.5 bg-slate-100 text-slate-500 rounded-xl font-black text-sm hover:bg-slate-200 transition-colors">取消</button>
                            <button
                                onClick={async () => {
                                    if (!pendingAvatar || pendingAvatar === activeKid.avatar) {
                                        setShowAvatarPickerModal(false);
                                        return;
                                    }
                                    try {
                                        await apiFetch(`/api/kids/${activeKid.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ avatar: pendingAvatar }) });
                                        setKids(kids.map(k => k.id === activeKid.id ? { ...k, avatar: pendingAvatar } : k));
                                        setShowAvatarPickerModal(false);
                                        notify('头像修改成功！', 'success');
                                    } catch (e) {
                                        notify('保存失败，请重试', 'error');
                                    }
                                }}
                                className="flex-[2] py-3.5 bg-indigo-600 text-white rounded-xl font-black text-sm shadow-md shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all"
                            >
                                保存设置
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 勋章与等级个人中心 Modal (保留作为 Level Details) */}
            {showLevelModal && (
                <div className="fixed inset-0 bg-[#f4f7f9] z-[200] flex flex-col animate-slide-up overflow-hidden">
                    {/* Header Gradient Area */}
                    <div className={`pt-12 pb-24 px-6 bg-gradient-to-br ${getLevelTier(activeKid.level).bg} relative overflow-hidden flex flex-col items-center text-white flex-shrink-0 rounded-b-[3rem] shadow-sm`}>
                        <button onClick={() => setShowLevelModal(false)} className="absolute top-6 left-6 bg-white/20 hover:bg-white/30 w-10 h-10 rounded-full flex items-center justify-center transition-colors backdrop-blur-md">
                            <Icons.ChevronLeft size={24} />
                        </button>
                        <div className="absolute top-6 text-lg font-black tracking-widest opacity-90 text-white/90">成长图鉴</div>

                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform -translate-x-20 translate-y-20 pointer-events-none"></div>

                        <div className="mt-8 w-28 h-28 rounded-full bg-white/20 p-2 backdrop-blur-md shadow-xl relative z-10 mb-5 border border-white/30">
                            <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-5xl overflow-hidden"><AvatarDisplay avatar={activeKid.avatar} /></div>
                            <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full flex items-center justify-center font-black border-2 border-white shadow-md text-sm tracking-wider">
                                Lv.{activeKid.level}
                            </div>
                        </div>
                        <h2 className="text-3xl font-black tracking-wide drop-shadow-md mb-2">{activeKid.name}</h2>
                        <div className="flex items-center gap-1.5 bg-white/20 px-4 py-1.5 rounded-full text-sm font-black backdrop-blur-sm shadow-inner border border-white/20 tracking-wider">
                            {getLevelTier(activeKid.level).emoji} {getLevelTier(activeKid.level).title}
                        </div>
                    </div>

                    {/* Card Body Overlay */}
                    <div className="flex-1 overflow-y-auto hide-scrollbar px-6 pt-6 pb-24 -mt-12 relative z-20">

                        {/* Progress Bar */}
                        <div className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 mb-6 relative hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
                            <div className="flex justify-between items-end mb-3">
                                <span className="text-slate-500 font-bold text-sm tracking-wider">升级进度条</span>
                                <div className="text-right">
                                    <div className="text-[10px] text-slate-400 font-bold mb-0.5">距离下一级还需要</div>
                                    <span className={`font-black text-2xl ${getLevelTier(activeKid.level).color}`}>
                                        {nextLevelExp - activeKid.exp} <span className="text-sm text-slate-400">EXP</span>
                                    </span>
                                </div>
                            </div>
                            <div className="h-5 bg-slate-50 rounded-full overflow-hidden shadow-inner relative border border-slate-100">
                                <div
                                    className={`h-full bg-gradient-to-r ${getLevelTier(activeKid.level).bg} relative shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1)] transition-all duration-1000 ease-out`}
                                    style={{ width: `${Math.max(0, (activeKid.exp / nextLevelExp) * 100)}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mt-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <span>Lv.{activeKid.level} ({activeKid.exp})</span>
                                <span>Lv.{activeKid.level + 1} ({nextLevelExp})</span>
                            </div>
                        </div>

                        {/* Honor & Badges */}
                        <div className="mb-6">
                            <h3 className="font-black text-slate-800 text-lg mb-4 flex items-center gap-2 pl-2">
                                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center shadow-inner"><Icons.Award size={18} /></div>
                                我的成就勋章
                            </h3>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-white rounded-[1.5rem] p-4 flex flex-col items-center justify-center shadow-[0_4px_15px_rgb(0,0,0,0.03)] border border-slate-100 aspect-square text-center opacity-100">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-200 to-orange-400 flex items-center justify-center text-2xl shadow-inner mb-2 border-2 border-amber-100">🔥</div>
                                    <div className="text-[11px] font-black text-slate-700 tracking-wider">初出茅庐</div>
                                </div>
                                <div className="bg-white rounded-[1.5rem] p-4 flex flex-col items-center justify-center shadow-[0_4px_15px_rgb(0,0,0,0.03)] border border-slate-100 aspect-square text-center opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-300 to-purple-500 flex items-center justify-center text-2xl shadow-inner mb-2 border-2 border-indigo-100">⚡</div>
                                    <div className="text-[11px] font-black text-slate-800 tracking-wider">打卡7天</div>
                                </div>
                                <div className="bg-white rounded-[1.5rem] p-4 flex flex-col items-center justify-center shadow-[0_4px_15px_rgb(0,0,0,0.03)] border border-slate-100 aspect-square text-center opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-300 to-teal-500 flex items-center justify-center text-2xl shadow-inner mb-2 border-2 border-emerald-100">👑</div>
                                    <div className="text-[11px] font-black text-slate-800 tracking-wider">百变达人</div>
                                </div>
                            </div>
                        </div>
                        {/* Card: EXP History Log */}
                        <div className="mb-8">
                            <h3 className="font-black text-slate-800 text-lg mb-4 flex items-center gap-2 pl-2">
                                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-inner"><Icons.Activity size={18} /></div>
                                近期经验获取
                            </h3>
                            <div className="bg-white rounded-[2rem] p-5 shadow-[0_4px_15px_rgb(0,0,0,0.03)] border border-slate-100 space-y-4">
                                {transactions
                                    .filter(t => t.kidId === activeKid.id && t.type === 'income' && t.category === 'habit' && t.amount > 0)
                                    .slice(0, 5)
                                    .map((t, idx, arr) => (
                                        <div key={t.id} className={`flex items-center justify-between text-sm ${idx !== arr.length - 1 ? 'border-b border-slate-50 pb-4' : ''}`}>
                                            <div className="flex items-center gap-3 text-slate-700 font-bold truncate pr-3">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0 shadow-inner">
                                                    <Icons.ArrowUpRight size={18} strokeWidth={3} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="truncate tracking-wide">{t.title}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium tracking-wider">任务记录</span>
                                                </div>
                                            </div>
                                            <div className="font-black text-emerald-500 text-lg flex-shrink-0 tracking-wider">
                                                +{t.amount} EXP
                                            </div>
                                        </div>
                                    ))}
                                {transactions.filter(t => t.kidId === activeKid.id && t.type === 'income' && t.category === 'habit' && t.amount > 0).length === 0 && (
                                    <div className="text-center py-8 flex flex-col items-center justify-center">
                                        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-3 shadow-inner">
                                            <Icons.Check size={32} />
                                        </div>
                                        <p className="text-sm text-slate-400 font-bold tracking-wider">还没有获取记录呢，快去完成任务吧！</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white border-b border-slate-100 p-5 md:p-8 hidden md:block">
                <div className="max-w-5xl mx-auto">
                    <button
                        onClick={() => setShowLevelModal(true)}
                        className="w-full flex items-center justify-between bg-transparent hover:bg-slate-50/80 p-3 -mx-3 rounded-3xl transition-colors group text-left relative overflow-hidden"
                    >
                        <div className="flex items-center gap-5">
                            <div className="relative flex-shrink-0">
                                {/* SVG Circular Progress Ring */}
                                <svg className="absolute -inset-2 w-[calc(100%+1rem)] h-[calc(100%+1rem)] -rotate-90 pointer-events-none drop-shadow-sm" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="46" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                                    <circle
                                        cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="6"
                                        strokeLinecap="round"
                                        className={getLevelTier(activeKid.level).color}
                                        strokeDasharray="289.02"
                                        strokeDashoffset={289.02 - (289.02 * Math.max(0, activeKid.exp / nextLevelExp))}
                                    />
                                </svg>
                                <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-[40px] shadow-sm border-[4px] border-white relative z-10 overflow-hidden"><AvatarDisplay avatar={activeKid.avatar} /></div>
                            </div>
                            <div>
                                <h1 className="text-[22px] font-black text-slate-800 tracking-tight leading-tight">早上好，{activeKid.name}！</h1>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black text-white shadow-sm bg-gradient-to-r ${getLevelTier(activeKid.level).bg}`}>
                                        <span className="opacity-90 leading-none">{getLevelTier(activeKid.level).emoji}</span>
                                        <span className="leading-none tracking-wider">LV.{activeKid.level} {getLevelTier(activeKid.level).title}</span>
                                    </div>
                                    <span className="text-[12px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">{activeKid.exp} / {nextLevelExp} EXP</span>
                                </div>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-indigo-500 transition-colors shadow-sm border border-slate-100 flex-shrink-0 transform md:translate-x-0 translate-x-2 opacity-50 group-hover:opacity-100 group-hover:scale-110 active:scale-95">
                            <Icons.ChevronRight size={20} />
                        </div>
                    </button>
                </div>

                <div className="max-w-5xl mx-auto mt-6 hidden md:flex overflow-x-auto hide-scrollbar gap-3 pb-1">
                    {[
                        { id: 'study', icon: <Icons.BookOpen size={18} />, label: "学习任务" },
                        { id: 'habit', icon: <Icons.ShieldCheck size={18} />, label: "习惯养成" },
                        { id: 'wealth', icon: <Icons.Wallet size={18} />, label: "财富中心" },
                        { id: 'shop', icon: <Icons.ShoppingBag size={18} />, label: "家庭超市" }
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setKidTab(tab.id)} className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-full font-black text-sm whitespace-nowrap transition-all shadow-sm ${kidTab === tab.id ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-5xl mx-auto p-4 md:p-8 pb-28 md:pb-8">
                {kidTab === 'study' && <KidStudyTab />}
                {kidTab === 'profile' && <KidProfileTab />}
                {kidTab === 'habit' && <KidHabitTab />}
                {kidTab === 'wealth' && <KidWealthTab />}
                {kidTab === 'shop' && <KidShopTab />}
            </div>
        </div>
    );
};
