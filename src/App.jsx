import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
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
import { AdminPage } from './pages/Admin/AdminPage';
import { GlobalModals } from './components/common/GlobalModals';
import { SmartInstallBanner } from './components/common/SmartInstallBanner';
import { PaywallModal } from './components/common/PaywallModal';
import { ExpiredBanner } from './components/common/ExpiredBanner';
import { SplashScreen } from './components/common/SplashScreen';

function AppContent() {
  const { token, user, authLoading } = useAuthContext();
  const { kids, setKids, transactions, setTransactions, isLoading, notifications, notify, setNotifications } = useDataContext();
  const { appState, kidTab, setKidTab, parentTab, setParentTab, showTransactionHistoryModal, showAddItemModal, showShopConfirmModal, showReviewModal, showAddPlanModal, showAddKidModal, showSettingsModal, showLevelModal, qrModalValue, showTimerModal } = useUIContext();
  const location = useLocation();
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [petRoomOpen, setPetRoomOpen] = useState(false);

  // Listen for pet room open/close events
  useEffect(() => {
    const onOpen = () => setPetRoomOpen(true);
    const onClose = () => setPetRoomOpen(false);
    window.addEventListener('petroom:open', onOpen);
    window.addEventListener('petroom:close', onClose);
    return () => { window.removeEventListener('petroom:open', onOpen); window.removeEventListener('petroom:close', onClose); };
  }, []);

  const isExpired = user && user.role !== 'admin' && new Date(user.sub_end_date) < new Date();

  // Expose paywall globally so any component can trigger it
  useEffect(() => {
    window.__minilife_showPaywall = () => setPaywallVisible(true);
    window.__minilife_isExpired = () => isExpired;
    return () => { delete window.__minilife_showPaywall; delete window.__minilife_isExpired; };
  }, [isExpired]);



  // --- 移动端底部导航 ---
  const renderMobileNavigationBar = () => {
    if (appState !== 'kid_app' && appState !== 'parent_app') return null;
    // Hide bottom nav when any modal is open (it has z-[9999] which blocks modal buttons)
    if (petRoomOpen || showTransactionHistoryModal || showAddItemModal || showShopConfirmModal || showReviewModal || showAddPlanModal || showAddKidModal || showSettingsModal || showLevelModal || qrModalValue || showTimerModal) return null;
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
    return <SplashScreen />;
  }

  // Auth guard: not logged in → show login page
  if (!token) {
    return <AuthPage />;
  }

  // Admin user → show admin page
  if (user?.role === 'admin') {
    return <AdminPage />;
  }

  return (
    <div className="font-sans selection:bg-indigo-100">
      {/* Expired banner */}
      {isExpired && !petRoomOpen && <ExpiredBanner onRenew={() => setPaywallVisible(true)} />}
      <Routes>
        <Route path="/" element={<ProfileSelectionPage />} />
        <Route path="/parent/pin" element={<ParentPinPage />} />
        <Route path="/parent/*" element={<ParentApp />} />
        <Route path="/kid/*" element={<KidApp />} />
        {/* Catch-all: redirect to profile selection */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {renderMobileNavigationBar()}

      {/* Toast 通知 */}
      <div className="fixed top-24 right-6 z-[99999] space-y-3 pointer-events-none">
        {notifications.map((n) => (
          <div key={n.id} className={`px-6 py-4 rounded-2xl shadow-xl animate-bounce-in text-white text-sm font-bold flex items-center justify-between gap-4 pointer-events-auto ${n.type === 'error' ? 'bg-rose-500' : n.type === 'info' ? 'bg-slate-800' : 'bg-emerald-500'}`}>
            <div className="flex items-center gap-2">
              <Icons.Bell size={18} /> {n.message}
            </div>
            <button onClick={() => setNotifications((p) => p.filter((x) => x.id !== n.id))} className="opacity-70 hover:opacity-100 transition-opacity flex-shrink-0">
              <Icons.X size={16} />
            </button>
          </div>
        ))}
      </div>

      <GlobalModals />
      <PaywallModal visible={paywallVisible} onClose={() => setPaywallVisible(false)} />

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
          @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); } 20%, 40%, 60%, 80% { transform: translateX(4px); } }
          .animate-shake { animation: shake 0.5s ease-in-out; }
        `
      }} />
    </div>
  );
}

export default function App() {
  return (
    <>
      <SmartInstallBanner />
      <BrowserRouter>
        <AuthProvider>
          <DataProvider>
            <UIProvider>
              <AppContent />
            </UIProvider>
          </DataProvider>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}