import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Download, 
  Upload, 
  Trash2, 
  Shield, 
  Smartphone,
  Database,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useNotifications } from '../hooks/useNotifications';
import { baseIntegration, farcasterUtils } from '../utils/baseIntegration';
import { dataManager } from '../utils/dataManager';

const Settings = ({ user, onUserUpdate }) => {
  const [preferences, setPreferences] = useLocalStorage('healthsync_preferences', {
    notifications: true,
    reminderSound: true,
    dataBackup: true,
    shareAnalytics: false,
    theme: 'purple',
    language: 'en'
  });

  const [connectionStatus, setConnectionStatus] = useState({
    wallet: false,
    farcaster: false,
    notifications: false
  });

  const [storageStats, setStorageStats] = useState(null);
  const [backups, setBackups] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);

  const { permission, requestPermission, isSupported } = useNotifications();

  useEffect(() => {
    // Update connection status
    const walletStatus = baseIntegration.getConnectionStatus();
    setConnectionStatus(prev => ({
      ...prev,
      wallet: walletStatus.isConnected,
      farcaster: !!walletStatus.farcasterId,
      notifications: permission === 'granted'
    }));

    // Load storage stats
    const stats = dataManager.getStorageStats();
    setStorageStats(stats);

    // Load backups
    const availableBackups = dataManager.getBackups();
    setBackups(availableBackups);
  }, [permission]);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      const result = await baseIntegration.connectWallet();
      if (result.success) {
        // Update user data
        const updatedUser = {
          ...user,
          walletAddress: result.walletAddress,
          farcasterId: result.farcasterId
        };
        onUserUpdate(updatedUser);
        
        setConnectionStatus(prev => ({
          ...prev,
          wallet: true,
          farcaster: true
        }));
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectWallet = () => {
    baseIntegration.disconnect();
    setConnectionStatus(prev => ({
      ...prev,
      wallet: false,
      farcaster: false
    }));
    
    // Update user data
    const updatedUser = {
      ...user,
      walletAddress: null,
      farcasterId: null
    };
    onUserUpdate(updatedUser);
  };

  const handleNotificationPermission = async () => {
    const granted = await requestPermission();
    setConnectionStatus(prev => ({
      ...prev,
      notifications: granted
    }));
  };

  const handleExportData = async () => {
    try {
      const result = await dataManager.exportAllData();
      if (result.success) {
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `healthsync-export-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        const result = await dataManager.importData(importData);
        
        if (result.success) {
          alert(`Successfully imported ${result.imported.symptoms} symptoms, ${result.imported.reminders} reminders, and ${result.imported.records} records.`);
          // Refresh page to show imported data
          window.location.reload();
        } else {
          alert(`Import failed: ${result.error}`);
        }
      } catch (error) {
        alert('Invalid file format. Please select a valid HealthSync export file.');
      }
    };
    reader.readAsText(file);
  };

  const handleCreateBackup = async () => {
    try {
      const result = await dataManager.createBackup();
      if (result.success) {
        const updatedBackups = dataManager.getBackups();
        setBackups(updatedBackups);
        alert('Backup created successfully!');
      } else {
        alert(`Backup failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Backup failed:', error);
      alert('Backup failed. Please try again.');
    }
  };

  const handleRestoreBackup = async (backupId) => {
    if (!confirm('This will replace all current data with the backup. Continue?')) {
      return;
    }

    try {
      const result = await dataManager.restoreFromBackup(backupId);
      if (result.success) {
        alert(`Successfully restored ${result.restored.symptoms} symptoms, ${result.restored.reminders} reminders, and ${result.restored.records} records.`);
        window.location.reload();
      } else {
        alert(`Restore failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Restore failed:', error);
      alert('Restore failed. Please try again.');
    }
  };

  const handleClearAllData = () => {
    if (!confirm('This will permanently delete all your health data. This action cannot be undone. Continue?')) {
      return;
    }

    if (!confirm('Are you absolutely sure? This will delete all symptoms, reminders, and health records.')) {
      return;
    }

    localStorage.removeItem('healthsync_symptoms');
    localStorage.removeItem('healthsync_reminders');
    localStorage.removeItem('healthsync_records');
    localStorage.removeItem('healthsync_backups');
    
    alert('All data has been cleared.');
    window.location.reload();
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Settings</h2>
      </div>

      {/* Connection Status */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Wifi className="w-5 h-5 mr-2" />
          Connection Status
        </h3>
        
        <div className="space-y-4">
          {/* Wallet Connection */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${connectionStatus.wallet ? 'bg-green-400' : 'bg-red-400'}`} />
              <div>
                <p className="text-white font-medium">Base Wallet</p>
                <p className="text-sm text-white/70">
                  {connectionStatus.wallet ? `Connected: ${user.walletAddress?.slice(0, 6)}...${user.walletAddress?.slice(-4)}` : 'Not connected'}
                </p>
              </div>
            </div>
            {connectionStatus.wallet ? (
              <button
                onClick={handleDisconnectWallet}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-all duration-200 disabled:opacity-50"
              >
                {isConnecting ? 'Connecting...' : 'Connect'}
              </button>
            )}
          </div>

          {/* Farcaster Connection */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${connectionStatus.farcaster ? 'bg-green-400' : 'bg-gray-400'}`} />
              <div>
                <p className="text-white font-medium">Farcaster ID</p>
                <p className="text-sm text-white/70">
                  {connectionStatus.farcaster ? farcasterUtils.formatFarcasterId(user.farcasterId) : 'Connect wallet first'}
                </p>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${connectionStatus.notifications ? 'bg-green-400' : 'bg-yellow-400'}`} />
              <div>
                <p className="text-white font-medium">Notifications</p>
                <p className="text-sm text-white/70">
                  {connectionStatus.notifications ? 'Enabled' : isSupported ? 'Click to enable' : 'Not supported'}
                </p>
              </div>
            </div>
            {!connectionStatus.notifications && isSupported && (
              <button
                onClick={handleNotificationPermission}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm transition-all duration-200"
              >
                Enable
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <SettingsIcon className="w-5 h-5 mr-2" />
          Preferences
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-white">Enable Notifications</span>
            <input
              type="checkbox"
              checked={preferences.notifications}
              onChange={(e) => setPreferences({...preferences, notifications: e.target.checked})}
              className="w-5 h-5 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-500"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <span className="text-white">Reminder Sound</span>
            <input
              type="checkbox"
              checked={preferences.reminderSound}
              onChange={(e) => setPreferences({...preferences, reminderSound: e.target.checked})}
              className="w-5 h-5 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-500"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <span className="text-white">Auto Backup</span>
            <input
              type="checkbox"
              checked={preferences.dataBackup}
              onChange={(e) => setPreferences({...preferences, dataBackup: e.target.checked})}
              className="w-5 h-5 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-500"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <span className="text-white">Share Anonymous Analytics</span>
            <input
              type="checkbox"
              checked={preferences.shareAnalytics}
              onChange={(e) => setPreferences({...preferences, shareAnalytics: e.target.checked})}
              className="w-5 h-5 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Database className="w-5 h-5 mr-2" />
          Data Management
        </h3>
        
        {storageStats && (
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-white/70 text-sm">Total Storage</p>
                <p className="text-white font-medium">{formatBytes(storageStats.totalSize)}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-white/70 text-sm">Total Items</p>
                <p className="text-white font-medium">
                  {storageStats.itemCounts.symptoms + storageStats.itemCounts.reminders + storageStats.itemCounts.records}
                </p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-white/70">
                <span>Symptoms: {storageStats.itemCounts.symptoms}</span>
                <span>{formatBytes(storageStats.breakdown.symptoms)}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Reminders: {storageStats.itemCounts.reminders}</span>
                <span>{formatBytes(storageStats.breakdown.reminders)}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Records: {storageStats.itemCounts.records}</span>
                <span>{formatBytes(storageStats.breakdown.records)}</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={handleExportData}
            className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Export Data</span>
          </button>
          
          <label className="bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer">
            <Upload className="w-5 h-5" />
            <span>Import Data</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
          </label>
        </div>

        {/* Backups */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-medium">Backups</h4>
            <button
              onClick={handleCreateBackup}
              className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm transition-all duration-200"
            >
              Create Backup
            </button>
          </div>
          
          {backups.length > 0 ? (
            <div className="space-y-2">
              {backups.map((backup) => (
                <div key={backup.id} className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">
                      {new Date(backup.timestamp).toLocaleDateString()} {new Date(backup.timestamp).toLocaleTimeString()}
                    </p>
                    <p className="text-white/60 text-xs">{formatBytes(backup.size)}</p>
                  </div>
                  <button
                    onClick={() => handleRestoreBackup(backup.id)}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/70 text-sm">No backups available</p>
          )}
        </div>

        {/* Danger Zone */}
        <div className="border-t border-red-500/20 pt-4">
          <h4 className="text-red-400 font-medium mb-3 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Danger Zone
          </h4>
          <button
            onClick={handleClearAllData}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All Data</span>
          </button>
          <p className="text-red-400/70 text-xs mt-2">
            This action cannot be undone. All your health data will be permanently deleted.
          </p>
        </div>
      </div>

      {/* About */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">About HealthSync</h3>
        <div className="space-y-2 text-sm text-white/70">
          <p>Version: 1.0.0</p>
          <p>Built for Base MiniApps</p>
          <p>Your health data is stored locally and encrypted</p>
          <p>Powered by Farcaster identity and IPFS storage</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
