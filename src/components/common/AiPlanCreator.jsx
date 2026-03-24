import React, { useState } from 'react';
import { Icons } from '../../utils/Icons';
import { apiFetch } from '../../api/client';

/**
 * AI Plan Creator — overlay modal for AI-powered homework-to-task conversion
 * Called from ParentApp's plan creation flow
 */
const AiPlanCreator = ({ isOpen, onClose, kids, planForm, setPlanForm, setTasks, notify, setShowAddPlanModal }) => {
    const [mode, setMode] = useState('input'); // 'input' | 'loading' | 'preview'
    const [textInput, setTextInput] = useState('');
    const [imageData, setImageData] = useState(null);
    const [parsedTasks, setParsedTasks] = useState([]);
    const [refineInput, setRefineInput] = useState('');
    const [isRefining, setIsRefining] = useState(false);

    if (!isOpen) return null;

    const handleReset = () => {
        setMode('input');
        setTextInput('');
        setImageData(null);
        setParsedTasks([]);
        setRefineInput('');
        setIsRefining(false);
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    const handleParse = async () => {
        if (!textInput && !imageData) { notify('请输入作业内容或上传图片', 'error'); return; }
        setMode('loading');
        try {
            const res = await apiFetch('/api/ai/parse-homework', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textInput || undefined, image: imageData || undefined })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'AI 解析失败');
            if (data.mock) notify('演示模式：使用模拟数据（未配置 AI API Key）', 'info');
            setParsedTasks(data.tasks.map((t, i) => ({ ...t, _id: `ai_${Date.now()}_${i}` })));
            setMode('preview');
        } catch (err) {
            notify(err.message || 'AI 解析失败，请重试', 'error');
            setMode('input');
        }
    };

    const handleRefine = async () => {
        if (!refineInput.trim()) return;
        setIsRefining(true);
        try {
            const res = await apiFetch('/api/ai/parse-homework', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentTasks: parsedTasks, refineInstruction: refineInput.trim() })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'AI 调整失败');
            setParsedTasks(data.tasks.map((t, i) => ({ ...t, _id: `ai_${Date.now()}_${i}` })));
            setRefineInput('');
            notify('已根据你的要求调整', 'success');
        } catch (err) {
            notify(err.message || 'AI 调整失败', 'error');
        }
        setIsRefining(false);
    };

    const getCategoryGradient = (cat) => {
        const map = {
            '语文': 'from-red-400 to-red-500', '数学': 'from-blue-400 to-blue-500',
            '英语': 'from-green-400 to-green-500', '科学': 'from-purple-400 to-purple-500',
            '编程': 'from-cyan-400 to-cyan-500', '阅读': 'from-amber-400 to-amber-500',
            '写作': 'from-pink-400 to-pink-500', '音乐': 'from-violet-400 to-violet-500',
            '美术': 'from-rose-400 to-rose-500', '体育': 'from-teal-400 to-teal-500'
        };
        return map[cat] || 'from-orange-400 to-orange-500';
    };

    const handleBatchCreate = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const targetKids = planForm.targetKids || ['all'];
            const allNewTasks = [];
            // Get max existing order to place new tasks at end
            let nextOrder;
            setTasks(prev => {
                nextOrder = prev.reduce((max, t) => Math.max(max, t.order ?? 0), 0) + 1;
                return prev; // don't change state yet
            });

            for (const task of parsedTasks) {
                // Determine schedule from AI output
                const schedule = task.schedule || 'today';
                let frequency = '仅当天';
                let repeatConfig = { type: 'today' };
                let dates = [today];
                let weeklyDays = task.weeklyDays || [1, 2, 3, 4, 5];

                if (schedule === 'daily') {
                    frequency = '每天';
                    repeatConfig = { type: 'daily' };
                    dates = undefined; // daily tasks don't use dates array
                } else if (schedule === 'weekly') {
                    const dayNames = ['', '一', '二', '三', '四', '五', '六', '日'];
                    const dayLabels = weeklyDays.sort().map(d => '周' + dayNames[d]).join('、');
                    frequency = `每${dayLabels}`;
                    repeatConfig = { type: 'weekly_custom', weeklyDays };
                    dates = undefined;
                }

                const baseTask = {
                    id: `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                    order: nextOrder++,
                    title: task.title,
                    desc: task.desc || '',
                    reward: task.reward || 10,
                    type: 'study',
                    status: 'todo',
                    iconEmoji: task.iconEmoji || '📚',
                    standards: task.desc || '',
                    category: task.category || '技能',
                    catColor: getCategoryGradient(task.category),
                    frequency,
                    timeStr: task.durationPreset ? `${task.durationPreset}分钟` : '--:--',
                    startDate: today,
                    pointRule: 'default',
                    requireApproval: true,
                    ...(dates ? { dates } : {}),
                    repeatConfig,
                    history: {},
                    attachments: [],
                    timeSetting: task.durationPreset ? 'duration' : 'none',
                    durationPreset: task.durationPreset || 25,
                };

                if (targetKids.includes('all') || targetKids.length === kids.length) {
                    const newTask = { ...baseTask, kidId: 'all' };
                    await apiFetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newTask) });
                    allNewTasks.push(newTask);
                } else {
                    for (const kidId of targetKids) {
                        const newTask = { ...baseTask, id: `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, kidId };
                        // Note: For multi-kid specific tasks created from AI, they'll share same order value 
                        // which is fine since they are different kids' lists. 
                        await apiFetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newTask) });
                        allNewTasks.push(newTask);
                    }
                }
            }

            setTasks(prev => [...prev, ...allNewTasks]);
            notify(`成功创建了 ${parsedTasks.length} 条学习任务！`, 'success');
            handleClose();
            if (setShowAddPlanModal) setShowAddPlanModal(false);
        } catch (err) {
            notify('创建任务失败，请重试', 'error');
        }
    };

    return (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-0 md:p-6 animate-fade-in"
            style={{ background: 'rgba(27,46,75,0.45)', backdropFilter: 'blur(8px)' }}
            onClick={handleClose}>
            <div className="w-full h-full md:h-auto md:max-h-[85vh] md:max-w-lg flex flex-col md:rounded-3xl overflow-hidden animate-bounce-in"
                style={{ background: '#FBF7F0' }}
                onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="shrink-0 px-5 py-4 flex items-center justify-between"
                    style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl backdrop-blur-sm">✨</div>
                        <div>
                            <h2 className="font-black text-base text-white">AI 智能任务</h2>
                            <div className="text-[11px] font-bold mt-0.5 text-white/70">上传作业截图或输入文字，AI 自动创建任务</div>
                        </div>
                    </div>
                    <button onClick={handleClose}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 bg-white/20 text-white">
                        <Icons.X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">

                    {/* ── INPUT MODE ── */}
                    {mode === 'input' && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1.5px solid #F0EBE1' }}>
                                <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: '#9CAABE' }}>
                                    作业内容
                                </label>
                                <textarea
                                    value={textInput}
                                    onChange={e => setTextInput(e.target.value)}
                                    placeholder={"粘贴或输入老师布置的作业内容...\n\n例如：\n1. 语文：抄写词语3遍\n2. 数学：课本P45-P46练习题\n3. 英语：背诵Unit 2单词"}
                                    className="w-full rounded-xl px-4 py-3 outline-none font-bold text-sm transition-all resize-none"
                                    style={{ background: '#FBF7F0', border: '1.5px solid #F0EBE1', color: '#1B2E4B', minHeight: '140px' }}
                                    onFocus={e => e.target.style.borderColor = '#667eea'}
                                    onBlur={e => e.target.style.borderColor = '#F0EBE1'}
                                />
                            </div>

                            {/* Image upload */}
                            <div className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1.5px solid #F0EBE1' }}>
                                <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: '#9CAABE' }}>
                                    上传作业图片（可选）
                                </label>
                                <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-all active:scale-95 text-xs font-bold"
                                        style={{ background: '#F0EBE1', color: '#6B7A8D' }}>
                                        <Icons.Camera size={14} />
                                        选择图片
                                        <input type="file" accept="image/*" className="hidden"
                                            onChange={e => {
                                                const file = e.target.files[0];
                                                if (!file) return;
                                                // Compress image before sending to AI (save tokens!)
                                                const img = new Image();
                                                img.onload = () => {
                                                    const MAX_W = 800;
                                                    const scale = img.width > MAX_W ? MAX_W / img.width : 1;
                                                    const canvas = document.createElement('canvas');
                                                    canvas.width = img.width * scale;
                                                    canvas.height = img.height * scale;
                                                    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                                                    setImageData(canvas.toDataURL('image/jpeg', 0.6));
                                                    URL.revokeObjectURL(img.src);
                                                };
                                                img.src = URL.createObjectURL(file);
                                            }} />
                                    </label>
                                    {imageData && (
                                        <div className="relative">
                                            <img src={imageData} alt="作业" className="w-14 h-14 rounded-xl object-cover border-2 border-green-300" />
                                            <button onClick={() => setImageData(null)}
                                                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-400 text-white flex items-center justify-center text-[10px]">
                                                ✕
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── LOADING MODE ── */}
                    {mode === 'loading' && (
                        <div className="flex flex-col items-center justify-center py-20 space-y-5 animate-fade-in">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl animate-bounce"
                                    style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 8px 25px rgba(102,126,234,0.3)' }}>
                                    🤖
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-400 flex items-center justify-center animate-pulse">
                                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="font-black text-base" style={{ color: '#1B2E4B' }}>AI 正在分析作业内容...</div>
                                <div className="text-[11px] font-bold mt-1.5" style={{ color: '#9CAABE' }}>正在拆解为具体学习任务</div>
                            </div>
                            <div className="flex gap-1.5">
                                {[0, 1, 2].map(i => (
                                    <div key={i} className="w-2.5 h-2.5 rounded-full animate-pulse"
                                        style={{ background: '#667eea', animationDelay: `${i * 0.3}s` }} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── PREVIEW MODE ── */}
                    {mode === 'preview' && (
                        <div className="space-y-3 animate-fade-in">
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-black" style={{ color: '#1B2E4B' }}>
                                    AI 解析出 <span style={{ color: '#667eea' }}>{parsedTasks.length}</span> 条任务
                                </div>
                                <button onClick={() => setMode('input')}
                                    className="text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all active:scale-95"
                                    style={{ background: '#F0EBE1', color: '#9CAABE' }}>
                                    🔄 重新解析
                                </button>
                            </div>

                            {/* Target kids selector (hidden when only one kid) */}
                            {kids.length > 1 && (
                            <div className="rounded-2xl p-3" style={{ background: '#FFFFFF', border: '1px solid #F0EBE1' }}>
                                <label className="text-[10px] font-bold uppercase tracking-wider mb-2 block" style={{ color: '#9CAABE' }}>分配给</label>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => setPlanForm({ ...planForm, targetKids: ['all'] })}
                                        className="text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all active:scale-95"
                                        style={(!planForm.targetKids || planForm.targetKids.includes('all'))
                                            ? { background: '#667eea', color: '#fff' }
                                            : { background: '#F0EBE1', color: '#6B7A8D' }}>
                                        全部孩子
                                    </button>
                                    {kids.map(k => {
                                        const sel = planForm.targetKids && !planForm.targetKids.includes('all') && planForm.targetKids.includes(k.id);
                                        return (
                                            <button key={k.id}
                                                onClick={() => {
                                                    let nt = (!planForm.targetKids || planForm.targetKids.includes('all')) ? [] : [...planForm.targetKids];
                                                    if (nt.includes(k.id)) nt = nt.filter(id => id !== k.id);
                                                    else nt.push(k.id);
                                                    if (nt.length === 0) nt = ['all'];
                                                    setPlanForm({ ...planForm, targetKids: nt });
                                                }}
                                                className="text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all active:scale-95"
                                                style={sel ? { background: '#667eea', color: '#fff' } : { background: '#F0EBE1', color: '#6B7A8D' }}>
                                                {k.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            )}

                            {/* Task cards */}
                            {parsedTasks.map((task, idx) => (
                                <div key={task._id} className="rounded-2xl p-4 transition-all"
                                    style={{ background: '#FFFFFF', border: '1.5px solid #F0EBE1' }}>
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                                            style={{ background: '#667eea12' }}>
                                            {task.iconEmoji || '📚'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <input
                                                value={task.title}
                                                onChange={e => {
                                                    const updated = [...parsedTasks];
                                                    updated[idx] = { ...updated[idx], title: e.target.value };
                                                    setParsedTasks(updated);
                                                }}
                                                className="w-full font-black text-sm outline-none bg-transparent"
                                                style={{ color: '#1B2E4B' }}
                                            />
                                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                                                    style={{ background: '#667eea12', color: '#667eea' }}>
                                                    {task.category}
                                                </span>
                                                <span className="text-[9px] font-bold" style={{ color: '#9CAABE' }}>
                                                    ⏱ {task.durationPreset}分钟
                                                </span>
                                                <span className="text-[9px] font-bold" style={{ color: '#FF8C42' }}>
                                                    ⭐ {task.reward}分
                                                </span>
                                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{
                                                    background: task.schedule === 'daily' ? '#DBEAFE' : task.schedule === 'weekly' ? '#E0E7FF' : '#F0EBE1',
                                                    color: task.schedule === 'daily' ? '#2563EB' : task.schedule === 'weekly' ? '#4F46E5' : '#9CAABE'
                                                }}>
                                                    {task.schedule === 'daily' ? '🔄 每天' : task.schedule === 'weekly' ? `📆 每周${(task.weeklyDays || []).map(d => ['','一','二','三','四','五','六','日'][d]).join('、')}` : '📅 仅今天'}
                                                </span>
                                            </div>
                                            {task.desc && (
                                                <div className="text-[10px] font-bold mt-1.5 leading-relaxed" style={{ color: '#9CAABE' }}>
                                                    {task.desc}
                                                </div>
                                            )}
                                        </div>
                                        <button onClick={() => setParsedTasks(parsedTasks.filter((_, i) => i !== idx))}
                                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all active:scale-90"
                                            style={{ background: '#FEE2E2', color: '#EF4444' }}>
                                            <Icons.Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {parsedTasks.length === 0 && (
                                <div className="text-center py-10">
                                    <div className="text-4xl mb-3">🤔</div>
                                    <div className="text-xs font-bold" style={{ color: '#9CAABE' }}>所有任务已删除，请重新解析</div>
                                </div>
                            )}

                            {/* Refinement Input */}
                            {parsedTasks.length > 0 && (
                                <div className="rounded-2xl p-3" style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}>
                                    <div className="text-[10px] font-bold mb-2 flex items-center gap-1" style={{ color: '#9CAABE' }}>
                                        💬 告诉 AI 如何调整
                                    </div>
                                    <div className="flex gap-2 mb-2 flex-wrap">
                                        {['合并成1个任务', '拆分更细', '减少奖励分数', '增加任务时长'].map(s => (
                                            <button key={s} onClick={() => setRefineInput(s)}
                                                className="text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all active:scale-95"
                                                style={{ background: '#F0EBE1', color: '#6B7A8D' }}>
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            value={refineInput}
                                            onChange={e => setRefineInput(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && !isRefining && handleRefine()}
                                            placeholder="例如：合并成1个任务 / 只保留语文和数学"
                                            className="flex-1 rounded-xl px-3 py-2.5 text-xs font-bold outline-none"
                                            style={{ background: '#F9F5EE', border: '1px solid #E8E0D4', color: '#1B2E4B' }}
                                        />
                                        <button onClick={handleRefine}
                                            disabled={!refineInput.trim() || isRefining}
                                            className="px-4 py-2.5 rounded-xl font-black text-xs text-white transition-all active:scale-95 disabled:opacity-40 shrink-0"
                                            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                            {isRefining ? '⏳' : '✨ 调整'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="shrink-0 px-5 py-4 flex gap-3"
                    style={{ background: '#FFFFFF', borderTop: '1px solid #F0EBE1', paddingBottom: 'max(1rem, env(safe-area-inset-bottom) + 0.5rem)' }}>
                    {mode === 'input' && (
                        <>
                            <button onClick={handleClose}
                                className="flex-1 py-3 rounded-xl font-black text-sm transition-all active:scale-95"
                                style={{ background: '#F0EBE1', color: '#5A6E8A' }}>
                                取消
                            </button>
                            <button onClick={handleParse}
                                disabled={!textInput && !imageData}
                                className="flex-[2] py-3 rounded-xl font-black text-sm text-white transition-all active:scale-95 disabled:opacity-40"
                                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 4px 15px rgba(102,126,234,0.3)' }}>
                                🤖 开始 AI 解析
                            </button>
                        </>
                    )}
                    {mode === 'preview' && parsedTasks.length > 0 && (
                        <>
                            <button onClick={() => setMode('input')}
                                className="flex-1 py-3 rounded-xl font-black text-sm transition-all active:scale-95"
                                style={{ background: '#F0EBE1', color: '#5A6E8A' }}>
                                返回
                            </button>
                            <button onClick={handleBatchCreate}
                                className="flex-[2] py-3 rounded-xl font-black text-sm text-white transition-all active:scale-95"
                                style={{ background: 'linear-gradient(135deg, #FF8C42 0%, #FF6B35 100%)', boxShadow: '0 4px 15px rgba(255,140,66,0.3)' }}>
                                ✅ 一键创建 {parsedTasks.length} 条计划
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AiPlanCreator;
