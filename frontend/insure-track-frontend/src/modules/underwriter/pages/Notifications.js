import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getUserNotifications, markNotificationRead, dismissNotification } from '../../../core/services/api.js';
import '../styles/underwriter.css';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.userId;

    const unreadCount = useMemo(() => {
        return notifications.filter(n => n.status === 'UNREAD').length;
    }, [notifications]);

    const fetchNotifications = useCallback(async () => {
        if (!userId) return;
        try {
            const response = await getUserNotifications(userId);
            setNotifications(response.data || response);
        } catch (error) {
            console.error("Error fetching notifications", error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleMarkAsRead = async (id) => {
        try {
            await markNotificationRead(id);
            setNotifications(prev => prev.map(n => 
                n.notificationId === id ? { ...n, status: 'READ' } : n
            ));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const handleDismiss = async (id) => {
        try {
            await dismissNotification(id);
            setNotifications(prev => prev.map(n => 
                n.notificationId === id ? { ...n, status: 'DISMISSED' } : n
            ));
        } catch (error) {
            console.error("Failed to dismiss", error);
        }
    };

    const sortedNotifications = useMemo(() => {
        return [...notifications].sort((a, b) => {
            if (a.status === 'DISMISSED' && b.status !== 'DISMISSED') return 1;
            if (a.status !== 'DISMISSED' && b.status === 'DISMISSED') return -1;
            return new Date(b.createdDate) - new Date(a.createdDate);
        });
    }, [notifications]);

    const getCategoryDetails = (category) => {
        switch (category) {
            case 'UNDERWRITING': return { icon: '📝', class: 'underwriting' };
            case 'BILLING':      return { icon: '💰', class: 'billing' };
            case 'CLAIM':        return { icon: '📋', class: 'claim' };
            case 'RENEWAL':      return { icon: '🔄', class: 'renewal' };
            case 'POLICY':       return { icon: '📄', class: 'policy' };
            default:             return { icon: 'ℹ️', class: 'system' };
        }
    };

    if (loading) return <div className="loader">Loading updates...</div>;

    return (
        <div className="notifications-page">
            <div className="notifications-header">
                <div className="title-row">
                    <h2>Notifications</h2>
                    {unreadCount > 0 && (
                        <span className="unread-count-badge">{unreadCount}</span>
                    )}
                </div>
                <p>Stay updated with your latest underwriting tasks</p>
            </div>

            <div className="notifications-list">
                {sortedNotifications.length === 0 ? (
                    <div className="empty-state">No notifications found</div>
                ) : (
                    sortedNotifications.map((n) => {
                        const details = getCategoryDetails(n.category);
                        const isUnread = n.status === 'UNREAD';
                        const isDismissed = n.status === 'DISMISSED';

                        return (
                            <div 
                                key={n.notificationId} 
                                className={`notification-item ${isUnread ? 'unread' : ''} ${isDismissed ? 'dismissed' : ''}`}
                            >
                                <div className={`icon-circle ${details.class}`}>
                                    {details.icon}
                                </div>
                                
                                <div className="notification-content">
                                    <div className="notification-title-row">
                                        <h4>{n.category}</h4>
                                        <span className="time-stamp">
                                            {new Date(n.createdDate).toLocaleString()}
                                        </span>
                                    </div>
                                    <p>{n.message}</p>
                                    
                                    <div className="notification-actions">
                                        {isUnread && (
                                            <button 
                                                onClick={() => handleMarkAsRead(n.notificationId)} 
                                                className="action-link"
                                            >
                                                Mark as read
                                            </button>
                                        )}
                                        
                                        {!isDismissed ? (
                                            <button 
                                                onClick={() => handleDismiss(n.notificationId)} 
                                                className="action-link delete"
                                            >
                                                Dismiss
                                            </button>
                                        ) : (
                                            <span className="archived-tag">Archived</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Notifications;