import { useAuthContext } from '../context/AuthContext.jsx';
import { useDataContext } from '../context/DataContext.jsx';
import { useUIContext } from '../context/UIContext.jsx';
import { apiFetch } from '../api/client';

export const useShopManager = (authC, dataC, uiC) => {
    const context = { ...authC, ...dataC, ...uiC };
    const { activeKidId, kids, setKids, inventory, setInventory, orders, setOrders, transactions, setTransactions, notify, setShowTransferModal, setTransferForm, setSelectedOrder, setReviewStars, setReviewComment, setShowAddItemModal, newItem, setNewItem, setShowQrScanner } = context;

    const handleVerifyOrder = async (orderIdOrCode) => {
        const order = orders.find(o => o.id === orderIdOrCode || o.redeemCode === orderIdOrCode);
        if (!order) return notify("未找到该订单或核销码无效", "error");
        if (order.status !== 'shipping') return notify("该订单已被核销或状态错误", "error");

        try {
            await apiFetch(`/api/orders/${order.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'completed' }) });
            setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'completed' } : o));
            notify("扫码核销成功！", "success");
            setShowQrScanner(false);
        } catch (e) {
            notify("核销网络请求失败", "error");
        }
    };

// 快速完成功能 
 

const confirmTransfer = async () => {
  const amount = parseInt(transferForm.amount);
  const activeKid = kids.find(k => k.id === activeKidId);
  if (!amount || amount <= 0 || amount > activeKid.balances.spend) {
    return notify("请输入有效的划转金额！", "error");
  }
  try {
    const newSpend = activeKid.balances.spend - amount;
    let newVault = {
      ...activeKid.vault
    };
    let newBalances = {
      ...activeKid.balances,
      spend: newSpend
    };
    if (transferForm.target === 'vault') {
      newVault.lockedAmount += amount;
      // Dynamically update projected return based on level (5% base + 1% per level)
      const apy = 5 + activeKid.level;
      newVault.projectedReturn = Math.floor(newVault.lockedAmount * (apy / 100));
    } else if (transferForm.target === 'give') {
      newBalances.give += amount;
    }
    // Sync with backend
    await apiFetch(`/api/kids/${activeKidId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        balances: newBalances,
        vault: newVault
      })
    });
    setKids(kids.map(k => k.id === activeKidId ? {
      ...k,
      balances: newBalances,
      vault: newVault
    } : k));
    setShowTransferModal(false);
    setTransferForm({
      amount: '',
      target: 'vault'
    });
    notify(`成功划转 ${amount} 家庭币！`, "success");
  } catch (e) {
    notify("网络请求失败", "error");
  }
};

    const buyItem = async item => {
  const activeKid = kids.find(k => k.id === activeKidId);
  const targetWallet = item.walletTarget === 'give' ? 'give' : 'spend';
  const walletName = targetWallet === 'give' ? '爱心基金' : '零花钱';
  if ((activeKid.balances[targetWallet] || 0) < item.price) {
    notify(`${walletName}不够，去“学习任务”赚点吧！`, 'error');
    return false;
  }
  // Check limits per kid
  const kidOrders = orders.filter(o => o.kidId === activeKidId && o.itemId === item.id);
  if (item.type === 'single') {
    if (kidOrders.length >= 1) {
      notify("此愿望/商品仅可兑换一次，你已经兑换过啦！", "error");
      return false;
    }
  } else if (item.type === 'multiple') {
    const maxAllowed = item.maxExchanges || Infinity;
    if (kidOrders.length >= maxAllowed) {
      notify(`该商品最多兑换 ${maxAllowed} 次，你已达到上限！`, "error");
      return false;
    }
  }
  // Generate a unique 8-character redeem code
  const redeemCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  const newOrder = {
    id: `ORD-${Math.floor(Math.random() * 100000)}`,
    kidId: activeKidId,
    itemId: item.id,
    itemName: item.name,
    price: item.price,
    status: 'shipping',
    date: new Date().toLocaleDateString(),
    rating: 0,
    comment: "",
    redeemCode: redeemCode
  };
  try {
    const newBalances = {
      ...activeKid.balances,
      [targetWallet]: (activeKid.balances[targetWallet] || 0) - item.price
    };
    await apiFetch(`/api/kids/${activeKidId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        balances: newBalances
      })
    });
    await apiFetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newOrder)
    });
    // Record Transaction
    const newTrans = {
      id: `trans_${Date.now()}`,
      kidId: activeKidId,
      type: 'expense',
      amount: item.price,
      title: `兑换: ${item.name}`,
      date: new Date().toISOString(),
      category: 'wish'
    };
    await apiFetch('/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newTrans)
    });
    // NOTE: We no longer delete single items globally from inventory so other kids can still buy them!
    setTransactions([newTrans, ...transactions]);
    // Optimistic Update
    setKids(kids.map(k => k.id === activeKidId ? {
      ...k,
      balances: newBalances
    } : k));
    setOrders([newOrder, ...orders]);
    notify(`下单成功！快去拿给爸爸妈妈核销吧！`, "success");
    return true;
  } catch (e) {
    notify("网络请求失败", "error");
    return false;
  }
};

    const confirmReceipt = async orderId => {
  try {
    await apiFetch(`/ api / orders / ${orderId} `, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'received'
      })
    });
    setOrders(orders.map(o => o.id === orderId ? {
      ...o,
      status: 'received'
    } : o));
    notify("签收成功！快去评价一下吧。", "success");
  } catch (e) {
    notify("网络请求失败", "error");
  }
};

    const submitReview = async (orderId, stars, text) => {
  try {
    await apiFetch(`/ api / orders / ${orderId} `, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'completed',
        rating: stars,
        comment: text
      })
    });
    setOrders(orders.map(o => o.id === orderId ? {
      ...o,
      status: 'completed',
      rating: stars,
      comment: text
    } : o));
    setSelectedOrder(null);
    setReviewStars(5);
    setReviewComment("");
    notify("评价完成，感谢反馈！", "success");
  } catch (e) {
    notify("网络请求失败", "error");
  }
};

    const handleSaveNewItem = async () => {
  if (!newItem.name || !newItem.price) return notify("请填写名称和需要星数", "error");
  if (newItem.id) {
    try {
      const updated = {
        ...newItem,
        price: parseInt(newItem.price)
      };
      await apiFetch(`/api/inventory/${newItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updated)
      });
      setInventory(inventory.map(i => i.id === newItem.id ? updated : i));
      setShowAddItemModal(false);
      setNewItem({
        name: '',
        desc: '',
        price: '',
        iconEmoji: '🧸',
        type: 'single',
        walletTarget: 'spend',
        charityTarget: '',
        maxExchanges: 1,
        periodMaxType: 'lifetime'
      });
      notify("商品修改成功！", "success");
    } catch (e) {
      notify("网络请求失败", "error");
    }
  } else {
    const addedItem = {
      id: Date.now().toString(),
      ...newItem,
      price: parseInt(newItem.price)
    };
    try {
      await apiFetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(addedItem)
      });
      setInventory([...inventory, addedItem]);
      setShowAddItemModal(false);
      setNewItem({
        name: '',
        desc: '',
        price: '',
        iconEmoji: '🧸',
        type: 'single',
        walletTarget: 'spend',
        charityTarget: '',
        maxExchanges: 1,
        periodMaxType: 'lifetime'
      });
      notify("商品上架成功！", "success");
    } catch (e) {
      notify("网络请求失败", "error");
    }
  }
};
// === 弹窗渲染函数 (彻底修复 ReferenceError) ===
// --- Mobile Bottom Navigation Portal ---

    return {
        buyItem,
        confirmReceipt,
        submitReview,
        handleSaveNewItem,
        confirmTransfer,
        handleVerifyOrder
    };
};
