import { useContext } from 'react'
import { NotificationContext } from '../contexts/NotificationContext'

export default function NotificationCenter() {
  const { notifications, removeNotification } = useContext(NotificationContext)

  return (
    <div className="notification-center">
      {notifications.map((notification) => (
        <div key={notification.id} className={`notification notification-${notification.type}`}>
          <div className="notification-content">
            <span className="notification-icon">
              {notification.type === 'success' && '✓'}
              {notification.type === 'error' && '✕'}
              {notification.type === 'warning' && '⚠'}
              {notification.type === 'info' && 'ℹ'}
            </span>
            <span className="notification-message">{notification.message}</span>
          </div>
          <button className="notification-close" onClick={() => removeNotification(notification.id)} type="button">
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
