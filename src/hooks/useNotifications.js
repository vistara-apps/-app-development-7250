import { useState, useEffect } from 'react';

export function useNotifications() {
  const [permission, setPermission] = useState(Notification.permission);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('Notification' in window);
  }, []);

  const requestPermission = async () => {
    if (!isSupported) return false;
    
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const showNotification = (title, options = {}) => {
    if (permission !== 'granted' || !isSupported) return null;

    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    });

    return notification;
  };

  const scheduleReminder = (reminder) => {
    if (permission !== 'granted') return;

    // Calculate time until reminder
    const now = new Date();
    const [hours, minutes] = reminder.time.split(':');
    const reminderTime = new Date();
    reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // If time has passed today, schedule for tomorrow
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const timeUntilReminder = reminderTime.getTime() - now.getTime();

    if (timeUntilReminder > 0) {
      setTimeout(() => {
        showNotification(`HealthSync Reminder: ${reminder.details}`, {
          body: `Time to ${reminder.type === 'medication' ? 'take your medication' : 'attend your appointment'}`,
          tag: `reminder-${reminder.reminderId}`,
          requireInteraction: true
        });
      }, timeUntilReminder);
    }
  };

  return {
    permission,
    isSupported,
    requestPermission,
    showNotification,
    scheduleReminder
  };
}
