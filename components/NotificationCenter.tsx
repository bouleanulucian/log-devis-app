import React from 'react';
import { Bell, Check, X } from 'lucide-react';
import { Notification } from '../types/extended';
import { NotificationService } from '../services/notificationService';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';

interface NotificationCenterProps {
    notifications: Notification[];
    onMarkAsRead: (id: string) => void;
    onClearAll: () => void;
    onNavigate?: (quoteId: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
    notifications,
    onMarkAsRead,
    onClearAll,
    onNavigate
}) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const unreadCount = NotificationService.getUnreadCount(notifications);
    const recentNotifications = NotificationService.getRecent(notifications, 10);

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'expiry-warning':
                return '⏰';
            case 'approval-request':
                return '📋';
            case 'status-change':
                return '🔄';
            case 'quote-accepted':
                return '✅';
            case 'quote-rejected':
                return '❌';
            case 'payment-due':
                return '💰';
            default:
                return '📢';
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read) {
            onMarkAsRead(notification.id);
        }
        if (notification.quoteId && onNavigate) {
            onNavigate(notification.quoteId);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative">
            {/* Bell Icon Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <Bell className="w-5 h-5 text-gray-700" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-12 w-96 bg-white shadow-lg rounded-lg border border-gray-200 z-20 max-h-[500px] flex flex-col">
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">
                                Notificări {unreadCount > 0 && `(${unreadCount})`}
                            </h3>
                            {notifications.length > 0 && (
                                <button
                                    onClick={onClearAll}
                                    className="text-sm text-gray-500 hover:text-gray-700"
                                >
                                    Șterge toate
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="overflow-y-auto flex-1">
                            {recentNotifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                    <p>Nicio notificare</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {recentNotifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`p-4 cursor-pointer transition-colors ${notification.read
                                                    ? 'bg-white hover:bg-gray-50'
                                                    : 'bg-blue-50 hover:bg-blue-100'
                                                }`}
                                        >
                                            <div className="flex gap-3">
                                                <div className="text-2xl flex-shrink-0">
                                                    {getNotificationIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                        <h4 className="font-medium text-sm text-gray-900">
                                                            {notification.title}
                                                        </h4>
                                                        {!notification.read && (
                                                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-2">
                                                        {formatDistanceToNow(new Date(notification.timestamp), {
                                                            addSuffix: true,
                                                            locale: ro
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
