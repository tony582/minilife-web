import React from 'react';
import { Icons } from '../../utils/Icons';
import { apiFetch } from '../../api/client';

export const AddKidModal = ({ context }) => {
    const {
        showAddKidModal, setShowAddKidModal,
        newKidForm, setNewKidForm,
        kids, setKids,
        notify
    } = context;

    if (!showAddKidModal) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-bounce-in">
                <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center relative">
                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-2"><Icons.Users size={24} className="text-indigo-500" /> {newKidForm.id ? '编辑家庭成员' : '添加家庭成员'}</h2>
                    <button onClick={() => setShowAddKidModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors bg-white w-8 h-8 rounded-full shadow-sm flex items-center justify-center"><Icons.X size={18} /></button>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">宝贝的小名 / 昵称</label>
                        <input type="text" value={newKidForm.name} onChange={e => setNewKidForm(f => ({ ...f, name: e.target.value }))} placeholder="例如：小明、芳芳"
                            className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500 transition-colors" autoFocus />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">选择性别</label>
                        <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                            <button onClick={() => setNewKidForm(f => ({ ...f, gender: 'boy', avatar: '👦' }))}
                                className={`flex-1 py-3 font-black text-sm rounded-lg transition-all flex items-center justify-center gap-2 ${newKidForm.gender === 'boy' ? 'bg-white text-blue-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                👦 男孩
                            </button>
                            <button onClick={() => setNewKidForm(f => ({ ...f, gender: 'girl', avatar: '👧' }))}
                                className={`flex-1 py-3 font-black text-sm rounded-lg transition-all flex items-center justify-center gap-2 ${newKidForm.gender === 'girl' ? 'bg-white text-pink-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                👧 女孩
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">挑选一个专属可爱头像</label>
                        <div className="grid grid-cols-5 gap-3">
                            {(newKidForm.gender === 'boy' ? ['👦', '🧑‍🚀', '🦸‍♂️', '🕵️‍♂️', '👼'] : ['👧', '👩‍🚀', '🦸‍♀️', '🧚‍♀️', '🧜‍♀️']).map(avatar => (
                                <button key={avatar} onClick={() => setNewKidForm(f => ({ ...f, avatar }))}
                                    className={`aspect-square text-3xl flex items-center justify-center rounded-2xl transition-all ${newKidForm.avatar === avatar ? (newKidForm.gender === 'boy' ? 'bg-blue-100 border-2 border-blue-400 scale-110 shadow-sm' : 'bg-pink-100 border-2 border-pink-400 scale-110 shadow-sm') : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100 grayscale hover:grayscale-0'}`}>
                                    {avatar}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="bg-slate-50 p-6 border-t border-slate-100 flex gap-4">
                    <button onClick={() => setShowAddKidModal(false)} className="flex-[1] bg-white text-slate-600 font-bold py-4 rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50">取消</button>
                    <button onClick={async () => {
                        if (!newKidForm.name.trim()) return notify("请输入孩子名字", "error");
                        if (!newKidForm.avatar) return notify("请选择一个头像", "error");
                        if (newKidForm.id) {
                            try {
                                await apiFetch(`/api/kids/${newKidForm.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newKidForm.name.trim(), avatar: newKidForm.avatar }) });
                                setKids(kids.map(k => k.id === newKidForm.id ? { ...k, name: newKidForm.name.trim(), avatar: newKidForm.avatar } : k));
                                notify("资料已保存更新！", "success");
                                setShowAddKidModal(false);
                            } catch (err) { notify("保存失败", "error"); }
                        } else {
                            const newKid = { id: `kid_${Date.now()}`, name: newKidForm.name.trim(), avatar: newKidForm.avatar };
                            try {
                                await apiFetch('/api/kids', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newKid) });
                                setKids([...kids, { ...newKid, level: 1, exp: 0, balances: { spend: 0, save: 0, give: 0 }, vault: { lockedAmount: 0, projectedReturn: 0 } }]);
                                notify("家庭新成员添加成功！", "success");
                                setShowAddKidModal(false);
                            } catch (err) { notify("添加失败", "error"); }
                        }
                    }} className={`flex-[2] text-white font-black py-4 rounded-xl shadow-lg transition-transform hover:scale-[1.02] ${newKidForm.gender === 'boy' ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-200' : 'bg-pink-500 hover:bg-pink-600 shadow-pink-200'}`}>
                        {newKidForm.id ? '保存修改' : '确定添加'}
                    </button>
                </div>
            </div>
        </div>
    );
};
