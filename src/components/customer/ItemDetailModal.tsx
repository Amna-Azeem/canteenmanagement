import React, { useState } from 'react';
import { MenuItem } from '../../types';
import { useCart } from '../../context/CartContext';
import { useNotifications } from '../../context/NotificationContext';
import { X, Clock, Flame, Leaf, Plus, Minus, AlertCircle } from 'lucide-react';

interface ItemDetailModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item, onClose }) => {
  const { addToCart } = useCart();
  const { showToast } = useNotifications();
  const [quantity, setQuantity] = useState(1);
  const [specialInstruction, setSpecialInstruction] = useState('');

  if (!item) return null;

  const isUnavailable = item.status === 'Sold Out' || item.status === 'Temporarily Unavailable';

  const handleAdd = () => {
    const res = addToCart(item, quantity, specialInstruction);
    if (!res.success) {
      showToast('warning', 'Order Limit', res.error || 'Could not add item to cart.');
    } else {
      showToast('success', 'Added to Cart', `${quantity}x ${item.item_name} added to your pre-order cart.`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Image header with close button */}
        <div className="relative h-56 bg-slate-100">
          <img
            src={item.image}
            alt={item.item_name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 left-3 flex gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 text-slate-800 shadow-xs">
              {item.category}
            </span>
            {item.is_veg && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
                <Leaf className="w-3 h-3" /> Veg
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 leading-snug">{item.item_name}</h3>
              <p className="text-2xl font-extrabold text-amber-600 mt-1">
                ${item.price.toFixed(2)}
              </p>
            </div>

            {/* Availability Status */}
            <div>
              {item.status === 'Sold Out' && (
                <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md">
                  Sold Out
                </span>
              )}
              {item.status === 'Limited' && (
                <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-md">
                  Only {item.available_quantity} Left!
                </span>
              )}
              {item.status === 'Available' && (
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-md">
                  In Stock ({item.available_quantity})
                </span>
              )}
            </div>
          </div>

          <p className="text-sm text-slate-600 mt-3 leading-relaxed">{item.description}</p>

          {/* Quick Badges */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Prep: ~{item.preparation_time} mins</span>
            </div>
            {item.calories && (
              <div className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>{item.calories} kcal</span>
              </div>
            )}
          </div>

          {/* Special Instruction Input */}
          <div className="mt-5">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Special Preparation Instructions (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., No pickles, dressing on side, less spicy..."
              value={specialInstruction}
              onChange={(e) => setSpecialInstruction(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              maxLength={120}
              disabled={isUnavailable}
            />
          </div>

          {/* Quantity selector & Add Button */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1 || isUnavailable}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white disabled:opacity-30 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center font-bold text-sm text-slate-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(item.available_quantity, quantity + 1))}
                disabled={quantity >= item.available_quantity || isUnavailable}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white disabled:opacity-30 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handleAdd}
              disabled={isUnavailable}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-sm ${
                isUnavailable
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-200 cursor-pointer'
              }`}
            >
              {isUnavailable ? (
                <>
                  <AlertCircle className="w-4 h-4" /> Item Unavailable
                </>
              ) : (
                <>Add to Cart • ${(item.price * quantity).toFixed(2)}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
