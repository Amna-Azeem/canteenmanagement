import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';
import { getOrders, checkReorderAvailability, subscribeDb } from '../services/db';
import { Order } from '../types';
import { CartDrawer } from '../components/customer/CartDrawer';
import { useNavigate } from 'react-router-dom';
import {
  History,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Receipt,
} from 'lucide-react';

export const CustomerHistoryPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { clearCart, addToCart, setIsCartOpen } = useCart();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);

  const refreshOrders = () => {
    if (!currentUser) return;
    const all = getOrders().filter((o) => o.customer_id === currentUser.user_id);
    setOrders(all);
  };

  useEffect(() => {
    refreshOrders();
    const unsub = subscribeDb(refreshOrders);
    return unsub;
  }, [currentUser?.user_id]);

  const handleReorder = (order: Order) => {
    const { availableItems, unavailableItems } = checkReorderAvailability(order);

    if (availableItems.length === 0) {
      showToast(
        'error',
        'Cannot Reorder',
        'All items in this past order are currently Sold Out or discontinued.'
      );
      return;
    }

    // Clear current cart and add available items
    clearCart();
    let addedCount = 0;
    for (const entry of availableItems) {
      const res = addToCart(entry.item, entry.quantity, entry.special_instruction);
      if (res.success) addedCount += entry.quantity;
    }

    if (unavailableItems.length > 0) {
      const unavailableList = unavailableItems.map((u) => `${u.name} (${u.reason})`).join(', ');
      showToast(
        'warning',
        'Partial Reorder',
        `Some items could not be reordered: ${unavailableList}. Available items were added to your cart.`
      );
    } else {
      showToast('success', 'Cart Rebuilt', `Added ${addedCount} items from order #${order.token_number} to cart.`);
    }

    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full mb-1">
              <History className="w-3.5 h-3.5" />
              <span>Personal Dining Ledger</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">Your Order History &amp; Reorder</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review past digital tokens, inspect receipts, and 1-click reorder your favorites.
            </p>
          </div>

          <button
            onClick={() => navigate('/menu')}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shadow-xs"
          >
            Order New Meal <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No Past Orders Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Your completed and active orders will appear here. Start pre-ordering from the menu!
            </p>
            <button
              onClick={() => navigate('/menu')}
              className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl cursor-pointer"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => (
              <div
                key={ord.order_id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left Meta */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black font-mono text-slate-900 px-2.5 py-1 bg-slate-100 rounded-xl">
                      {ord.token_number}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        ord.order_status === 'Completed' || ord.order_status === 'Collected'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.order_status === 'Preparing'
                          ? 'bg-amber-100 text-amber-800'
                          : ord.order_status === 'Cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {ord.order_status}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(ord.order_time).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}{' '}
                      at{' '}
                      {new Date(ord.order_time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Items summary */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {ord.items.map((it) => (
                      <span
                        key={it.order_item_id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium"
                      >
                        <strong className="text-amber-700 font-mono">{it.quantity}x</strong>{' '}
                        {it.item_name}
                      </span>
                    ))}
                  </div>

                  <div className="text-xs text-slate-500 flex items-center gap-3">
                    <span>Slot: <strong>{ord.pickup_time}</strong></span>
                    <span>•</span>
                    <span>Payment: <strong className="uppercase font-mono">{ord.payment_method}</strong> ({ord.payment_status})</span>
                  </div>
                </div>

                {/* Right: Price & 1-Click Reorder Button */}
                <div className="flex items-center justify-between md:flex-col md:items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-xl font-black text-slate-900 block leading-none">
                      ${ord.total_amount.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {ord.items.length} item{ord.items.length > 1 ? 's' : ''} total
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/track?orderId=${ord.order_id}`)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                    >
                      Track Token
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReorder(ord)}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      1-Click Reorder
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CartDrawer />
    </div>
  );
};
