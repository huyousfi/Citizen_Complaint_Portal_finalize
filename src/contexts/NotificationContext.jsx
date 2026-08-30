import { createContext, useState, useCallback } from 'react'

export const NotificationContext = createContext()

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const addNotification = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now()
    const notification = { id, message, type }

    setNotifications((prev) => [...prev, notification])

    if (duration > 0) {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
      }, duration)
    }

    return id
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const success = useCallback((message, duration) => addNotification(message, 'success', duration), [addNotification])
  const error = useCallback((message, duration) => addNotification(message, 'error', duration), [addNotification])
  const info = useCallback((message, duration) => addNotification(message, 'info', duration), [addNotification])
  const warning = useCallback((message, duration) => addNotification(message, 'warning', duration), [addNotification])

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, success, error, info, warning }}>
      {children}
    </NotificationContext.Provider>
  )
}
