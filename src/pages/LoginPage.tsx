import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../services/db';
import { UserRole } from '../types';
import {
  UtensilsCrossed,
  KeyRound,
  Mail,
  Shield,
  ChefHat,
  BarChart3,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [studentId, setStudentId] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Quick Demo Logins
  const DEMO_ACCOUNTS = [
    {
      role: 'customer' as UserRole,
      title: 'Customer (Student)',
      name: 'Alex Morgan',
      email: 'student@canteen.edu',
      desc: 'Browse menu, order food, receive digital token & track live status',
      icon: UserCheck,
      color: 'emerald',
    },
    {
      role: 'staff' as UserRole,
      title: 'Kitchen Staff',
      name: 'Chef Marco Bellini',
      email: 'kitchen@canteen.edu',
      desc: 'Smart kitchen queue, prepare orders, verify tokens & prevent double collection',
      icon: ChefHat,
      color: 'amber',
    },
    {
      role: 'manager' as UserRole,
      title: 'Canteen Manager',
      name: 'Sarah Jenkins',
      email: 'manager@canteen.edu',
      desc: 'Menu pricing, inventory control, AI demand forecasts & Recharts analytics',
      icon: BarChart3,
      color: 'blue',
    },
    {
      role: 'admin' as UserRole,
      title: 'Administrator',
      name: 'Devin Vance',
      email: 'admin@canteen.edu',
      desc: 'User permissions, role assignments, canteen settings & system audit logs',
      icon: Shield,
      color: 'purple',
    },
  ];

  const handleQuickLogin = (demoEmail: string, demoRole: UserRole) => {
    setErrorMessage(null);
    const res = login(demoEmail);
    if (res.success) {
      if (demoRole === 'customer') navigate('/menu');
      else if (demoRole === 'staff') navigate('/kitchen');
      else if (demoRole === 'manager') navigate('/manager');
      else if (demoRole === 'admin') navigate('/admin');
    } else {
      setErrorMessage(res.error || 'Login failed.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (isRegister) {
      if (!name.trim() || !email.trim()) {
        setErrorMessage('Please fill in your name and email.');
        return;
      }

      const res = registerUser({
        user_id: `usr_${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: role,
        account_status: 'active',
        student_or_emp_id: studentId.trim() || 'STU-9999',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Registration failed.');
      } else {
        setSuccessMessage('Account created successfully! Logging you in...');
        setTimeout(() => {
          login(email.trim());
          navigate('/menu');
        }, 600);
      }
    } else {
      const res = login(email);
      if (res.success) {
        navigate('/menu');
      } else {
        setErrorMessage(res.error || 'Authentication error.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950/40 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        {/* App Title Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-xl shadow-amber-500/20 mb-2">
            <UtensilsCrossed className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Smart Canteen System
          </h1>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            AI-driven Pre-Order, Smart Kitchen Queue &amp; Token Collection for Campus &amp; Workplace Dining.
          </p>
        </div>

        {/* Demo Credentials Box (Requirement: one account per role displayed clearly) */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Hackathon Demo Credentials (1-Click Instant Login)
              </h2>
            </div>
            <span className="text-[11px] text-amber-400 font-semibold">
              Select any role to test live end-to-end
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4">
            {DEMO_ACCOUNTS.map((acc) => {
              const Icon = acc.icon;
              return (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleQuickLogin(acc.email, acc.role)}
                  className="p-4 bg-slate-900/80 hover:bg-slate-900 border border-slate-700/80 hover:border-amber-500/80 rounded-2xl text-left transition-all group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-xl bg-slate-800 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold uppercase">
                        {acc.role}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition">
                      {acc.title}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-300 mt-0.5">{acc.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">{acc.email}</p>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{acc.desc}</p>
                  </div>

                  <div className="mt-4 pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-amber-400 font-semibold group-hover:translate-x-1 transition-transform">
                    <span>Log in as {acc.role}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Login / Register Form */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-3xl p-6 sm:p-8 max-w-lg mx-auto shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">
              {isRegister ? 'Create New Account' : 'Sign In with Credentials'}
            </h3>
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 cursor-pointer"
            >
              {isRegister ? 'Already have an account? Sign In' : 'Need an account? Register'}
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3.5 bg-red-900/40 border border-red-500/60 rounded-xl text-xs text-red-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3.5 bg-emerald-900/40 border border-emerald-500/60 rounded-xl text-xs text-emerald-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full text-xs px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="customer">Customer</option>
                      <option value="staff">Canteen Staff</option>
                      <option value="manager">Canteen Manager</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Student/Staff ID</label>
                    <input
                      type="text"
                      placeholder="e.g. STU-1029"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@canteen.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-600/30 transition cursor-pointer"
            >
              {isRegister ? 'Register & Continue' : 'Sign In to Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
