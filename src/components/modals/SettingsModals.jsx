import React, { useState } from 'react';
import { Icons, AvatarDisplay } from '../../utils/Icons';
import { apiFetch, safeJson, safeJsonOr } from '../../api/client';
import { detectGender, DEFAULT_BOY_AVATAR } from '../../utils/avatarPresets';
import { getSpiritForm } from '../../utils/spiritUtils';

export const SettingsModals = ({ context }) => {
    const {
        showSettingsModal, setShowSettingsModal,
        showSubscriptionModal, setShowSubscriptionModal,
        showSecurityParamsModal, setShowSecurityParamsModal,
        showLevelModal, setShowLevelModal,
        showAddKidModal, setShowAddKidModal,
        newKidForm, setNewKidForm,
        parentSettings, setParentSettings,

        usedCodes, setUsedCodes,
        user, setUser,
        kids, setKids,
        notify
    } = context;
    const [settingsCode, setSettingsCode] = useState('');

    return (
        <>
            {/* Child Management Modal */}
            {showSettingsModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[200] animate-fade-in">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 shrink-0">
                            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2"><Icons.Users size={22} className="text-indigo-500" /> 孩子资料管理</h2>
                            <button onClick={() => setShowSettingsModal(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"><Icons.X size={18} /></button>
                        </div>
                        <div className="p-6 overflow-y-auto overflow-x-hidden relative flex-1">
                            <div className="space-y-4 mb-6">
                                {kids.map(k => (
                                    <div key={k.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex gap-4 items-center">
                                        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 shrink-0 overflow-hidden">
                                            <AvatarDisplay avatar={k.avatar} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-black text-slate-800 text-base truncate">{k.name}</div>
                                            {(() => { const sf = getSpiritForm(k.level); return (
                                                <span className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded-md" style={{ background: `${sf.color}15`, border: `1px solid ${sf.color}25` }}>
                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black shadow-sm" style={{ background: sf.color, color: '#FFF' }}>Lv.{k.level}</span>
                                                    <span className="text-[11px] font-black pr-0.5" style={{ color: sf.color }}>{sf.name}</span>
                                                    <span className="text-[10px] font-bold" style={{ color: `${sf.color}99` }}>· 星尘 {k.exp}</span>
                                                </span>
                                            ); })()}
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button onClick={() => {
                                                const gender = detectGender(k.avatar);
                                                setNewKidForm({ id: k.id, name: k.name, gender, avatar: k.avatar });
                                                setShowAddKidModal(true);
                                            }} className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:border-indigo-200 hover:bg-indigo-50 transition-colors">
                                                <Icons.Edit3 size={18} />
                                            </button>
                                            <button onClick={async () => {
                                                if (window.confirm(`确定要删除 ${k.name} 吗？与该孩子相关的所有任务、订单和记录都将被删除！此操作无法撤销。`)) {
                                                    try {
                                                        await apiFetch(`/api/kids/${k.id}`, { method: 'DELETE' });
                                                        setKids(kids.filter(kid => kid.id !== k.id));
                                                        notify(`${k.name} 已被删除`, "success");
                                                    } catch (e) { notify("删除失败", "error"); }
                                                }
                                            }} className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors">
                                                <Icons.Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => {
                                if (kids.length >= 5) {
                                    return notify("目前最多支持添加5名家庭成员！", "warning");
                                }
                                setNewKidForm({ id: null, name: '', gender: 'boy', avatar: DEFAULT_BOY_AVATAR });
                                setShowAddKidModal(true);
                            }} className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 border-2 border-dashed border-slate-300 transition-colors flex items-center justify-center gap-2">
                                <Icons.Plus size={18} className="text-slate-400" /> 添加家庭成员
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Subscription Modal */}
            {showSubscriptionModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[200] animate-fade-in">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 shrink-0">
                            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2"><Icons.Award size={22} className="text-rose-500" /> 我的订阅体验</h2>
                            <button onClick={() => setShowSubscriptionModal(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"><Icons.X size={18} /></button>
                        </div>
                        <div className="p-6 overflow-y-auto relative flex-1">
                            <div className="space-y-6">
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                    <div className="text-sm font-bold text-slate-500 mb-1">当前账号</div>
                                    <div className="font-black text-slate-800 text-lg">{user?.email}</div>
                                    <div className="mt-4 text-sm font-bold text-slate-500 mb-1">服务有效期至</div>
                                    <div className={`font-black text-lg ${new Date(user?.sub_end_date) < new Date() ? 'text-rose-500' : 'text-emerald-600'}`}>
                                        {user?.sub_end_date ? new Date(user.sub_end_date).toLocaleDateString() : '永久有效'}
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">输入兑换码续费</label>
                                    <div className="flex gap-2">
                                        <input type="text" value={settingsCode} onChange={e => setSettingsCode(e.target.value.toUpperCase())} className="flex-1 bg-white border-2 border-slate-200 p-3 rounded-xl font-black text-slate-800 tracking-wider outline-none focus:border-rose-500 uppercase placeholder:text-slate-300 placeholder:font-bold" placeholder="ACT-XXXXXX" />
                                        <button onClick={async () => {
                                            if (!settingsCode) return;
                                            try {
                                                const res = await apiFetch('/api/redeem-code', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: settingsCode }) });
                                                const data = await safeJson(res);
                                                if (!res.ok || data.error) return notify(data.error || "兑换失败", 'error');
                                                notify("兑换成功！", 'success');
                                                setUser(prev => ({ ...prev, sub_end_date: data.new_sub_end_date }));
                                                setSettingsCode('');
                                                apiFetch('/api/me/codes').then(r => safeJsonOr(r, [])).then(d => d && setUsedCodes(d)).catch(console.error);
                                            } catch (err) { notify("网络错误", "error"); }
                                        }} className="bg-rose-500 text-white px-6 rounded-xl font-bold shadow-md shadow-rose-200 hover:bg-rose-600 transition-colors shrink-0">兑换卡密</button>
                                    </div>
                                </div>
                                {usedCodes.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-slate-100">
                                        <h3 className="text-sm font-black text-slate-700 mb-3 flex items-center gap-2"><Icons.Clock size={16}/> 兑换历史记录</h3>
                                        <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                            {usedCodes.map(c => (
                                                <div key={c.code} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-sm">
                                                    <div className="font-mono font-bold text-slate-700 bg-white px-2 py-1 rounded border border-slate-200 text-sm tracking-widest">{c.code}</div>
                                                    <div className="text-right">
                                                        <span className="font-black text-emerald-600 block text-sm">+{c.duration_days} 天</span>
                                                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{new Date(c.used_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Security PIN Modal */}
            {showSecurityParamsModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[200] animate-fade-in">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 shrink-0">
                            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2"><Icons.Lock size={22} className="text-slate-600" /> 后台安全锁</h2>
                            <button onClick={() => setShowSecurityParamsModal(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"><Icons.X size={18} /></button>
                        </div>
                        <div className="p-6 overflow-y-auto relative flex-1">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-slate-800">开启家长密码锁</div>
                                        <div className="text-xs text-slate-500 mt-1">防止孩子私自进入后台修改数据</div>
                                    </div>
                                    <button onClick={() => setParentSettings(p => ({ ...p, pinEnabled: !p.pinEnabled }))} className={`w-14 h-8 rounded-full flex items-center p-1 transition-colors ${parentSettings.pinEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                        <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform ${parentSettings.pinEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                    </button>
                                </div>
                                {parentSettings.pinEnabled && (
                                    <div className="animate-fade-in">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">修改 4 位密码 (默认1234)</label>
                                        <input type="text" maxLength={4} value={parentSettings.pinCode} onChange={e => setParentSettings(p => ({ ...p, pinCode: e.target.value.replace(/\D/g, '') }))} className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-xl font-mono text-xl tracking-[1em] outline-none focus:border-indigo-500 text-center" />
                                    </div>
                                )}
                                <button onClick={() => { setShowSecurityParamsModal(false); notify("安全设置已保存", "success"); }} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition-colors shadow-lg active:scale-[0.98]">完成设定</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
