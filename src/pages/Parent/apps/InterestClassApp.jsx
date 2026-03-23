import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useDataContext } from '../../../context/DataContext.jsx';
import { useToast } from '../../../hooks/useToast';
import { apiFetch } from '../../../api/client';
import { Icons, AvatarDisplay } from '../../../utils/Icons';

// Design tokens — warm cream system
const C = {
    bg: '#FBF7F0', bgCard: '#FFFFFF', bgLight: '#F0EBE1', bgMuted: '#E8E0D4',
    orange: '#FF8C42', orangeHot: '#FF6B1A', yellow: '#FFD93D', teal: '#4ECDC4',
    coral: '#FF6B6B', green: '#10B981', purple: '#7C5CFC', blue: '#6C9CFF',
    pink: '#EC4899', indigo: '#6366F1',
    textPrimary: '#1B2E4B', textSoft: '#5A6E8A', textMuted: '#9CAABE',
    cardShadow: '0 2px 12px rgba(27,46,75,0.06)',
    cardHoverShadow: '0 8px 28px rgba(27,46,75,0.10)',
};

// 周一开始的星期显示顺序
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const DAY_LABELS = { 1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六', 0: '日' };

export const InterestClassApp = () => {
    const { kids, classes, setClasses, activeKidId } = useDataContext();
    const { notify } = useToast();

    const [showForm, setShowForm] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [filterKidId, setFilterKidId] = useState(activeKidId || 'all');

    const [deleteConfirmClass, setDeleteConfirmClass] = useState(null);
    const [checkinConfirmClass, setCheckinConfirmClass] = useState(null);
    const [skipConfirmClass, setSkipConfirmClass] = useState(null);

    const todayStr = new Date().toISOString().split('T')[0];

    const [form, setForm] = useState({
        kidIds: activeKidId ? [activeKidId] : [],
        name: '',
        totalSessions: '',
        sessionsPerClass: 1,
        scheduleDays: [],
        startTime: '',
        endTime: '',
        startDate: todayStr,
        reward: 5,
        checkinMode: 'parent',
        notes: '',
        classMode: 'package',
        pricePerSession: '',
        settlementType: 'manual',
    });

    const resetForm = () => {
        setForm({
            kidIds: activeKidId ? [activeKidId] : (kids[0] ? [kids[0].id] : []),
            name: '', totalSessions: '', sessionsPerClass: 1,
            scheduleDays: [], startTime: '', endTime: '',
            startDate: todayStr, reward: 5, checkinMode: 'parent',
            notes: '', classMode: 'package', pricePerSession: '', settlementType: 'manual',
        });
        setEditingClass(null);
    };

    const openAdd = () => { resetForm(); setShowForm(true); };

    const openEdit = (cls) => {
        const [startTime, endTime] = (cls.timeStr || '').split('-');
        setForm({
            kidIds: cls.kidId ? cls.kidId.split(',') : [],
            name: cls.name, totalSessions: cls.totalSessions || '',
            sessionsPerClass: cls.sessionsPerClass || 1,
            scheduleDays: cls.scheduleDays || [],
            startTime: startTime || '', endTime: endTime || '',
            startDate: cls.startDate || todayStr,
            reward: cls.reward || 0, checkinMode: cls.checkinMode || 'parent',
            notes: cls.notes || '', classMode: cls.classMode || 'package',
            pricePerSession: cls.pricePerSession || '',
            settlementType: cls.settlementType || 'manual',
        });
        setEditingClass(cls);
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!form.name.trim()) return notify('请输入兴趣班名称', 'warning');
        if (form.kidIds.length === 0) return notify('请选择孩子', 'warning');
        const timeStr = form.startTime && form.endTime ? `${form.startTime}-${form.endTime}` : '';
        const payload = {
            kidId: form.kidIds.join(','), name: form.name.trim(), iconEmoji: '📚',
            totalSessions: form.classMode === 'tutor' ? 0 : (parseInt(form.totalSessions) || 0),
            sessionsPerClass: parseInt(form.sessionsPerClass) || 1,
            scheduleDays: form.scheduleDays, timeStr,
            startDate: form.startDate || todayStr,
            reward: parseInt(form.reward) || 0, checkinMode: form.checkinMode,
            notes: form.notes, classMode: form.classMode,
            pricePerSession: parseFloat(form.pricePerSession) || 0,
            settlementType: form.settlementType,
        };
        try {
            if (editingClass) {
                await apiFetch(`/api/classes/${editingClass.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                setClasses(prev => prev.map(c => c.id === editingClass.id ? { ...c, ...payload, scheduleDays: form.scheduleDays } : c));
                notify('已更新', 'success');
            } else {
                const id = `class_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
                await apiFetch('/api/classes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, id }) });
                setClasses(prev => [{ ...payload, id, usedSessions: 0, status: 'active', checkinHistory: [], scheduleDays: form.scheduleDays, createdAt: new Date().toISOString() }, ...prev]);
                notify('添加成功！', 'success');
            }
            setShowForm(false); resetForm();
        } catch (err) { notify('保存失败', 'error'); }
    };

    const requestCheckin = (cls) => {
        if (cls.classMode !== 'tutor' && cls.usedSessions >= cls.totalSessions) return notify('课时已用完', 'warning');
        setCheckinConfirmClass(cls);
    };

    const confirmCheckin = async () => {
        if (!checkinConfirmClass) return;
        const cls = checkinConfirmClass;
        setCheckinConfirmClass(null);
        const today = new Date().toISOString().split('T')[0];
        try {
            const newUsed = (cls.usedSessions || 0) + (cls.sessionsPerClass || 1);
            const isTutor = cls.classMode === 'tutor';
            const newStatus = isTutor ? 'active' : (newUsed >= cls.totalSessions ? 'completed' : 'active');
            const newHistory = [...(cls.checkinHistory || []), { date: today, type: 'checkin', sessions: cls.sessionsPerClass || 1 }];
            await apiFetch(`/api/classes/${cls.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ usedSessions: newUsed, status: newStatus, checkinHistory: newHistory }) });
            setClasses(prev => prev.map(c => c.id === cls.id ? { ...c, usedSessions: newUsed, status: newStatus, checkinHistory: newHistory } : c));
            notify(`${cls.name} 打卡成功！${isTutor ? `累计 ${newUsed} 节` : `消耗 ${cls.sessionsPerClass} 课时`}`, 'success');
        } catch (err) { notify('网络错误', 'error'); }
    };

    const requestDelete = (cls) => setDeleteConfirmClass(cls);
    const confirmDelete = async () => {
        if (!deleteConfirmClass) return;
        const cls = deleteConfirmClass;
        setDeleteConfirmClass(null);
        try {
            await apiFetch(`/api/classes/${cls.id}`, { method: 'DELETE' });
            setClasses(prev => prev.filter(c => c.id !== cls.id));
            notify('已删除', 'success');
        } catch (err) { notify('删除失败', 'error'); }
    };

    const requestSkip = (cls) => setSkipConfirmClass(cls);
    const confirmSkip = async () => {
        if (!skipConfirmClass) return;
        const cls = skipConfirmClass;
        setSkipConfirmClass(null);
        const today = new Date().toISOString().split('T')[0];
        const newHistory = [...(cls.checkinHistory || []), { date: today, type: 'skip', note: '请假/调课' }];
        try {
            await apiFetch(`/api/classes/${cls.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ checkinHistory: newHistory }) });
            setClasses(prev => prev.map(c => c.id === cls.id ? { ...c, checkinHistory: newHistory } : c));
            notify(`${cls.name} 今日已标记请假`, 'success');
        } catch (err) { notify('操作失败', 'error'); }
    };

    const getKidsForClass = (cls) => {
        const ids = (cls.kidId || '').split(',').filter(Boolean);
        return kids.filter(k => ids.includes(k.id));
    };

    const filteredClasses = (classes || []).filter(c => filterKidId === 'all' || (c.kidId || '').split(',').includes(filterKidId));
    const activeClasses = filteredClasses.filter(c => c.status === 'active');
    const completedClasses = filteredClasses.filter(c => c.status === 'completed');
    const getTutorCost = (cls) => ((cls.usedSessions || 0) * (cls.pricePerSession || 0));

    const toggleKidId = (kidId) => {
        setForm(f => ({ ...f, kidIds: f.kidIds.includes(kidId) ? f.kidIds.filter(id => id !== kidId) : [...f.kidIds, kidId] }));
    };

    // ─── Pill tag component ───
    const InfoPill = ({ icon: Icon, text, color }) => (
        <div className="flex items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-bold" style={{ background: `${color}12`, color, border: `1px solid ${color}20` }}>
            {Icon && <Icon size={11} />} {text}
        </div>
    );

    return (
        <div className="space-y-5">
            {/* ═══ Header ═══ */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl md:text-2xl font-black flex items-center gap-2.5" style={{ color: C.textPrimary }}>
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${C.orange}, ${C.orangeHot})`, boxShadow: `0 4px 14px ${C.orange}40` }}>
                        <Icons.GraduationCap size={20} />
                    </div>
                    课外兴趣班
                </h2>
                <button onClick={openAdd} className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all active:scale-95 group"
                    style={{ background: C.orange, boxShadow: `0 4px 14px ${C.orange}40` }}>
                    <Icons.Plus size={16} className="group-hover:rotate-90 transition-transform" /> 添加记录
                </button>
            </div>

            {/* ═══ Kid Filter ═══ */}
            {kids.length > 1 && (
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                    <button onClick={() => setFilterKidId('all')}
                        className="shrink-0 px-5 py-2 rounded-full font-bold text-sm transition-all"
                        style={filterKidId === 'all' ? { background: C.orange, color: '#fff', boxShadow: `0 4px 14px ${C.orange}40` } : { background: C.bgCard, color: C.textMuted, border: `1.5px solid ${C.bgLight}` }}>
                        全部
                    </button>
                    {kids.map(k => (
                        <button key={k.id} onClick={() => setFilterKidId(k.id)}
                            className="shrink-0 px-4 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2"
                            style={filterKidId === k.id ? { background: C.orange, color: '#fff', boxShadow: `0 4px 14px ${C.orange}40` } : { background: C.bgCard, color: C.textMuted, border: `1.5px solid ${C.bgLight}` }}>
                            <span className="w-5 h-5 block rounded-full overflow-hidden"><AvatarDisplay avatar={k.avatar} /></span> {k.name}
                        </button>
                    ))}
                </div>
            )}

            {/* ═══ Empty State ═══ */}
            {activeClasses.length === 0 && completedClasses.length === 0 && (
                <div className="text-center py-16 px-6 rounded-3xl relative overflow-hidden" style={{ background: C.bgCard, border: `1.5px solid ${C.bgLight}`, boxShadow: C.cardShadow }}>
                    <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full opacity-20" style={{ background: C.orange }}></div>
                    <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full opacity-15" style={{ background: C.teal }}></div>
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 text-4xl relative z-10 rotate-3" style={{ background: C.bgLight, boxShadow: C.cardShadow }}>🎓</div>
                    <h3 className="text-lg font-black relative z-10" style={{ color: C.textPrimary }}>还没有兴趣班记录</h3>
                    <p className="text-sm font-medium mt-2 relative z-10" style={{ color: C.textMuted }}>点击「添加记录」开始规划孩子的课外进步</p>
                    <button onClick={openAdd} className="mt-5 font-bold text-sm px-6 py-2.5 rounded-full transition-all relative z-10 inline-flex items-center gap-1.5 active:scale-95"
                        style={{ background: `${C.orange}15`, color: C.orange, border: `1.5px solid ${C.orange}30` }}>
                        <Icons.Plus size={15} /> 立即添加
                    </button>
                </div>
            )}

            {/* ═══ Active Classes ═══ */}
            {activeClasses.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeClasses.map(cls => {
                        const clsKids = getKidsForClass(cls);
                        const isTutor = cls.classMode === 'tutor';
                        const progress = !isTutor && cls.totalSessions > 0 ? Math.round((cls.usedSessions / cls.totalSessions) * 100) : 0;
                        const remaining = !isTutor ? cls.totalSessions - cls.usedSessions : null;
                        const todaySkipped = (cls.checkinHistory || []).some(h => h.date === todayStr && h.type === 'skip');
                        const totalCost = getTutorCost(cls);

                        return (
                            <div key={cls.id} className="rounded-2xl p-4 sm:p-5 flex flex-col relative overflow-hidden group transition-all duration-300"
                                style={{ background: C.bgCard, border: `1.5px solid ${C.bgLight}`, boxShadow: C.cardShadow }}>
                                {/* Hover glow */}
                                <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none" style={{ background: C.orange }}></div>

                                {/* Header */}
                                <div className="flex justify-between items-start mb-3 relative z-10">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-black text-base leading-tight flex items-center gap-2 mb-1.5" style={{ color: C.textPrimary }}>
                                            <span className="truncate">{cls.name}</span>
                                            {isTutor && <span className="shrink-0 text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: `${C.yellow}30`, color: '#B8860B', border: `1px solid ${C.yellow}50` }}>家教</span>}
                                        </div>
                                        {clsKids.length > 0 && (
                                            <div className="flex items-center gap-1 flex-wrap">
                                                {clsKids.map(k => (
                                                    <div key={k.id} className="flex items-center gap-1 rounded-full px-2 py-0.5" style={{ background: C.bgLight }}>
                                                        <span className="w-3.5 h-3.5 rounded-full overflow-hidden block shrink-0"><AvatarDisplay avatar={k.avatar} /></span>
                                                        <span className="text-[10px] font-bold" style={{ color: C.textMuted }}>{k.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {/* Actions — always visible on mobile, hover on desktop */}
                                    <div className="flex items-center gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                                        <button onClick={() => requestSkip(cls)} className="p-2 rounded-xl transition-colors" style={{ color: C.textMuted }} title="请假/跳课"><Icons.Clock size={16} /></button>
                                        <button onClick={() => openEdit(cls)} className="p-2 rounded-xl transition-colors" style={{ color: C.textMuted }}><Icons.Edit3 size={16} /></button>
                                        <button onClick={() => requestDelete(cls)} className="p-2 rounded-xl transition-colors" style={{ color: C.textMuted }}><Icons.Trash2 size={16} /></button>
                                    </div>
                                </div>

                                {/* Info pills */}
                                <div className="flex flex-wrap gap-1.5 mb-3 relative z-10">
                                    {cls.timeStr && <InfoPill icon={Icons.Clock} text={cls.timeStr} color={C.indigo} />}
                                    {cls.scheduleDays?.length > 0 && (
                                        <InfoPill icon={Icons.Calendar} text={`周${cls.scheduleDays.sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b)).map(d => DAY_LABELS[d]).join('、')}`} color={C.green} />
                                    )}
                                    {cls.startDate && cls.startDate > todayStr && <InfoPill icon={Icons.Calendar} text={`${cls.startDate} 开课`} color={C.orange} />}
                                    {isTutor && cls.pricePerSession > 0 && <InfoPill text={`¥${cls.pricePerSession}/节`} color={C.coral} />}
                                </div>

                                {/* Skip notice */}
                                {todaySkipped && (
                                    <div className="rounded-xl px-3 py-2 text-[11px] font-bold flex items-center gap-1.5 mb-3"
                                        style={{ background: `${C.yellow}15`, color: '#B8860B', border: `1px solid ${C.yellow}30` }}>
                                        <Icons.AlertCircle size={14} /> 今日已标记请假
                                    </div>
                                )}

                                {/* Stats area */}
                                <div className="flex-1 relative z-10">
                                    {isTutor ? (
                                        <div className="rounded-2xl p-4" style={{ background: C.bgLight + '80', border: `1px solid ${C.bgMuted}50` }}>
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: C.textMuted }}>累计上课</span>
                                                    <div className="text-2xl font-black mt-0.5" style={{ color: C.textPrimary }}>{cls.usedSessions} <span className="text-sm font-bold" style={{ color: C.textMuted }}>节</span></div>
                                                </div>
                                                {cls.pricePerSession > 0 && (
                                                    <div className="text-right">
                                                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: C.textMuted }}>累计费用</span>
                                                        <div className="text-xl font-black mt-0.5" style={{ color: C.coral }}>¥{totalCost.toFixed(0)}</div>
                                                    </div>
                                                )}
                                            </div>
                                            {cls.settlementType && (
                                                <div className="mt-2 text-[10px] font-bold" style={{ color: C.textMuted }}>
                                                    结算方式：{cls.settlementType === 'per_session' ? '每次结算' : cls.settlementType === 'monthly' ? '月结' : '手动结算'}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="rounded-2xl p-4" style={{ background: C.bgLight + '80', border: `1px solid ${C.bgMuted}50` }}>
                                            <div className="flex justify-between items-end mb-2.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: C.textMuted }}>课时进度</span>
                                                    <span className="text-xs font-black" style={{ color: C.orange }}>{cls.usedSessions} <span className="text-[10px] font-bold" style={{ color: C.textMuted }}>/ {cls.totalSessions}</span></span>
                                                </div>
                                                <div className="text-[10px] font-medium" style={{ color: C.textMuted }}>
                                                    剩 <strong style={{ color: C.textPrimary }}>{remaining}</strong> 节
                                                    {cls.reward > 0 && <span> · 奖 <strong style={{ color: C.orange }}>{cls.reward}</strong></span>}
                                                </div>
                                            </div>
                                            <div className="h-2 rounded-full overflow-hidden" style={{ background: C.bgMuted + '60' }}>
                                                <div className="h-full rounded-full transition-all duration-700 ease-out"
                                                    style={{ width: `${Math.min(progress, 100)}%`, background: progress >= 100 ? C.green : progress >= 80 ? C.yellow : `linear-gradient(90deg, ${C.orange}, ${C.orangeHot})` }}></div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Action button */}
                                {cls.checkinMode === 'kid' && remaining > 0 ? (
                                    <div className="w-full mt-3 rounded-xl py-3 text-center flex items-center justify-center gap-1" style={{ background: `${C.purple}10`, border: `1.5px solid ${C.purple}25` }}>
                                        <Icons.Target size={14} style={{ color: C.purple }} />
                                        <span className="text-[11px] font-bold tracking-wide" style={{ color: C.purple }}>由孩子完成任务自动核销</span>
                                    </div>
                                ) : (
                                    <button onClick={() => requestCheckin(cls)} disabled={!isTutor && remaining <= 0}
                                        className="w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[13px] transition-all active:scale-[0.98]"
                                        style={(isTutor || remaining > 0) ? { background: C.orange, color: '#fff', boxShadow: `0 4px 14px ${C.orange}40` } : { background: C.bgLight, color: C.textMuted, cursor: 'not-allowed' }}>
                                        <Icons.CheckCircle size={18} />
                                        {isTutor ? `记录上课 (+${cls.sessionsPerClass}节)` : (remaining > 0 ? `上课打卡 (${cls.sessionsPerClass}课时)` : '课程已完成')}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ═══ Completed Classes ═══ */}
            {completedClasses.length > 0 && (
                <div className="pt-6" style={{ borderTop: `2px dashed ${C.bgLight}` }}>
                    <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: C.textMuted }}>
                        <Icons.CheckCircle size={16} style={{ color: C.green }} /> 已结课
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {completedClasses.map(cls => {
                            const clsKids = getKidsForClass(cls);
                            const isTutor = cls.classMode === 'tutor';
                            const totalCost = getTutorCost(cls);
                            return (
                                <div key={cls.id} className="rounded-2xl p-4 sm:p-5 group flex flex-col relative overflow-hidden opacity-75 hover:opacity-100 transition-all"
                                    style={{ background: C.bgCard, border: `1.5px solid ${C.bgLight}`, boxShadow: C.cardShadow }}>
                                    <div className="flex justify-between items-start mb-3 relative z-10">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-black text-base leading-tight flex items-center gap-2 mb-1.5" style={{ color: C.textSoft }}>
                                                <span className="truncate">{cls.name}</span>
                                                <span className="shrink-0 text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: `${C.green}15`, color: C.green }}>已结课</span>
                                            </div>
                                            {clsKids.length > 0 && (
                                                <div className="flex items-center gap-1 flex-wrap">
                                                    {clsKids.map(k => (
                                                        <div key={k.id} className="flex items-center gap-1 rounded-full px-2 py-0.5" style={{ background: C.bgLight }}>
                                                            <span className="w-3.5 h-3.5 rounded-full overflow-hidden block shrink-0"><AvatarDisplay avatar={k.avatar} /></span>
                                                            <span className="text-[10px] font-bold" style={{ color: C.textMuted }}>{k.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                                            <button onClick={() => openEdit(cls)} className="p-2 rounded-xl transition-colors" style={{ color: C.textMuted }}><Icons.Edit3 size={16} /></button>
                                            <button onClick={() => requestDelete(cls)} className="p-2 rounded-xl transition-colors" style={{ color: C.textMuted }}><Icons.Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                    <div className="rounded-2xl p-4 relative z-10" style={{ background: `${C.green}08`, border: `1px solid ${C.green}20` }}>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: C.textMuted }}>总计上课</span>
                                                <div className="text-xl font-black mt-0.5" style={{ color: C.textPrimary }}>{cls.usedSessions} <span className="text-sm font-bold" style={{ color: C.textMuted }}>节</span></div>
                                            </div>
                                            {isTutor && cls.pricePerSession > 0 ? (
                                                <div className="text-right">
                                                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: C.textMuted }}>累计费用</span>
                                                    <div className="text-lg font-black mt-0.5" style={{ color: C.coral }}>¥{totalCost.toFixed(0)}</div>
                                                </div>
                                            ) : !isTutor && (
                                                <div className="text-right">
                                                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: C.textMuted }}>总购买</span>
                                                    <div className="text-lg font-black mt-0.5" style={{ color: C.green }}>{cls.totalSessions} 节</div>
                                                </div>
                                            )}
                                        </div>
                                        {!isTutor && (
                                            <div className="h-2 rounded-full overflow-hidden mt-3" style={{ background: `${C.green}15` }}>
                                                <div className="h-full rounded-full" style={{ width: '100%', background: C.green }}></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ═══════ Add/Edit Form Modal ═══════ */}
            {showForm && createPortal(
                <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999] animate-fade-in" style={{ background: 'rgba(27,46,75,0.5)', backdropFilter: 'blur(8px)' }}>
                    <div className="w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] rounded-3xl" style={{ background: C.bgCard, boxShadow: '0 25px 60px rgba(0,0,0,0.15)' }}>
                        {/* Modal header */}
                        <div className="px-6 py-4 flex justify-between items-center shrink-0" style={{ borderBottom: `1.5px solid ${C.bgLight}` }}>
                            <h2 className="text-lg font-black flex items-center gap-2.5" style={{ color: C.textPrimary }}>
                                <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${C.orange}15`, color: C.orange }}><Icons.Edit3 size={18} /></span>
                                {editingClass ? '修改信息' : '新记录'}
                            </h2>
                            <button onClick={() => { setShowForm(false); resetForm(); }} className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors" style={{ background: C.bgLight, color: C.textMuted }}><Icons.X size={18} /></button>
                        </div>

                        {/* Modal body */}
                        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5 hide-scrollbar">
                            {/* 选择孩子 */}
                            {kids.length > 0 && (
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest mb-2.5" style={{ color: C.textMuted }}>所属孩子 (可多选)</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {kids.map(k => (
                                            <button key={k.id} type="button" onClick={() => toggleKidId(k.id)}
                                                className="px-4 py-2.5 rounded-full text-[13px] font-bold flex items-center gap-2 transition-all"
                                                style={form.kidIds.includes(k.id) ? { background: C.orange, color: '#fff', boxShadow: `0 4px 12px ${C.orange}40` } : { background: C.bgLight, color: C.textSoft }}>
                                                <span className="w-5 h-5 block rounded-full overflow-hidden"><AvatarDisplay avatar={k.avatar} /></span> {k.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 模式选择 */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest mb-2.5" style={{ color: C.textMuted }}>课程类型</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button type="button" onClick={() => setForm(f => ({ ...f, classMode: 'package' }))}
                                        className="p-3 rounded-2xl transition-all text-left" style={form.classMode === 'package' ? { border: `2px solid ${C.orange}`, background: `${C.orange}08` } : { border: `2px solid ${C.bgLight}`, background: C.bgLight + '50' }}>
                                        <div className="font-black text-[13px] flex items-center gap-1.5 mb-1" style={{ color: form.classMode === 'package' ? C.orange : C.textSoft }}><Icons.BookOpen size={14} /> 课时包</div>
                                        <div className="text-[10px] font-bold leading-relaxed" style={{ color: C.textMuted }}>购买固定课时，每次上课扣除</div>
                                    </button>
                                    <button type="button" onClick={() => setForm(f => ({ ...f, classMode: 'tutor' }))}
                                        className="p-3 rounded-2xl transition-all text-left" style={form.classMode === 'tutor' ? { border: `2px solid ${C.yellow}`, background: `${C.yellow}10` } : { border: `2px solid ${C.bgLight}`, background: C.bgLight + '50' }}>
                                        <div className="font-black text-[13px] flex items-center gap-1.5 mb-1" style={{ color: form.classMode === 'tutor' ? '#B8860B' : C.textSoft }}><Icons.User size={14} /> 家教/按次</div>
                                        <div className="text-[10px] font-bold leading-relaxed" style={{ color: C.textMuted }}>上一次记一次，按次/月结算费用</div>
                                    </button>
                                </div>
                            </div>

                            {/* 名称 */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest mb-2.5" style={{ color: C.textMuted }}>兴趣班名称</label>
                                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="如：钢琴课、游泳训练..."
                                    className="w-full p-3.5 rounded-2xl font-black text-lg outline-none transition-all"
                                    style={{ background: C.bgLight + '80', border: `2px solid transparent`, color: C.textPrimary }} onFocus={e => e.target.style.borderColor = C.orange + '60'} onBlur={e => e.target.style.borderColor = 'transparent'} />
                            </div>

                            {/* 课时包模式 */}
                            {form.classMode === 'package' && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest mb-2.5" style={{ color: C.textMuted }}>总购买课时</label>
                                        <div className="relative">
                                            <input type="number" value={form.totalSessions} onChange={e => setForm(f => ({ ...f, totalSessions: e.target.value }))} placeholder="0"
                                                className="w-full p-3 pr-8 rounded-2xl font-black text-lg outline-none transition-all" style={{ background: C.bgLight + '80', color: C.textPrimary, border: '2px solid transparent' }} />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold" style={{ color: C.textMuted }}>节</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest mb-2.5" style={{ color: C.textMuted }}>每次消耗课时</label>
                                        <div className="relative">
                                            <input type="number" value={form.sessionsPerClass} onChange={e => setForm(f => ({ ...f, sessionsPerClass: e.target.value }))}
                                                className="w-full p-3 pr-8 rounded-2xl font-black text-lg outline-none transition-all" style={{ background: C.bgLight + '80', color: C.textPrimary, border: '2px solid transparent' }} />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold" style={{ color: C.textMuted }}>节</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 家教模式 */}
                            {form.classMode === 'tutor' && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest mb-2.5" style={{ color: C.textMuted }}>每节课费用</label>
                                        <div className="relative">
                                            <input type="number" value={form.pricePerSession} onChange={e => setForm(f => ({ ...f, pricePerSession: e.target.value }))} placeholder="0"
                                                className="w-full p-3 pl-10 rounded-2xl font-black text-lg outline-none transition-all" style={{ background: C.bgLight + '80', color: C.textPrimary, border: '2px solid transparent' }} />
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: C.orange }}>¥</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest mb-2.5" style={{ color: C.textMuted }}>结算方式</label>
                                        <select value={form.settlementType} onChange={e => setForm(f => ({ ...f, settlementType: e.target.value }))}
                                            className="w-full p-3 rounded-2xl font-bold text-[13px] outline-none transition-all appearance-none cursor-pointer" style={{ background: C.bgLight + '80', color: C.textSoft, border: '2px solid transparent' }}>
                                            <option value="per_session">每次结算</option>
                                            <option value="monthly">月结</option>
                                            <option value="manual">手动结算</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* 上课时间 */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest mb-2.5 flex items-center gap-1" style={{ color: C.textMuted }}><Icons.Clock size={12} /> 上课时间</label>
                                <div className="flex items-center gap-3 p-3 rounded-2xl transition-all" style={{ background: C.bgLight + '80', border: '2px solid transparent' }}>
                                    <input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} className="flex-1 bg-transparent font-bold text-base outline-none px-2 py-0.5" style={{ color: C.textSoft }} />
                                    <span className="font-black text-lg" style={{ color: C.bgMuted }}>→</span>
                                    <input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} className="flex-1 bg-transparent font-bold text-base outline-none px-2 py-0.5" style={{ color: C.textSoft }} />
                                </div>
                            </div>

                            {/* 开课日期 */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest mb-2.5 flex items-center gap-1" style={{ color: C.textMuted }}><Icons.Calendar size={12} /> 开课日期</label>
                                <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                                    className="w-full p-3 rounded-2xl font-bold text-[13px] outline-none transition-all" style={{ background: C.bgLight + '80', color: C.textSoft, border: '2px solid transparent' }} />
                            </div>

                            {/* 上课星期 */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest mb-2.5 flex items-center gap-1" style={{ color: C.textMuted }}><Icons.Calendar size={12} /> 上课星期</label>
                                <div className="flex gap-1.5 flex-wrap">
                                    {DAY_ORDER.map(idx => (
                                        <button key={idx} type="button" onClick={() => setForm(f => ({ ...f, scheduleDays: f.scheduleDays.includes(idx) ? f.scheduleDays.filter(d => d !== idx) : [...f.scheduleDays, idx] }))}
                                            className="flex-1 min-w-[2.8rem] aspect-square rounded-xl font-black text-sm flex items-center justify-center transition-all"
                                            style={form.scheduleDays.includes(idx) ? { background: C.orange, color: '#fff', boxShadow: `0 4px 12px ${C.orange}40` } : { background: C.bgLight, color: C.textMuted }}>
                                            {DAY_LABELS[idx]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 完成奖励 */}
                            {form.classMode === 'package' && (
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest mb-2.5" style={{ color: C.textMuted }}>完成奖励 (家庭币)</label>
                                    <div className="relative">
                                        <input type="number" value={form.reward} onChange={e => setForm(f => ({ ...f, reward: e.target.value }))}
                                            className="w-full p-3.5 pl-12 rounded-2xl font-black text-lg outline-none transition-all" style={{ background: `${C.yellow}10`, color: '#B8860B', border: '2px solid transparent' }} />
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl drop-shadow-sm">💰</span>
                                    </div>
                                </div>
                            )}

                            {/* 打卡模式 */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest mb-2.5 flex items-center gap-1" style={{ color: C.textMuted }}><Icons.Sparkles size={12} /> 打卡模式</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button type="button" onClick={() => setForm(f => ({ ...f, checkinMode: 'parent' }))}
                                        className="p-3 rounded-2xl transition-all text-left" style={form.checkinMode === 'parent' ? { border: `2px solid ${C.orange}`, background: `${C.orange}08` } : { border: `2px solid ${C.bgLight}`, background: C.bgLight + '50' }}>
                                        <div className="font-black text-[13px] flex items-center gap-1.5 mb-1" style={{ color: form.checkinMode === 'parent' ? C.orange : C.textSoft }}><Icons.User size={14} /> 家长手动</div>
                                        <div className="text-[10px] font-bold leading-relaxed" style={{ color: C.textMuted }}>在此页面操作打卡</div>
                                    </button>
                                    <button type="button" onClick={() => setForm(f => ({ ...f, checkinMode: 'kid' }))}
                                        className="p-3 rounded-2xl transition-all text-left" style={form.checkinMode === 'kid' ? { border: `2px solid ${C.purple}`, background: `${C.purple}08` } : { border: `2px solid ${C.bgLight}`, background: C.bgLight + '50' }}>
                                        <div className="font-black text-[13px] flex items-center gap-1.5 mb-1" style={{ color: form.checkinMode === 'kid' ? C.purple : C.textSoft }}><Icons.Target size={14} /> 孩子任务联动</div>
                                        <div className="text-[10px] font-bold leading-relaxed" style={{ color: C.textMuted }}>创建任务，由孩子打卡</div>
                                    </button>
                                </div>
                            </div>

                            {/* 备注 */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest mb-2.5" style={{ color: C.textMuted }}>备注信息</label>
                                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="选填..."
                                    className="w-full p-3.5 rounded-2xl font-medium text-[13px] outline-none transition-all resize-none" style={{ background: C.bgLight + '80', color: C.textSoft, border: '2px solid transparent' }}></textarea>
                            </div>
                        </div>

                        {/* Modal footer */}
                        <div className="p-4 shrink-0" style={{ borderTop: `1.5px solid ${C.bgLight}` }}>
                            <button onClick={handleSave} className="w-full py-3.5 rounded-xl font-black text-[15px] transition-all active:scale-[0.98] text-white"
                                style={{ background: C.orange, boxShadow: `0 4px 14px ${C.orange}40` }}>
                                {editingClass ? '保存修改信息' : '创建记录'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* ═══ Checkin Confirm ═══ */}
            {checkinConfirmClass && createPortal(
                <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999] animate-fade-in" style={{ background: 'rgba(27,46,75,0.5)', backdropFilter: 'blur(8px)' }}>
                    <div className="w-full max-w-xs sm:max-w-sm overflow-hidden rounded-3xl" style={{ background: C.bgCard, boxShadow: '0 25px 60px rgba(0,0,0,0.15)' }}>
                        <div className="p-8 text-center" style={{ background: `linear-gradient(180deg, ${C.orange}08 0%, ${C.bgCard} 100%)` }}>
                            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 rotate-3" style={{ background: C.bgCard, boxShadow: `0 8px 24px ${C.orange}20`, color: C.orange }}>
                                <Icons.CheckCircle size={36} />
                            </div>
                            <h3 className="text-xl font-black mb-2" style={{ color: C.textPrimary }}>{checkinConfirmClass.name}</h3>
                            <p className="text-sm font-bold mt-2" style={{ color: C.textSoft }}>
                                {checkinConfirmClass.classMode === 'tutor'
                                    ? <>确定记录上课？将累加 <span className="font-black text-lg" style={{ color: C.orange }}>{checkinConfirmClass.sessionsPerClass}</span> 节</>
                                    : <>确定要打卡吗？将扣除 <span className="font-black text-lg" style={{ color: C.orange }}>{checkinConfirmClass.sessionsPerClass}</span> 节课时</>
                                }
                            </p>
                        </div>
                        <div className="flex" style={{ borderTop: `1.5px solid ${C.bgLight}` }}>
                            <button onClick={() => setCheckinConfirmClass(null)} className="flex-1 py-4 font-bold transition-colors" style={{ color: C.textMuted }}>取消</button>
                            <div style={{ width: 1, background: C.bgLight, margin: '12px 0' }}></div>
                            <button onClick={confirmCheckin} className="flex-1 py-4 font-black transition-colors" style={{ color: C.orange }}>确认</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* ═══ Delete Confirm ═══ */}
            {deleteConfirmClass && createPortal(
                <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999] animate-fade-in" style={{ background: 'rgba(27,46,75,0.5)', backdropFilter: 'blur(8px)' }}>
                    <div className="w-full max-w-xs sm:max-w-sm overflow-hidden rounded-3xl" style={{ background: C.bgCard, boxShadow: '0 25px 60px rgba(0,0,0,0.15)' }}>
                        <div className="p-8 text-center" style={{ background: `linear-gradient(180deg, ${C.coral}08 0%, ${C.bgCard} 100%)` }}>
                            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 -rotate-3" style={{ background: C.bgCard, boxShadow: `0 8px 24px ${C.coral}20`, color: C.coral }}>
                                <Icons.Trash2 size={36} />
                            </div>
                            <h3 className="text-xl font-black mb-2" style={{ color: C.textPrimary }}>删除记录</h3>
                            <p className="text-sm font-bold mt-2" style={{ color: C.textSoft }}>确定要删除「{deleteConfirmClass.name}」吗？<br /><span style={{ color: C.coral }}>此操作不可恢复</span></p>
                        </div>
                        <div className="flex" style={{ borderTop: `1.5px solid ${C.bgLight}` }}>
                            <button onClick={() => setDeleteConfirmClass(null)} className="flex-1 py-4 font-bold transition-colors" style={{ color: C.textMuted }}>取消</button>
                            <div style={{ width: 1, background: C.bgLight, margin: '12px 0' }}></div>
                            <button onClick={confirmDelete} className="flex-1 py-4 font-black transition-colors" style={{ color: C.coral }}>确认删除</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* ═══ Skip Confirm ═══ */}
            {skipConfirmClass && createPortal(
                <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999] animate-fade-in" style={{ background: 'rgba(27,46,75,0.5)', backdropFilter: 'blur(8px)' }}>
                    <div className="w-full max-w-xs sm:max-w-sm overflow-hidden rounded-3xl" style={{ background: C.bgCard, boxShadow: '0 25px 60px rgba(0,0,0,0.15)' }}>
                        <div className="p-8 text-center" style={{ background: `linear-gradient(180deg, ${C.yellow}10 0%, ${C.bgCard} 100%)` }}>
                            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: C.bgCard, boxShadow: `0 8px 24px ${C.yellow}30`, color: '#B8860B' }}>
                                <Icons.Clock size={36} />
                            </div>
                            <h3 className="text-xl font-black mb-2" style={{ color: C.textPrimary }}>请假 / 调课</h3>
                            <p className="text-sm font-bold mt-2" style={{ color: C.textSoft }}>将「{skipConfirmClass.name}」今日标记为<span className="font-black" style={{ color: '#B8860B' }}>请假</span>？<br /><span className="text-[11px]" style={{ color: C.textMuted }}>不会扣除课时</span></p>
                        </div>
                        <div className="flex" style={{ borderTop: `1.5px solid ${C.bgLight}` }}>
                            <button onClick={() => setSkipConfirmClass(null)} className="flex-1 py-4 font-bold transition-colors" style={{ color: C.textMuted }}>取消</button>
                            <div style={{ width: 1, background: C.bgLight, margin: '12px 0' }}></div>
                            <button onClick={confirmSkip} className="flex-1 py-4 font-black transition-colors" style={{ color: '#B8860B' }}>确认请假</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
