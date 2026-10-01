import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { placeOrder } from '../../services/db';
import { Order, PaymentMethod } from '../../types';
import { OrderSuccessModal } from './OrderSuccessModal';
import {
  X,
  Trash2,
  Plus,
  Minus,
  Clock,
  CreditCard,
  Building2,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    updateInstruction,
    clearCart,
    selectedSlot,
    setSelectedSlot,
    availableSlots,
    subtotal,
    tax,
    total,
    totalItemsCount,
    estimatedPrepTimeMins,
  } = useCart();

  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('campus_card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  if (!isCartOpen) return null;

  const handleCheckout = async () => {
    if (!currentUser) {
      showToast('error', 'Authentication Required', 'Please sign in to place an order.');
      return;
    }

    if (cart.length === 0) {
      showToast('warning', 'Cart Empty', 'Please add items before checking out.');
      return;
    }

    if (!selectedSlot) {
      showToast('warning', 'Select Pickup Slot', 'Please select a pickup time slot.');
      return;
    }

    if (selectedSlot.is_full && selectedSlot.slot_id !== 'slot_asap') {
      showToast('error', 'Slot Full', 'Selected pickup slot has reached full capacity. Please pick another slot.');
      return;
    }

    // Submit lock & idempotency key
    setIsSubmitting(true);
    const idempotencyKey = `idemp_${currentUser.user_id}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    try {
      // Simulate minor network latency for realistic feel
      await new Promise((r) => setTimeout(r, 450));

      const res = placeOrder({
        customerId: currentUser.user_id,
        customerName: currentUser.name,
        customerEmail: currentUser.email,
        items: cart.map((ci) => ({
          menuItem: ci.menuItem,
          quantity: ci.quantity,
          special_instruction: ci.special_instruction,
        })),
        pickupSlotLabel: selectedSlot.label,
        paymentMethod,
        idempotencyKey,
      });

      if (!res.success) {
        showToast('error', 'Order Failed', res.error || 'Could not place order. Please review your cart.');
        setIsSubmitting(false);
        return;
      }

      // Order created successfully!
      clearCart();
      setIsCartOpen(false);
      setCreatedOrder(res.order || null);
      showToast('success', 'Order Placed!', `Token #${res.order?.token_number} generated.`);
    } catch (err) {
      console.error(err);
      showToast('error', 'Network Error', 'An error occurred while placing order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          onClick={() => setIsCartOpen(false)}
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold">Your Pre-Order Cart</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                  {totalItemsCount} item{totalItemsCount !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Content / Empty State */}
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <Clock className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-base font-bold text-slate-700">Your Cart is Empty</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Explore our menu items and add food to your pre-order cart to beat the canteen rush!
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition cursor-pointer"
                >
                  Browse Menu Items
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Items List */}
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.menuItem.item_id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex gap-3"
                    >
                      <img
                        src={item.menuItem.image}
                        alt={item.menuItem.item_name}
                        className="w-16 h-16 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-900 leading-tight truncate">
                            {item.menuItem.item_name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.menuItem.item_id)}
                            className="text-slate-400 hover:text-red-500 p-0.5 cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-xs font-extrabold text-amber-700 mt-0.5">
                          ${(item.menuItem.price * item.quantity).toFixed(2)}
                          <span className="text-[10px] text-slate-400 font-normal ml-1">
                            (${item.menuItem.price.toFixed(2)} ea)
                          </span>
                        </div>

                        {/* Special Instruction preview */}
                        <div className="mt-1.5">
                          <input
                            type="text"
                            placeholder="Add note (e.g. no cheese)..."
                            value={item.special_instruction || ''}
                            onChange={(e) =>
                              updateInstruction(item.menuItem.item_id, e.target.value)
                            }
                            className="w-full text-[11px] px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 focus:outline-none focus:border-amber-500"
                            maxLength={80}
                          />
                        </div>

                        {/* Quantity Counter */}
                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200/60">
                          <span className="text-[10px] text-slate-500 font-medium">Quantity</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updateQuantity(item.menuItem.item_id, item.quantity - 1)
                              }
                              className="w-5 h-5 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold text-slate-900 w-4 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.menuItem.item_id, item.quantity + 1)
                              }
                              className="w-5 h-5 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pickup Slot Selection */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      Select Pickup Time Slot
                    </label>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Est. Prep: ~{estimatedPrepTimeMins} mins
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {availableSlots.map((slot) => {
                      const isFull = slot.is_full && slot.slot_id !== 'slot_asap';
                      const isSelected = selectedSlot?.slot_id === slot.slot_id;

                      return (
                        <button
                          key={slot.slot_id}
                          type="button"
                          disabled={isFull}
                          onClick={() => setSelectedSlot(slot)}
                          className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-center justify-between transition cursor-pointer ${
                            isSelected
                              ? 'border-amber-500 bg-amber-50/70 font-semibold text-slate-900'
                              : isFull
                              ? 'border-slate-200 bg-slate-100/70 text-slate-400 cursor-not-allowed'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                isFull ? 'bg-red-400' : isSelected ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                            />
                            <span>{slot.label}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {isFull ? (
                              <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold">
                                FULL
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500">
                                {slot.slot_id === 'slot_asap'
                                  ? 'Fast Track'
                                  : `${slot.booked_count}/${slot.max_capacity} booked`}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Payment Option */}
                <div className="pt-2">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('campus_card')}
                      className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                        paymentMethod === 'campus_card'
                          ? 'border-amber-500 bg-amber-50/70 text-slate-900 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 mx-auto mb-1 text-amber-600" />
                      <span className="text-[10px] block leading-tight">Campus Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('online_demo')}
                      className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                        paymentMethod === 'online_demo'
                          ? 'border-amber-500 bg-amber-50/70 text-slate-900 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                      <span className="text-[10px] block leading-tight">Digital Pay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('counter')}
                      className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                        paymentMethod === 'counter'
                          ? 'border-amber-500 bg-amber-50/70 text-slate-900 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <Building2 className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                      <span className="text-[10px] block leading-tight">Pay Counter</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Sticky Checkout Bar */}
            {cart.length > 0 && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
                {/* Cost Breakdown */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Campus Dining Tax (5%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 text-sm pt-1 border-t border-slate-200">
                    <span>Order Total</span>
                    <span className="text-amber-700">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-md shadow-amber-200 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Securing Queue Token...
                    </>
                  ) : (
                    <>
                      Confirm Pre-Order • ${total.toFixed(2)}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-slate-400">
                  Protected with duplicate-order prevention &amp; digital token queue.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <OrderSuccessModal order={createdOrder} onClose={() => setCreatedOrder(null)} />
    </>
  );
};
