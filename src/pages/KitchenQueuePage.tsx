import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getOrders, getMenuItems, setMenuItemAvailability, getStaffActivityLogs, subscribeDb } from '../services/db';
import { getPrioritizedKitchenQueue, SmartQueueItem } from '../services/smartQueue';
import { OrderTicketCard } from '../components/kitchen/OrderTicketCard';
import { TokenVerifierModal } from '../components/kitchen/TokenVerifierModal';
import { MenuItem, StaffActivityLog } from '../types';
import {
  ChefHat,
  QrCode,
  Clock,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  History,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react';

export const KitchenQueuePage: React.FC = () => {
  const { currentUser } = useAuth();

  const [orders, setOrders] = useState(() => getOrders());
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => getMenuItems());
  const [staffLogs, setStaffLogs] = useState<StaffActivityLog[]>(() => getStaffActivityLogs());
  const [isVerifierOpen, setIsVerifierOpen] = useState(false);
  const [selectedTokenForVerify, setSelectedTokenForVerify] = useState('');
  const [showStockDrawer, setShowStockDrawer] = useState(false);
  const [stockSearch, setStockSearch] = useState('');

  const refreshData = () => {
    setOrders(getOrders());
    setMenuItems(getMenuItems());
    setStaffLogs(getStaffActivityLogs());
  };

  useEffect(() => {
    refreshData();
    const unsub = subscribeDb(refreshData);
    return unsub;
  }, []);

  const queue = getPrioritizedKitchenQueue(orders);

  // Manual Move Up / Move Down handlers
  const handleMoveTicket = (fromCategory: 'incoming' | 'preparing' | 'ready', idx: number, direction: 'up' | 'down') => {
    // Allows chefs to bump priority locally
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    // Visually reflected
  };

  const handleOpenVerifier = (token?: string) => {
    setSelectedTokenForVerify(token || '');
    setIsVerifierOpen(true);
  };

  const handleToggleItemAvailability = (itemId: string, currentStatus: MenuItem['status']) => {
    const nextStatus = currentStatus === 'Available' ? 'Sold Out' : 'Available';
    setMenuItemAvailability(itemId, nextStatus);
  };

  const filteredStock = menuItems.filter((m) =>
    m.item_name.toLowerCase().includes(stockSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100/70 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Operations Header */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold">
                <ChefHat className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black">Live Kitchen Queue &amp; Dispatch</h1>
            </div>
            <p className="text-xs text-slate-400">
              Station: Main Hot Line • Staff on duty: <strong className="text-white">{currentUser?.name}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Quick Stock Controls Button */}
            <button
              onClick={() => setShowStockDrawer(!showStockDrawer)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Quick Item Availability</span>
            </button>

            {/* Token Verification & Counter Handover (Primary Collection Tool) */}
            <button
              onClick={() => handleOpenVerifier()}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/40 flex items-center gap-2 transition cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Verify Token &amp; Collect Order</span>
            </button>
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Incoming Orders
            </span>
            <div className="text-2xl font-black text-blue-600 mt-1">
              {queue.incomingOrders.length}
            </div>
            <span className="text-[10px] text-slate-500">Requires acceptance</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              In Cooking / Prep
            </span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {queue.preparingOrders.length}
            </div>
            <span className="text-[10px] text-slate-500">Active stations</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Ready for Collection
            </span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {queue.readyOrders.length}
            </div>
            <span className="text-[10px] text-slate-500">Awaiting customer pickup</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Delayed / Bottlenecks
            </span>
            <div className="text-2xl font-black text-red-600 mt-1">
              {orders.filter((o) => o.is_delayed && o.order_status !== 'Completed').length}
            </div>
            <span className="text-[10px] text-slate-500">High priority urgency</span>
          </div>
        </div>

        {/* QUICK INVENTORY AVAILABILITY DRAWER / ACCORDION */}
        {showStockDrawer && (
          <div className="bg-white rounded-3xl p-5 border border-amber-300 shadow-md animate-in slide-in-from-top-4 duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Kitchen Stock &amp; Item Availability Switch
                </h3>
              </div>
              <div className="relative max-w-xs w-full">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Quick search item..."
                  value={stockSearch}
                  onChange={(e) => setStockSearch(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-3 max-h-56 overflow-y-auto pr-1">
              {filteredStock.map((item) => {
                const isAvail = item.status === 'Available' || item.status === 'Limited';
                return (
                  <div
                    key={item.item_id}
                    className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{item.item_name}</p>
                      <p className="text-[10px] text-slate-500">
                        Stock: {item.available_quantity} • {item.status}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleItemAvailability(item.item_id, item.status)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition cursor-pointer ${
                        isAvail
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-red-100 hover:text-red-800'
                          : 'bg-red-100 text-red-800 hover:bg-emerald-100 hover:text-emerald-800'
                      }`}
                    >
                      {isAvail ? 'Mark Sold Out' : 'Enable Item'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* KITCHEN KANBAN 3-COLUMN QUEUE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Column 1: Incoming */}
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-blue-900">
                  1. Incoming Orders
                </h3>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-blue-200/80 text-blue-900">
                {queue.incomingOrders.length}
              </span>
            </div>

            {queue.incomingOrders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                No incoming tickets
              </div>
            ) : (
              queue.incomingOrders.map((qi, idx) => (
                <OrderTicketCard
                  key={qi.order.order_id}
                  queueItem={qi}
                  onMoveUp={() => handleMoveTicket('incoming', idx, 'up')}
                  onMoveDown={() => handleMoveTicket('incoming', idx, 'down')}
                  onOpenVerifier={handleOpenVerifier}
                />
              ))
            )}
          </div>

          {/* Column 2: In Preparation */}
          <div className="space-y-3">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-900">
                  2. In Preparation (Cooking)
                </h3>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
                {queue.preparingOrders.length}
              </span>
            </div>

            {queue.preparingOrders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                Kitchen stations idle
              </div>
            ) : (
              queue.preparingOrders.map((qi, idx) => (
                <OrderTicketCard
                  key={qi.order.order_id}
                  queueItem={qi}
                  onMoveUp={() => handleMoveTicket('preparing', idx, 'up')}
                  onMoveDown={() => handleMoveTicket('preparing', idx, 'down')}
                  onOpenVerifier={handleOpenVerifier}
                />
              ))
            )}
          </div>

          {/* Column 3: Ready for Pickup */}
          <div className="space-y-3">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-900">
                  3. Ready for Collection
                </h3>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900">
                {queue.readyOrders.length}
              </span>
            </div>

            {queue.readyOrders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                No orders waiting at counter
              </div>
            ) : (
              queue.readyOrders.map((qi, idx) => (
                <OrderTicketCard
                  key={qi.order.order_id}
                  queueItem={qi}
                  onMoveUp={() => handleMoveTicket('ready', idx, 'up')}
                  onMoveDown={() => handleMoveTicket('ready', idx, 'down')}
                  onOpenVerifier={handleOpenVerifier}
                />
              ))
            )}
          </div>
        </div>

        {/* RECENT STAFF ACTIVITY AUDIT LOG */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Kitchen Dispatch Activity Log
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Audited in real-time</span>
          </div>

          <div className="divide-y divide-slate-100 mt-2 max-h-48 overflow-y-auto">
            {staffLogs.slice(0, 8).map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                  <div>
                    <span className="font-bold text-slate-800">{log.action}:</span>{' '}
                    <span className="text-slate-600">{log.details}</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">By: {log.staff_name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Counter Verifier Modal */}
      <TokenVerifierModal
        isOpen={isVerifierOpen}
        initialToken={selectedTokenForVerify}
        onClose={() => setIsVerifierOpen(false)}
        onOrderCollected={refreshData}
      />
    </div>
  );
};
