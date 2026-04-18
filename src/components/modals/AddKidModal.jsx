import React from 'react';
import { Icons } from '../../utils/Icons';
import { apiFetch } from '../../api/client';
import { GIRL_AVATAR_SEEDS, BOY_AVATAR_SEEDS, seedToAvatar, getAvatarUrl, DEFAULT_BOY_AVATAR, DEFAULT_GIRL_AVATAR } from '../../utils/avatarPresets';

const compressImage = (file, callback) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX = 320;
            let w = img.width, h = img.height;
            if (w > h) { if (w > MAX) { h = h * MAX / w; w = MAX; } }
            else       { if (h > MAX) { w = w * MAX / h; h = MAX; } }
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            callback(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
};

export const AddKidModal = ({ context }) => {
    const {
        showAddKidModal, setShowAddKidModal,
        newKidForm, setNewKidForm,
        kids, setKids,
        notify
    } = context;

    if (!showAddKidModal) return null;

    const isPhoto = newKidForm.avatar?.startsWith('data:image/');
    const accentColor = newKidForm.gender === 'boy' ? 'blue' : 'pink';

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        compressImage(file, (base64) => {
            setNewKidForm(f => ({ ...f, avatar: base64 }));
        });
        // reset file input so same file can be re-selected
        e.target.value = '';
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-bounce-in">

                {/* Header */}
                <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center">
                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                        <Icons.Users size={24} className="text-indigo-500" />
                        {newKidForm.id ? '编辑家庭成员' : '添加家庭成员'}
                    </h2>
                    <button onClick={() => setShowAddKidModal(false)}
                        className="text-slate-400 hover:text-slate-600 bg-white w-8 h-8 rounded-full shadow-sm flex items-center justify-center transition-colors">
                        <Icons.X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">宝贝的小名 / 昵称</label>
                        <input
                            type="text"
                            value={newKidForm.name}
                            onChange={e => setNewKidForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="例如：小明、芳芳"
                            className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500 transition-colors"
                            autoFocus
                        />
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">选择性别</label>
                        <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                            <button onClick={() => setNewKidForm(f => ({ ...f, gender: 'boy', avatar: DEFAULT_BOY_AVATAR }))}
                                className={`flex-1 py-3 font-black text-sm rounded-lg transition-all flex items-center justify-center gap-1.5 ${newKidForm.gender === 'boy' ? 'bg-white text-blue-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                <span style={{ fontSize: 17, lineHeight: 1, color: '#3B82F6' }}>♂</span> 男孩
                            </button>
                            <button onClick={() => setNewKidForm(f => ({ ...f, gender: 'girl', avatar: DEFAULT_GIRL_AVATAR }))}
                                className={`flex-1 py-3 font-black text-sm rounded-lg transition-all flex items-center justify-center gap-1.5 ${newKidForm.gender === 'girl' ? 'bg-white text-pink-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                <span style={{ fontSize: 17, lineHeight: 1, color: '#EC4899' }}>♀</span> 女孩
                            </button>
                        </div>
                    </div>

                    {/* Avatar section */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3">头像</label>

                        {/* Photo upload row */}
                        <div className="flex items-center gap-4 mb-4">
                            {/* Upload button */}
                            <label htmlFor="add-kid-photo-upload"
                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors active:scale-[0.98]">
                                <Icons.Camera size={20} className="text-slate-400" />
                                <span className="text-sm font-bold text-slate-500">上传宝贝照片</span>
                            </label>
                            <input
                                id="add-kid-photo-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />

                            {/* Photo preview (shown when a photo is uploaded) */}
                            {isPhoto && (
                                <div className="relative shrink-0">
                                    <div className={`w-16 h-16 rounded-full overflow-hidden border-[3px] shadow-lg ${accentColor === 'boy' ? 'border-blue-400' : 'border-pink-400'}`}>
                                        <img src={newKidForm.avatar} alt="kid" className="w-full h-full object-cover" />
                                    </div>
                                    <button
                                        onClick={() => setNewKidForm(f => ({ ...f, avatar: newKidForm.gender === 'boy' ? DEFAULT_BOY_AVATAR : DEFAULT_GIRL_AVATAR }))}
                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors">
                                        <Icons.X size={11} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-3 mb-3">
                            <div className="flex-1 h-px bg-slate-100" />
                            <span className="text-[11px] font-bold text-slate-400">或选择预设头像</span>
                            <div className="flex-1 h-px bg-slate-100" />
                        </div>

                        {/* Miniavs grid */}
                        <div className={`grid grid-cols-4 gap-3 ${isPhoto ? 'opacity-50' : ''}`}>
                            {(newKidForm.gender === 'boy' ? BOY_AVATAR_SEEDS : GIRL_AVATAR_SEEDS).map(seed => {
                                const av = seedToAvatar(seed);
                                const isSelected = !isPhoto && newKidForm.avatar === av;
                                return (
                                    <button key={seed} onClick={() => setNewKidForm(f => ({ ...f, avatar: av }))}
                                        className={`aspect-square rounded-2xl overflow-hidden transition-all border-2 ${
                                            isSelected
                                                ? (newKidForm.gender === 'boy' ? 'border-blue-400 scale-110 shadow-md' : 'border-pink-400 scale-110 shadow-md')
                                                : 'border-transparent bg-slate-50 hover:scale-105'
                                        }`}>
                                        <img src={getAvatarUrl(av)} alt={seed} className="w-full h-full object-cover" loading="lazy" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 p-6 border-t border-slate-100 flex gap-4">
                    <button onClick={() => setShowAddKidModal(false)}
                        className="flex-[1] bg-white text-slate-600 font-bold py-4 rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50">
                        取消
                    </button>
                    <button onClick={async () => {
                        if (!newKidForm.name.trim()) return notify('请输入孩子名字', 'error');
                        if (!newKidForm.avatar)      return notify('请选择一个头像', 'error');
                        if (newKidForm.id) {
                            try {
                                await apiFetch(`/api/kids/${newKidForm.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ name: newKidForm.name.trim(), avatar: newKidForm.avatar }),
                                });
                                setKids(kids.map(k => k.id === newKidForm.id ? { ...k, name: newKidForm.name.trim(), avatar: newKidForm.avatar } : k));
                                notify('资料已保存更新！', 'success');
                                setShowAddKidModal(false);
                            } catch { notify('保存失败', 'error'); }
                        } else {
                            const newKid = { id: `kid_${Date.now()}`, name: newKidForm.name.trim(), avatar: newKidForm.avatar };
                            try {
                                await apiFetch('/api/kids', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(newKid),
                                });
                                setKids([...kids, { ...newKid, level: 1, exp: 0, balances: { spend: 0, save: 0, give: 0 }, vault: { lockedAmount: 0, projectedReturn: 0 } }]);
                                notify('家庭新成员添加成功！', 'success');
                                setShowAddKidModal(false);
                            } catch { notify('添加失败', 'error'); }
                        }
                    }} className={`flex-[2] text-white font-black py-4 rounded-xl shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] ${newKidForm.gender === 'boy' ? 'bg-blue-500 shadow-blue-200' : 'bg-pink-500 shadow-pink-200'}`}>
                        {newKidForm.id ? '保存修改' : '确定添加'}
                    </button>
                </div>
            </div>
        </div>
    );
};
