import React, { useState, useEffect } from 'react';
import { MenuItem, MenuItemCategory } from '../types';
import { getMenuItems, getOrders, subscribeDb } from '../services/db';
import { getSmartRecommendations } from '../services/aiAnalytics';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ItemDetailModal } from '../components/customer/ItemDetailModal';
import { CartDrawer } from '../components/customer/CartDrawer';
import {
  Search,
  Clock,
  Flame,
  Leaf,
  Sparkles,
  ShoppingBag,
  SlidersHorizontal,
  Plus,
  Zap,
} from 'lucide-react';

const CATEGORIES: ('All' | MenuItemCategory)[] = [
  'All',
  'Burgers',
  'Meals',
  'Drinks',
  'Snacks',
  'Desserts',
];

export const CustomerOrderPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { cart, totalItemsCount, total, setIsCartOpen, addToCart } = useCart();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'All' | MenuItemCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVegOnly, setFilterVegOnly] = useState(false);
  const [filterPopularOnly, setFilterPopularOnly] = useState(false);
  const [filterFastPrepOnly, setFilterFastPrepOnly] = useState(false);
  const [filterAvailableOnly, setFilterAvailableOnly] = useState(false);
  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);

  const refreshMenu = () => {
    setMenuItems(getMenuItems());
  };

  useEffect(() => {
    refreshMenu();
    const unsub = subscribeDb(refreshMenu);
    return unsub;
  }, []);

  // Compute Smart AI Recommendations
  const userOrders = getOrders().filter((o) => o.customer_id === currentUser?.user_id);
  const recommendations = getSmartRecommendations(currentUser?.user_id || '', userOrders, menuItems);

  // Filtered menu
  const filteredItems = menuItems.filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.item_name.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    if (filterVegOnly && !item.is_veg) return false;
    if (filterPopularOnly && !item.is_popular) return false;
    if (filterFastPrepOnly && item.preparation_time > 4) return false;
    if (filterAvailableOnly && (item.status === 'Sold Out' || item.status === 'Temporarily Unavailable'))
      return false;

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* Hero Announcement Header */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white py-8 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Smart Pre-Order System • Skip Waiting In Line</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Pre-Order Your Meal, Beat the Rush
            </h1>
            <p className="text-xs sm:text-sm text-amber-100 max-w-xl">
              Order now, select your scheduled pickup slot, and receive a digital queue token with real-time cooking countdown.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCartOpen(true)}
              className="px-5 py-3 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs shadow-lg flex items-center gap-2 transition cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-amber-600" />
              <span>View Cart ({totalItemsCount})</span>
              {totalItemsCount > 0 && <span className="text-amber-700 font-black">• ${total.toFixed(2)}</span>}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-8">
        {/* SMART AI RECOMMENDATIONS CAROUSEL */}
        {recommendations.length > 0 && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Smart AI Recommendations for You
                  </h3>
                  <p className="text-xs text-slate-500">
                    Personalized pairings, popular campus favorites &amp; fast-prep combos
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {recommendations.map(({ item, matchReason }) => (
                <div
                  key={item.item_id}
                  onClick={() => setSelectedItemForModal(item)}
                  className="p-3 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-amber-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.item_name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-amber-700 block truncate">
                        {matchReason}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">
                        {item.item_name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-[11px]">
                        <span className="font-extrabold text-slate-900">${item.price.toFixed(2)}</span>
                        <span className="text-slate-400">• ~{item.preparation_time}m</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-bold text-amber-600">
                    <span>Quick Select</span>
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEARCH, CATEGORY TABS & ADVANCED FILTERS */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search burgers, bowls, drinks, snacks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
              />
            </div>

            {/* Quick Filter Checkboxes */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <button
                type="button"
                onClick={() => setFilterVegOnly(!filterVegOnly)}
                className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition cursor-pointer font-medium ${
                  filterVegOnly
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                Veg Only
              </button>

              <button
                type="button"
                onClick={() => setFilterPopularOnly(!filterPopularOnly)}
                className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition cursor-pointer font-medium ${
                  filterPopularOnly
                    ? 'bg-amber-50 border-amber-300 text-amber-800 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                Bestsellers
              </button>

              <button
                type="button"
                onClick={() => setFilterFastPrepOnly(!filterFastPrepOnly)}
                className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition cursor-pointer font-medium ${
                  filterFastPrepOnly
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-800 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                Fast Prep (&lt;5m)
              </button>

              <button
                type="button"
                onClick={() => setFilterAvailableOnly(!filterAvailableOnly)}
                className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition cursor-pointer font-medium ${
                  filterAvailableOnly
                    ? 'bg-slate-800 border-slate-800 text-white font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                In Stock Only
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-600 text-white shadow-sm shadow-amber-200'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* MENU ITEMS GRID */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">
              {selectedCategory === 'All' ? 'All Canteen Menu Items' : selectedCategory} (
              {filteredItems.length})
            </h2>
            <span className="text-xs text-slate-500">
              Prices in USD • Freshly prepared on order
            </span>
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8">
              <Search className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">No items match your filters</h3>
              <p className="text-xs text-slate-400 mt-1">Try resetting search keywords or category filters.</p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                  setFilterVegOnly(false);
                  setFilterPopularOnly(false);
                  setFilterFastPrepOnly(false);
                  setFilterAvailableOnly(false);
                }}
                className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredItems.map((item) => {
                const isUnavailable =
                  item.status === 'Sold Out' || item.status === 'Temporarily Unavailable';

                return (
                  <div
                    key={item.item_id}
                    className={`bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group ${
                      isUnavailable ? 'opacity-75 grayscale-20' : ''
                    }`}
                  >
                    {/* Image & Badges */}
                    <div
                      className="relative h-44 bg-slate-100 cursor-pointer overflow-hidden"
                      onClick={() => setSelectedItemForModal(item)}
                    >
                      <img
                        src={item.image}
                        alt={item.item_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                        {item.is_popular && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                            Popular
                          </span>
                        )}
                        {item.is_veg && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
                            <Leaf className="w-3 h-3" /> Veg
                          </span>
                        )}
                      </div>

                      {/* Availability Pill */}
                      <div className="absolute top-2.5 right-2.5">
                        {item.status === 'Sold Out' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white shadow-xs">
                            Sold Out
                          </span>
                        )}
                        {item.status === 'Limited' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                            {item.available_quantity} left
                          </span>
                        )}
                      </div>

                      {/* Prep time badge bottom */}
                      <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>~{item.preparation_time}m</span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3
                            onClick={() => setSelectedItemForModal(item)}
                            className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition cursor-pointer leading-snug"
                          >
                            {item.item_name}
                          </h3>
                        </div>

                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-lg font-black text-slate-900">
                            ${item.price.toFixed(2)}
                          </span>
                        </div>

                        <button
                          type="button"
                          disabled={isUnavailable}
                          onClick={() => setSelectedItemForModal(item)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                            isUnavailable
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-200'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Pre-Order
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Cart Bar for Quick Access */}
      {totalItemsCount > 0 && (
        <div className="fixed bottom-4 inset-x-4 max-w-lg mx-auto z-30 animate-in slide-in-from-bottom duration-300">
          <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl flex items-center justify-between border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  {totalItemsCount} Item{totalItemsCount > 1 ? 's' : ''} in Pre-Order Cart
                </p>
                <p className="text-[11px] text-amber-400 font-extrabold font-mono">
                  Total: ${total.toFixed(2)}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              Checkout &amp; Get Token
            </button>
          </div>
        </div>
      )}

      {/* Item Modal & Cart Drawer */}
      <ItemDetailModal
        item={selectedItemForModal}
        onClose={() => setSelectedItemForModal(null)}
      />
      <CartDrawer />
    </div>
  );
};
