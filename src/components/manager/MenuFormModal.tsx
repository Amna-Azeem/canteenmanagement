import React, { useState, useEffect } from 'react';
import { MenuItem, MenuItemCategory, MenuItemStatus } from '../../types';
import { saveMenuItem } from '../../services/db';
import { useNotifications } from '../../context/NotificationContext';
import { X, Check } from 'lucide-react';

interface MenuFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editItem?: MenuItem | null;
  onSaved: () => void;
}

const CATEGORIES: MenuItemCategory[] = ['Burgers', 'Meals', 'Drinks', 'Snacks', 'Desserts'];
const STATUSES: MenuItemStatus[] = ['Available', 'Limited', 'Sold Out', 'Temporarily Unavailable'];

export const MenuFormModal: React.FC<MenuFormModalProps> = ({
  isOpen,
  onClose,
  editItem,
  onSaved,
}) => {
  const { showToast } = useNotifications();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<MenuItemCategory>('Burgers');
  const [price, setPrice] = useState<number>(6.99);
  const [prepTime, setPrepTime] = useState<number>(6);
  const [quantity, setQuantity] = useState<number>(25);
  const [status, setStatus] = useState<MenuItemStatus>('Available');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState<number>(450);
  const [isVeg, setIsVeg] = useState(false);
  const [isPopular, setIsPopular] = useState(false);

  useEffect(() => {
    if (editItem) {
      setName(editItem.item_name);
      setCategory(editItem.category);
      setPrice(editItem.price);
      setPrepTime(editItem.preparation_time);
      setQuantity(editItem.available_quantity);
      setStatus(editItem.status);
      setImage(editItem.image);
      setDescription(editItem.description);
      setCalories(editItem.calories || 400);
      setIsVeg(!!editItem.is_veg);
      setIsPopular(!!editItem.is_popular);
    } else {
      setName('');
      setCategory('Burgers');
      setPrice(6.99);
      setPrepTime(6);
      setQuantity(25);
      setStatus('Available');
      setImage(
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80'
      );
      setDescription('Freshly prepared with quality ingredients daily.');
      setCalories(450);
      setIsVeg(false);
      setIsPopular(false);
    }
  }, [editItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('error', 'Validation Error', 'Item name is required.');
      return;
    }

    const itemToSave: MenuItem = {
      item_id: editItem ? editItem.item_id : `item_${Date.now()}`,
      item_name: name.trim(),
      category,
      price: Number(price),
      preparation_time: Number(prepTime),
      available_quantity: Number(quantity),
      status,
      image:
        image.trim() ||
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      description: description.trim(),
      calories: Number(calories),
      is_veg: isVeg,
      is_popular: isPopular,
    };

    saveMenuItem(itemToSave);
    showToast(
      'success',
      'Menu Updated',
      `"${itemToSave.item_name}" saved successfully.`
    );
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <h3 className="text-base font-bold">
            {editItem ? `Edit Menu Item: ${editItem.item_name}` : 'Add New Menu Item'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Item Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Crispy Chicken Burger"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MenuItemCategory)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price, Prep Time, Stock */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.5"
                required
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Prep Time (mins)</label>
              <input
                type="number"
                min="1"
                max="60"
                required
                value={prepTime}
                onChange={(e) => setPrepTime(parseInt(e.target.value, 10) || 1)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Stock Quantity</label>
              <input
                type="number"
                min="0"
                max="500"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Status & Calories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status Override</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MenuItemStatus)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Calories (kcal)</label>
              <input
                type="number"
                min="0"
                value={calories}
                onChange={(e) => setCalories(parseInt(e.target.value, 10) || 0)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Food Image URL</label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ingredients, taste profile, and serving notes..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isVeg}
                onChange={(e) => setIsVeg(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              Vegetarian Item
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
              />
              Mark as Popular / Bestseller
            </label>
          </div>

          {/* Submit CTAs */}
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              {editItem ? 'Save Changes' : 'Create Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
