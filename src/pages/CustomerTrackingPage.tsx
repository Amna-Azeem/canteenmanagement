import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getOrders, subscribeDb } from '../services/db';
import { Order, OrderStatus } from '../types';
import { QrCodeSvg } from '../components/common/QrCodeSvg';
import { CancelOrderModal } from '../components/customer/CancelOrderModal';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  Ban,
  ChefHat,
  PackageCheck,
  ChevronRight,
  Info,
} from 'lucide-react';

const STATUS_STEPS: OrderStatus[] = ['Placed', 'Accepted', 'Preparing', 'Ready', 'Collected'];

export const CustomerTrackingPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const refreshOrders = () => {
    if (!currentUser) return;
    const all = getOrders().filter((o) => o.customer_id === currentUser.user_id);
    setOrders(all);

    const queryOrderId = searchParams.get('orderId');
    if (queryOrderId) {
      const match = all.find((o) => o.order_id === queryOrderId);
      if (match) {
        setSelectedOrder(match);
        return;
      }
    }

    // Default to most recent non-completed order, or very latest order
    const active = all.find(
      (o) =>
        o.order_status === 'Placed' ||
        o.order_status === 'Accepted' ||
        o.order_status === 'Preparing' ||
        o.order_status === 'Ready'
    );
    setSelectedOrder(active || all[0] || null);
  };

  useEffect(() => {
    refreshOrders();
    const unsub = subscribeDb(refreshOrders);
    return unsub;
  }, [currentUser?.user_id, searchParams]);

  if (!selectedOrder) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900">No Active Orders Found</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            You don't have any pre-orders in the queue right now. Pre-order your favorite meal to receive a queue token.
          </p>
          <button
            onClick={() => navigate('/menu')}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Explore Menu &amp; Order
          </button>
        </div>
      </div>
    );
  }

  // Calculate timeline step index
  const currentStepIdx = STATUS_STEPS.indexOf(selectedOrder.order_status);
  const isCancelled = selectedOrder.order_status === 'Cancelled';
  const isRejected = selectedOrder.order_status === 'Rejected';
  const isNotCollected = selectedOrder.order_status === 'Not Collected';
  const isDelayed = selectedOrder.is_delayed;

  // Can cancel check
  const canCancel =
    selectedOrder.order_status === 'Placed' || selectedOrder.order_status === 'Accepted';

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Selector for multiple orders */}
        {orders.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
              Your Orders:
            </span>
            {orders.slice(0, 6).map((ord) => (
              <button
                key={ord.order_id}
                onClick={() => setSelectedOrder(ord)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  selectedOrder.order_id === ord.order_id
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{ord.token_number}</span>
                <span className="text-[10px] opacity-80">({ord.order_status})</span>
              </button>
            ))}
          </div>
        )}

        {/* MAIN TRACKING CARD */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          {/* Header Banner with Token */}
          <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest block">
                DIGITAL QUEUE TOKEN
              </span>
              <div className="text-4xl sm:text-5xl font-black font-mono tracking-wider text-white mt-1">
                {selectedOrder.token_number}
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Pickup Slot: <strong className="text-amber-300">{selectedOrder.pickup_time}</strong>
              </p>
            </div>

            <div className="flex flex-col items-center sm:items-end gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  selectedOrder.order_status === 'Ready'
                    ? 'bg-emerald-500 text-slate-950 animate-bounce'
                    : selectedOrder.order_status === 'Preparing'
                    ? 'bg-amber-500 text-slate-950'
                    : isCancelled || isRejected
                    ? 'bg-red-500 text-white'
                    : 'bg-blue-500 text-white'
                }`}
              >
                Status: {selectedOrder.order_status}
              </span>

              {isDelayed && (
                <div className="px-3 py-1 bg-red-900/60 border border-red-500/80 rounded-xl text-[11px] text-red-200 font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <span>Kitchen delayed by ~{selectedOrder.delay_minutes || 6} mins</span>
                </div>
              )}
            </div>
          </div>

          {/* REAL-TIME PROGRESS TIMELINE */}
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
              Live Preparation Progress
            </h3>

            {isCancelled || isRejected ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                <Ban className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-red-900">
                    Order {selectedOrder.order_status}
                  </h4>
                  <p className="text-xs text-red-700 mt-0.5">
                    Reason:{' '}
                    {selectedOrder.cancellation_reason ||
                      selectedOrder.rejection_reason ||
                      'Cancelled by request.'}
                  </p>
                  <p className="text-[11px] text-red-600 mt-1">
                    Refund has been credited back to your account ({selectedOrder.payment_status}).
                  </p>
                </div>
              </div>
            ) : isNotCollected ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900">Marked Uncollected</h4>
                  <p className="text-xs text-amber-700 mt-0.5">
                    This order was not collected at the counter within the grace period. Please visit Counter 1.
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative">
                {/* Horizontal line */}
                <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0" />

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 relative z-10">
                  {STATUS_STEPS.map((step, idx) => {
                    const isPassed = currentStepIdx >= idx;
                    const isCurrent = currentStepIdx === idx;

                    return (
                      <div
                        key={step}
                        className={`flex flex-col items-center text-center p-3 rounded-2xl transition ${
                          isCurrent
                            ? 'bg-amber-50 border border-amber-300 font-bold'
                            : 'bg-white font-medium text-slate-500'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                            isCurrent
                              ? 'bg-amber-600 text-white shadow-md shadow-amber-300 ring-4 ring-amber-100'
                              : isPassed
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-400'
                          }`}
                        >
                          {isPassed && !isCurrent ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            idx + 1
                          )}
                        </div>
                        <span
                          className={`text-xs ${
                            isCurrent ? 'text-amber-900 font-bold' : 'text-slate-700'
                          }`}
                        >
                          {step === 'Ready' ? 'Ready for Pickup' : step}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] text-amber-600 font-semibold mt-0.5 animate-pulse">
                            Current Stage
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* TWO COLUMN DETAILS: QR CODE + ITEMS LIST */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: QR Verification Display */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Counter Collection QR Code
              </span>

              <QrCodeSvg
                value={`${selectedOrder.token_number}:${selectedOrder.order_id}`}
                size={180}
              />

              <p className="text-xs text-slate-600 mt-4 max-w-xs">
                Staff will scan or verify token{' '}
                <strong className="text-slate-900 font-mono">{selectedOrder.token_number}</strong> at
                the counter upon handover.
              </p>
            </div>

            {/* Right: Order Summary & Cancel Action */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Order Summary
                </h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((it) => (
                    <div
                      key={it.order_item_id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-700">{it.quantity}x</span>
                          <span className="font-semibold text-slate-800">{it.item_name}</span>
                        </div>
                        {it.special_instruction && (
                          <p className="text-[11px] text-slate-500 italic mt-0.5">
                            Note: {it.special_instruction}
                          </p>
                        )}
                      </div>
                      <span className="font-bold text-slate-900">${it.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Payment Method ({selectedOrder.payment_status})
                  </span>
                  <span className="font-bold text-slate-900 uppercase font-mono">
                    {selectedOrder.payment_method} • ${selectedOrder.total_amount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Cancel Order Section (Strict requirement: Allowed ONLY before prep starts) */}
              <div className="pt-4 border-t border-slate-100">
                {canCancel ? (
                  <button
                    onClick={() => setIsCancelModalOpen(true)}
                    className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Ban className="w-4 h-4" />
                    Cancel Order (Stock Restored &amp; Refunded)
                  </button>
                ) : (
                  <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-600 flex items-start gap-2">
                    <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>
                      Order is <strong>{selectedOrder.order_status}</strong>. Cancellation is locked
                      once cooking begins to prevent food waste. Please ask counter staff for help.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      <CancelOrderModal
        order={selectedOrder}
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onCancelled={refreshOrders}
      />
    </div>
  );
};
