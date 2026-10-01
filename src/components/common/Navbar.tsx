import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useNotifications } from '../../context/NotificationContext';
import { UserRole } from '../../types';
import {
  UtensilsCrossed,
  ShoppingBag,
  Bell,
  LogOut,
  ChevronDown,
  Clock,
  History,
  ChefHat,
  BarChart3,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, logout, switchDemoRole, isCustomer, isStaff, isManager, isAdmin } = useAuth();
  const { totalItemsCount, setIsCartOpen } = useCart();
  const { unreadCount, setIsDrawerOpen } = useNotifications();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleRoleSwitch = (role: UserRole) => {
    switchDemoRole(role);
    setRoleDropdownOpen(false);
    if (role === 'customer') navigate('/menu');
    else if (role === 'staff') navigate('/kitchen');
    else if (role === 'manager') navigate('/manager');
    else if (role === 'admin') navigate('/admin');
  };

  const getRoleBadgeColor = (role?: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'manager':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'staff':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-sm shadow-amber-200">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight text-lg block leading-none">
                Smart Canteen
              </span>
              <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider block mt-0.5">
                Pre-Order &amp; Queue System
              </span>
            </div>
          </div>

          {/* Navigation Links (Strictly filtered by role - zero duplicates) */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {isCustomer && (
              <>
                <NavLink
                  to="/menu"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-amber-50 text-amber-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  Menu &amp; Pre-Order
                </NavLink>

                <NavLink
                  to="/track"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-amber-50 text-amber-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  <Clock className="w-4 h-4" />
                  Track Order
                </NavLink>

                <NavLink
                  to="/history"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-amber-50 text-amber-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  <History className="w-4 h-4" />
                  Order History &amp; Reorder
                </NavLink>
              </>
            )}

            {isStaff && (
              <NavLink
                to="/kitchen"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-amber-50 text-amber-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <ChefHat className="w-4 h-4" />
                Live Kitchen Queue &amp; Collection
              </NavLink>
            )}

            {isManager && (
              <NavLink
                to="/manager"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-amber-50 text-amber-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <BarChart3 className="w-4 h-4" />
                Manager Insights &amp; Menu Control
              </NavLink>
            )}

            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-amber-50 text-amber-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <ShieldCheck className="w-4 h-4" />
                System Administration &amp; Logs
              </NavLink>
            )}
          </nav>

          {/* Right Action Icons & Persona Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Demo Role Switcher Quick Pill (Crucial for Hackathon presentation) */}
            <div className="relative">
              <button
                onClick={() => {
                  setRoleDropdownOpen(!roleDropdownOpen);
                  setProfileDropdownOpen(false);
                }}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition cursor-pointer"
                title="Switch active role demo"
              >
                <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>Role:</span>
                <span
                  className={`capitalize font-bold px-1.5 py-0.5 rounded text-[11px] border ${getRoleBadgeColor(
                    currentUser?.role
                  )}`}
                >
                  {currentUser?.role || 'Guest'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-sm">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold uppercase text-slate-400">
                    Switch Demo Persona
                  </div>
                  <button
                    onClick={() => handleRoleSwitch('customer')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between text-slate-700 cursor-pointer"
                  >
                    <span className="font-medium">Customer (Student)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Alex
                    </span>
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('staff')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between text-slate-700 cursor-pointer"
                  >
                    <span className="font-medium">Kitchen Staff</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                      Marco
                    </span>
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('manager')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between text-slate-700 cursor-pointer"
                  >
                    <span className="font-medium">Canteen Manager</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                      Sarah
                    </span>
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('admin')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between text-slate-700 cursor-pointer"
                  >
                    <span className="font-medium">Administrator</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                      Devin
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Cart Button (Only for Customer) */}
            {isCustomer && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title="View cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-scale">
                    {totalItemsCount}
                  </span>
                )}
              </button>
            )}

            {/* Notification Bell */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Profile & Logout */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setRoleDropdownOpen(false);
                }}
                className="flex items-center gap-2 p-1 pl-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <img
                  src={
                    currentUser?.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80'
                  }
                  alt={currentUser?.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200"
                />
                <span className="hidden lg:block text-xs font-semibold text-slate-700 max-w-[100px] truncate">
                  {currentUser?.name || 'User'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {currentUser?.name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                      ID: {currentUser?.student_or_emp_id || 'ID-000'}
                    </p>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                        navigate('/login');
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
