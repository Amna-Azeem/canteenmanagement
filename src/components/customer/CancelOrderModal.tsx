import React, { useState } from 'react';
import { Order } from '../../types';
import { cancelOrder } from '../../services/db';
import { useNotifications } from '../../context/NotificationContext';
import { AlertTriangle, X, Check } from 'lucide-react';

interface CancelOrderModalProps {
  order: Order | null;
  isOpen?: boolean;
  onClose: () => void;
  onCancelled: () => void;
}

const CANCEL_REASONS = [
  'Lecture / Meeting timetable shifted',
  'Ordered duplicate item by mistake',
  'Wait time longer than break allows',
  'Selected wrong pickup slot',
  'Personal dietary change',
  'Other reasons',
];

export const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  order,
  isOpen = true,
  onClose,
  onCancelled,
}) => {
  const { showToast } = useNotifications();
  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0]);
  const [customNotes, setCustomNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !order) return null;

  const canCancel = order.order_status === 'Placed' || order.order_status === 'Accepted';

  const handleConfirmCancel = () => {
    if (!canCancel) {
      showToast('error', 'Cannot Cancel', 'Order is already in preparation or completed.');
      return;
    }

    setLoading(true);
    const finalReason = customNotes.trim() ? `${selectedReason} - ${customNotes}` : selectedReason;

    const res = cancelOrder(order.order_id, finalReason, order.customer_id);
    setLoading(false);

    if (res.success) {
      showToast('success', 'Order Cancelled', `Token ${order.token_number} cancelled. Items restored to kitchen stock.`);
      onCancelled();
      onClose();
    } else {
      showToast('error', 'Cancellation Failed', res.error || 'Could not cancel order.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
        <div className="p-5 bg-red-50 border-b border-red-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Cancel Pre-Order</h3>
              <p className="text-xs text-red-700 font-mono">Token: {order.token_number}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!canCancel ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
              <p className="font-semibold mb-1">Cannot Cancel at this Stage</p>
              Your order is currently <strong>{order.order_status}</strong>. To prevent food waste, orders already in active cooking cannot be cancelled automatically. Please speak to kitchen staff directly at the counter.
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cancelling will release your pickup slot, restore ingredients to stock, and initiate an immediate payment refund to your original payment method.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Reason for Cancellation
                </label>
                <div className="space-y-1.5">
                  {CANCEL_REASONS.map((r) => (
                    <label
                      key={r}
                      className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition ${
                        selectedReason === r
                          ? 'border-amber-500 bg-amber-50/50 text-slate-900 font-medium'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="cancel_reason"
                        checked={selectedReason === r}
                        onChange={() => setSelectedReason(r)}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Additional Details (Optional)
                </label>
                <textarea
                  rows={2}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="Tell us what happened so we can improve..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs cursor-pointer"
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  {loading ? 'Processing...' : 'Confirm Cancel'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
