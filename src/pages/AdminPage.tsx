import React, { useState, useEffect } from 'react';
import {
  getUsers,
  setUserRole,
  setUserStatus,
  getSystemLogs,
  getSystemSettings,
  saveSystemSettings,
  subscribeDb,
  addSystemLog,
} from '../services/db';
import { SystemLog, SystemSettings, User, UserRole } from '../types';
import { useNotifications } from '../context/NotificationContext';
import {
  Shield,
  Users,
  Building,
  Activity,
  CheckCircle2,
  Ban,
  Search,
  Sliders,
  AlertTriangle,
  Info,
  Save,
  Tag,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { showToast } = useNotifications();

  const [users, setUsers] = useState<User[]>(() => getUsers());
  const [logs, setLogs] = useState<SystemLog[]>(() => getSystemLogs());
  const [settings, setSettings] = useState<SystemSettings>(() => getSystemSettings());

  // Search & Filters
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'All' | UserRole>('All');
  const [logLevelFilter, setLogLevelFilter] = useState<'All' | 'info' | 'warn' | 'error'>('All');
  const [logSearch, setLogSearch] = useState('');

  // Settings form
  const [canteenName, setCanteenName] = useState(settings.canteen_name);
  const [isOpen, setIsOpen] = useState(settings.canteen_is_open);
  const [prepMultiplier, setPrepMultiplier] = useState(settings.avg_prep_multiplier);

  // Categories list
  const [categories, setCategories] = useState<string[]>([
    'Burgers',
    'Meals',
    'Drinks',
    'Snacks',
    'Desserts',
  ]);
  const [newCatName, setNewCatName] = useState('');

  const refreshData = () => {
    setUsers(getUsers());
    setLogs(getSystemLogs());
    const s = getSystemSettings();
    setSettings(s);
    setCanteenName(s.canteen_name);
    setIsOpen(s.canteen_is_open);
    setPrepMultiplier(s.avg_prep_multiplier);
  };

  useEffect(() => {
    refreshData();
    const unsub = subscribeDb(refreshData);
    return unsub;
  }, []);

  const handleRoleChange = (userId: string, role: UserRole) => {
    setUserRole(userId, role);
    showToast('success', 'Role Updated', `User role modified to ${role}.`);
  };

  const handleStatusToggle = (userId: string, curStatus: string) => {
    const nextStatus = curStatus === 'active' ? 'suspended' : 'active';
    setUserStatus(userId, nextStatus);
    showToast(
      nextStatus === 'suspended' ? 'warning' : 'success',
      'Account Status Changed',
      `Account has been ${nextStatus}.`
    );
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SystemSettings = {
      ...settings,
      canteen_name: canteenName.trim(),
      canteen_is_open: isOpen,
      avg_prep_multiplier: prepMultiplier,
    };
    saveSystemSettings(updated);
    addSystemLog('info', 'ADMIN_SETTINGS', `Global canteen operational settings updated.`);
    showToast('success', 'Settings Saved', 'System configurations updated.');
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    if (categories.includes(newCatName.trim())) {
      showToast('warning', 'Duplicate', 'Category already exists.');
      return;
    }
    setCategories([...categories, newCatName.trim()]);
    setNewCatName('');
    addSystemLog('info', 'CATEGORY_MANAGER', `Added food category: ${newCatName.trim()}`);
    showToast('success', 'Category Added', `Category "${newCatName.trim()}" added.`);
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    if (userRoleFilter !== 'All' && u.role !== userRoleFilter) return false;
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchId = u.student_or_emp_id?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchId) return false;
    }
    return true;
  });

  // Filtered logs
  const filteredLogs = logs.filter((l) => {
    if (logLevelFilter !== 'All' && l.level !== logLevelFilter) return false;
    if (logSearch.trim()) {
      const q = logSearch.toLowerCase();
      const matchMsg = l.message.toLowerCase().includes(q);
      const matchMod = l.module.toLowerCase().includes(q);
      if (!matchMsg && !matchMod) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-100/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full mb-1">
              <Shield className="w-3.5 h-3.5" />
              <span>System Administrator Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              System Governance &amp; Audit Logs
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Control user accounts, suspend abusers, configure global canteen settings &amp; inspect logs.
            </p>
          </div>
        </div>

        {/* ROW 1: Global Canteen Settings & Category Management */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Canteen Settings */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Building className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900">Canteen Facility Settings</h3>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Canteen Facility Name</label>
                <input
                  type="text"
                  value={canteenName}
                  onChange={(e) => setCanteenName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="font-bold text-slate-800 block">Canteen Pre-Order Open Status</span>
                  <span className="text-[10px] text-slate-400">
                    If closed, customers cannot place new pre-orders
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOpen}
                    onChange={(e) => setIsOpen(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kitchen Workload Prep Multiplier
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="3.0"
                  value={prepMultiplier}
                  onChange={(e) => setPrepMultiplier(parseFloat(e.target.value) || 1.0)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium font-mono"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" /> Save Global Facility Settings
              </button>
            </form>
          </div>

          {/* Categories Management */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Tag className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900">Food Menu Categories</h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 text-xs font-semibold"
                >
                  {cat}
                </span>
              ))}
            </div>

            <form onSubmit={handleAddCategory} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="New category (e.g. Smoothies)..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Add Category
              </button>
            </form>
          </div>
        </div>

        {/* ROW 2: USER MANAGEMENT (View, Change Role, Suspend/Activate) */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">User Accounts &amp; Access Control</h3>
              </div>
              <p className="text-xs text-slate-500">
                Grant roles, audit permissions &amp; suspend unauthorized accounts
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search user..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value as any)}
                className="text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="All">All Roles</option>
                <option value="customer">Customer</option>
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Identifier</th>
                  <th className="py-3 px-4">Role Assignment</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Access Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.user_id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{u.name}</span>
                          <span className="text-[11px] text-slate-400">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {u.student_or_emp_id || 'ID-000'}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.user_id, e.target.value as UserRole)}
                        className="text-xs py-1 px-2 border border-slate-200 rounded-lg bg-white font-medium"
                      >
                        <option value="customer">Customer</option>
                        <option value="staff">Canteen Staff</option>
                        <option value="manager">Canteen Manager</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.account_status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {u.account_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleStatusToggle(u.user_id, u.account_status)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          u.account_status === 'active'
                            ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        {u.account_status === 'active' ? 'Suspend Account' : 'Activate Account'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ROW 3: SYSTEM AUDIT & SECURITY LOGS */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">System Logs &amp; Audit Trail</h3>
              </div>
              <p className="text-xs text-slate-500">Security events, queue events &amp; auto-triggers</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search message or module..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
              />

              <select
                value={logLevelFilter}
                onChange={(e) => setLogLevelFilter(e.target.value as any)}
                className="text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="All">All Severity Levels</option>
                <option value="info">Info</option>
                <option value="warn">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {filteredLogs.map((l) => (
              <div
                key={l.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={`mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                      l.level === 'warn'
                        ? 'bg-amber-100 text-amber-800'
                        : l.level === 'error'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {l.level}
                  </span>
                  <div>
                    <span className="font-mono text-slate-500 font-semibold">[{l.module}]</span>{' '}
                    <span className="text-slate-800">{l.message}</span>
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                  {new Date(l.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
