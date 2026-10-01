import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { getUsers, registerUser, setUserRole, setUserStatus } from '../../services/db';
import { useNotifications } from '../../context/NotificationContext';
import { X, UserPlus, Shield, CheckCircle, Ban } from 'lucide-react';

interface StaffManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export const StaffManagementModal: React.FC<StaffManagementModalProps> = ({
  isOpen,
  onClose,
  onUpdated,
}) => {
  const { showToast } = useNotifications();
  const [users, setUsers] = useState<User[]>(() => getUsers());
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New staff form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('staff');
  const [newId, setNewId] = useState('');

  if (!isOpen) return null;

  const refreshList = () => {
    setUsers(getUsers());
    onUpdated();
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      showToast('error', 'Validation Error', 'Name and email are required.');
      return;
    }

    const newUser: User = {
      user_id: `usr_${newRole}_${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      role: newRole,
      account_status: 'active',
      student_or_emp_id: newId.trim() || `EMP-${Math.floor(100 + Math.random() * 900)}`,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
    };

    const res = registerUser(newUser);
    if (res.success) {
      showToast('success', 'Staff Member Added', `${newName} added with role: ${newRole}`);
      setIsAddingNew(false);
      setNewName('');
      setNewEmail('');
      setNewId('');
      refreshList();
    } else {
      showToast('error', 'Error Adding Staff', res.error || 'User creation failed.');
    }
  };

  const handleStatusToggle = (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    setUserStatus(userId, nextStatus);
    showToast('info', 'Status Changed', `User status updated to ${nextStatus}.`);
    refreshList();
  };

  const handleRoleChange = (userId: string, nextRole: UserRole) => {
    setUserRole(userId, nextRole);
    showToast('info', 'Role Changed', `Role updated to ${nextRole}.`);
    refreshList();
  };

  const staffAndManagerUsers = users.filter((u) => u.role === 'staff' || u.role === 'manager');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500 text-slate-950 rounded-xl font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Kitchen &amp; Operations Staff</h3>
              <p className="text-xs text-slate-400">Manage shift personnel, permissions &amp; access status</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Header Action: Add Staff */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Active Crew ({staffAndManagerUsers.length})
            </span>
            <button
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              {isAddingNew ? 'Close Form' : 'Add New Staff Member'}
            </button>
          </div>

          {/* New Staff Form */}
          {isAddingNew && (
            <form
              onSubmit={handleCreateStaff}
              className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3"
            >
              <h4 className="text-xs font-bold text-slate-900">New Staff Credentials</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Full Name (e.g. Elena Rostova)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <input
                  type="email"
                  required
                  placeholder="Email (e.g. elena@canteen.edu)"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Staff ID (e.g. STF-302)"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  className="text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="staff">Role: Canteen Staff</option>
                  <option value="manager">Role: Canteen Manager</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 cursor-pointer"
                >
                  Register Staff Account
                </button>
              </div>
            </form>
          )}

          {/* Staff List Table */}
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
            {staffAndManagerUsers.map((u) => (
              <div
                key={u.user_id}
                className="p-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{u.name}</h4>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase font-bold ${
                          u.role === 'manager'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{u.email}</p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ID: {u.student_or_emp_id || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.user_id, e.target.value as UserRole)}
                    className="text-[11px] py-1 px-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="staff">Staff</option>
                    <option value="manager">Manager</option>
                  </select>

                  <button
                    onClick={() => handleStatusToggle(u.user_id, u.account_status)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition ${
                      u.account_status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                    }`}
                  >
                    {u.account_status === 'active' ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" /> Active
                      </>
                    ) : (
                      <>
                        <Ban className="w-3.5 h-3.5" /> Suspended
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
