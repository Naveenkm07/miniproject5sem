// Reminders and notifications utilities

/**
 * Get "On This Day" memories from previous years
 */
export const getOnThisDayMemories = (memories) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentDate = today.getDate();

  return memories.filter(memory => {
    const memoryDate = new Date(memory.dateCreated);
    const memoryYear = memoryDate.getFullYear();
    const currentYear = today.getFullYear();
    
    // Same month and date, but different year
    return memoryDate.getMonth() === currentMonth &&
           memoryDate.getDate() === currentDate &&
           memoryYear < currentYear;
  }).map(memory => ({
    ...memory,
    yearsAgo: today.getFullYear() - new Date(memory.dateCreated).getFullYear()
  })).sort((a, b) => b.yearsAgo - a.yearsAgo);
};

/**
 * Get upcoming anniversaries (memories from past years approaching their anniversary)
 */
export const getUpcomingAnniversaries = (memories, daysAhead = 7) => {
  const today = new Date();
  const upcoming = [];

  for (let i = 1; i <= daysAhead; i++) {
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + i);
    
    const month = futureDate.getMonth();
    const date = futureDate.getDate();

    const anniversaryMemories = memories.filter(memory => {
      const memoryDate = new Date(memory.dateCreated);
      const memoryYear = memoryDate.getFullYear();
      const currentYear = today.getFullYear();
      
      return memoryDate.getMonth() === month &&
             memoryDate.getDate() === date &&
             memoryYear < currentYear;
    });

    anniversaryMemories.forEach(memory => {
      const yearsAgo = today.getFullYear() - new Date(memory.dateCreated).getFullYear();
      upcoming.push({
        ...memory,
        yearsAgo,
        daysUntil: i,
        anniversaryDate: futureDate
      });
    });
  }

  return upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
};

/**
 * Check if browser supports notifications
 */
export const supportsNotifications = () => {
  return 'Notification' in window;
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async () => {
  if (!supportsNotifications()) {
    return 'unsupported';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  return permission;
};

/**
 * Show browser notification
 */
export const showNotification = (title, options = {}) => {
  if (!supportsNotifications() || Notification.permission !== 'granted') {
    return null;
  }

  const notification = new Notification(title, {
    icon: '/memoria-icon.png',
    badge: '/memoria-badge.png',
    ...options
  });

  return notification;
};

/**
 * Get custom reminders from localStorage
 */
export const getReminders = () => {
  try {
    const stored = localStorage.getItem('memoria-vault-reminders');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load reminders:', error);
    return [];
  }
};

/**
 * Save reminders to localStorage
 */
export const saveReminders = (reminders) => {
  try {
    localStorage.setItem('memoria-vault-reminders', JSON.stringify(reminders));
    return true;
  } catch (error) {
    console.error('Failed to save reminders:', error);
    return false;
  }
};

/**
 * Add a custom reminder
 */
export const addReminder = (reminder) => {
  const reminders = getReminders();
  const newReminder = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    enabled: true,
    notified: false,
    ...reminder
  };
  
  reminders.push(newReminder);
  saveReminders(reminders);
  return newReminder;
};

/**
 * Update a reminder
 */
export const updateReminder = (id, updates) => {
  const reminders = getReminders();
  const index = reminders.findIndex(r => r.id === id);
  
  if (index !== -1) {
    reminders[index] = { ...reminders[index], ...updates };
    saveReminders(reminders);
    return reminders[index];
  }
  
  return null;
};

/**
 * Delete a reminder
 */
export const deleteReminder = (id) => {
  const reminders = getReminders();
  const filtered = reminders.filter(r => r.id !== id);
  saveReminders(filtered);
  return filtered;
};

/**
 * Get active reminders that should trigger today
 */
export const getActiveReminders = () => {
  const reminders = getReminders();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return reminders.filter(reminder => {
    if (!reminder.enabled || reminder.notified) {
      return false;
    }

    const reminderDate = new Date(reminder.date);
    reminderDate.setHours(0, 0, 0, 0);

    // Check if reminder date is today or in the past
    return reminderDate <= today;
  });
};

/**
 * Mark reminder as notified
 */
export const markReminderAsNotified = (id) => {
  return updateReminder(id, { notified: true, notifiedAt: new Date().toISOString() });
};

/**
 * Get reminder statistics
 */
export const getReminderStats = () => {
  const reminders = getReminders();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return {
    total: reminders.length,
    active: reminders.filter(r => r.enabled).length,
    pending: reminders.filter(r => {
      const date = new Date(r.date);
      date.setHours(0, 0, 0, 0);
      return r.enabled && !r.notified && date > today;
    }).length,
    overdue: reminders.filter(r => {
      const date = new Date(r.date);
      date.setHours(0, 0, 0, 0);
      return r.enabled && !r.notified && date < today;
    }).length,
    completed: reminders.filter(r => r.notified).length
  };
};

/**
 * Check and trigger reminders
 */
export const checkReminders = (onReminderTriggered) => {
  const activeReminders = getActiveReminders();
  
  activeReminders.forEach(reminder => {
    // Show notification if permitted
    if (Notification.permission === 'granted') {
      showNotification(reminder.title, {
        body: reminder.message,
        tag: `reminder-${reminder.id}`,
        requireInteraction: true
      });
    }

    // Call callback
    if (onReminderTriggered) {
      onReminderTriggered(reminder);
    }

    // Mark as notified
    markReminderAsNotified(reminder.id);
  });

  return activeReminders;
};

/**
 * Schedule daily reminder check
 */
export const scheduleDailyCheck = (onReminderTriggered) => {
  // Check immediately
  checkReminders(onReminderTriggered);

  // Check every hour
  const interval = setInterval(() => {
    checkReminders(onReminderTriggered);
  }, 60 * 60 * 1000); // 1 hour

  return () => clearInterval(interval);
};
