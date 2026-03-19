import React, { useState } from 'react';
import '../styles/underwriter.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'assignment',
      title: 'New Case Assigned',
      message: 'Case #UC-9842 (John Harrison) has been assigned to you for review.',
      time: '2 mins ago',
      unread: true
    },
    {
      id: 2,
      type: 'alert',
      title: 'Urgent: High Risk Score',
      message: 'Case #UC-8821 triggered a high-risk alert (Score: 88). Immediate attention required.',
      time: '1 hour ago',
      unread: true
    },
    {
      id: 3,
      type: 'update',
      title: 'Rating Rule Updated',
      message: 'The "BMI Threshold" rating rule has been updated by the Admin.',
      time: '3 hours ago',
      unread: false
    },
    {
      id: 4,
      type: 'system',
      title: 'System Maintenance',
      message: 'The underwriting portal will be down for maintenance at 12:00 AM UTC.',
      time: '1 day ago',
      unread: false
    }
  ]);

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, unread: false } : n
    ));
  };

  const clearNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <h2>Notifications</h2>
          <p>Stay updated with your latest underwriting tasks</p>
        </div>
        <button 
          className="mark-all-btn"
          onClick={() => setNotifications(notifications.map(n => ({ ...n, unread: false })))}
        >
          Mark all as read
        </button>
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-state">No new notifications</div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className={`notification-item ${n.unread ? 'unread' : ''}`}>
              <div className={`icon-circle ${n.type}`}>
                {n.type === 'assignment' && '📋'}
                {n.type === 'alert' && '⚠️'}
                {n.type === 'update' && '⚙️'}
                {n.type === 'system' && 'ℹ️'}
              </div>
              
              <div className="notification-content">
                <div className="notification-title-row">
                  <h4>{n.title}</h4>
                  <span className="time-stamp">{n.time}</span>
                </div>
                <p>{n.message}</p>
                <div className="notification-actions">
                  {n.unread && (
                    <button onClick={() => markAsRead(n.id)} className="action-link">
                      Mark as read
                    </button>
                  )}
                  <button onClick={() => clearNotification(n.id)} className="action-link delete">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;