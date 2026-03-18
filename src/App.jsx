import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Icons, renderIcon, AvatarDisplay } from './utils/Icons';
import { isSameDay, formatDate, getDisplayDateArray, getWeekNumber, getDaysInMonth } from './utils/dateUtils';
import { defaultCategories, getCategoryColor, getCategoryGradient, getIconForCategory } from './utils/categoryUtils';
import { CelebrationModal } from './components/common/CelebrationModal';
import { getLevelTier } from './utils/levelUtils';
import { apiFetch, API_BASE } from './api/client';
import { useToast } from './hooks/useToast';
import { useAppState } from './hooks/useAppState';
import { AuthProvider, useAuthContext } from './context/AuthContext.jsx';
import { DataProvider, useDataContext } from './context/DataContext.jsx';
import { UIProvider, useUIContext } from './context/UIContext.jsx';
import { useTaskManager } from './hooks/useTaskManager';
import { useShopManager } from './hooks/useShopManager';
// === 钩子工具 ===
const useOnClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};
// Removed HTML5 Base64 Audio Engine to prevent iOS Safari from hijacking the Dynamic Island / Lock Screen media player.
let globalAudioCtx = null;
function AppContent() {
  const authC = useAuthContext();
  const dataC = useDataContext();
  const uiC = useUIContext();
  const {
    getWeeklyCompletionCount, checkPeriodLimits, handleAttemptSubmit, getTaskStatusOnDate,
    getTaskTimeSpent, handleStartTask, handleDeleteTask, confirmSubmitTask, openQuickComplete,
    handleQcQuickDuration, handleQcFileUpload, handleQuickComplete, handleExpChange, handleMarkHabitComplete,
    handleRejectTask, handleApproveTask, handleApproveAllTasks, handleSavePlan, playSuccessSound
  } = useTaskManager(authC, dataC, uiC);
    const {
        buyItem, confirmReceipt, submitReview, handleSaveNewItem, confirmTransfer
    } = useShopManager(authC, dataC, uiC);



  // === 全局状态 ===
  const { notifications, notify, setNotifications } = useToast();
  const { appState, changeAppState } = useAppState();
  const {
    token, setToken, user, setUser,
    authLoading, setAuthLoading,
    authMode, setAuthMode,
    authForm, setAuthForm,
    confirmPassword, setConfirmPassword,
    activationCode, setActivationCode,
    handleAuth, handleLogout
  } = useAuth(notify, changeAppState);
  const generateCodes = async (days) => {
    const res = await apiFetch('/api/admin/codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ duration_days: days, count: 5 })
    });
    const data = await res.json();
    if (res.ok) {
      notify(`成功生成 ${data.codes.length} 个兑换码`, 'success');
      apiFetch('/api/admin/codes').then((r) => r.json()).then(setAdminCodes).catch(console.error);
    } else {
      notify(data.error, 'error');
    }
  };
  const [activeKidId, setActiveKidId] = useState(localStorage.getItem('minilife_activeKidId') || 'kid_1');
  const [parentSettings, setParentSettings] = useState({ pinEnabled: false, pinCode: '1234' });
  const changeActiveKid = (newKidId) => {
    setActiveKidId(newKidId);
    if (newKidId) localStorage.setItem('minilife_activeKidId', newKidId);else
    localStorage.removeItem('minilife_activeKidId');
  };
  const {
    kids, setKids,
    tasks, setTasks,
    inventory, setInventory,
    orders, setOrders,
    transactions, setTransactions,
    isLoading, setIsLoading,
    adminTab, setAdminTab,
    adminUsers, setAdminUsers,
    adminCodes, setAdminCodes,
    usedCodes, setUsedCodes,
    settingsCode, setSettingsCode
  } = useAppData(token, setToken, user, setUser, setAuthLoading);
  // UI 控制状态
  const [kidTab, setKidTab] = useState('study');
  const [kidShopTab, setKidShopTab] = useState('browse');
  const [parentTab, setParentTab] = useState('tasks');
  const [parentKidFilter, setParentKidFilter] = useState('');
  useEffect(() => {
    if (kids.length > 0 && !parentKidFilter) {
      setParentKidFilter(kids[0].id);
    }
  }, [kids, parentKidFilter]);
  // 日期控制状态
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [monthViewDate, setMonthViewDate] = useState(new Date());
  // 任务列表控制
  // 任务列表控制 (Student)
  // Helper function to get weekly completion count


























  // === 额外约束检查: N次任务防刷限制 ===







































































































































  // === 全局方法 ===









































  const updateActiveKid = async (updates) => {
    try {
      await apiFetch(`/api/kids/${activeKidId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates)
      });
      setKids(kids.map((k) => k.id === activeKidId ? { ...k, ...updates } : k));
    } catch (e) {console.error(e);notify("网络请求失败", "error");}
  };
  const updateKidData = async (targetKidId, updates) => {
    try {
      await apiFetch(`/api/kids/${targetKidId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates)
      });
      setKids((prevKids) => prevKids.map((k) => k.id === targetKidId ? { ...k, ...updates } : k));
    } catch (e) {console.error(e);notify("网络请求失败", "error");}
  };
  const getLevelReq = (level) => level * 100;
































































































































  // 快速完成功能 























































































































































































































































































































































































































































































































  const getDefaultTimeRange = () => {
    if (!lastSavedEndTime) return { start: "17:00", end: "18:00" };
    const [h, m] = lastSavedEndTime.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return { start: "17:00", end: "18:00" };
    const endH = (h + 1) % 24;
    return {
      start: lastSavedEndTime,
      end: `${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
    };
  };
  // --- DAILY INTEREST CALCULATION (TIME VAULT) ---
  useEffect(() => {
    if (!kids.length) return;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    let needsUpdate = false;
    const promises = [];
    const newKids = [...kids];
    const newTransactions = [...transactions];
    newKids.forEach((kid, index) => {
      if (!kid.vault) kid.vault = { lockedAmount: 0, lastInterestDate: null, totalInterest: 0 };
      // Generate interest if the last interest date is not today, and vault has money
      if (kid.vault.lockedAmount > 0 && kid.vault.lastInterestDate !== todayStr) {
        // Calculate 1% daily interest, minimum 1 coin (because it's fun for kids)
        const dailyInterest = Math.max(1, Math.floor(kid.vault.lockedAmount * 0.01));
        kid.vault.lockedAmount += dailyInterest;
        kid.vault.totalInterest = (kid.vault.totalInterest || 0) + dailyInterest;
        kid.vault.lastInterestDate = todayStr;
        needsUpdate = true;
        // Log the interest as a transaction
        const interestTx = {
          id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          kidId: kid.id,
          type: 'income',
          amount: dailyInterest,
          category: 'interest',
          title: `✨ 时光金库自动生息 (+${dailyInterest}币)`,
          date: now.toISOString()
        };
        newTransactions.push(interestTx);
        promises.push(apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(interestTx) }));
        promises.push(apiFetch(`/api/kids/${kid.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vault: kid.vault })
        }));
      }
    });
    if (needsUpdate) {
      setKids(newKids);
      setTransactions(newTransactions);
      Promise.all(promises).then(() => {
        if (appState === 'kid_app') {
          notify("✨ 时光金库产生了新的利息收益！", "success");
        }
      }).catch(console.error);
    }
  }, [appState, kids.length]); // Check on load when kids data is present
























































































































































  const handlePinClick = (num) => {
    if (pinInput.length < 4) {
      const newPin = pinInput + num;
      setPinInput(newPin);
      if (newPin.length === 4) {
        if (newPin === parentSettings.pinCode) {
          setTimeout(() => {
            changeAppState('parent_app');
            setPinInput('');
            setShowParentPinModal(false);
          }, 200);
        } else {
          notify("密码错误", "error");
          setTimeout(() => setPinInput(''), 400);
        }
      }
    }
  };
  const openParentFromKid = () => {
    if (parentSettings.pinEnabled) {
      setPinInput('');
      setShowParentPinModal(true);
    } else {
      changeAppState('parent_app');
    }
  };
  const switchKid = (kidId) => {
    changeActiveKid(kidId);
    setShowKidSwitcher(false);
    setKidTab('study');
  };







































  // === 弹窗渲染函数 (彻底修复 ReferenceError) ===
  // --- Mobile Bottom Navigation Portal ---
  const renderMobileNavigationBar = () => {
    if (appState !== 'kid_app' && appState !== 'parent_app') return null;
    const isParent = appState === 'parent_app';
    const mobileTabs = isParent ? [
    { id: 'tasks', label: '学习任务', icon: <Icons.Target size={22} strokeWidth={2.5} /> },
    { id: 'plans', label: '习惯养成', icon: <Icons.CheckSquare size={22} strokeWidth={2.5} /> },
    { id: 'wealth', label: '财富中心', icon: <Icons.Landmark size={22} strokeWidth={2.5} /> },
    { id: 'shop_manage', label: '家庭超市', icon: <Icons.ShoppingBag size={22} strokeWidth={2.5} /> },
    { id: 'settings', label: '我的宝贝', icon: <Icons.User size={22} strokeWidth={2.5} /> }] :
    [
    { id: 'study', label: '学习任务', icon: <Icons.BookOpen size={22} strokeWidth={2.5} /> },
    { id: 'habit', label: '习惯养成', icon: <Icons.ShieldCheck size={22} strokeWidth={2.5} /> },
    { id: 'wealth', label: '财富中心', icon: <Icons.Wallet size={22} strokeWidth={2.5} /> },
    { id: 'shop', label: '家庭超市', icon: <Icons.ShoppingBag size={22} strokeWidth={2.5} /> },
    { id: 'profile', label: '我的', icon: <Icons.User size={22} strokeWidth={2.5} /> }];

    return createPortal(
      <nav className="fixed bottom-0 left-0 right-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-100 flex justify-around items-center px-2 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] z-[9999] md:hidden shadow-[0_-10px_20px_rgb(0,0,0,0.03)]" style={{ position: 'fixed', bottom: 0, isolation: 'isolate', transform: 'none' }}>
                {mobileTabs.map((tab) => {
          const isActive = isParent ? parentTab === tab.id : kidTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (isParent) {
                  setParentTab(tab.id);
                } else {
                  setKidTab(tab.id);
                }
              }}
              className={`flex flex-col items-center justify-center w-full py-1 gap-1 transition-all ${isActive ? 'text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}>
              
                            <div className={`relative flex items-center justify-center transition-all ${isActive ? 'bg-indigo-50 w-12 h-8 rounded-full' : 'h-8'}`}>
                                {tab.icon}
                            </div>
                            <span className={`text-[10px] font-black tracking-wider transition-all ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                                {tab.label}
                            </span>
                        </button>);

        })}
            </nav>,
      document.body
    );
  };
  // === 主返回 ===
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-bold text-xl">加载中...</div>;
  }
  

  return (
    
            <div className="font-sans selection:bg-indigo-100">
            {appState === 'profiles' && <ProfileSelectionPage />}
            {appState === 'parent_pin' && <ParentPinPage />}
            {appState === 'kid_app' && <KidApp />}
            {appState === 'parent_app' && <ParentApp />}
            {/* Mobile Bottom Navigation Rendered via Portal */}
            {renderMobileNavigationBar()}
            <div className="fixed top-24 right-6 z-[200] space-y-3 pointer-events-none">
                {notifications.map((n) =>
          <div key={n.id} className={`px-6 py-4 rounded-2xl shadow-xl animate-bounce-in text-white text-sm font-bold flex items-center justify-between gap-4 pointer-events-auto ${n.type === 'error' ? 'bg-rose-500' : n.type === 'info' ? 'bg-slate-800' : 'bg-emerald-500'}`}>
                        <div className="flex items-center gap-2">
                            <Icons.Bell size={18} /> {n.msg}
                        </div>
                        <button onClick={() => setNotifications((p) => p.filter((x) => x.id !== n.id))} className="opacity-70 hover:opacity-100 transition-opacity flex-shrink-0">
                            <Icons.X size={16} />
                        </button>
                    </div>
          )}
            </div>
            <GlobalModals />
            <style dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes simpleFade { from { opacity: 0; } to { opacity: 1; } }
        .animate-simple-fade { animation: simpleFade 0.2s ease-out forwards; }
        @keyframes bounceIn { 0% { opacity: 0; transform: scale(0.9); } 60% { opacity: 1; transform: scale(1.05); } 100% { transform: scale(1); } }
        .animate-bounce-in { animation: bounceIn 0.3s forwards; }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
        .animate-scale-up { animation: scaleUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes bounceCustom { 0%, 20%, 50%, 80%, 100% {transform: translateY(0);} 40% {transform: translateY(-20px);} 60% {transform: translateY(-10px);} }
        .animate-bounce-custom { animation: bounceCustom 1s ease infinite; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      ` }} />
            </div>
        );

}

export default function App() {
  return (
    <AuthProvider>
            <DataProvider>
                <UIProvider>
                    <AppContent />
                </UIProvider>
            </DataProvider>
        </AuthProvider>);

}