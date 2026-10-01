import React, { useState } from 'react';
import { SmartQueueItem } from '../../services/smartQueue';
import { useAuth } from '../../context/AuthContext';
import { updateOrderStatus } from '../../services/db';
import { useNotifications } from '../../context/NotificationContext';
import {
  Clock,
  CheckCircle2,
  Play,
  XCircle,
  AlertTriangle,
  Zap,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  Flame,
  MessageSquare,
} from 'lucide-react';

interface OrderTicketCardProps {
  queueItem: SmartQueueItem;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onOpenVerifier?: (token: string) => void;
}

export const OrderTicketCard: React.FC<OrderTicketCardProps> = ({
  queueItem,
  onMoveUp,
  onMoveDown,
  onOpenVerifier,
}) => {
  const { order, priorityScore, isUrgent, isQuickPrep, estimatedRemainingMins, minutesInQueue, urgencyReason } =
    queueItem;
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('Out of fresh ingredients');
  const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);
  const [delayMins, setDelayMins] = useState(8);

  const handleStatusChange = (newStatus: any, extra?: any) => {
    if (!currentUser) return;
    const res = updateOrderStatus(order.order_id, newStatus, currentUser, extra);
    if (res.success) {
      showToast('success', 'Status Updated', `Token ${order.token_number} is now ${newStatus}.`);
    } else {
      showToast('error', 'Update Error', res.error || 'Failed to update order status.');
    }
  };

  const getBorderColor = () => {
    if (order.is_delayed) return 'border-red-400 bg-red-50/20';
    if (order.order_status === 'Ready') return 'border-emerald-400 bg-emerald-50/20';
    if (order.order_status === 'Preparing') return 'border-amber-400 bg-amber-50/20';
    return 'border-slate-200 bg-white';
  };

  return (
    <>
      <div
        className={`p-4 rounded-2xl border-2 transition-all shadow-xs hover:shadow-md ${getBorderColor()}`}
      >
        {/* Top Header: Token & Badges */}
        <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black font-mono text-slate-900 tracking-tight">
              {order.token_number}
            </span>
            <span className="text-[11px] font-semibold text-slate-500 font-mono">
              #{order.order_id.substring(4, 9)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {isQuickPrep && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 flex items-center gap-1">
                <Zap className="w-3 h-3" /> Quick Prep
              </span>
            )}
            {order.is_delayed && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 flex items-center gap-1 animate-pulse">
                <AlertTriangle className="w-3 h-3" /> Delayed +{order.delay_minutes || 6}m
              </span>
            )}
            {isUrgent && !order.is_delayed && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                <Flame className="w-3 h-3" /> Rush
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 font-mono">
              Score: {priorityScore}
            </span>
          </div>
        </div>

        {/* Urgency Alert if any */}
        {urgencyReason && (
          <div className="mt-2 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200/80 text-[11px] font-medium text-amber-900 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{urgencyReason}</span>
          </div>
        )}

        {/* Timers & Pickup Info */}
        <div className="grid grid-cols-2 gap-2 my-2.5 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Waited: <strong>{minutesInQueue} mins</strong></span>
          </div>
          <div className="text-right">
            <span>Pickup: <strong className="text-slate-800">{order.pickup_time}</strong></span>
          </div>
        </div>

        {/* Items List with Special Instructions */}
        <div className="space-y-1.5 my-3">
          {order.items.map((it) => (
            <div
              key={it.order_item_id}
              className="p-2 bg-slate-50 rounded-xl border border-slate-200/70 text-xs"
            >
              <div className="flex items-center justify-between font-bold text-slate-900">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-mono flex items-center justify-center font-black">
                    {it.quantity}
                  </span>
                  <span>{it.item_name}</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  ~{it.prep_time_mins}m
                </span>
              </div>

              {it.special_instruction && (
                <div className="mt-1 px-2 py-1 bg-amber-100/70 rounded text-[11px] font-semibold text-amber-900 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-amber-700 shrink-0" />
                  <span>Note: {it.special_instruction}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Customer & Payment Meta */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          <span>Customer: <strong>{order.customer_name}</strong></span>
          <span className="capitalize px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
            {order.payment_method.replace('_', ' ')} ({order.payment_status})
          </span>
        </div>

        {/* Bottom Actions based on Status */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
          {/* Manual queue priority adjust buttons */}
          <div className="flex items-center gap-1">
            {onMoveUp && (
              <button
                type="button"
                onClick={onMoveUp}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                title="Move ticket higher in queue"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            )}
            {onMoveDown && (
              <button
                type="button"
                onClick={onMoveDown}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                title="Move ticket lower in queue"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsDelayModalOpen(true)}
              className="p-1.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 transition text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
              title="Flag delay"
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Delay
            </button>
          </div>

          {/* Primary Action Button */}
          <div className="flex items-center gap-1.5">
            {order.order_status === 'Placed' && (
              <>
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(true)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold cursor-pointer"
                  title="Reject order"
                >
                  <XCircle className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('Accepted')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  Accept <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {order.order_status === 'Accepted' && (
              <button
                type="button"
                onClick={() => handleStatusChange('Preparing')}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Start Cooking
              </button>
            )}

            {order.order_status === 'Preparing' && (
              <button
                type="button"
                onClick={() => handleStatusChange('Ready')}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" /> Mark Ready
              </button>
            )}

            {order.order_status === 'Ready' && (
              <button
                type="button"
                onClick={() => {
                  if (onOpenVerifier) onOpenVerifier(order.token_number);
                }}
                className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                Verify &amp; Collect
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-3">
            <h4 className="font-bold text-slate-900 text-sm">Reject Order {order.token_number}</h4>
            <p className="text-xs text-slate-500">
              Provide reason to refund customer and log cancellation.
            </p>
            <input
              type="text"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full text-xs p-2.5 border rounded-lg"
            />
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleStatusChange('Rejected', { rejectionReason: rejectReason });
                  setIsRejectModalOpen(false);
                }}
                className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delay Modal */}
      {isDelayModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-3">
            <h4 className="font-bold text-slate-900 text-sm">Report Delay for {order.token_number}</h4>
            <p className="text-xs text-slate-500">
              Notify customer about kitchen rush and set expected delay.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600">Delay minutes:</span>
              <input
                type="number"
                min="2"
                max="30"
                value={delayMins}
                onChange={(e) => setDelayMins(Number(e.target.value))}
                className="w-20 text-xs p-2 border rounded-lg font-bold text-center"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setIsDelayModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  handleStatusChange('Delayed', { delayMins });
                  setIsDelayModalOpen(false);
                }}
                className="px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg"
              >
                Send Delay Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
