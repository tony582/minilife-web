import React, { useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useSwipeBack } from '../../hooks/useSwipeBack';
import { Icons } from '../../utils/Icons';
import { CategoryManagerModal } from './CategoryManagerModal';

export const AddPlanModal = ({ context }) => {
    const {
        showAddPlanModal, setShowAddPlanModal,
        editingTask, setEditingTask,
        planType, setPlanType,
        planForm, setPlanForm,
        planFormErrors, setPlanFormErrors,
        handleSavePlan,
        kids,
        parentSettings, setParentSettings,
        allCategories,
        getCategoryGradient, getCatHexColor,
        getIconForCategory,
        handleRejectTask,
        AvatarDisplay
    } = context;

    const fileInputRef = useRef(null);
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const closeModal = useCallback(() => { setShowAddPlanModal(false); setEditingTask(null); }, [setShowAddPlanModal, setEditingTask]);
    const { swipeRef, swipeHandlers } = useSwipeBack(closeModal, { enabled: showAddPlanModal });

    if (!showAddPlanModal) return null;

        try {
            // Define color themes for habits
            const habitColors = [
                'from-blue-400 to-blue-500', 'from-indigo-400 to-indigo-500', 'from-purple-400 to-purple-500',
                'from-fuchsia-400 to-fuchsia-500', 'from-rose-400 to-rose-500', 'from-red-400 to-red-500',
                'from-orange-400 to-orange-500', 'from-amber-400 to-amber-500', 'from-green-400 to-green-500',
                'from-emerald-400 to-emerald-500', 'from-teal-400 to-teal-500', 'from-cyan-400 to-cyan-500'
            ];

            const studyEmojis = ['📚', '✏️', '📝', '🧮', '🔬', '💻', '🧠', '🎧', '🎨', '🎵'];
            const habitEmojis = ['⭐', '⏰', '🛏️', '🧹', '🏃', '🍎', '🥛', '🚫', '📱', '🎮'];

            return (
                planType === 'habit' ? (
                /* ═══ HABIT MODAL — full-screen mobile, warm Headspace style ═══ */
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-0 md:p-6 animate-fade-in"
                    style={{ background: 'rgba(27,46,75,0.3)', backdropFilter: 'blur(8px)' }}>
                    <div ref={swipeRef} {...swipeHandlers}
                        className="w-full h-full md:h-auto md:max-h-[85vh] md:max-w-lg flex flex-col md:rounded-3xl overflow-hidden animate-bounce-in"
                        style={{ background: '#FBF7F0' }}
                        onClick={e => e.stopPropagation()}>

                        {/* — Header — */}
                        <div className="shrink-0 px-5 py-4 flex items-center justify-between"
                            style={{ background: '#FFFFFF', borderBottom: '1px solid #F0EBE1' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                                    style={{ background: '#4ECDC418', color: '#4ECDC4' }}>🌱</div>
                                <div>
                                    <h2 className="font-black text-base" style={{ color: '#1B2E4B' }}>
                                        {editingTask ? '编辑习惯' : '新建习惯'}
                                    </h2>
                                    <div className="text-[11px] font-bold mt-0.5" style={{ color: '#9CAABE' }}>
                                        {editingTask ? '修改后点击保存' : '培养好习惯，纠正坏习惯'}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => { setShowAddPlanModal(false); setEditingTask(null); }}
                                className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
                                style={{ background: '#F0EBE1', color: '#9CAABE' }}>
                                <Icons.X size={18} />
                            </button>
                        </div>

                        {/* — Scrollable Body — */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-5 min-h-0">

                            {/* Section: 习惯名称 */}
                            <div data-field-error={planFormErrors?.title ? 'title' : undefined}>
                                <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: planFormErrors?.title ? '#EF4444' : '#9CAABE' }}>习惯名称 {planFormErrors?.title && <span className="text-red-500 normal-case">— {planFormErrors.title}</span>}</label>
                                <input
                                    value={planForm.title || ''}
                                    onChange={e => { setPlanForm({ ...planForm, title: e.target.value }); if (planFormErrors?.title) setPlanFormErrors(prev => ({ ...prev, title: undefined })); }}
                                    placeholder="例如：早起、阅读、不玩手机"
                                    className={`w-full rounded-xl px-4 py-3 outline-none font-bold text-base transition-all ${planFormErrors?.title ? 'animate-shake' : ''}`}
                                    style={{ background: '#FFFFFF', border: `1.5px solid ${planFormErrors?.title ? '#EF4444' : '#F0EBE1'}`, color: '#1B2E4B' }}
                                    onFocus={e => e.target.style.borderColor = planFormErrors?.title ? '#EF4444' : '#4ECDC4'}
                                    onBlur={e => e.target.style.borderColor = planFormErrors?.title ? '#EF4444' : '#F0EBE1'}
                                />
                            </div>

                            {/* Section: 外观 — Icon + Color + Preview grouped */}
                            <div className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1px solid #F0EBE1' }}>
                                {/* Live Preview */}
                                <div className={`rounded-2xl bg-gradient-to-br ${planForm.habitColor} p-4 flex items-center gap-3 text-white mb-4 relative overflow-hidden`}
                                    style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl translate-x-6 -translate-y-6"></div>
                                    <div className="text-3xl flex items-center justify-center bg-white/20 w-14 h-14 rounded-2xl backdrop-blur-sm shrink-0 relative z-10">
                                        {planForm.iconEmoji}
                                    </div>
                                    <div className="flex-1 min-w-0 relative z-10">
                                        <div className="font-black text-base leading-tight truncate">{planForm.title || '习惯名称'}</div>
                                        <div className="text-white/70 text-[11px] font-bold mt-0.5">
                                            {planForm.habitType === 'daily_once' ? '每日打卡' : '多次记录'} · {planForm.habitRewardType === 'penalty' ? '坏习惯' : '好习惯'}
                                        </div>
                                    </div>
                                </div>

                                {/* Icon Picker */}
                                <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: '#9CAABE' }}>选择图标</label>
                                <div className="flex flex-wrap gap-1.5 pb-2 mb-3">
                                    {habitEmojis.map(e => (
                                        <button key={e} onClick={() => setPlanForm({ ...planForm, iconEmoji: e })}
                                            className={`text-xl p-2 rounded-xl transition-all ${planForm.iconEmoji === e ? 'bg-white shadow-md scale-110' : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0'}`}
                                            style={planForm.iconEmoji === e ? { boxShadow: '0 0 0 2px #4ECDC4' } : {}}>{e}</button>
                                    ))}
                                </div>

                                {/* Color Picker */}
                                <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: '#9CAABE' }}>主题颜色</label>
                                <div className="flex flex-wrap gap-2 pb-1">
                                    {habitColors.map(color => (
                                        <button key={color} onClick={() => setPlanForm({ ...planForm, habitColor: color })}
                                            className={`w-8 h-8 rounded-xl bg-gradient-to-br ${color} transition-all relative overflow-hidden
                                            ${planForm.habitColor === color ? 'scale-110 ring-2 ring-offset-2' : 'opacity-60 hover:opacity-100 hover:scale-105'}`}
                                            style={planForm.habitColor === color ? { ringColor: '#1B2E4B' } : {}}>
                                            {planForm.habitColor === color && <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white"><Icons.Check size={14} /></div>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Section: 指派给谁 (hidden when only one kid) */}
                            {kids.length > 1 && (
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: '#9CAABE' }}>指派给谁</label>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => setPlanForm({ ...planForm, targetKids: ['all'] })}
                                        className="px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                                        style={(!planForm.targetKids || planForm.targetKids.includes('all'))
                                            ? { background: '#4ECDC4', color: '#fff', boxShadow: '0 2px 8px rgba(78,205,196,0.3)' }
                                            : { background: '#F0EBE1', color: '#5A6E8A' }}>
                                        👥 全部
                                    </button>
                                    {kids.map(k => {
                                        const isSelected = (!planForm.targetKids || planForm.targetKids.includes('all')) || planForm.targetKids.includes(k.id);
                                        return (
                                            <button key={k.id}
                                                onClick={() => {
                                                    let nt = (!planForm.targetKids || planForm.targetKids.includes('all')) ? [] : [...planForm.targetKids];
                                                    if (nt.includes(k.id)) { nt = nt.filter(id => id !== k.id); } else { nt.push(k.id); }
                                                    if (nt.length === 0) nt = ['all'];
                                                    if (nt.length === kids.length && kids.length > 0) nt = ['all'];
                                                    setPlanForm({ ...planForm, targetKids: nt });
                                                }}
                                                className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
                                                style={isSelected && planForm.targetKids && !planForm.targetKids.includes('all')
                                                    ? { background: '#4ECDC4', color: '#fff', boxShadow: '0 2px 8px rgba(78,205,196,0.3)' }
                                                    : (!planForm.targetKids || planForm.targetKids.includes('all'))
                                                        ? { background: 'rgba(78,205,196,0.1)', color: '#4ECDC4' }
                                                        : { background: '#F0EBE1', color: '#5A6E8A' }}>
                                                <div className="w-5 h-5 rounded-full overflow-hidden shrink-0"><AvatarDisplay avatar={k.avatar} /></div>
                                                <span className="truncate">{k.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            )}

                            {/* Section: 好坏习惯 + 频率 + 金币 — grouped */}
                            <div className="rounded-2xl p-4 space-y-4" style={{ background: '#FFFFFF', border: '1px solid #F0EBE1' }}>

                                {/* 好/坏习惯 */}
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-wider mb-2 block" style={{ color: '#9CAABE' }}>习惯类型</label>
                                    <div className="flex gap-2">
                                        <button onClick={() => setPlanForm({ ...planForm, habitRewardType: 'reward' })}
                                            className="flex-1 py-2.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-1.5 active:scale-95"
                                            style={planForm.habitRewardType === 'reward'
                                                ? { background: '#4ECDC4', color: '#fff', boxShadow: '0 2px 10px rgba(78,205,196,0.3)' }
                                                : { background: '#F0EBE1', color: '#5A6E8A' }}>
                                            <Icons.ThumbsUp size={14} /> 好习惯
                                        </button>
                                        <button onClick={() => setPlanForm({ ...planForm, habitRewardType: 'penalty' })}
                                            className="flex-1 py-2.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-1.5 active:scale-95"
                                            style={planForm.habitRewardType === 'penalty'
                                                ? { background: '#FF6B6B', color: '#fff', boxShadow: '0 2px 10px rgba(255,107,107,0.3)' }
                                                : { background: '#F0EBE1', color: '#5A6E8A' }}>
                                            <Icons.ThumbsDown size={14} /> 坏习惯
                                        </button>
                                    </div>
                                </div>

                                {/* 频率 */}
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-wider mb-2 block" style={{ color: '#9CAABE' }}>打卡频率</label>
                                    <div className="flex gap-2">
                                        <button onClick={() => setPlanForm({ ...planForm, habitType: 'daily_once' })}
                                            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
                                            style={planForm.habitType === 'daily_once'
                                                ? { background: 'rgba(78,205,196,0.12)', color: '#2BA8A0', boxShadow: 'inset 0 0 0 1.5px rgba(78,205,196,0.3)' }
                                                : { background: '#F0EBE1', color: '#5A6E8A' }}>
                                            每日一次
                                        </button>
                                        <button onClick={() => setPlanForm({ ...planForm, habitType: 'multiple' })}
                                            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
                                            style={planForm.habitType === 'multiple'
                                                ? { background: 'rgba(78,205,196,0.12)', color: '#2BA8A0', boxShadow: 'inset 0 0 0 1.5px rgba(78,205,196,0.3)' }
                                                : { background: '#F0EBE1', color: '#5A6E8A' }}>
                                            多次记录
                                        </button>
                                    </div>
                                </div>

                                {/* 多次记录 — 上限设置 */}
                                {planForm.habitType === 'multiple' && (
                                    <div className="space-y-3 pt-1 animate-fade-in">
                                        <div className="flex gap-2">
                                            <button onClick={() => setPlanForm({ ...planForm, periodMaxType: 'daily' })}
                                                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
                                                style={planForm.periodMaxType === 'daily'
                                                    ? { background: 'rgba(78,205,196,0.12)', color: '#2BA8A0', boxShadow: 'inset 0 0 0 1.5px rgba(78,205,196,0.3)' }
                                                    : { background: '#F0EBE1', color: '#5A6E8A' }}>
                                                每日上限
                                            </button>
                                            <button onClick={() => setPlanForm({ ...planForm, periodMaxType: 'weekly' })}
                                                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
                                                style={planForm.periodMaxType === 'weekly'
                                                    ? { background: 'rgba(78,205,196,0.12)', color: '#2BA8A0', boxShadow: 'inset 0 0 0 1.5px rgba(78,205,196,0.3)' }
                                                    : { background: '#F0EBE1', color: '#5A6E8A' }}>
                                                每周上限
                                            </button>
                                        </div>
                                        {/* Stepper: 最多次数 */}
                                        <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: '#fff', border: '1px solid #F0EBE1' }}>
                                            <span className="text-sm font-bold" style={{ color: '#1B2E4B' }}>最多打卡次数</span>
                                            <div className="flex items-center gap-0">
                                                <button onClick={() => setPlanForm({ ...planForm, periodMaxPerDay: Math.max(2, (planForm.periodMaxPerDay || 3) - 1) })}
                                                    className="w-9 h-9 rounded-l-xl flex items-center justify-center text-lg font-bold transition-all active:scale-90"
                                                    style={{ background: '#F0EBE1', color: '#5A6E8A' }}>−</button>
                                                <div className="w-12 h-9 flex items-center justify-center text-base font-black"
                                                    style={{ background: '#FBF7F0', color: '#1B2E4B', borderTop: '1px solid #F0EBE1', borderBottom: '1px solid #F0EBE1' }}>
                                                    {planForm.periodMaxPerDay || 3}
                                                </div>
                                                <button onClick={() => setPlanForm({ ...planForm, periodMaxPerDay: Math.min(99, (planForm.periodMaxPerDay || 3) + 1) })}
                                                    className="w-9 h-9 rounded-r-xl flex items-center justify-center text-lg font-bold transition-all active:scale-90"
                                                    style={{ background: '#4ECDC4', color: '#fff' }}>+</button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 金币奖惩 — full width stepper */}
                                <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: '#fff', border: '1px solid #F0EBE1' }}>
                                    <span className="text-sm font-bold" style={{ color: '#1B2E4B' }}>
                                        每次{planForm.habitRewardType === 'penalty' ? '扣' : '奖'} ⭐ 家庭币
                                    </span>
                                    <div className="flex items-center gap-0">
                                        <button onClick={() => setPlanForm({ ...planForm, reward: Math.max(0, (parseInt(planForm.reward) || 5) - 1).toString() })}
                                            className="w-9 h-9 rounded-l-xl flex items-center justify-center text-lg font-bold transition-all active:scale-90"
                                            style={{ background: '#F0EBE1', color: '#5A6E8A' }}>−</button>
                                        <div className="w-12 h-9 flex items-center justify-center text-base font-black"
                                            style={{ background: '#FBF7F0', color: '#1B2E4B', borderTop: '1px solid #F0EBE1', borderBottom: '1px solid #F0EBE1' }}>
                                            {Math.abs(planForm.reward || 5)}
                                        </div>
                                        <button onClick={() => setPlanForm({ ...planForm, reward: ((parseInt(planForm.reward) || 5) + 1).toString() })}
                                            className="w-9 h-9 rounded-r-xl flex items-center justify-center text-lg font-bold transition-all active:scale-90"
                                            style={{ background: '#4ECDC4', color: '#fff' }}>+</button>
                                    </div>
                                </div>
                            </div>


                            {/* Section: History (edit mode only) */}
                            {(() => {
                                try {
                                    if (!editingTask || !editingTask.history || typeof editingTask.history !== 'object' || Array.isArray(editingTask.history) || Object.keys(editingTask.history).length === 0) return null;
                                    const allEntries = [];
                                    Object.entries(editingTask.history).sort((a, b) => new Date(b[0]) - new Date(a[0])).forEach(([dateStr, kidRecords]) => {
                                        if (!kidRecords || typeof kidRecords !== 'object' || Array.isArray(kidRecords)) return;
                                        Object.entries(kidRecords).forEach(([kidId, record]) => {
                                            if (!record || typeof record !== 'object') return;
                                            const kUser = kids.find(k => String(k.id) === String(kidId));
                                            if (kUser) allEntries.push({ dateStr, kidId, record, kUser });
                                        });
                                    });
                                    if (allEntries.length === 0) return null;
                                    const statusMap = { completed: { label: '✅' }, pending: { label: '⏳' }, pending_approval: { label: '⏳' }, failed: { label: '❌' }, todo: { label: '⬜' } };
                                    return (
                                        <div>
                                            <label className="text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: '#9CAABE' }}>
                                                <Icons.Clock size={12} /> 打卡记录 · {allEntries.length}条
                                            </label>
                                            <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #F0EBE1' }}>
                                                <div className="max-h-[160px] overflow-y-auto">
                                                    {allEntries.map((e, idx) => {
                                                        const s = statusMap[e.record.status] || statusMap.todo;
                                                        return (
                                                            <div key={`${e.dateStr}-${e.kidId}-${idx}`}
                                                                className="flex items-center gap-2 px-3.5 py-2.5 text-xs"
                                                                style={idx < allEntries.length - 1 ? { borderBottom: '1px solid #F0EBE1' } : {}}>
                                                                <span className="font-mono font-bold shrink-0" style={{ color: '#9CAABE' }}>{e.dateStr.slice(5)}</span>
                                                                <span className="font-bold truncate" style={{ color: '#1B2E4B' }}>{e.kUser.name}</span>
                                                                <span className="ml-auto shrink-0">{s.label}</span>
                                                                {e.record.status !== 'todo' && e.record.status !== 'failed' && (
                                                                    <button onClick={() => handleRejectTask(editingTask, e.dateStr, e.kidId)}
                                                                        className="text-[10px] font-bold px-2 py-1 rounded-lg transition-all active:scale-90 shrink-0"
                                                                        style={{ background: 'rgba(255,107,107,0.1)', color: '#FF6B6B' }}>打回</button>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                } catch (err) { return null; }
                            })()}
                        </div>

                        {/* — Footer — */}
                        <div className="shrink-0 px-5 py-4 pb-8 md:pb-4 flex gap-3" style={{ background: '#FFFFFF', borderTop: '1px solid #F0EBE1', paddingBottom: 'max(2rem, calc(env(safe-area-inset-bottom, 0px) + 1rem))' }}>
                            <button onClick={() => { setShowAddPlanModal(false); setEditingTask(null); }}
                                className="flex-1 py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
                                style={{ background: '#F0EBE1', color: '#5A6E8A' }}>
                                取消
                            </button>
                            <button onClick={handleSavePlan}
                                className="flex-[2] py-3 rounded-xl text-sm font-black text-white flex items-center justify-center gap-1.5 transition-all active:scale-95"
                                style={{ background: '#4ECDC4', boxShadow: '0 4px 15px rgba(78,205,196,0.35)' }}>
                                <Icons.Save size={16} /> {editingTask ? '保存修改' : '保存习惯'}
                            </button>
                        </div>
                    </div>
                </div>
                ) : (
                /* ═══ STUDY TASK MODAL — warm Headspace style (matches habit) ═══ */
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-0 md:p-6 animate-fade-in"
                    style={{ background: 'rgba(27,46,75,0.3)', backdropFilter: 'blur(8px)' }}>
                    <div ref={swipeRef} {...swipeHandlers}
                        className="w-full h-full md:h-auto md:max-h-[85vh] md:max-w-lg flex flex-col md:rounded-3xl overflow-hidden animate-bounce-in"
                        style={{ background: '#FBF7F0' }}
                        onClick={e => e.stopPropagation()}>

                        {/* — Header — */}
                        <div className="shrink-0 px-5 py-4 flex items-center justify-between"
                            style={{ background: '#FFFFFF', borderBottom: '1px solid #F0EBE1' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                                    style={{ background: '#FF8C4218', color: '#FF8C42' }}>📝</div>
                                <div>
                                    <h2 className="font-black text-base" style={{ color: '#1B2E4B' }}>
                                        {editingTask ? '编辑任务' : '新建任务'}
                                    </h2>
                                    <div className="text-[11px] font-bold mt-0.5" style={{ color: '#9CAABE' }}>
                                        {editingTask ? '修改后点击保存' : '布置任务，让孩子赚取家庭币'}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => { setShowAddPlanModal(false); setEditingTask(null); }}
                                className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
                                style={{ background: '#F0EBE1', color: '#9CAABE' }}>
                                <Icons.X size={18} />
                            </button>
                        </div>

                        {/* — Scrollable Body — */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-5 min-h-0">


                            {planType === 'study' && (
                                <div className="space-y-5 animate-fade-in relative z-0">

                                    {/* ═══ 分类 + 指派 (moved to top) ═══ */}
                                    <div className="rounded-2xl p-4 space-y-3" style={{ background: '#FFFFFF', border: '1px solid #F0EBE1' }}>
                                        {/* 分类选择 — 下拉列表 + 管理按钮 */}
                                        <div>
                                            <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: '#9CAABE' }}>分类</label>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: (() => {
                                                        const cc = (parentSettings.customCategories || []).find(c => (typeof c === 'object' ? c.name : c) === planForm.category);
                                                        return cc && typeof cc === 'object' ? cc.color : getCatHexColor(planForm.category);
                                                    })() }} />
                                                    <select
                                                        value={planForm.category || ''}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            const customCat = (parentSettings.customCategories || []).find(c => (typeof c === 'string' ? c : c.name) === val);
                                                            const iconName = customCat && typeof customCat === 'object' ? customCat.icon : getIconForCategory(val);
                                                            setPlanForm({ ...planForm, category: val, iconName });
                                                        }}
                                                        className="flex-1 min-w-0 rounded-xl px-3 py-2.5 outline-none font-bold text-sm appearance-none cursor-pointer"
                                                        style={{ background: '#FBF7F0', border: '1.5px solid #F0EBE1', color: '#1B2E4B' }}
                                                    >
                                                        {[...allCategories, ...(parentSettings.customCategories || []).map(c => typeof c === 'string' ? c : c.name).filter(c => !allCategories.includes(c))].map(c => (
                                                            <option key={c} value={c}>{c}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <button
                                                    onClick={() => setShowCategoryManager(true)}
                                                    className="shrink-0 px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all active:scale-95 flex items-center gap-1"
                                                    style={{ background: '#FBF7F0', color: '#9CAABE', border: '1.5px solid #F0EBE1' }}
                                                >
                                                    <Icons.Settings size={12} /> 管理
                                                </button>
                                            </div>
                                        </div>

                                        {/* 分类管理弹窗 — 使用标准弹窗 */}
                                        {showCategoryManager && createPortal(
                                            <CategoryManagerModal
                                                show={true}
                                                onClose={() => setShowCategoryManager(false)}
                                                parentSettings={parentSettings}
                                                setParentSettings={setParentSettings}
                                                allCategories={allCategories}
                                                getCatHexColor={getCatHexColor}
                                            />,
                                            document.body
                                        )}

                                        {/* 指派给谁 (hidden when only one kid) */}
                                        {kids.length > 1 && (
                                            <div>
                                                <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: '#9CAABE' }}>指派给谁</label>
                                                <div className="flex flex-wrap gap-1.5">
                                                    <button
                                                        onClick={() => setPlanForm({ ...planForm, targetKids: ['all'] })}
                                                        className="px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
                                                        style={(!planForm.targetKids || planForm.targetKids.includes('all'))
                                                            ? { background: '#FF8C42', color: '#fff', boxShadow: '0 2px 8px rgba(255,140,66,0.3)' }
                                                            : { background: '#FBF7F0', color: '#5A6E8A', border: '1px solid #F0EBE1' }}
                                                    >
                                                        👥 全部
                                                    </button>
                                                    {kids.map(k => {
                                                        const isSelected = (!planForm.targetKids || planForm.targetKids.includes('all')) || planForm.targetKids.includes(k.id);
                                                        const isExplicit = isSelected && (planForm.targetKids && !planForm.targetKids.includes('all'));
                                                        return (
                                                            <button key={k.id}
                                                                onClick={() => {
                                                                    let newTargets = (!planForm.targetKids || planForm.targetKids.includes('all')) ? [] : [...planForm.targetKids];
                                                                    if (newTargets.includes(k.id)) {
                                                                        newTargets = newTargets.filter(id => id !== k.id);
                                                                    } else {
                                                                        newTargets.push(k.id);
                                                                    }
                                                                    if (newTargets.length === 0) newTargets = ['all'];
                                                                    if (newTargets.length === kids.length && kids.length > 0) newTargets = ['all'];
                                                                    setPlanForm({ ...planForm, targetKids: newTargets });
                                                                }}
                                                                className="px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
                                                                style={isExplicit
                                                                    ? { background: '#FF8C42', color: '#fff', boxShadow: '0 2px 8px rgba(255,140,66,0.3)' }
                                                                    : ((!planForm.targetKids || planForm.targetKids.includes('all'))
                                                                        ? { background: '#FFF3E8', color: '#FF8C42', border: '1px solid #FFD4AD' }
                                                                        : { background: '#FBF7F0', color: '#5A6E8A', border: '1px solid #F0EBE1' })}
                                                            >
                                                                <div className="w-4 h-4 flex flex-shrink-0 items-center justify-center rounded-full overflow-hidden"><AvatarDisplay avatar={k.avatar} /></div> <span className="truncate">{k.name}</span>
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* 任务名称 */}
                                    <div data-field-error={planFormErrors?.title ? 'title' : undefined}>
                                        <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: planFormErrors?.title ? '#EF4444' : '#9CAABE' }}>任务名称 {planFormErrors?.title && <span className="text-red-500 normal-case">— {planFormErrors.title}</span>}</label>
                                        <input
                                            value={planForm.title || ''}
                                            onChange={e => { setPlanForm({ ...planForm, title: e.target.value }); if (planFormErrors?.title) setPlanFormErrors(prev => ({ ...prev, title: undefined })); }}
                                            placeholder="例如：练字30分钟、阅读打卡"
                                            className={`w-full rounded-xl px-4 py-3 outline-none font-bold text-base transition-all ${planFormErrors?.title ? 'animate-shake' : ''}`}
                                            style={{ background: '#FFFFFF', border: `1.5px solid ${planFormErrors?.title ? '#EF4444' : '#F0EBE1'}`, color: '#1B2E4B' }}
                                            onFocus={e => e.target.style.borderColor = planFormErrors?.title ? '#EF4444' : '#FF8C42'}
                                            onBlur={e => e.target.style.borderColor = planFormErrors?.title ? '#EF4444' : '#F0EBE1'}
                                        />
                                    </div>

                                    {/* ═══ 任务说明 + 附件 (合并为一个卡片) ═══ */}
                                    <div className="rounded-2xl p-4 space-y-3" style={{ background: '#FFFFFF', border: '1px solid #F0EBE1' }}>
                                        <label className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: '#9CAABE' }}>任务说明与附件 <span style={{ color: '#C0C8D4' }}>(可选)</span></label>
                                        <textarea
                                            value={planForm.desc || ''}
                                            onChange={e => setPlanForm({ ...planForm, desc: e.target.value })}
                                            placeholder="描述任务的具体要求或标准..."
                                            className="w-full rounded-xl px-4 py-3 outline-none font-bold text-sm transition-all resize-y min-h-[60px]"
                                            style={{ background: '#FBF7F0', border: '1.5px solid #F0EBE1', color: '#1B2E4B' }}
                                            onFocus={e => e.target.style.borderColor = '#FF8C42'}
                                            onBlur={e => e.target.style.borderColor = '#F0EBE1'}
                                        />
                                        {/* 附件图片 — delete button always visible */}
                                        <div className="flex flex-wrap gap-2">
                                            {(planForm.attachments || []).map((att, i) => {
                                                const src = typeof att === 'string' ? att : (att.data || att.url || '');
                                                return src ? (
                                                    <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden" style={{ border: '2px solid #FFE8D0' }}>
                                                        <img src={src} className="w-full h-full object-cover" />
                                                        <button onClick={() => {
                                                            const newAtts = [...(planForm.attachments || [])];
                                                            newAtts.splice(i, 1);
                                                            setPlanForm({ ...planForm, attachments: newAtts });
                                                        }} className="absolute -top-0 -right-0 w-5 h-5 bg-red-500 text-white rounded-bl-lg flex items-center justify-center" style={{ fontSize: 11 }}>✕</button>
                                                    </div>
                                                ) : null;
                                            })}
                                            {(!planForm.attachments || planForm.attachments.length < 6) && (
                                                <>
                                                    <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple
                                                        style={{ display: 'none' }}
                                                        onChange={e => {
                                                            const files = Array.from(e.target.files);
                                                            files.forEach(file => {
                                                                const reader = new FileReader();
                                                                reader.onload = ev => {
                                                                    setPlanForm(prev => ({
                                                                        ...prev,
                                                                        attachments: [...(prev.attachments || []), { data: ev.target.result, name: file.name }]
                                                                    }));
                                                                };
                                                                reader.readAsDataURL(file);
                                                            });
                                                            e.target.value = '';
                                                        }} />
                                                    <button type="button"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="w-16 h-16 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95"
                                                        style={{ background: '#FBF7F0', border: '1.5px dashed #D0C9BD', color: '#9CAABE' }}>
                                                        <Icons.Image size={16} />
                                                        <span style={{ fontSize: 9, marginTop: 2 }}>添加图片</span>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>



                                </div>
                            )}


                            {/* 任务安排 */}
                            {planType === 'study' && (
                                <div className="rounded-2xl p-4 space-y-4" style={{ background: '#FFFFFF', border: '1px solid #F0EBE1' }}>
                                    <div>
                                        <label className="text-[11px] font-bold uppercase tracking-wider mb-3 block" style={{ color: '#9CAABE' }}>任务安排</label>

                                        {/* Quick Chips for Repeat Type */}
                                        <div className="flex gap-2 mb-2">
                                            {[
                                                { v: 'today', l: '仅今天', d: '只在今天出现一次' },
                                                { v: 'daily', l: '每天', d: '每天都需要完成' },
                                                { v: 'weekly_custom', l: '每周固定', d: '选择每周哪几天执行' }
                                            ].map(opt => (
                                                <button
                                                    key={opt.v}
                                                    onClick={() => setPlanForm({ ...planForm, repeatType: opt.v })}
                                                    className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 text-center"
                                                    style={planForm.repeatType === opt.v
                                                        ? { background: '#FF8C42', color: '#fff', boxShadow: '0 4px 14px rgba(255,140,66,0.3)' }
                                                        : { background: '#FBF7F0', color: '#5A6E8A', border: '1.5px solid #F0EBE1' }}
                                                >
                                                    {opt.l}
                                                </button>
                                            ))}
                                        </div>
                                        {/* Weekly day picker — between main buttons and 更多安排 */}
                                        {planForm.repeatType === 'weekly_custom' && (() => {
                                            const days = planForm.weeklyDays || [];
                                            const sorted = [...days].sort((a, b) => a - b);
                                            const isWorkdays = sorted.join() === '1,2,3,4,5';
                                            const isWeekend = sorted.join() === '6,7';
                                            const isEveryday = sorted.join() === '1,2,3,4,5,6,7';
                                            return (
                                            <div className="animate-fade-in rounded-xl p-3" style={{ background: '#FBF7F0', border: '1px solid #F0EBE1' }}>
                                                <label className="text-[11px] font-bold mb-2 block" style={{ color: '#5A6E8A' }}>在以下星期几重复？</label>
                                                <div className="flex gap-2 mb-2.5">
                                                    {[
                                                        { key: 'workdays', label: '工作日', val: [1,2,3,4,5], active: isWorkdays },
                                                        { key: 'weekend', label: '周末', val: [6,7], active: isWeekend },
                                                        { key: 'everyday', label: '每天', val: [1,2,3,4,5,6,7], active: isEveryday },
                                                    ].map(f => (
                                                        <button key={f.key} onClick={() => setPlanForm({ ...planForm, weeklyDays: f.val })}
                                                            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 text-center"
                                                            style={f.active
                                                                ? { background: '#FF8C42', color: '#fff', boxShadow: '0 2px 8px rgba(255,140,66,0.3)' }
                                                                : { background: '#FFFFFF', color: '#5A6E8A', border: '1px solid #F0EBE1' }}>
                                                            {f.label}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="grid grid-cols-7 gap-1.5">
                                                    {[{ d: 1, l: '一' }, { d: 2, l: '二' }, { d: 3, l: '三' }, { d: 4, l: '四' }, { d: 5, l: '五' }, { d: 6, l: '六' }, { d: 7, l: '日' }].map(w => {
                                                        const isSelected = days.includes(w.d);
                                                        return (
                                                            <button key={w.d} onClick={() => {
                                                                const newDays = isSelected ? days.filter(d => d !== w.d) : [...days, w.d];
                                                                setPlanForm({ ...planForm, weeklyDays: newDays });
                                                            }} className="w-9 h-9 rounded-full font-bold transition-all flex items-center justify-center text-xs active:scale-90"
                                                                style={isSelected
                                                                    ? { background: '#FF8C42', color: '#fff', boxShadow: '0 2px 8px rgba(255,140,66,0.3)' }
                                                                    : { background: '#FFFFFF', color: '#5A6E8A', border: '1px solid #F0EBE1' }}>
                                                                {w.l}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                            );
                                        })()}

                                        <select
                                            value={!['today', 'daily', 'weekly_custom'].includes(planForm.repeatType || '') ? planForm.repeatType : ''}
                                            onChange={e => { if (e.target.value) setPlanForm({ ...planForm, repeatType: e.target.value }) }}
                                            className="w-full py-2.5 rounded-xl text-sm font-bold transition-all outline-none appearance-none text-center mb-2 mt-3"
                                            style={{
                                                textAlignLast: 'center', textAlign: 'center',
                                                ...(!['today', 'daily', 'weekly_custom'].includes(planForm.repeatType || '')
                                                    ? { background: '#FF8C42', color: '#fff', boxShadow: '0 4px 14px rgba(255,140,66,0.3)' }
                                                    : { background: '#FBF7F0', color: '#5A6E8A', border: '1.5px solid #F0EBE1' })
                                            }}
                                        >
                                            <option value="" disabled>... 更多安排</option>
                                            <option value="biweekly_custom">隔周重复（按双周）</option>
                                            <option value="ebbinghaus">记忆曲线（艾宾浩斯）</option>
                                            <option value="weekly_1">本周内完成（可选次数）</option>
                                            <option value="biweekly_1">本双周内完成（可选次数）</option>
                                            <option value="monthly_1">本月内完成（可选次数）</option>
                                            <option value="every_week_1">每周循环完成（可选次数）</option>
                                            <option value="every_biweek_1">每双周循环完成（可选次数）</option>
                                            <option value="every_month_1">每月循环完成（可选次数）</option>
                                        </select>
                                        {/* P3: 安排说明小字 */}
                                        <div className="text-[11px] font-medium mb-1 px-1" style={{ color: '#9CAABE' }}>
                                            {planForm.repeatType === 'today' && '📌 任务仅在今天出现，完成后不再重复'}
                                            {planForm.repeatType === 'daily' && '🔁 任务会每天出现，直到设定的结束日期'}
                                            {planForm.repeatType === 'weekly_custom' && '📅 选择每周的固定日期来执行此任务'}
                                            {planForm.repeatType === 'biweekly_custom' && '📅 每隔一周执行，适合交替安排的任务'}
                                            {planForm.repeatType === 'ebbinghaus' && '🧠 按遗忘曲线安排复习，适合记忆类任务'}
                                            {planForm.repeatType?.includes('weekly_1') && '🎯 在本周的任意时间完成指定次数'}
                                            {planForm.repeatType?.includes('biweekly_1') && '🎯 在本双周内的任意时间完成指定次数'}
                                            {planForm.repeatType?.includes('monthly_1') && '🎯 在本月内的任意时间完成指定次数'}
                                            {planForm.repeatType?.includes('every_week_1') && '🔄 每周循环，在每周内完成指定次数'}
                                            {planForm.repeatType?.includes('every_biweek_1') && '🔄 每双周循环，在每个双周内完成指定次数'}
                                            {planForm.repeatType?.includes('every_month_1') && '🔄 每月循环，在每月内完成指定次数'}
                                        </div>
                                        {/* Weekday picker for biweekly — shown below the dropdown */}
                                        {planForm.repeatType === 'biweekly_custom' && (() => {
                                            const days = planForm.weeklyDays || [];
                                            const sorted = [...days].sort((a, b) => a - b);
                                            const isWorkdays = sorted.join() === '1,2,3,4,5';
                                            const isWeekend = sorted.join() === '6,7';
                                            const isEveryday = sorted.join() === '1,2,3,4,5,6,7';
                                            return (
                                            <div className="animate-fade-in rounded-xl p-3" style={{ background: '#FBF7F0', border: '1px solid #F0EBE1' }}>
                                                <label className="text-[11px] font-bold mb-2 block" style={{ color: '#5A6E8A' }}>在以下星期几重复？</label>
                                                <div className="flex gap-2 mb-2.5">
                                                    {[
                                                        { key: 'workdays', label: '工作日', val: [1,2,3,4,5], active: isWorkdays },
                                                        { key: 'weekend', label: '周末', val: [6,7], active: isWeekend },
                                                        { key: 'everyday', label: '每天', val: [1,2,3,4,5,6,7], active: isEveryday },
                                                    ].map(f => (
                                                        <button key={f.key} onClick={() => setPlanForm({ ...planForm, weeklyDays: f.val })}
                                                            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 text-center"
                                                            style={f.active
                                                                ? { background: '#FF8C42', color: '#fff', boxShadow: '0 2px 8px rgba(255,140,66,0.3)' }
                                                                : { background: '#FFFFFF', color: '#5A6E8A', border: '1px solid #F0EBE1' }}>
                                                            {f.label}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="grid grid-cols-7 gap-1.5">
                                                    {[{ d: 1, l: '一' }, { d: 2, l: '二' }, { d: 3, l: '三' }, { d: 4, l: '四' }, { d: 5, l: '五' }, { d: 6, l: '六' }, { d: 7, l: '日' }].map(w => {
                                                        const isSelected = days.includes(w.d);
                                                        return (
                                                            <button key={w.d} onClick={() => {
                                                                const newDays = isSelected ? days.filter(d => d !== w.d) : [...days, w.d];
                                                                setPlanForm({ ...planForm, weeklyDays: newDays });
                                                            }} className="w-9 h-9 rounded-full font-bold transition-all flex items-center justify-center text-xs active:scale-90"
                                                                style={isSelected
                                                                    ? { background: '#FF8C42', color: '#fff', boxShadow: '0 2px 8px rgba(255,140,66,0.3)' }
                                                                    : { background: '#FFFFFF', color: '#5A6E8A', border: '1px solid #F0EBE1' }}>
                                                                {w.l}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                            );
                                        })()}

                                        {/* Dynamic Sub-configs: ebbinghaus, n-times etc */}
                                        <div className="space-y-4">


                                            {/* Ebbinghaus Config */}
                                            {planForm.repeatType === 'ebbinghaus' && (
                                                <div className="animate-fade-in bg-purple-50 p-4 rounded-2xl border border-purple-100">
                                                    <label className="block text-xs font-bold text-purple-800 mb-3">复习强度</label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {[{ v: 'gentle', l: '温柔强度', d: '第1,3,7,14,30天' }, { v: 'normal', l: '一般强度', d: '第1,2,4,7,15,30天' }, { v: 'exam', l: '考前强度', d: '第1,2,3,5,7,10,14天' }, { v: 'enhanced', l: '增强模式', d: '密集的9次复习' }].map(eb => (
                                                            <button key={eb.v} onClick={() => setPlanForm({ ...planForm, ebbStrength: eb.v })} className={`p-3 rounded-xl border-2 text-left transition-all ${planForm.ebbStrength === eb.v ? 'border-purple-500 bg-white shadow-sm ring-2 ring-purple-500/20' : 'border-transparent bg-white/50 hover:bg-white text-slate-500'}`}>
                                                                <div className={`font-bold text-sm mb-1 ${planForm.ebbStrength === eb.v ? 'text-purple-700' : 'text-slate-600'}`}>{eb.l}</div>
                                                                <div className="text-[10px] leading-tight opacity-70">{eb.d}</div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* N-times Period Goals */}
                                            {(planForm.repeatType?.includes('_1') || planForm.repeatType?.includes('_n')) && (
                                                <div className="animate-fade-in bg-orange-50/50 p-4 rounded-2xl border border-orange-100 space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-xs font-bold text-slate-600 mb-2">该周期内需完成几次？</label>
                                                            <input type="number" min="1" max="99"
                                                                value={planForm.periodTargetCount ?? 1}
                                                                onChange={e => setPlanForm({ ...planForm, periodTargetCount: e.target.value === '' ? '' : parseInt(e.target.value) || '' })}
                                                                onBlur={e => { const v = parseInt(e.target.value); setPlanForm({ ...planForm, periodTargetCount: (isNaN(v) || v < 1) ? 1 : Math.min(v, 99) }); }}
                                                                className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-orange-500 font-bold bg-white text-orange-700" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-slate-600 mb-2">每天最多完成次数</label>
                                                            <input type="number" min="1" max="99"
                                                                value={planForm.periodMaxPerDay ?? 1}
                                                                onChange={e => setPlanForm({ ...planForm, periodMaxPerDay: e.target.value === '' ? '' : parseInt(e.target.value) || '' })}
                                                                onBlur={e => { const v = parseInt(e.target.value); setPlanForm({ ...planForm, periodMaxPerDay: (isNaN(v) || v < 1) ? 1 : Math.min(v, 99) }); }}
                                                                className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-orange-500 font-bold bg-white text-orange-700" />
                                                        </div>
                                                    </div>
                                                    {/* Smart validation hint */}
                                                    {(() => {
                                                        const target = Number(planForm.periodTargetCount) || 1;
                                                        const maxDay = Number(planForm.periodMaxPerDay) || 1;
                                                        if (maxDay > target) return (
                                                            <p className="text-[11px] mt-1 px-1" style={{ color: '#E67E22' }}>⚠️ 每天限额({maxDay}次) 大于周期目标({target}次)，一天就能完成了，建议调整</p>
                                                        );
                                                        const rt = planForm.repeatType || '';
                                                        let periodDays = 7;
                                                        if (rt.includes('biweek')) periodDays = 14;
                                                        else if (rt.includes('month')) periodDays = 30;
                                                        if (maxDay * periodDays < target) return (
                                                            <p className="text-[11px] mt-1 px-1" style={{ color: '#E67E22' }}>⚠️ 按每天{maxDay}次算，{periodDays}天最多{maxDay * periodDays}次，不够完成{target}次目标哦</p>
                                                        );
                                                        return null;
                                                    })()}

                                                    <div>
                                                        <label className="text-[11px] font-bold mb-2 block" style={{ color: '#5A6E8A' }}>允许执行的日期</label>
                                                        {(() => {
                                                            const pDays = planForm.periodCustomDays || [1,2,3,4,5,6,7];
                                                            const pSorted = [...pDays].sort((a, b) => a - b);
                                                            const pIsWorkdays = pSorted.join() === '1,2,3,4,5';
                                                            const pIsWeekend = pSorted.join() === '6,7';
                                                            const pIsEveryday = pSorted.join() === '1,2,3,4,5,6,7';
                                                            return (
                                                                <>
                                                                    <div className="flex gap-2 mb-2.5">
                                                                        {[
                                                                            { key: 'workdays', label: '工作日', val: [1,2,3,4,5], active: pIsWorkdays },
                                                                            { key: 'weekend', label: '周末', val: [6,7], active: pIsWeekend },
                                                                            { key: 'everyday', label: '每天', val: [1,2,3,4,5,6,7], active: pIsEveryday },
                                                                        ].map(f => (
                                                                            <button key={f.key} onClick={() => setPlanForm({ ...planForm, periodCustomDays: f.val, periodDaysType: f.key === 'workdays' ? 'workdays' : f.key === 'weekend' ? 'weekends' : 'any' })}
                                                                                className="flex-1 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 text-center"
                                                                                style={f.active
                                                                                    ? { background: '#FF8C42', color: '#fff', boxShadow: '0 2px 8px rgba(255,140,66,0.3)' }
                                                                                    : { background: '#FFFFFF', color: '#5A6E8A', border: '1px solid #F0EBE1' }}>
                                                                                {f.label}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                    <div className="grid grid-cols-7 gap-1.5">
                                                                        {[{ d: 1, l: '一' }, { d: 2, l: '二' }, { d: 3, l: '三' }, { d: 4, l: '四' }, { d: 5, l: '五' }, { d: 6, l: '六' }, { d: 7, l: '日' }].map(w => {
                                                                            const isSelected = pDays.includes(w.d);
                                                                            return (
                                                                                <button key={w.d} onClick={() => {
                                                                                    const newDays = isSelected ? pDays.filter(d => d !== w.d) : [...pDays, w.d];
                                                                                    const sorted = [...newDays].sort((a, b) => a - b).join();
                                                                                    let newType = 'custom';
                                                                                    if (sorted === '1,2,3,4,5,6,7') newType = 'any';
                                                                                    else if (sorted === '1,2,3,4,5') newType = 'workdays';
                                                                                    else if (sorted === '6,7') newType = 'weekends';
                                                                                    setPlanForm({ ...planForm, periodDaysType: newType, periodCustomDays: newDays });
                                                                                }} className="w-9 h-9 rounded-full font-bold transition-all flex items-center justify-center text-xs active:scale-90"
                                                                                    style={isSelected
                                                                                        ? { background: '#FF8C42', color: '#fff', boxShadow: '0 2px 8px rgba(255,140,66,0.3)' }
                                                                                        : { background: '#FFFFFF', color: '#5A6E8A', border: '1px solid #F0EBE1' }}>
                                                                                    {w.l}
                                                                                </button>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                </>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ═══ 计划周期 ═══ */}
                            {planType === 'study' && !['today', 'weekly_1', 'biweekly_1', 'monthly_1'].includes(planForm.repeatType) && (
                                <div className="rounded-2xl p-4 space-y-3" style={{ background: '#FFFFFF', border: '1px solid #F0EBE1' }}>
                                    <label className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: '#9CAABE' }}>计划周期</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="w-full min-w-0">
                                            <label className="text-[10px] font-bold mb-1.5 block" style={{ color: '#9CAABE' }}>开始日期</label>
                                            <input type="date" value={planForm.startDate || ''} onChange={e => setPlanForm({ ...planForm, startDate: e.target.value })}
                                                className="w-full box-border rounded-xl px-3 py-2.5 outline-none font-bold text-xs appearance-none"
                                                style={{ background: '#FBF7F0', border: '1.5px solid #F0EBE1', color: '#1B2E4B' }} />
                                        </div>
                                        {planForm.repeatType !== 'today' && (
                                            <div className="w-full min-w-0">
                                                <label className="text-[10px] font-bold mb-1.5 block" style={{ color: '#9CAABE' }}>结束日期 <span style={{ color: '#C0C8D4' }}>(可选)</span></label>
                                                <input type="date" value={planForm.endDate || ''} onChange={e => setPlanForm({ ...planForm, endDate: e.target.value })}
                                                    className="w-full box-border rounded-xl px-3 py-2.5 outline-none font-bold text-xs appearance-none"
                                                    style={{ background: '#FBF7F0', border: '1.5px solid #F0EBE1', color: '#1B2E4B' }} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ═══ 时间要求 ═══ */}
                            {planType === 'study' && (
                                <div className="rounded-2xl p-4 space-y-3" style={{ background: '#FFFFFF', border: '1px solid #F0EBE1' }}>
                                    <div className="flex items-center justify-between">
                                        <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#9CAABE' }}>时间要求</label>
                                        {planForm.timeSetting !== 'none' && (
                                            <button onClick={() => setPlanForm({ ...planForm, timeSetting: 'none', startTime: '', endTime: '', durationPreset: null })}
                                                className="text-[10px] font-bold transition-all" style={{ color: '#E57373' }}>清除</button>
                                        )}
                                    </div>
                                    {planForm.timeSetting === 'none' ? (
                                        <button
                                            onClick={() => setPlanForm({ ...planForm, timeSetting: 'range' })}
                                            className="w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                            style={{ background: '#FBF7F0', color: '#FF8C42', border: '1.5px dashed #FFD4AD' }}
                                        >
                                            <Icons.Plus size={16} /> 添加具体时间要求 (可选)
                                        </button>
                                    ) : (
                                        <>
                                            <div className="flex gap-2">
                                                <button onClick={() => setPlanForm({ ...planForm, timeSetting: 'range' })}
                                                    className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 text-center"
                                                    style={planForm.timeSetting === 'range'
                                                        ? { background: '#FF8C42', color: '#fff', boxShadow: '0 2px 8px rgba(255,140,66,0.3)' }
                                                        : { background: '#FBF7F0', color: '#5A6E8A', border: '1.5px solid #F0EBE1' }}>
                                                    指定时段
                                                </button>
                                                <button onClick={() => setPlanForm({ ...planForm, timeSetting: 'duration' })}
                                                    className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 text-center"
                                                    style={planForm.timeSetting === 'duration'
                                                        ? { background: '#FF8C42', color: '#fff', boxShadow: '0 2px 8px rgba(255,140,66,0.3)' }
                                                        : { background: '#FBF7F0', color: '#5A6E8A', border: '1.5px solid #F0EBE1' }}>
                                                    要求时长
                                                </button>
                                            </div>

                                            {planForm.timeSetting === 'range' && (
                                                <div className="animate-fade-in rounded-xl p-3" style={{ background: '#FBF7F0', border: '1px solid #F0EBE1' }} data-field-error={planFormErrors?.time ? 'time' : undefined}>
                                                    {planFormErrors?.time && <div className="text-xs font-bold text-red-500 mb-2 flex items-center gap-1">⚠️ {planFormErrors.time}</div>}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="w-full min-w-0">
                                                            <label className="text-[10px] font-bold mb-1.5 block" style={{ color: planFormErrors?.time ? '#EF4444' : '#5A6E8A' }}>开始时间</label>
                                                            <input type="time" value={planForm.startTime || ''} onChange={e => { setPlanForm({ ...planForm, startTime: e.target.value }); if (planFormErrors?.time) setPlanFormErrors(prev => ({ ...prev, time: undefined })); }}
                                                                className="w-full box-border rounded-xl px-3 py-2.5 outline-none font-bold text-xs appearance-none"
                                                                style={{ background: '#FFFFFF', border: `1.5px solid ${planFormErrors?.time ? '#EF4444' : '#F0EBE1'}`, color: '#1B2E4B' }} />
                                                        </div>
                                                        <div className="w-full min-w-0">
                                                            <label className="text-[10px] font-bold mb-1.5 block" style={{ color: planFormErrors?.time ? '#EF4444' : '#5A6E8A' }}>结束时间</label>
                                                            <input type="time" value={planForm.endTime || ''} onChange={e => { setPlanForm({ ...planForm, endTime: e.target.value }); if (planFormErrors?.time) setPlanFormErrors(prev => ({ ...prev, time: undefined })); }}
                                                                className="w-full box-border rounded-xl px-3 py-2.5 outline-none font-bold text-xs appearance-none"
                                                                style={{ background: '#FFFFFF', border: `1.5px solid ${planFormErrors?.time ? '#EF4444' : '#F0EBE1'}`, color: '#1B2E4B' }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {planForm.timeSetting === 'duration' && (
                                                <div className="animate-fade-in rounded-xl p-3 space-y-3" style={{ background: '#FBF7F0', border: '1px solid #F0EBE1' }}>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {[{ label: '15分钟', val: 15 }, { label: '30分钟', val: 30 }, { label: '45分钟', val: 45 }, { label: '1小时', val: 60 }, { label: '1.5小时', val: 90 }, { label: '2小时', val: 120 }].map(opt => (
                                                            <button key={opt.val} onClick={() => setPlanForm({ ...planForm, durationPreset: opt.val })}
                                                                className="py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                                                                style={planForm.durationPreset === opt.val
                                                                    ? { background: '#FF8C42', color: '#fff', boxShadow: '0 2px 8px rgba(255,140,66,0.3)' }
                                                                    : { background: '#FFFFFF', color: '#5A6E8A', border: '1.5px solid #F0EBE1' }}>
                                                                {opt.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <input type="number" min="1" placeholder="自定义分钟"
                                                            value={planForm.durationPreset || ''}
                                                            onChange={e => setPlanForm({ ...planForm, durationPreset: Math.max(0, parseInt(e.target.value) || 0) })}
                                                            className="flex-1 w-full min-w-0 rounded-xl px-3 py-2.5 outline-none font-bold text-xs appearance-none"
                                                            style={{ background: '#FFFFFF', border: '1.5px solid #F0EBE1', color: '#1B2E4B' }} />
                                                        <span className="font-bold text-xs shrink-0" style={{ color: '#9CAABE' }}>分钟</span>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}


                            {/* 奖励与审核 */}
                            {planType === 'study' && (
                                <div className="rounded-2xl p-4 space-y-4" style={{ background: '#FFFFFF', border: '1px solid #F0EBE1' }}>
                                    <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: '#9CAABE' }}>奖励与审核</label>

                                    {/* Custom Reward Toggle */}
                                    <div className="flex items-center justify-between rounded-xl px-4 py-3 cursor-pointer transition-all active:scale-[0.98]"
                                        style={{ background: '#FBF7F0', border: '1px solid #F0EBE1' }}
                                        onClick={() => setPlanForm({ ...planForm, pointRule: planForm.pointRule === 'custom' ? 'default' : 'custom' })}>
                                        <div className="flex-1 pr-4">
                                            <div className="font-bold text-sm" style={{ color: '#1B2E4B' }}>自定义家庭币奖励</div>
                                            <div className="text-[11px] mt-0.5" style={{ color: '#9CAABE' }}>关闭则自动计算</div>
                                        </div>
                                        <div className="w-11 h-6 rounded-full p-0.5 transition-colors flex-shrink-0"
                                            style={{ background: planForm.pointRule === 'custom' ? '#FF8C42' : '#D1D5DB' }}>
                                            <div className="w-5 h-5 bg-white rounded-full shadow-md transform transition-transform"
                                                style={{ transform: planForm.pointRule === 'custom' ? 'translateX(20px)' : 'translateX(0)' }}></div>
                                        </div>
                                    </div>

                                    {/* Stepper for reward */}
                                    {planForm.pointRule === 'custom' && (
                                        <div className="flex items-center justify-between rounded-xl px-4 py-3 animate-fade-in"
                                            style={{ background: '#FBF7F0', border: '1px solid #F0EBE1' }}>
                                            <span className="text-sm font-bold" style={{ color: '#1B2E4B' }}>
                                                完成奖励 ⭐ 家庭币
                                            </span>
                                            <div className="flex items-center gap-0">
                                                <button onClick={() => setPlanForm({ ...planForm, reward: Math.max(0, (parseInt(planForm.reward) || 5) - 1).toString() })}
                                                    className="w-9 h-9 rounded-l-xl flex items-center justify-center font-black text-lg transition-all active:scale-90"
                                                    style={{ background: '#F0EBE1', color: '#5A6E8A' }}>−</button>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="999"
                                                    value={planForm.reward === '' ? 5 : planForm.reward}
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        if (val === '') { setPlanForm({ ...planForm, reward: '' }); return; }
                                                        const num = Math.max(0, Math.min(999, parseInt(val) || 0));
                                                        setPlanForm({ ...planForm, reward: num.toString() });
                                                    }}
                                                    onBlur={e => { if (e.target.value === '' || isNaN(parseInt(e.target.value))) setPlanForm({ ...planForm, reward: '5' }); }}
                                                    className="w-14 h-9 text-center font-black text-lg outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    style={{ background: '#fff', color: '#FF8C42', borderTop: '1px solid #F0EBE1', borderBottom: '1px solid #F0EBE1' }}
                                                />
                                                <button onClick={() => setPlanForm({ ...planForm, reward: ((parseInt(planForm.reward) || 5) + 1).toString() })}
                                                    className="w-9 h-9 rounded-r-xl flex items-center justify-center font-black text-lg transition-all active:scale-90"
                                                    style={{ background: '#FF8C42', color: '#fff' }}>+</button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Require Approval Toggle */}
                                    <div className="flex items-center justify-between rounded-xl px-4 py-3 cursor-pointer transition-all active:scale-[0.98]"
                                        style={{ background: '#FBF7F0', border: '1px solid #F0EBE1' }}
                                        onClick={() => setPlanForm({ ...planForm, requireApproval: !planForm.requireApproval })}>
                                        <div className="flex-1 pr-4">
                                            <div className="font-bold text-sm" style={{ color: '#1B2E4B' }}>打卡需家长审核</div>
                                            <div className="text-[11px] mt-0.5" style={{ color: '#9CAABE' }}>关闭后孩子打卡直接发放奖励</div>
                                        </div>
                                        <div className="w-11 h-6 rounded-full p-0.5 transition-colors flex-shrink-0"
                                            style={{ background: planForm.requireApproval ? '#FF8C42' : '#D1D5DB' }}>
                                            <div className="w-5 h-5 bg-white rounded-full shadow-md transform transition-transform"
                                                style={{ transform: planForm.requireApproval ? 'translateX(20px)' : 'translateX(0)' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* === 任务概览卡片 === */}
                        {planForm.title && planType === 'study' && (() => {
                            const parts = [];
                            // 1. Start date
                            if (planForm.startDate) {
                                const sd = new Date(planForm.startDate);
                                parts.push(`从 ${sd.getMonth()+1}月${sd.getDate()}日 开始`);
                            }
                            // 2. Repeat schedule
                            const rt = planForm.repeatType || '';
                            const dayNames = { 1:'一', 2:'二', 3:'三', 4:'四', 5:'五', 6:'六', 7:'日' };
                            if (rt === 'today') {
                                parts.push('仅今天执行一次');
                            } else if (rt === 'daily') {
                                parts.push('每天执行');
                            } else if (rt === 'weekly_custom' || rt === 'biweekly_custom') {
                                const days = (planForm.weeklyDays || []).sort((a,b) => a - b);
                                const dStr = days.map(d => '周' + dayNames[d]).join('、');
                                parts.push(rt === 'biweekly_custom' ? `隔周的${dStr}执行` : `每周${dStr}执行`);
                            } else if (rt === 'ebbinghaus') {
                                parts.push('按艾宾浩斯记忆曲线安排');
                            } else if (rt.includes('_1') || rt.includes('_n')) {
                                const isEvery = rt.includes('every_');
                                let periodName = '本周';
                                if (rt.includes('month')) periodName = isEvery ? '每月' : '本月';
                                else if (rt.includes('biweek')) periodName = isEvery ? '每双周' : '本双周';
                                else if (rt.includes('every_week')) periodName = '每周';
                                const target = planForm.periodTargetCount || 1;
                                const maxDay = planForm.periodMaxPerDay || 1;
                                parts.push(`${periodName}内完成 ${target} 次`);
                                if (maxDay > 1) parts.push(`每天最多 ${maxDay} 次`);
                                // Period allowed days
                                const pdt = planForm.periodDaysType || 'any';
                                if (pdt === 'workdays') parts.push('仅工作日可执行');
                                else if (pdt === 'weekends') parts.push('仅周末可执行');
                                else if (pdt === 'custom') {
                                    const cd = (planForm.periodCustomDays || []).sort((a,b) => a - b);
                                    parts.push(`限${cd.map(d => '周' + dayNames[d]).join('、')}执行`);
                                }
                            }
                            // 3. Time
                            if (planForm.timeSetting === 'range' && planForm.startTime && planForm.endTime) {
                                parts.push(`${planForm.startTime} ~ ${planForm.endTime} 之间完成`);
                            } else if (planForm.timeSetting === 'duration' && planForm.durationPreset) {
                                parts.push(`需用时 ${planForm.durationPreset} 分钟`);
                            }
                            // 4. End date
                            if (planForm.endDate && rt !== 'today') {
                                const ed = new Date(planForm.endDate);
                                parts.push(`截至 ${ed.getMonth()+1}月${ed.getDate()}日`);
                            }
                            // 5. Reward
                            const reward = Number(planForm.reward) || 0;
                            if (reward > 0) parts.push(`完成奖励 ${reward} 家庭币 🪙`);
                            else if (reward < 0) parts.push(`未完成扣 ${Math.abs(reward)} 家庭币`);
                            // 6. Approval
                            if (planForm.requireApproval) parts.push('需家长审核');
                            else parts.push('自动完成（无需审核）');

                            if (parts.length === 0) return null;
                            return (
                                <div className="mx-5 mb-2 px-4 py-2.5 rounded-xl" style={{ background: '#FBF7F0', borderTop: '1px solid #F0EBE1' }}>
                                    <p className="text-[12px] leading-relaxed" style={{ color: '#8A7A6A' }}>
                                        📋 <span className="font-bold" style={{ color: '#5A4A3A' }}>「{planForm.title}」</span>{parts.join('，')}。
                                    </p>
                                </div>
                            );
                        })()}

                        {/* — Footer — */}
                        <div className="shrink-0 px-5 py-4 flex gap-3"
                            style={{ background: '#FFFFFF', borderTop: '1px solid #F0EBE1', paddingBottom: 'max(1rem, env(safe-area-inset-bottom) + 0.5rem)' }}>
                            <button onClick={() => { setShowAddPlanModal(false); setEditingTask(null); }}
                                className="flex-1 py-3 rounded-xl font-black text-sm transition-all active:scale-95"
                                style={{ background: '#F0EBE1', color: '#5A6E8A' }}>
                                取消
                            </button>
                            <button onClick={handleSavePlan}
                                className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm text-white transition-all active:scale-95"
                                style={{ background: '#FF8C42', boxShadow: '0 4px 15px rgba(255,140,66,0.35)' }}>
                                <Icons.Save size={16} /> {editingTask ? '保存修改' : '保存任务'}
                            </button>
                        </div>
                    </div>
                </div>
                )
            );
        } catch (error) {
            console.error("FATAL ERROR IN renderAddPlanModal:", error);
            return (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-2xl text-center shadow-xl relative z-[110] max-w-md w-full">
                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">哎呀，页面出错了！</h2>
                        <p className="text-red-600 mb-4 text-xs font-mono text-left bg-red-50 p-3 rounded-lg overflow-x-auto" id="crash-error-message">{error.message}</p>
                        <p className="text-slate-500 mb-4 text-[10px] font-mono text-left bg-slate-100 p-3 rounded-lg overflow-y-auto max-h-32" id="crash-error-stack">{error.stack}</p>
                        <button onClick={() => { setShowAddPlanModal(false); setEditingTask(null); }} className="bg-slate-800 text-white px-8 py-3 w-full rounded-xl font-bold hover:bg-slate-700 transition-colors">关闭即可恢复</button>
                    </div>
                </div>
            );
        }
};
