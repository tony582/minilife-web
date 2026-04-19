import React from 'react';
import { useDataContext } from '../../../context/DataContext.jsx';
import { useUIContext } from '../../../context/UIContext.jsx';
import { useToast } from '../../../hooks/useToast';
import { apiFetch } from '../../../api/client';
import { Icons, AvatarDisplay } from '../../../utils/Icons';
import { detectGender, DEFAULT_BOY_AVATAR } from '../../../utils/avatarPresets';
import { getSpiritForm } from '../../../utils/spiritUtils';

/**
 * KidSettingsApp - 孩子资料与管教
 * 管理孩子名单、编辑资料、删除孩子、进入成长图鉴配置
 */
export const KidSettingsApp = () => {
    const { kids, setKids } = useDataContext();
    const {
        setShowAddKidModal,
        setNewKidForm,
        setShowLevelModal,
    } = useUIContext();
    const { notify } = useToast();

    const handleEditKid = (k) => {
        const gender = detectGender(k.avatar);
        setNewKidForm({ id: k.id, name: k.name, gender, avatar: k.avatar });
        setShowAddKidModal(true);
    };

    const handleDeleteKid = async (k) => {
        if (window.confirm(`确定要删除 ${k.name} 吗？与该孩子相关的所有任务、订单和记录都将被删除！此操作无法撤销。`)) {
            try {
                await apiFetch(`/api/kids/${k.id}`, { method: 'DELETE' });
                setKids(kids.filter(kid => kid.id !== k.id));
                notify(`${k.name} 已被删除`, "success");
            } catch (e) {
                notify("删除失败", "error");
            }
        }
    };

    const handleAddKid = () => {
        if (kids.length >= 5) {
            return notify("目前最多支持添加5名家庭成员！", "warning");
        }
        setNewKidForm({ id: null, name: '', gender: 'boy', avatar: DEFAULT_BOY_AVATAR });
        setShowAddKidModal(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <Icons.Users size={22} className="text-indigo-500" /> 孩子资料管理
                </h2>
                <span className="text-sm font-bold text-slate-400">{kids.length}/5 位成员</span>
            </div>

            {/* 孩子列表 */}
            <div className="space-y-4">
                {kids.map(k => (
                    <div key={k.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex gap-4 items-center shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center shadow-sm border border-slate-200 shrink-0 overflow-hidden">
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
                            <button onClick={() => handleEditKid(k)} className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:border-indigo-200 hover:bg-indigo-50 transition-colors">
                                <Icons.Edit3 size={18} />
                            </button>
                            <button onClick={() => handleDeleteKid(k)} className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors">
                                <Icons.Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* 添加按钮 */}
            <button onClick={handleAddKid} className="w-full bg-slate-50 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-100 border-2 border-dashed border-slate-300 transition-colors flex items-center justify-center gap-2">
                <Icons.Plus size={18} className="text-slate-400" /> 添加家庭成员
            </button>
        </div>
    );
};
