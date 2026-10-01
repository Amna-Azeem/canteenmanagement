import React from 'react';
import { Order } from '../../types';
import { QrCodeSvg } from '../common/QrCodeSvg';
import { CheckCircle2, Clock, MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, onClose }) => {
  const navigate = useNavigate();

  if (!order) return null;

  const handleTrack = () => {
    onClose();
    navigate(`/track?orderId=${order.order_id}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-200">
        {/* Success Banner */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 relative overflow-hidden">
          <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto flex items-center justify-center mb-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-200" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Order Confirmed!</h2>
          <p className="text-xs text-emerald-100 mt-1">
            Your kitchen ticket has been dispatched to kitchen stations.
          </p>
        </div>

        <div className="p-6">
          {/* Big Digital Token Banner */}
          <div className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-2xl p-4 my-2">
            <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-widest block">
              YOUR DIGITAL QUEUE TOKEN
            </span>
            <div className="text-4xl sm:text-5xl font-black font-mono text-slate-900 tracking-wider my-1">
              {order.token_number}
            </div>
            <p className="text-xs text-amber-700">
              Show this token or scan your QR code at the counter for collection.
            </p>
          </div>

          {/* QR Code Container */}
          <div className="my-5 flex justify-center">
            <QrCodeSvg value={`${order.token_number}:${order.order_id}`} size={160} />
          </div>

          {/* Meta Details */}
          <div className="grid grid-cols-2 gap-3 text-left bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs mb-6">
            <div>
              <span className="text-slate-500 block flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Pickup Slot
              </span>
              <span className="font-semibold text-slate-800 block mt-0.5 truncate">
                {order.pickup_time}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Collection Station
              </span>
              <span className="font-semibold text-slate-800 block mt-0.5">
                Main Counter 1 &amp; 2
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2">
            <button
              onClick={handleTrack}
              className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-md shadow-amber-200 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              Track Live Order Status
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs transition cursor-pointer"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
