import React, { useState, useEffect } from 'react';
import { Activity, Calendar, FileText, Share2, Plus, Home, User, Settings as SettingsIcon } from 'lucide-react';
import Dashboard from './components/Dashboard';
import SymptomTracker from './components/SymptomTracker';
import MedicationReminders from './components/MedicationReminders';
import HealthRecords from './components/HealthRecords';
import HealthSummary from './components/HealthSummary';
import Settings from './components/Settings';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useNotifications } from './hooks/useNotifications';
import { baseIntegration } from './utils/baseIntegration';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useLocalStorage('healthsync_user', {
    userId: 'user_001',
    farcasterId: 'health_user',
    walletAddress: '0x1234...5678',
    preferences: { theme: 'purple', notifications: true }
  });

  const { scheduleReminder } = useNotifications();

  // Initialize Base integration on app load
  useEffect(() => {
    const initializeApp = async () => {
      // Check if user has a wallet connection
      const connectionStatus = baseIntegration.getConnectionStatus();
      if (connectionStatus.isConnected) {
        setUser(prev => ({
          ...prev,
          walletAddress: connectionStatus.walletAddress,
          farcasterId: connectionStatus.farcasterId
        }));
      }
    };

    initializeApp();
  }, [setUser]);

  const tabs = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'symptoms', label: 'Symptoms', icon: Activity },
    { id: 'reminders', label: 'Reminders', icon: Calendar },
    { id: 'records', label: 'Records', icon: FileText },
    { id: 'summary', label: 'Summary', icon: Share2 },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={user} onNavigate={setActiveTab} />;
      case 'symptoms':
        return <SymptomTracker user={user} />;
      case 'reminders':
        return <MedicationReminders user={user} />;
      case 'records':
        return <HealthRecords user={user} />;
      case 'summary':
        return <HealthSummary user={user} />;
      case 'settings':
        return <Settings user={user} onUserUpdate={setUser} />;
      default:
        return <Dashboard user={user} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-white">HealthSync</h1>
          </div>
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto px-4 py-6 pb-20">
        {renderActiveComponent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md border-t border-white/20">
        <div className="max-w-xl mx-auto px-4 py-2">
          <div className="flex justify-around">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default App;
