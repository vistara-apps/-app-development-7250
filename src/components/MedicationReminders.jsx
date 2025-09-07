import React, { useState } from 'react';
import { Plus, Clock, Pill, Calendar, Edit2, Trash2, Bell } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const MedicationReminders = ({ user }) => {
  const [reminders, setReminders] = useLocalStorage('healthsync_reminders', []);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    type: 'medication',
    details: '',
    time: '',
    frequency: 'daily',
    isEnabled: true,
    notes: ''
  });

  const frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'as-needed', label: 'As Needed' }
  ];

  const reminderTypes = [
    { value: 'medication', label: 'Medication', icon: Pill },
    { value: 'appointment', label: 'Appointment', icon: Calendar },
    { value: 'exercise', label: 'Exercise', icon: Bell },
    { value: 'other', label: 'Other', icon: Clock }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const reminderData = {
      reminderId: editingId || Date.now().toString(),
      userId: user.userId,
      ...formData,
      createdAt: editingId ? reminders.find(r => r.reminderId === editingId)?.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingId) {
      setReminders(reminders.map(r => r.reminderId === editingId ? reminderData : r));
    } else {
      setReminders([...reminders, reminderData]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      type: 'medication',
      details: '',
      time: '',
      frequency: 'daily',
      isEnabled: true,
      notes: ''
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (reminder) => {
    setFormData(reminder);
    setEditingId(reminder.reminderId);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setReminders(reminders.filter(r => r.reminderId !== id));
  };

  const toggleReminder = (id) => {
    setReminders(reminders.map(r => 
      r.reminderId === id ? { ...r, isEnabled: !r.isEnabled } : r
    ));
  };

  const activeReminders = reminders.filter(r => r.isEnabled);
  const inactiveReminders = reminders.filter(r => !r.isEnabled);

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {editingId ? 'Edit Reminder' : 'Add Reminder'}
          </h2>
          <button
            onClick={resetForm}
            className="text-white/70 hover:text-white"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            {/* Type Selection */}
            <div className="space-y-4">
              <label className="block text-white font-medium">Type</label>
              <div className="grid grid-cols-2 gap-3">
                {reminderTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({...formData, type: type.value})}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                        formData.type === type.value
                          ? 'bg-white/30 text-white'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-4">
              <label className="block text-white font-medium">Details</label>
              <input
                type="text"
                value={formData.details}
                onChange={(e) => setFormData({...formData, details: e.target.value})}
                placeholder={`Enter ${formData.type} details`}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
                required
              />
            </div>

            {/* Time */}
            <div className="space-y-4">
              <label className="block text-white font-medium">Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                required
              />
            </div>

            {/* Frequency */}
            <div className="space-y-4">
              <label className="block text-white font-medium">Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                {frequencies.map((freq) => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="space-y-4">
              <label className="block text-white font-medium">Notes (Optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Additional notes or instructions"
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-white/20 hover:bg-white/30 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
            >
              {editingId ? 'Update Reminder' : 'Add Reminder'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Reminders</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Active Reminders */}
      {activeReminders.length > 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Active Reminders
          </h3>
          <div className="space-y-4">
            {activeReminders.map((reminder) => {
              const TypeIcon = reminderTypes.find(t => t.value === reminder.type)?.icon || Clock;
              return (
                <div key={reminder.reminderId} className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="bg-green-500 rounded-lg p-2">
                        <TypeIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{reminder.details}</h4>
                        <div className="space-y-1 text-sm text-white/70">
                          <p className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {reminder.time} • {reminder.frequency}
                          </p>
                          {reminder.notes && <p>Notes: {reminder.notes}</p>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleReminder(reminder.reminderId)}
                        className="text-green-400 hover:text-green-300 p-1"
                      >
                        <Bell className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(reminder)}
                        className="text-white/70 hover:text-white p-1"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(reminder.reminderId)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Inactive Reminders */}
      {inactiveReminders.length > 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4 text-white/70">Inactive Reminders</h3>
          <div className="space-y-4">
            {inactiveReminders.map((reminder) => {
              const TypeIcon = reminderTypes.find(t => t.value === reminder.type)?.icon || Clock;
              return (
                <div key={reminder.reminderId} className="bg-white/5 rounded-lg p-4 opacity-60">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="bg-gray-500 rounded-lg p-2">
                        <TypeIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{reminder.details}</h4>
                        <div className="space-y-1 text-sm text-white/70">
                          <p className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {reminder.time} • {reminder.frequency}
                          </p>
                          {reminder.notes && <p>Notes: {reminder.notes}</p>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleReminder(reminder.reminderId)}
                        className="text-white/50 hover:text-white/70 p-1"
                      >
                        <Bell className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(reminder)}
                        className="text-white/50 hover:text-white/70 p-1"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(reminder.reminderId)}
                        className="text-red-400/50 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {reminders.length === 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-white/50 mx-auto mb-4" />
            <p className="text-white/70 mb-4">No reminders set yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg transition-all duration-200"
            >
              Add Your First Reminder
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationReminders;