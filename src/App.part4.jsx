const renderParentApp = () => (
    <div className="min-h-screen bg-[#f4f7f9] font-sans pb-24 text-left animate-fade-in">
        <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center sticky top-0 z-20">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white"><Icons.Award size={24} /></div>
                <span className="font-black text-xl text-white tracking-tight">家长总控后台</span>
            </div>
            <button onClick={() => setAppState('profiles')} className="text-sm font-bold text-slate-400 bg-slate-800 px-4 py-2 rounded-full hover:text-white transition-colors flex items-center gap-1">
                <Icons.LogOut size={16} /> 退出管理
            </button>
        </div>

        <div className="max-w-5xl mx-auto p-4 md:p-8">
            <div className="flex gap-4 border-b border-slate-200 mb-8 overflow-x-auto hide-scrollbar">
                <button onClick={() => setParentTab('tasks')} className={`pb-3 px-2 font-black text-sm whitespace-nowrap transition-all border-b-4 ${parentTab === 'tasks' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>任务审批大厅</button>
                <button onClick={() => setParentTab('plans')} className={`pb-3 px-2 font-black text-sm whitespace-nowrap transition-all border-b-4 ${parentTab === 'plans' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>计划与习惯管理</button>
                <button onClick={() => setParentTab('shop_manage')} className={`pb-3 px-2 font-black text-sm whitespace-nowrap transition-all border-b-4 ${parentTab === 'shop_manage' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>愿望超市配置</button>
                <button onClick={() => setParentTab('settings')} className={`pb-3 px-2 font-black text-sm whitespace-nowrap transition-all border-b-4 ${parentTab === 'settings' ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>家庭与安全设置</button>
            </div>

            {parentTab === 'tasks' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                    <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                        <h2 className="p-6 font-black text-slate-800 border-b border-slate-100 flex justify-between bg-slate-50/50 items-center">
                            待审核验收单 <span className="text-white bg-orange-500 px-3 py-1 rounded-full text-xs shadow-sm">{tasks.filter(t => t.status === 'pending_approval').length} 项待办</span>
                        </h2>
                        <ul className="divide-y divide-slate-100">
                            {tasks.filter(t => t.status === 'pending_approval').map(t => {
                                const kidInfo = kids.find(k => k.id === t.kidId);
                                return (
                                    <li key={t.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:bg-slate-50 transition-colors">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded border border-indigo-100">{kidInfo?.name} 提交了验收</span>
                                            </div>
                                            <div className="font-black text-slate-800 text-lg flex items-center gap-2">
                                                {t.type === 'study' ? <Icons.BookOpen size={18} className="text-blue-500" /> : <Icons.ShieldCheck size={18} className="text-yellow-500" />}
                                                {t.title}
                                            </div>
                                            <div className="text-sm text-slate-500 mt-2 bg-white p-3 rounded-xl border border-slate-200">
                                                <span className="font-bold">当时设定的标准：</span>{t.standards}
                                            </div>
                                        </div>
                                        <div className="flex flex-col md:items-end gap-3 shrink-0">
                                            <span className="font-black text-indigo-600 text-lg">{t.reward > 0 ? '+' : ''}{t.reward} {t.type === 'study' ? '币' : 'EXP'}</span>
                                            <button onClick={() => handleApproveTask(t)} className="w-full md:w-auto px-6 py-3 bg-emerald-500 text-white rounded-xl text-sm font-black shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-transform hover:scale-105">验收通过并发放</button>
                                        </div>
                                    </li>
                                )
                            })}
                            {tasks.filter(t => t.status === 'pending_approval').length === 0 && <div className="p-16 text-center text-slate-400 font-bold bg-slate-50">太棒了，目前没有积压的验收申请。</div>}
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6">
                            <h2 className="font-black text-slate-800 mb-6 flex items-center gap-2"><Icons.TrendingUp className="text-indigo-500" size={20} /> 孩子财务监控盘</h2>
                            {kids.map(k => (
                                <div key={k.id} className="mb-4 last:mb-0 border-b border-slate-50 pb-4 last:pb-0 last:border-0">
                                    <div className="flex items-center gap-2 font-bold text-slate-700 mb-3"><span className="text-2xl">{k.avatar}</span> {k.name} <span className="text-xs font-normal text-slate-400">Lv.{k.level}</span></div>
                                    <div className="space-y-2 text-sm pl-10">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500">活期钱包</span>
                                            <span className="font-black text-indigo-600">{k.balances.spend} 币</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500 flex items-center gap-1"><Icons.Lock size={12} /> 时光金库锁定</span>
                                            <span className="font-black text-emerald-600">{k.vault.lockedAmount} 币</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {parentTab === 'plans' && (
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden animate-fade-in">
                    <div className="p-6 border-b border-slate-100 bg-blue-50/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="font-black text-slate-800 text-xl">管理学习计划与习惯</h2>
                            <p className="text-sm text-slate-500 mt-1">设置正向任务或惩罚规则，引导孩子成长</p>
                        </div>
                        <button onClick={() => setShowAddPlanModal(true)} className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700">
                            <Icons.Plus size={18} /> 新建计划 / 习惯
                        </button>
                    </div>

                    <div className="p-6">
                        <h3 className="font-bold text-slate-800 mb-4 text-lg">当前生效的任务规则</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {tasks.map(t => {
                                const kName = kids.find(k => k.id === t.kidId)?.name || '未知';
                                return (
                                    <div key={t.id} className="p-4 border border-slate-100 rounded-2xl flex flex-col justify-between hover:shadow-md transition-shadow">
                                        <div className="flex items-start gap-3 mb-4">
                                            <div className="text-3xl bg-slate-50 rounded-xl p-2">{t.iconEmoji || (t.type === 'study' ? '📚' : '🛡️')}</div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-black text-slate-800">{t.title}</h4>
                                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{kName} 的任务</span>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.standards}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                                            <span className={`text-sm font-black ${t.reward < 0 ? 'text-red-500' : (t.type === 'study' ? 'text-blue-600' : 'text-yellow-600')}`}>
                                                {t.reward > 0 ? '+' : ''}{t.reward} {t.type === 'study' ? '币' : 'EXP'}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {t.reward < 0 && <button onClick={() => {
                                                    handleExpChange(t.kidId, t.reward);
                                                    notify(`已记录惩罚，扣除 ${kName} ${Math.abs(t.reward)} 经验值！`, "error");
                                                }} className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors">记录扣分</button>}
                                                <button className="text-slate-400 hover:text-red-500 p-2"><Icons.Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {parentTab === 'shop_manage' && (
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden animate-fade-in">
                    <div className="p-6 border-b border-slate-100 bg-purple-50/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="font-black text-slate-800 text-xl">愿望超市货架配置</h2>
                            <p className="text-sm text-slate-500 mt-1">设置吸引人的奖励，激发孩子的动力</p>
                        </div>
                        <button onClick={() => setShowAddItemModal(true)} className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-purple-200 hover:opacity-90">
                            <Icons.Plus size={18} /> 添加愿望商品
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm min-w-[600px]">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-wider w-20">图标</th>
                                    <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-wider">商品/愿望信息</th>
                                    <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-wider">兑换规则</th>
                                    <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-wider">定价</th>
                                    <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-wider text-right">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {inventory.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-3xl bg-slate-100 w-12 h-12 flex items-center justify-center rounded-xl">{item.iconEmoji}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-black text-slate-800 text-base">{item.name}</div>
                                            <div className="text-xs text-slate-400 mt-1 max-w-[200px] truncate">{item.desc}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold text-slate-600 bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-300">
                                                {item.type === 'single' ? '单次兑换' : item.type === 'multiple' ? '多次兑换' : '无限次'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-black text-base">{item.price} 币</span>
                                        </td>
                                        <td className="px-6 py-4 flex justify-end gap-2 mt-1">
                                            <button className="hover:text-indigo-600 bg-white shadow-sm border border-slate-200 p-2.5 rounded-xl transition-colors"><Icons.Settings size={18} /></button>
                                            <button className="hover:text-rose-500 bg-white shadow-sm border border-slate-200 p-2.5 rounded-xl transition-colors"><Icons.Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {parentTab === 'settings' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-700"><Icons.Lock size={20} /></div>
                            <h2 className="text-xl font-black text-slate-800">后台安全锁</h2>
                        </div>
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
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">修改 4 位密码 (默认1234)</label>
                                    <input type="text" maxLength={4} value={parentSettings.pinCode} onChange={e => setParentSettings(p => ({ ...p, pinCode: e.target.value.replace(/\D/g, '') }))} className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-xl font-mono text-xl tracking-[1em] outline-none focus:border-indigo-500" />
                                </div>
                            )}
                            <button onClick={() => notify("安全设置已保存", "success")} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-black">保存安全设置</button>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-700"><Icons.Users size={20} /></div>
                            <h2 className="text-xl font-black text-slate-800">孩子资料管理</h2>
                        </div>
                        <div className="space-y-4 mb-6">
                            {kids.map(k => (
                                <div key={k.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex gap-4 items-center">
                                    <div className="text-4xl">{k.avatar}</div>
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">名字</label>
                                        <input
                                            value={k.name}
                                            onChange={e => setKids(kids.map(kid => kid.id === k.id ? { ...kid, name: e.target.value } : kid))}
                                            className="w-full bg-white border border-slate-200 p-2 rounded-lg font-bold text-slate-800 outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => notify("资料已保存更新", "success")} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700">保存名字修改</button>
                    </div>
                </div>
            )}
        </div>
    </div>
);

// === 主返回 ===
return (
    <div className="font-sans selection:bg-indigo-100">
        {appState === 'profiles' && renderProfileSelection()}
        {appState === 'parent_pin' && renderParentPinScreen()}
        {appState === 'kid_app' && renderKidApp()}
        {appState === 'parent_app' && renderParentApp()}

        <div className="fixed top-24 right-6 z-[200] space-y-3 pointer-events-none">
            {notifications.map(n => (
                <div key={n.id} className={`px-6 py-4 rounded-2xl shadow-xl animate-bounce-in text-white text-sm font-bold flex items-center gap-2 pointer-events-auto ${n.type === 'error' ? 'bg-rose-500' : n.type === 'info' ? 'bg-slate-800' : 'bg-emerald-500'}`}>
                    <Icons.Bell size={18} /> {n.msg}
                </div>
            ))}
        </div>

        {renderTaskSubmitModal()}
        {renderVaultDepositModal()}
        {renderReviewModal()}
        {renderAddItemModal()}
        {renderAddPlanModal()}

        {showLevelRules && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl text-left relative">
                    <button onClick={() => setShowLevelRules(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><Icons.X size={20} /></button>
                    <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2"><Icons.Award className="text-yellow-500" size={24} /> 等级系统说明</h2>
                    <div className="space-y-4 text-sm text-slate-600 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <p><span className="font-bold text-slate-800">🚀 如何升级：</span><br />完成【习惯养成】区的任务即可获得经验值 (EXP)。经验存满自动升至下一级。</p>
                        <p><span className="font-bold text-slate-800">⚠️ 保级与降级警告：</span><br />如果有不良习惯（例如超时玩手机），家长会记录扣分。如果当前等级的 EXP 被扣至 0 以下，将会触发<span className="text-red-500 font-bold">降级惩罚</span>！</p>
                        <p><span className="font-bold text-slate-800">💎 等级特权：</span><br />等级越高，时光金库的利息加成越高，解锁的高级愿望也越多。</p>
                    </div>
                    <button onClick={() => setShowLevelRules(false)} className="w-full mt-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">我明白了，努力升级！</button>
                </div>
            </div>
        )}

        <style dangerouslySetInnerHTML={{
            __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes bounceIn { 0% { opacity: 0; transform: scale(0.9); } 60% { opacity: 1; transform: scale(1.05); } 100% { transform: scale(1); } }
        .animate-bounce-in { animation: bounceIn 0.3s forwards; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
);
}
