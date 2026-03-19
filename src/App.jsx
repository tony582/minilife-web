import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icons } from './utils/Icons';
import { apiFetch } from './api/client';
import { useToast } from './hooks/useToast';
import { AuthProvider, useAuthContext } from './context/AuthContext.jsx';
import { DataProvider, useDataContext } from './context/DataContext.jsx';
import { UIProvider, useUIContext } from './context/UIContext.jsx';

import { KidApp } from './pages/Kid/KidApp';
import { ParentApp } from './pages/Parent/ParentApp';
import { ParentPinPage } from './pages/Auth/ParentPinPage';
import { ProfileSelectionPage } from './pages/Auth/ProfileSelectionPage';
import { AuthPage } from './pages/Auth/AuthPage';
import { ExpiredPage } from './pages/Auth/ExpiredPage';
import { AdminPage } from './pages/Admin/AdminPage';
import { GlobalModals } from './components/common/GlobalModals';

function AppContent() {
  const { token, user, authLoading } = useAuthContext();
  const { kids, setKids, transactions, setTransactions, isLoading } = useDataContext();
  const { appState, kidTab, setKidTab, parentTab, setParentTab } = useUIContext();
  const { notifications, notify, setNotifications } = useToast();

  // --- 每日利息计算 (时光金库) ---
  useEffect(() => {
    if (!kids.length) return;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    let needsUpdate = false;
    const promises = [];
    const newKids = [...kids];
    const newTransactions = [...transactions];

    newKids.forEach((kid) => {
      if (!kid.vault) kid.vault = { lockedAmount: 0, lastInterestDate: null, totalInterest: 0 };
      if (kid.vault.lockedAmount > 0 && kid.vault.lastInterestDate !== todayStr) {
        const dailyInterest = Math.max(1, Math.floor(kid.vault.lockedAmount * 0.01));
        kid.vault.lockedAmount += dailyInterest;
        kid.vault.totalInterest = (kid.vault.totalInterest || 0) + dailyInterest;
        kid.vault.lastInterestDate = todayStr;
        needsUpdate = true;
        const interestTx = {
          id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          kidId: kid.id, type: 'income', amount: dailyInterest, category: 'interest',
          title: `✨ 时光金库自动生息 (+${dailyInterest}币)`, date: now.toISOString()
        };
        newTransactions.push(interestTx);
        promises.push(apiFetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(interestTx) }));
        promises.push(apiFetch(`/api/kids/${kid.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vault: kid.vault }) }));
      }
    });

    if (needsUpdate) {
      setKids(newKids);
      setTransactions(newTransactions);
      Promise.all(promises).then(() => {
        if (appState === 'kid_app') {
          notify('✨ 时光金库产生了新的利息收益！', 'success');
        }
      }).catch(console.error);
    }
  }, [appState, kids.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- 移动端底部导航 ---
  const renderMobileNavigationBar = () => {
    if (appState !== 'kid_app' && appState !== 'parent_app') return null;
    const isParent = appState === 'parent_app';

    const mobileTabs = isParent
      ? [
          { id: 'tasks', label: '任务', icon: Icons.Target },
          { id: 'plans', label: '习惯', icon: Icons.CheckSquare },
          { id: 'wealth', label: '财富', icon: Icons.Wallet },
          { id: 'shop_manage', label: '超市', icon: Icons.ShoppingBag },
          { id: 'more', label: '更多', icon: Icons.LayoutGrid },
        ]
      : [
          { id: 'study', label: '任务', icon: Icons.BookOpen },
          { id: 'habit', label: '习惯', icon: Icons.ShieldCheck },
          { id: 'wealth', label: '财富', icon: Icons.Wallet },
          { id: 'shop', label: '超市', icon: Icons.ShoppingBag },
          { id: 'profile', label: '我的', icon: Icons.User },
        ];

    return createPortal(
      <nav
        className="fixed bottom-0 left-0 right-0 w-full flex justify-around items-end px-3 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.4rem)] z-[9999] md:hidden"
        style={{
          position: 'fixed', bottom: 0, isolation: 'isolate', transform: 'none',
          background: 'rgba(255,253,248,0.88)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderTop: '1px solid rgba(240,235,225,0.8)',
          boxShadow: '0 -8px 32px rgba(27,46,75,0.06)',
        }}
      >
        {mobileTabs.map((tab) => {
          const isActive = isParent ? parentTab === tab.id : kidTab === tab.id;
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => (isParent ? setParentTab(tab.id) : setKidTab(tab.id))}
              className="flex flex-col items-center justify-center py-1 gap-0.5 transition-all duration-200"
              style={{ flex: 1, WebkitTapHighlightColor: 'transparent' }}
            >
              <div
                className="relative flex items-center justify-center transition-all duration-300"
                style={isActive ? {
                  width: 48, height: 30, borderRadius: 20,
                  background: 'linear-gradient(135deg, #FF8C42, #FFB347)',
                  boxShadow: '0 4px 12px rgba(255,140,66,0.35)',
                  transform: 'translateY(-2px)',
                } : {
                  width: 48, height: 30, borderRadius: 20,
                }}
              >
                <TabIcon size={19} strokeWidth={2.5} style={{ color: isActive ? '#fff' : '#9CAABE' }} />
              </div>
              <span
                className="font-black transition-all duration-200"
                style={{
                  fontSize: 10, letterSpacing: '0.02em',
                  color: isActive ? '#FF8C42' : '#9CAABE',
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>,
      document.body
    );
  };

  // === 主返回 ===
  if (isLoading || authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-bold text-xl">加载中...</div>;
  }

  if (!token) {
    return <AuthPage />;
  }

  if (user && new Date(user.sub_end_date) < new Date() && user.role !== 'admin') {
    return <ExpiredPage />;
  }

  if (user?.role === 'admin') {
    return <AdminPage />;
  }

  return (
    <div className="font-sans selection:bg-indigo-100">
      {appState === 'profiles' && <ProfileSelectionPage />}
      {appState === 'parent_pin' && <ParentPinPage />}
      {appState === 'kid_app' && <KidApp />}
      {appState === 'parent_app' && <ParentApp />}

      {renderMobileNavigationBar()}

      {/* Toast 通知 */}
      <div className="fixed top-24 right-6 z-[200] space-y-3 pointer-events-none">
        {notifications.map((n) => (
          <div key={n.id} className={`px-6 py-4 rounded-2xl shadow-xl animate-bounce-in text-white text-sm font-bold flex items-center justify-between gap-4 pointer-events-auto ${n.type === 'error' ? 'bg-rose-500' : n.type === 'info' ? 'bg-slate-800' : 'bg-emerald-500'}`}>
            <div className="flex items-center gap-2">
              <Icons.Bell size={18} /> {n.msg}
            </div>
            <button onClick={() => setNotifications((p) => p.filter((x) => x.id !== n.id))} className="opacity-70 hover:opacity-100 transition-opacity flex-shrink-0">
              <Icons.X size={16} />
            </button>
          </div>
        ))}
      </div>

      <GlobalModals />

      {/* 全局动画样式 */}
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
        `
      }} />
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
    </AuthProvider>
  );
}