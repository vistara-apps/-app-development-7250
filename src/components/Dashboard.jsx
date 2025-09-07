import React from 'react';
import { Activity, Calendar, FileText, Share2, TrendingUp, Clock, Heart, Plus } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const Dashboard = ({ user, onNavigate }) => {
  const [symptoms] = useLocalStorage('healthsync_symptoms', []);
  const [reminders] = useLocalStorage('healthsync_reminders', []);
  const [records] = useLocalStorage('healthsync_records', []);

  const recentSymptoms = symptoms.slice(-3);
  const upcomingReminders = reminders.filter(r => r.isEnabled).slice(0, 2);
  const recentRecords = records.slice(-2);

  const stats = [
    {
      title: 'Symptoms Logged',
      value: symptoms.length,
      icon: Activity,
      color: 'bg-blue-500',
      trend: '+12% this week'
    },
    {
      title: 'Active Reminders',
      value: reminders.filter(r => r.isEnabled).length,
      icon: Clock,
      color: 'bg-green-500',
      trend: 'All on track'
    },
    {
      title: 'Health Records',
      value: records.length,
      icon: FileText,
      color: 'bg-purple-500',
      trend: '2 added recently'
    },
    {
      title: 'Health Score',
      value: '8.2/10',
      icon: Heart,
      color: 'bg-red-500',
      trend: '+0.3 this month'
    }
  ];

  const quickActions = [
    {
      title: 'Log Symptom',
      description: 'Track how you\'re feeling',
      icon: Plus,
      action: () => onNavigate('symptoms'),
      color: 'bg-blue-500'
    },
    {
      title: 'Set Reminder',
      description: 'Add medication or appointment',
      icon: Calendar,
      action: () => onNavigate('reminders'),
      color: 'bg-green-500'
    },
    {
      title: 'Upload Record',
      description: 'Store health documents',
      icon: FileText,
      action: () => onNavigate('records'),
      color: 'bg-purple-500'
    },
    {
      title: 'Share Summary',
      description: 'Generate health report',
      icon: Share2,
      action: () => onNavigate('summary'),
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-2">Welcome back!</h2>
        <p className="text-white/80">Here's your health overview for today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-white/70">{stat.title}</p>
                </div>
              </div>
              <p className="text-xs text-white/60">{stat.trend}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.action}
                className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-left hover:bg-white/20 transition-all duration-200"
              >
                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-semibold text-white mb-1">{action.title}</h4>
                <p className="text-sm text-white/70">{action.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      {recentSymptoms.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Recent Symptoms</h3>
          <div className="space-y-3">
            {recentSymptoms.map((symptom, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-white">{symptom.symptom}</h4>
                    <p className="text-sm text-white/70">Severity: {symptom.severity}/10</p>
                  </div>
                  <span className="text-xs text-white/60">
                    {new Date(symptom.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Reminders */}
      {upcomingReminders.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Upcoming Reminders</h3>
          <div className="space-y-3">
            {upcomingReminders.map((reminder, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-white">{reminder.details}</h4>
                    <p className="text-sm text-white/70 capitalize">{reminder.type}</p>
                  </div>
                  <span className="text-xs text-white/60">{reminder.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;