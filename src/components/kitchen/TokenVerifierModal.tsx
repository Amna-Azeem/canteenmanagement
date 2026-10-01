import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { verifyAndCollectOrder, getOrderByToken } from '../../services/db';
import { Order } from '../../types';
import {
  QrCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  ShieldAlert,
  Clock,
  User,
  ShoppingBag,
} from 'lucide-react';

interface TokenVerifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialToken?: string;
  onOrderCollected?: () => void;
}

export const TokenVerifierModal: React.FC<TokenVerifierModalProps> = ({
  isOpen,
  onClose,
  initialToken = '',
  onOrderCollected,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  const [inputVal, setInputVal] = useState(initialToken);
  const [scannedOrder, setScannedOrder] = useState<Order | null>(null);
  const [collectionError, setCollectionError] = useState<string | null>(null);
  const [alreadyCollectedAlert, setAlreadyCollectedAlert] = useState<{
    collectedAt?: string;
  } | null>(null);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const handleLookup = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCollectionError(null);
    setAlreadyCollectedAlert(null);
    setSuccessOrder(null);

    if (!inputVal.trim()) {
      setCollectionError('Please enter a Token number (e.g., C-101) or Order ID.');
      return;
    }

    // Support scanned QR strings formatted as "C-101:ord_1234"
    let cleanToken = inputVal.trim();
    if (cleanToken.includes(':')) {
      cleanToken = cleanToken.split(':')[0];
    }

    const order = getOrderByToken(cleanToken);
    if (!order) {
      setCollectionError(`No order found for "${inputVal}". Please verify the receipt.`);
      setScannedOrder(null);
      return;
    }

    setScannedOrder(order);

    // If already collected, immediately warn
    if (order.order_status === 'Collected' || order.order_status === 'Completed') {
      setAlreadyCollectedAlert({
        collectedAt: order.collected_time,
      });
    }
  };

  const handleConfirmCollection = () => {
    if (!scannedOrder || !currentUser) return;

    const res = verifyAndCollectOrder(scannedOrder.token_number, currentUser);

    if (!res.success) {
      if (res.alreadyCollected) {
        setAlreadyCollectedAlert({ collectedAt: res.collectedAt });
      }
      setCollectionError(res.error || 'Failed to confirm collection.');
    } else {
      setSuccessOrder(res.order || null);
      showToast('success', 'Verified & Collected', `Token ${scannedOrder.token_number} collected.`);
      if (onOrderCollected) onOrderCollected();
    }
  };

  const handleReset = () => {
    setInputVal('');
    setScannedOrder(null);
    setCollectionError(null);
    setAlreadyCollectedAlert(null);
    setSuccessOrder(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500 text-slate-950 rounded-xl font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Token Verification &amp; Collection</h3>
              <p className="text-xs text-slate-400">
                Staff Counter Station • Strict Double-Collection Prevention
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Search / Scan Input */}
          <form onSubmit={handleLookup} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Scan QR or enter token (e.g. C-101)..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition cursor-pointer"
            >
              Verify
            </button>
          </form>

          {/* Quick Demo Scan Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] text-slate-500">
            <span className="font-semibold shrink-0">Quick Scan Demo:</span>
            <button
              type="button"
              onClick={() => {
                setInputVal('C-102');
                const o = getOrderByToken('C-102');
                if (o) setScannedOrder(o);
              }}
              className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono hover:bg-emerald-200 cursor-pointer"
            >
              C-102 (Ready)
            </button>
            <button
              type="button"
              onClick={() => {
                setInputVal('C-101');
                const o = getOrderByToken('C-101');
                if (o) setScannedOrder(o);
              }}
              className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono hover:bg-amber-200 cursor-pointer"
            >
              C-101 (Preparing)
            </button>
            <button
              type="button"
              onClick={() => {
                setInputVal('C-106');
                const o = getOrderByToken('C-106');
                if (o) {
                  setScannedOrder(o);
                  setAlreadyCollectedAlert({ collectedAt: o.collected_time });
                }
              }}
              className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-mono hover:bg-red-200 cursor-pointer"
              title="Test double collection security check"
            >
              C-106 (Collected)
            </button>
          </div>

          {/* Error Message */}
          {collectionError && !alreadyCollectedAlert && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{collectionError}</span>
            </div>
          )}

          {/* ALREADY COLLECTED SECURITY ALERT */}
          {alreadyCollectedAlert && (
            <div className="p-4 bg-red-500 text-white rounded-2xl shadow-lg border-2 border-red-600 animate-pulse">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 text-white shrink-0" />
                <div>
                  <h4 className="font-extrabold text-sm uppercase tracking-wider">
                    Double Collection Blocked!
                  </h4>
                  <p className="text-xs text-red-100 mt-1 leading-relaxed">
                    This order was ALREADY handed over to the customer at{' '}
                    <strong>
                      {alreadyCollectedAlert.collectedAt
                        ? new Date(alreadyCollectedAlert.collectedAt).toLocaleTimeString()
                        : 'an earlier time'}
                    </strong>
                    . This token cannot be re-used!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SUCCESS MESSAGE */}
          {successOrder && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">
                Token {successOrder.token_number} Collected Successfully!
              </h4>
              <p className="text-xs text-slate-500">
                Customer record updated. Order is marked settled and released.
              </p>
              <button
                onClick={handleReset}
                className="mt-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg cursor-pointer"
              >
                Scan Next Token
              </button>
            </div>
          )}

          {/* Scanned Order Details Card */}
          {scannedOrder && !successOrder && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">
                    Verified Token
                  </span>
                  <span className="text-3xl font-black font-mono text-slate-900">
                    {scannedOrder.token_number}
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                      scannedOrder.order_status === 'Ready'
                        ? 'bg-emerald-100 text-emerald-800'
                        : scannedOrder.order_status === 'Preparing'
                        ? 'bg-amber-100 text-amber-800'
                        : scannedOrder.order_status === 'Collected'
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    Status: {scannedOrder.order_status}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-1">
                    Slot: {scannedOrder.pickup_time}
                  </span>
                </div>
              </div>

              {/* Customer info */}
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1.5 font-medium">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {scannedOrder.customer_name} ({scannedOrder.customer_email})
                </span>
                <span className="font-bold text-slate-900">
                  Total: ${scannedOrder.total_amount.toFixed(2)}
                </span>
              </div>

              {/* Items checklist */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Items to Hand Over:
                </span>
                {scannedOrder.items.map((it) => (
                  <div
                    key={it.order_item_id}
                    className="flex items-center justify-between text-xs p-2 bg-white rounded-lg border border-slate-200/70"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-700 font-mono">{it.quantity}x</span>
                      <span className="font-medium text-slate-800">{it.item_name}</span>
                    </div>
                    {it.special_instruction && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 italic">
                        {it.special_instruction}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Confirm collection CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleConfirmCollection}
                  disabled={
                    scannedOrder.order_status === 'Collected' ||
                    scannedOrder.order_status === 'Cancelled' ||
                    scannedOrder.order_status === 'Rejected'
                  }
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md shadow-emerald-200 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm Handover &amp; Complete Collection
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
