import React from 'react';
import { Icons } from '../../utils/Icons';
import { apiFetch } from '../../api/client';

export const AvatarPickerModal = ({ context }) => {
    const {
        showAvatarPickerModal, setShowAvatarPickerModal,
        activeKidId, kids, setKids,
        pendingAvatar, setPendingAvatar, notify
    } = context;

    if (!showAvatarPickerModal) return null;

    const activeKid = kids.find(k => k.id === activeKidId);
    if (!activeKid) return null;

    const handleSave = async () => {
        if (!pendingAvatar || pendingAvatar === activeKid.avatar) {
            setShowAvatarPickerModal(false);
            return;
        }
        try {
            await apiFetch(`/api/kids/${activeKid.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatar: pendingAvatar })
            });
            setKids(kids.map(k => k.id === activeKid.id ? { ...k, avatar: pendingAvatar } : k));
            setShowAvatarPickerModal(false);
            notify('头像修改成功！', 'success');
        } catch (e) {
            notify('保存失败，请重试', 'error');
        }
    };

    const handleFileChange = (e) => {
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
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300" 
                onClick={() => { setShowAvatarPickerModal(false); setPendingAvatar(''); }}
            />

            {/* Modal Container */}
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl relative flex flex-col max-h-[85vh] z-10 animate-scale-up">

                {/* Sticky Header */}
                <h3 className="font-black text-xl text-slate-800 mb-4 shrink-0 text-center">选择新头像</h3>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto min-h-0 pr-2 -mr-2">
                    {/* Upload Button */}
                    <div className="w-full mb-6 mt-1">
                        <input
                            type="file"
                            id="avatar-upload-modal"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <label htmlFor="avatar-upload-modal" className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-3 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors active:scale-95">
                            <Icons.Camera size={24} className="text-slate-400" />
                            <span className="text-xs">拍照 / 上传相册图片</span>
                        </label>
                    </div>

                    <div className="grid grid-cols-4 gap-4 pb-4">
                        {/* Special visual slot for base64 pending avatar */}
                        <div className={`col-span-4 flex justify-center mb-2 ${pendingAvatar && pendingAvatar.startsWith('data:image/') ? 'block' : 'hidden'}`}>
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-[3px] border-indigo-400 shadow-lg scale-110">
                                    {pendingAvatar && pendingAvatar.startsWith('data:image/') && <img src={pendingAvatar} alt="Pending Avatar" className="w-full h-full object-cover" />}
                                </div>
                                <button onClick={() => setPendingAvatar('')} className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full shadow-md hover:bg-rose-600 z-10 transition-transform active:scale-95">
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
                        onClick={handleSave}
                        className="flex-[2] py-3.5 bg-indigo-600 text-white rounded-xl font-black text-sm shadow-md shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all"
                    >
                        保存设置
                    </button>
                </div>
            </div>
        </div>
    );
};
