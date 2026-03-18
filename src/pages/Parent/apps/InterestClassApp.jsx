import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useDataContext } from '../../../context/DataContext.jsx';
import { useToast } from '../../../hooks/useToast';
import { apiFetch } from '../../../api/client';
import { Icons, AvatarDisplay } from '../../../utils/Icons';

// 周一开始的星期显示顺序
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // idx: 1=一 2=二 ... 6=六 0=日
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
        classMode: 'package', // 'package' | 'tutor'
        pricePerSession: '',
        settlementType: 'manual', // 'per_session' | 'monthly' | 'manual'
    });

    const resetForm = () => {
        setForm({
            kidIds: activeKidId ? [activeKidId] : (kids[0] ? [kids[0].id] : []),
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
        setEditingClass(null);
    };

    const openAdd = () => { resetForm(); setShowForm(true); };

    const openEdit = (cls) => {
        const [startTime, endTime] = (cls.timeStr || '').split('-');
        setForm({
            kidIds: cls.kidId ? cls.kidId.split(',') : [],
            name: cls.name,
            totalSessions: cls.totalSessions || '',
            sessionsPerClass: cls.sessionsPerClass || 1,
            scheduleDays: cls.scheduleDays || [],
            startTime: startTime || '',
            endTime: endTime || '',
            startDate: cls.startDate || todayStr,
            reward: cls.reward || 0,
            checkinMode: cls.checkinMode || 'parent',
            notes: cls.notes || '',
            classMode: cls.classMode || 'package',
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
            kidId: form.kidIds.join(','),
            name: form.name.trim(),
            iconEmoji: '📚',
            totalSessions: form.classMode === 'tutor' ? 0 : (parseInt(form.totalSessions) || 0),
            sessionsPerClass: parseInt(form.sessionsPerClass) || 1,
            scheduleDays: form.scheduleDays,
            timeStr,
            startDate: form.startDate || todayStr,
            reward: parseInt(form.reward) || 0,
            checkinMode: form.checkinMode,
            notes: form.notes,
            classMode: form.classMode,
            pricePerSession: parseFloat(form.pricePerSession) || 0,
            settlementType: form.settlementType,
        };

        try {
            if (editingClass) {
                await apiFetch(`/api/classes/${editingClass.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                setClasses(prev => prev.map(c => c.id === editingClass.id ? { ...c, ...payload, scheduleDays: form.scheduleDays } : c));
                notify('已更新', 'success');
            } else {
                const id = `class_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
                await apiFetch('/api/classes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...payload, id }),
                });
                setClasses(prev => [{ ...payload, id, usedSessions: 0, status: 'active', checkinHistory: [], scheduleDays: form.scheduleDays, createdAt: new Date().toISOString() }, ...prev]);
                notify('添加成功！', 'success');
            }
            setShowForm(false);
            resetForm();
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
            await apiFetch(`/api/classes/${cls.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usedSessions: newUsed, status: newStatus, checkinHistory: newHistory }),
            });
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
            await apiFetch(`/api/classes/${cls.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ checkinHistory: newHistory }),
            });
            setClasses(prev => prev.map(c => c.id === cls.id ? { ...c, checkinHistory: newHistory } : c));
            notify(`${cls.name} 今日已标记请假`, 'success');
        } catch (err) { notify('操作失败', 'error'); }
    };

    const getKidsForClass = (cls) => {
        const ids = (cls.kidId || '').split(',').filter(Boolean);
        return kids.filter(k => ids.includes(k.id));
    };

    const filteredClasses = (classes || []).filter(c => {
        if (filterKidId === 'all') return true;
        return (c.kidId || '').split(',').includes(filterKidId);
    });
    const activeClasses = filteredClasses.filter(c => c.status === 'active');
    const completedClasses = filteredClasses.filter(c => c.status === 'completed');

    // 家教模式统计
    const getTutorCost = (cls) => ((cls.usedSessions || 0) * (cls.pricePerSession || 0));

    const toggleKidId = (kidId) => {
        setForm(f => ({
            ...f,
            kidIds: f.kidIds.includes(kidId) ? f.kidIds.filter(id => id !== kidId) : [...f.kidIds, kidId]
        }));
    };

    return (
        <div className="space-y-6">
            {/* 标题栏 */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-pink-200">
                        <Icons.GraduationCap size={20} />
                    </div>
                    课外兴趣班
                </h2>
                <button onClick={openAdd} className="flex items-center justify-center gap-1.5 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95 group">
                    <Icons.Plus size={16} className="group-hover:rotate-90 transition-transform" /> 添加记录
                </button>
            </div>

            {/* 孩子筛选 */}
            {kids.length > 1 && (
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                    <button onClick={() => setFilterKidId('all')} className={`shrink-0 px-5 py-2.5 rounded-[1.25rem] font-bold text-sm transition-all shadow-sm ${filterKidId === 'all' ? 'bg-slate-800 text-white scale-105 shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`}>全部</button>
                    {kids.map(k => (
                        <button key={k.id} onClick={() => setFilterKidId(k.id)} className={`shrink-0 px-4 py-2.5 rounded-[1.25rem] font-bold text-sm transition-all flex items-center gap-2 shadow-sm ${filterKidId === k.id ? 'bg-slate-800 text-white scale-105 shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`}>
                            <span className="w-5 h-5 block rounded-full overflow-hidden"><AvatarDisplay avatar={k.avatar} /></span> {k.name}
                        </button>
                    ))}
                </div>
            )}

            {/* 空状态 */}
            {activeClasses.length === 0 && completedClasses.length === 0 && (
                <div className="text-center py-20 bg-gradient-to-br from-indigo-50/50 to-pink-50/50 rounded-[2.5rem] border border-white/60 shadow-sm relative overflow-hidden">
                    <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-pink-100 rotate-3 border border-pink-50 text-5xl z-10 relative">🎓</div>
                    <h3 className="text-xl font-black text-slate-800 relative z-10">还没有兴趣班记录</h3>
                    <p className="text-slate-500 text-sm font-medium mt-2 relative z-10">点击上方「添加记录」开始规划孩子的课外进步</p>
                    <button onClick={openAdd} className="mt-6 font-bold text-pink-500 hover:text-pink-600 px-6 py-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all relative z-10 inline-flex items-center gap-1 active:scale-95">
                        <Icons.Plus size={16}/> 立即添加
                    </button>
                </div>
            )}

            {/* 进行中的兴趣班 */}
            {activeClasses.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {activeClasses.map(cls => {
                        const clsKids = getKidsForClass(cls);
                        const isTutor = cls.classMode === 'tutor';
                        const progress = !isTutor && cls.totalSessions > 0 ? Math.round((cls.usedSessions / cls.totalSessions) * 100) : 0;
                        const remaining = !isTutor ? cls.totalSessions - cls.usedSessions : null;
                        const todaySkipped = (cls.checkinHistory || []).some(h => h.date === todayStr && h.type === 'skip');
                        const totalCost = getTutorCost(cls);

                        return (
                            <div key={cls.id} className="bg-white rounded-[2rem] p-5 shadow-[0_5px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-100/60 hover:shadow-lg hover:border-pink-100 transition-all group flex flex-col relative overflow-hidden">
                                <div className="absolute -right-8 -top-8 w-32 h-32 bg-pink-50 rounded-full blur-2xl opacity-60 pointer-events-none transition-transform group-hover:scale-150 duration-700"></div>

                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-black text-slate-800 text-[1.1rem] leading-tight flex items-center gap-2 mb-2">
                                            <span className="truncate">{cls.name}</span>
                                            {isTutor && <span className="shrink-0 text-[9px] font-black bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full border border-amber-200/50">家教</span>}
                                        </div>
                                        {clsKids.length > 0 && (
                                            <div className="flex items-center gap-1 flex-wrap">
                                                {clsKids.map(k => (
                                                    <div key={k.id} className="flex items-center gap-1 bg-slate-50 rounded-full px-2 py-0.5 border border-slate-100">
                                                        <span className="w-3.5 h-3.5 rounded-full overflow-hidden shadow-sm block shrink-0"><AvatarDisplay avatar={k.avatar} /></span>
                                                        <span className="text-[10px] font-bold text-slate-500">{k.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity translate-x-3 group-hover:translate-x-0 shrink-0">
                                        <button onClick={() => requestSkip(cls)} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-colors" title="请假/跳课"><Icons.Clock size={16} /></button>
                                        <button onClick={() => openEdit(cls)} className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-slate-50 rounded-xl transition-colors"><Icons.Edit3 size={16} /></button>
                                        <button onClick={() => requestDelete(cls)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Icons.Trash2 size={16} /></button>
                                    </div>
                                </div>

                                <div className="space-y-3 flex-1 relative z-10">
                                    <div className="flex flex-wrap gap-1.5 text-[10px] font-bold text-slate-500">
                                        {cls.timeStr && <div className="flex items-center gap-1 bg-indigo-50/50 border border-indigo-100/50 py-1 px-2.5 rounded-lg text-indigo-500"><Icons.Clock size={12} /> {cls.timeStr}</div>}
                                        {cls.scheduleDays?.length > 0 && (
                                            <div className="flex items-center gap-1 bg-emerald-50/50 border border-emerald-100/50 py-1 px-2.5 rounded-lg text-emerald-600">
                                                <Icons.Calendar size={12} /> 周{cls.scheduleDays.sort((a,b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b)).map(d => DAY_LABELS[d]).join('、')}
                                            </div>
                                        )}
                                        {cls.startDate && cls.startDate > todayStr && (
                                            <div className="flex items-center gap-1 bg-amber-50/50 border border-amber-100/50 py-1 px-2.5 rounded-lg text-amber-600"><Icons.Calendar size={12} /> {cls.startDate} 开课</div>
                                        )}
                                        {isTutor && cls.pricePerSession > 0 && (
                                            <div className="flex items-center gap-1 bg-rose-50/50 border border-rose-100/50 py-1 px-2.5 rounded-lg text-rose-500">¥{cls.pricePerSession}/节</div>
                                        )}
                                    </div>

                                    {todaySkipped && (
                                        <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 text-[11px] font-bold text-amber-600 flex items-center gap-1.5">
                                            <Icons.AlertCircle size={14} /> 今日已标记请假
                                        </div>
                                    )}

                                    {isTutor ? (
                                        /* 家教模式：累计统计 */
                                        <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">累计上课</span>
                                                    <div className="text-2xl font-black text-slate-800 mt-1">{cls.usedSessions} <span className="text-sm text-slate-400 font-bold">节</span></div>
                                                </div>
                                                {cls.pricePerSession > 0 && (
                                                    <div className="text-right">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">累计费用</span>
                                                        <div className="text-xl font-black text-rose-500 mt-1">¥{totalCost.toFixed(0)}</div>
                                                    </div>
                                                )}
                                            </div>
                                            {cls.settlementType && (
                                                <div className="mt-2 text-[10px] font-bold text-slate-400">
                                                    结算方式：{cls.settlementType === 'per_session' ? '每次结算' : cls.settlementType === 'monthly' ? '月结' : '手动结算'}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        /* 课时包模式：进度条 */
                                        <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50">
                                            <div className="flex justify-between items-end mb-2.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">课时进度</span>
                                                    <span className="text-xs font-black text-pink-500">{cls.usedSessions} <span className="text-slate-400 text-[10px] font-bold">/ {cls.totalSessions}</span></span>
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-medium">
                                                    剩 <strong className="text-slate-700">{remaining}</strong> 节
                                                    {cls.reward > 0 && <span> · 奖 <strong className="text-amber-500">{cls.reward}</strong></span>}
                                                </div>
                                            </div>
                                            <div className="h-2 bg-slate-200/50 rounded-full overflow-hidden shadow-inner">
                                                <div className={`h-full rounded-full transition-all duration-700 ease-out ${progress >= 100 ? 'bg-emerald-500' : progress >= 80 ? 'bg-amber-400' : 'bg-gradient-to-r from-pink-400 to-rose-500'}`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {cls.checkinMode === 'kid' && remaining > 0 ? (
                                    <div className="w-full mt-4 bg-indigo-50/50 border border-indigo-100/50 rounded-[1.25rem] py-3 text-center flex items-center justify-center gap-1 cursor-help">
                                        <Icons.Target size={14} className="text-indigo-500" />
                                        <span className="text-[11px] font-bold text-indigo-500 tracking-wide">由孩子完成任务自动核销</span>
                                    </div>
                                ) : (
                                    <button onClick={() => requestCheckin(cls)} disabled={!isTutor && remaining <= 0} className={`w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-[1.25rem] font-black text-[13px] transition-all active:scale-[0.98] ${(isTutor || remaining > 0) ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200/50' : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/50'}`}>
                                        <Icons.CheckCircle size={18} className={(isTutor || remaining > 0) ? 'text-pink-400' : ''} />
                                        {isTutor ? `记录上课 (+${cls.sessionsPerClass}节)` : (remaining > 0 ? `上课打卡 (${cls.sessionsPerClass}课时)` : '课程已完成')}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 已结课 */}
            {completedClasses.length > 0 && (
                <div className="pt-8 border-t-2 border-slate-100 border-dashed">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Icons.CheckCircle size={16} className="text-emerald-400" /> 已结课</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {completedClasses.map(cls => {
                            const clsKids = getKidsForClass(cls);
                            const isTutor = cls.classMode === 'tutor';
                            const totalCost = getTutorCost(cls);
                            return (
                                <div key={cls.id} className="bg-white/60 rounded-[2rem] p-5 shadow-[0_5px_20px_-5px_rgba(0,0,0,0.03)] border border-slate-100/60 group flex flex-col relative overflow-hidden opacity-80 hover:opacity-100 transition-all">
                                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-50 rounded-full blur-2xl opacity-40 pointer-events-none"></div>
                                    <div className="flex justify-between items-start mb-3 relative z-10">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-black text-slate-600 text-[1.05rem] leading-tight flex items-center gap-2 mb-2">
                                                <span className="truncate">{cls.name}</span>
                                                <span className="shrink-0 text-[9px] font-black bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">已结课</span>
                                            </div>
                                            {clsKids.length > 0 && (
                                                <div className="flex items-center gap-1 flex-wrap">
                                                    {clsKids.map(k => (
                                                        <div key={k.id} className="flex items-center gap-1 bg-slate-50 rounded-full px-2 py-0.5 border border-slate-100">
                                                            <span className="w-3.5 h-3.5 rounded-full overflow-hidden shadow-sm block shrink-0"><AvatarDisplay avatar={k.avatar} /></span>
                                                            <span className="text-[10px] font-bold text-slate-400">{k.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                            <button onClick={() => openEdit(cls)} className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-slate-50 rounded-xl transition-colors"><Icons.Edit3 size={16} /></button>
                                            <button onClick={() => requestDelete(cls)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Icons.Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                    <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/50 relative z-10">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">总计上课</span>
                                                <div className="text-xl font-black text-slate-700 mt-0.5">{cls.usedSessions} <span className="text-sm text-slate-400 font-bold">节</span></div>
                                            </div>
                                            {isTutor && cls.pricePerSession > 0 && (
                                                <div className="text-right">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">累计费用</span>
                                                    <div className="text-lg font-black text-rose-400 mt-0.5">¥{totalCost.toFixed(0)}</div>
                                                </div>
                                            )}
                                            {!isTutor && (
                                                <div className="text-right">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">总购买</span>
                                                    <div className="text-lg font-black text-emerald-500 mt-0.5">{cls.totalSessions} 节</div>
                                                </div>
                                            )}
                                        </div>
                                        {!isTutor && (
                                            <div className="h-2 bg-emerald-200/30 rounded-full overflow-hidden shadow-inner mt-3">
                                                <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: '100%' }}></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ========== 添加/编辑表单 ========== */}
            {showForm && createPortal(
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fade-in">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20">
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center shrink-0 bg-white/80 backdrop-blur-md">
                            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2.5">
                                <span className="w-9 h-9 rounded-[0.8rem] bg-indigo-50 text-indigo-500 flex items-center justify-center"><Icons.Edit3 size={18} /></span>
                                {editingClass ? '修改信息' : '新记录'}
                            </h2>
                            <button onClick={() => { setShowForm(false); resetForm(); }} className="w-9 h-9 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-[1rem] transition-colors"><Icons.X size={18} /></button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 space-y-5 custom-scrollbar">
                            {/* 选择孩子 (多选) */}
                            {kids.length > 0 && (
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">所属孩子 (可多选)</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {kids.map(k => (
                                            <button key={k.id} type="button" onClick={() => toggleKidId(k.id)} className={`px-4 py-2.5 rounded-2xl text-[13px] font-bold flex items-center gap-2 transition-all ${form.kidIds.includes(k.id) ? 'bg-slate-800 text-white shadow-md shadow-slate-200 scale-105' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100'}`}>
                                                <span className="w-5 h-5 block rounded-full overflow-hidden shadow-sm"><AvatarDisplay avatar={k.avatar} /></span> {k.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 模式选择 */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">课程类型</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button type="button" onClick={() => setForm(f => ({ ...f, classMode: 'package' }))} className={`p-3 rounded-2xl border-2 transition-all text-left ${form.classMode === 'package' ? 'border-pink-300 bg-pink-50 shadow-sm scale-[1.02]' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'}`}>
                                        <div className={`font-black text-[13px] flex items-center gap-1.5 mb-1 ${form.classMode === 'package' ? 'text-pink-600' : 'text-slate-600'}`}><Icons.BookOpen size={14} /> 课时包</div>
                                        <div className="text-[10px] font-bold text-slate-500 leading-relaxed">购买固定课时，每次上课扣除</div>
                                    </button>
                                    <button type="button" onClick={() => setForm(f => ({ ...f, classMode: 'tutor' }))} className={`p-3 rounded-2xl border-2 transition-all text-left ${form.classMode === 'tutor' ? 'border-amber-300 bg-amber-50 shadow-sm scale-[1.02]' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'}`}>
                                        <div className={`font-black text-[13px] flex items-center gap-1.5 mb-1 ${form.classMode === 'tutor' ? 'text-amber-600' : 'text-slate-600'}`}><Icons.User size={14} /> 家教/按次</div>
                                        <div className="text-[10px] font-bold text-slate-500 leading-relaxed">上一次记一次，按次/月结算费用</div>
                                    </button>
                                </div>
                            </div>

                            {/* 名称 */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">兴趣班名称</label>
                                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="如：钢琴课、游泳训练..." className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-300 focus:bg-white p-4 rounded-[1.5rem] font-black text-lg text-slate-800 outline-none transition-all placeholder:text-slate-300 placeholder:font-bold" />
                            </div>

                            {/* 课时包模式：总课时 + 每次消耗 */}
                            {form.classMode === 'package' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">总购买课时</label>
                                        <div className="relative">
                                            <input type="number" value={form.totalSessions} onChange={e => setForm(f => ({ ...f, totalSessions: e.target.value }))} placeholder="0" className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-300 focus:bg-white p-3.5 pr-8 rounded-2xl font-black text-lg text-slate-800 outline-none transition-all placeholder:text-slate-300" />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">节</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">每次消耗课时</label>
                                        <div className="relative">
                                            <input type="number" value={form.sessionsPerClass} onChange={e => setForm(f => ({ ...f, sessionsPerClass: e.target.value }))} className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-300 focus:bg-white p-3.5 pr-8 rounded-2xl font-black text-lg text-slate-800 outline-none transition-all" />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">节</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 家教模式：单价 + 结算方式 */}
                            {form.classMode === 'tutor' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">每节课费用</label>
                                        <div className="relative">
                                            <input type="number" value={form.pricePerSession} onChange={e => setForm(f => ({ ...f, pricePerSession: e.target.value }))} placeholder="0" className="w-full bg-slate-50 border-2 border-transparent focus:border-amber-300 focus:bg-white p-3.5 pl-10 rounded-2xl font-black text-lg text-slate-800 outline-none transition-all placeholder:text-slate-300" />
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-amber-500">¥</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">结算方式</label>
                                        <select value={form.settlementType} onChange={e => setForm(f => ({ ...f, settlementType: e.target.value }))} className="w-full bg-slate-50 border-2 border-transparent focus:border-amber-300 focus:bg-white p-3.5 rounded-2xl font-bold text-[13px] text-slate-700 outline-none transition-all appearance-none cursor-pointer">
                                            <option value="per_session">每次结算</option>
                                            <option value="monthly">月结</option>
                                            <option value="manual">手动结算</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* 上课时间 - 放大版 */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1"><Icons.Clock size={12}/> 上课时间</label>
                                <div className="flex items-center gap-3 bg-slate-50 p-3 border-2 border-transparent focus-within:border-indigo-300 focus-within:bg-white rounded-2xl transition-all">
                                    <input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} className="flex-1 bg-transparent font-bold text-base md:text-lg text-slate-700 outline-none px-2 py-1" />
                                    <span className="text-slate-300 font-black text-lg">→</span>
                                    <input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} className="flex-1 bg-transparent font-bold text-base md:text-lg text-slate-700 outline-none px-2 py-1" />
                                </div>
                            </div>

                            {/* 开课日期 */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1"><Icons.Calendar size={12}/> 开课日期</label>
                                <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-300 focus:bg-white p-3.5 rounded-2xl font-bold text-[13px] text-slate-700 outline-none transition-all" />
                            </div>

                            {/* 上课星期 (从周一开始) */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1"><Icons.Calendar size={12}/> 上课星期</label>
                                <div className="flex gap-1.5 flex-wrap">
                                    {DAY_ORDER.map(idx => (
                                        <button key={idx} type="button" onClick={() => setForm(f => ({ ...f, scheduleDays: f.scheduleDays.includes(idx) ? f.scheduleDays.filter(d => d !== idx) : [...f.scheduleDays, idx] }))} className={`flex-1 min-w-[3rem] aspect-square rounded-[1rem] font-black text-sm flex items-center justify-center transition-all ${form.scheduleDays.includes(idx) ? 'bg-slate-800 text-white shadow-md shadow-slate-200 scale-[1.05]' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}>
                                            {DAY_LABELS[idx]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 完成奖励 (仅课时包模式) */}
                            {form.classMode === 'package' && (
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">完成奖励 (家庭币)</label>
                                    <div className="relative">
                                        <input type="number" value={form.reward} onChange={e => setForm(f => ({ ...f, reward: e.target.value }))} className="w-full bg-amber-50/50 border-2 border-transparent focus:border-amber-300 focus:bg-white p-3.5 pl-12 rounded-2xl font-black text-lg text-amber-600 outline-none transition-all" />
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl drop-shadow-sm">💰</span>
                                    </div>
                                </div>
                            )}

                            {/* 打卡模式 */}
                            <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1"><Icons.Sparkles size={12}/> 打卡模式</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button type="button" onClick={() => setForm(f => ({ ...f, checkinMode: 'parent' }))} className={`p-3 rounded-2xl border-2 transition-all text-left ${form.checkinMode === 'parent' ? 'border-pink-300 bg-pink-50 shadow-sm scale-[1.02]' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'}`}>
                                            <div className={`font-black text-[13px] flex items-center gap-1.5 mb-1 ${form.checkinMode === 'parent' ? 'text-pink-600' : 'text-slate-600'}`}><Icons.User size={14} /> 家长手动</div>
                                            <div className="text-[10px] font-bold text-slate-500 leading-relaxed">在此页面操作打卡</div>
                                        </button>
                                        <button type="button" onClick={() => setForm(f => ({ ...f, checkinMode: 'kid' }))} className={`p-3 rounded-2xl border-2 transition-all text-left ${form.checkinMode === 'kid' ? 'border-indigo-300 bg-indigo-50 shadow-sm scale-[1.02]' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'}`}>
                                            <div className={`font-black text-[13px] flex items-center gap-1.5 mb-1 ${form.checkinMode === 'kid' ? 'text-indigo-600' : 'text-slate-600'}`}><Icons.Target size={14} /> 孩子任务联动</div>
                                            <div className="text-[10px] font-bold text-slate-500 leading-relaxed">创建任务，由孩子打卡</div>
                                        </button>
                                    </div>
                            </div>

                            {/* 备注 */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">备注信息</label>
                                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="选填..." className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-300 focus:bg-white p-4 rounded-2xl font-medium text-[13px] text-slate-700 outline-none transition-all placeholder:text-slate-300 resize-none"></textarea>
                            </div>
                        </div>

                        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                            <button onClick={handleSave} className="w-full bg-slate-900 text-white py-4 rounded-[1.25rem] font-black text-[15px] hover:bg-black transition-colors shadow-xl shadow-slate-200 active:scale-[0.98]">
                                {editingClass ? '保存修改信息' : '创建记录'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* 打卡确认弹窗 */}
            {checkinConfirmClass && createPortal(
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fade-in">
                    <div className="bg-white rounded-[2rem] w-full max-w-xs md:max-w-sm overflow-hidden shadow-2xl animate-pop-in border border-white/20">
                        <div className="p-8 text-center bg-gradient-to-b from-pink-50/50 to-white">
                            <div className="w-20 h-20 bg-white shadow-xl shadow-pink-100 text-pink-500 rounded-[1.5rem] flex items-center justify-center mx-auto mb-5 rotate-3 border border-pink-50"><Icons.CheckCircle size={36} /></div>
                            <h3 className="text-xl font-black text-slate-800 mb-2">{checkinConfirmClass.name}</h3>
                            <p className="text-sm font-bold text-slate-500 mt-2">
                                {checkinConfirmClass.classMode === 'tutor'
                                    ? <>确定记录上课？将累加 <span className="text-pink-500 font-black text-lg">{checkinConfirmClass.sessionsPerClass}</span> 节</>
                                    : <>确定要打卡吗？将扣除 <span className="text-pink-500 font-black text-lg">{checkinConfirmClass.sessionsPerClass}</span> 节课时</>
                                }
                            </p>
                        </div>
                        <div className="flex border-t border-slate-100 bg-slate-50/50">
                            <button onClick={() => setCheckinConfirmClass(null)} className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-100 transition-colors">取消</button>
                            <div className="w-px bg-slate-200 my-4"></div>
                            <button onClick={confirmCheckin} className="flex-1 py-4 font-black text-pink-500 hover:bg-pink-50 transition-colors">确认</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* 删除确认弹窗 */}
            {deleteConfirmClass && createPortal(
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fade-in">
                    <div className="bg-white rounded-[2rem] w-full max-w-xs md:max-w-sm overflow-hidden shadow-2xl animate-pop-in border border-white/20">
                        <div className="p-8 text-center bg-gradient-to-b from-red-50/50 to-white">
                            <div className="w-20 h-20 bg-white shadow-xl shadow-red-100 text-red-500 rounded-[1.5rem] flex items-center justify-center mx-auto mb-5 -rotate-3 border border-red-50"><Icons.Trash2 size={36} /></div>
                            <h3 className="text-xl font-black text-slate-800 mb-2">删除记录</h3>
                            <p className="text-sm font-bold text-slate-500 mt-2">确定要删除「{deleteConfirmClass.name}」吗？<br/><span className="text-red-400">此操作不可恢复</span></p>
                        </div>
                        <div className="flex border-t border-slate-100 bg-slate-50/50">
                            <button onClick={() => setDeleteConfirmClass(null)} className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-100 transition-colors">取消</button>
                            <div className="w-px bg-slate-200 my-4"></div>
                            <button onClick={confirmDelete} className="flex-1 py-4 font-black text-red-500 hover:bg-red-50 transition-colors">确认删除</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* 请假确认弹窗 */}
            {skipConfirmClass && createPortal(
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fade-in">
                    <div className="bg-white rounded-[2rem] w-full max-w-xs md:max-w-sm overflow-hidden shadow-2xl animate-pop-in border border-white/20">
                        <div className="p-8 text-center bg-gradient-to-b from-amber-50/50 to-white">
                            <div className="w-20 h-20 bg-white shadow-xl shadow-amber-100 text-amber-500 rounded-[1.5rem] flex items-center justify-center mx-auto mb-5 border border-amber-50"><Icons.Clock size={36} /></div>
                            <h3 className="text-xl font-black text-slate-800 mb-2">请假 / 调课</h3>
                            <p className="text-sm font-bold text-slate-500 mt-2">将「{skipConfirmClass.name}」今日标记为<span className="text-amber-500 font-black">请假</span>？<br/><span className="text-[11px] text-slate-400">不会扣除课时</span></p>
                        </div>
                        <div className="flex border-t border-slate-100 bg-slate-50/50">
                            <button onClick={() => setSkipConfirmClass(null)} className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-100 transition-colors">取消</button>
                            <div className="w-px bg-slate-200 my-4"></div>
                            <button onClick={confirmSkip} className="flex-1 py-4 font-black text-amber-500 hover:bg-amber-50 transition-colors">确认请假</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
