import { useState, useEffect } from 'react';
import { getReminders, addReminder, updateReminder, deleteReminder, getReminderStats } from '../utils/reminders';

const RemindersModal = ({ isOpen, onClose, showToast, memories }) => {
  const [reminders, setReminders] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [stats, setStats] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    date: '',
    type: 'custom',
    memoryId: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadReminders();
    }
  }, [isOpen]);

  const loadReminders = () => {
    const loaded = getReminders();
    setReminders(loaded);
    setStats(getReminderStats());
  };

  const handleAdd = () => {
    if (!formData.title || !formData.date) {
      showToast('error', 'Please fill in all required fields');
      return;
    }

    const reminder = addReminder(formData);
    showToast('success', 'Reminder added successfully!');
    setFormData({ title: '', message: '', date: '', type: 'custom', memoryId: '' });
    setShowAddForm(false);
    loadReminders();
  };

  const handleToggle = (id, enabled) => {
    updateReminder(id, { enabled: !enabled });
    loadReminders();
    showToast('success', enabled ? 'Reminder disabled' : 'Reminder enabled');
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this reminder?')) {
      deleteReminder(id);
      loadReminders();
      showToast('success', 'Reminder deleted');
    }
  };

  const getReminderIcon = (type) => {
    const icons = {
      birthday: '🎂',
      anniversary: '💝',
      custom: '⏰',
      memory: '📸'
    };
    return icons[type] || '⏰';
  };

  const getMemoryTitle = (memoryId) => {
    const memory = memories.find(m => m.id === memoryId);
    return memory ? memory.title : 'Unknown memory';
  };

  if (!isOpen) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-backdrop"></div>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
        <div className="modal-header">
          <h2>⏰ Reminders & Notifications</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Stats */}
          {stats && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '12px',
              marginBottom: '24px'
            }}>
              <div style={{
                background: 'var(--color-secondary)',
                padding: '12px',
                borderRadius: 'var(--radius-base)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                  {stats.active}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  Active
                </div>
              </div>
              <div style={{
                background: 'var(--color-secondary)',
                padding: '12px',
                borderRadius: 'var(--radius-base)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4facfe' }}>
                  {stats.pending}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  Pending
                </div>
              </div>
              <div style={{
                background: 'var(--color-secondary)',
                padding: '12px',
                borderRadius: 'var(--radius-base)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff6b95' }}>
                  {stats.overdue}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  Overdue
                </div>
              </div>
              <div style={{
                background: 'var(--color-secondary)',
                padding: '12px',
                borderRadius: 'var(--radius-base)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#43e97b' }}>
                  {stats.completed}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  Completed
                </div>
              </div>
            </div>
          )}

          {/* Add Reminder Button */}
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn--primary"
              style={{ width: '100%', marginBottom: '20px' }}
            >
              ➕ Add New Reminder
            </button>
          )}

          {/* Add Form */}
          {showAddForm && (
            <div style={{
              background: 'var(--color-secondary)',
              padding: '20px',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '20px'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '16px' }}>New Reminder</h3>
              
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Mom's Birthday"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Optional reminder message"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Type</label>
                <select
                  className="form-control"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="custom">⏰ Custom</option>
                  <option value="birthday">🎂 Birthday</option>
                  <option value="anniversary">💝 Anniversary</option>
                  <option value="memory">📸 Memory Related</option>
                </select>
              </div>

              {formData.type === 'memory' && (
                <div className="form-group">
                  <label className="form-label">Select Memory</label>
                  <select
                    className="form-control"
                    value={formData.memoryId}
                    onChange={(e) => setFormData({ ...formData, memoryId: e.target.value })}
                  >
                    <option value="">Choose a memory...</option>
                    {memories.map(memory => (
                      <option key={memory.id} value={memory.id}>
                        {memory.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setShowAddForm(false)} className="btn btn--outline">
                  Cancel
                </button>
                <button onClick={handleAdd} className="btn btn--primary">
                  Add Reminder
                </button>
              </div>
            </div>
          )}

          {/* Reminders List */}
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {reminders.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'var(--color-text-secondary)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>⏰</div>
                <p>No reminders yet. Create your first reminder!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reminders.map(reminder => {
                  const reminderDate = new Date(reminder.date);
                  const isPast = reminderDate < new Date();
                  
                  return (
                    <div
                      key={reminder.id}
                      style={{
                        background: reminder.enabled ? 'var(--color-surface)' : 'var(--color-secondary)',
                        border: `1px solid ${reminder.enabled ? 'var(--color-border)' : 'transparent'}`,
                        borderRadius: 'var(--radius-base)',
                        padding: '16px',
                        opacity: reminder.enabled ? 1 : 0.6
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '1.25rem' }}>{getReminderIcon(reminder.type)}</span>
                            <span style={{ fontWeight: '600', fontSize: '1rem' }}>
                              {reminder.title}
                            </span>
                            {reminder.notified && (
                              <span style={{
                                fontSize: '0.75rem',
                                padding: '2px 8px',
                                background: 'var(--color-primary)',
                                color: 'white',
                                borderRadius: 'var(--radius-full)'
                              }}>
                                ✓ Done
                              </span>
                            )}
                            {!reminder.notified && isPast && (
                              <span style={{
                                fontSize: '0.75rem',
                                padding: '2px 8px',
                                background: '#ff6b95',
                                color: 'white',
                                borderRadius: 'var(--radius-full)'
                              }}>
                                Overdue
                              </span>
                            )}
                          </div>
                          {reminder.message && (
                            <p style={{
                              margin: '4px 0',
                              fontSize: '0.875rem',
                              color: 'var(--color-text-secondary)'
                            }}>
                              {reminder.message}
                            </p>
                          )}
                          {reminder.memoryId && (
                            <p style={{
                              margin: '4px 0',
                              fontSize: '0.875rem',
                              color: 'var(--color-primary)'
                            }}>
                              📸 {getMemoryTitle(reminder.memoryId)}
                            </p>
                          )}
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
                            📅 {reminderDate.toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleToggle(reminder.id, reminder.enabled)}
                            className="btn btn--sm btn--outline"
                            title={reminder.enabled ? 'Disable' : 'Enable'}
                          >
                            {reminder.enabled ? '🔔' : '🔕'}
                          </button>
                          <button
                            onClick={() => handleDelete(reminder.id)}
                            className="btn btn--sm btn--outline"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn--primary">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemindersModal;
