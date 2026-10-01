import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, CheckCheck, Clock, AlertTriangle, CheckCircle, X, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotificationDrawer: React.FC = () => {
  const { notifications, unreadCount, isDrawerOpen, setIsDrawerOpen, markAsRead, markAllAsRead } =
    useNotifications();
  const navigate = useNavigate();

  if (!isDrawerOpen) return null;

  const handleNotificationClick = (notif: typeof notifications[0]) => {
    markAsRead(notif.id);
    if (notif.order_id) {
      setIsDrawerOpen(false);
      navigate(`/track?orderId=${notif.order_id}`);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ready':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'delay':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'order':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold">Notifications</h2>
                <p className="text-xs text-slate-300">
                  {unreadCount > 0 ? `${unreadCount} unread update(s)` : 'All caught up'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Read all
                </button>
              )}
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {notifications.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No notifications yet</p>
                <p className="text-xs text-slate-400 mt-1">Updates on your food and queue will appear here.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    !notif.read
                      ? 'bg-amber-50/70 border-amber-200 hover:bg-amber-100/60'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">{getIcon(notif.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-semibold text-slate-900 truncate">
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {new Date(notif.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                      {notif.token_number && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 rounded text-[11px] font-mono font-medium text-slate-700">
                          Token: {notif.token_number}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
